# Implementation Plan - Insurance Policy & Claims Management System

This document outlines the step-by-step implementation plan for building and completing the frontend of the Insurance Policy & Claims Management System. It bridges the React frontend (`D:\Monocept\React-Training\06_insurance_project`) with the Java Spring Boot REST API backend.

---

## 1. Backend Context & Reference

The Spring Boot backend is stateful and secured via JWT. All paginated GET requests accept `page` and `size` parameters.

### 1.1 Authentication & Profile Context
*   **Roles:** `CUSTOMER`, `AGENT`, `ADMIN`.
*   **Response on Login (`POST /api/auth/login`):**
    ```json
    {
      "token": "JWT_STRING",
      "email": "user@insurance.com",
      "fullName": "User FullName",
      "role": "CUSTOMER | AGENT | ADMIN"
    }
    ```
*   **Customer Profile (`/api/customers/profile` or `/api/customers/{id}`):**
    ```json
    {
      "id": 1,
      "dateOfBirth": "1992-05-15",
      "address": "456 Maple Ave",
      "city": "Scranton",
      "state": "PA",
      "pinCode": "185030",
      "nomineeName": "Carol Vance",
      "nomineeRelation": "Spouse"
    }
    ```

### 1.2 Endpoints & Payloads

#### Policies
*   **Customer Purchase (`POST /api/policies/purchase`):**
    *   Payload: `{ "planId": Long, "startDate": "YYYY-MM-DD" }`
*   **Admin/Agent Issue (`POST /api/policies/issue`):**
    *   Payload: `{ "customerId": Long, "planId": Long, "startDate": "YYYY-MM-DD" }`
*   **All Policies (Admin/Agent) (`GET /api/policies?page=0&size=10`):** Paginated.
*   **My Policies (Customer) (`GET /api/policies/my?page=0&size=10`):** Paginated.
*   **Cancel Policy (Admin/Agent) (`PUT /api/policies/{id}/cancel`):** Path variable ID.

#### Payments
*   **Record Payment (`POST /api/payments`):**
    *   Payload: `{ "policyId": Long, "amount": BigDecimal, "paymentMode": "UPI|CARD|NET_BANKING", "transactionReference": "TXN_REF", "paymentStatus": "SUCCESS|PENDING|FAILED" }`
*   **Get Payments by Policy (`GET /api/payments/policy/{policyId}`):** Returns array of payments.
*   **My Payments (Customer) (`GET /api/payments/my?page=0&size=10`):** Paginated.
*   **All Payments (Admin/Agent) (`GET /api/payments?page=0&size=10`):** Paginated.

#### Claims & Claim History
*   **File Claim (`POST /api/claims`):**
    *   *Option A (application/json):* Payload matching `ClaimRequestDto` (no files).
    *   *Option B (multipart/form-data):* Request part `"claim"` (stringified JSON matching `ClaimRequestDto`) and request part `"files"` (list of upload files).
    *   `ClaimRequestDto`:
        ```json
        {
          "policyId": 1,
          "claimAmount": 15000.00,
          "claimReason": "Critical hospitalization",
          "incidentDate": "2026-06-01",
          "documents": [
            {
              "documentName": "Medical Bill",
              "documentType": "PDF",
              "documentReference": "DOC_BILL_001"
            }
          ]
        }
        ```
*   **My Claims (`GET /api/claims/my?page=0&size=10`):** Paginated.
*   **All Claims (`GET /api/claims?page=0&size=10`):** Paginated.
*   **Review Claim (Agent) (`PUT /api/claims/{id}/review`):**
    *   Payload: `{ "recommendedStatus": "RECOMMENDED|REJECTED", "remarks": "Remarks string" }`
*   **Decision (Admin) (`PUT /api/claims/{id}/decision`):**
    *   Payload: `{ "finalDecisionStatus": "APPROVED|REJECTED", "remarks": "Remarks string" }`
*   **Claim History Timeline (`GET /api/claim-history/{claimId}`):** Returns array of claim history records.

---

## 2. Frontend Analysis & Cleanup

### 2.1 Current Frontend Structure
*   **Routing:** Simple routing in [App.jsx](file:///D:/Monocept/React-Training/06_insurance_project/src/App.jsx) (`/`, `/admindashboard`, `/userdashboard`).
*   **HTTP Client:** [api.js](file:///D:/Monocept/React-Training/06_insurance_project/src/api/api.js) configures an interceptor that automatically attaches `Authorization: Bearer <token>` from `localStorage`.
*   **Services Mismatch:** Services like [PolicyService.js](file:///D:/Monocept/React-Training/06_insurance_project/src/services/PolicyService.js) and [ClaimService.js](file:///D:/Monocept/React-Training/06_insurance_project/src/services/ClaimService.js) manually attach a hardcoded token. This overrides the interceptor and must be cleaned up.
*   **Missing Features:** Agent Portal routes, CRUD interfaces for Products & Plans, forms for purchasing policies, making payments, and filing claims.

---

## 3. Step-by-Step Implementation Tasks

### Task 1: API & Auth Refactoring (High Priority)
*   [ ] Refactor service files to remove hardcoded headers and token definitions:
    *   [AuthService.js](file:///D:/Monocept/React-Training/06_insurance_project/src/services/AuthService.js)
    *   [PolicyService.js](file:///D:/Monocept/React-Training/06_insurance_project/src/services/PolicyService.js)
    *   [ClaimService.js](file:///D:/Monocept/React-Training/06_insurance_project/src/services/ClaimService.js)
    *   [UserService.js](file:///D:/Monocept/React-Training/06_insurance_project/src/services/UserService.js)
    *   [ProductService.js](file:///D:/Monocept/React-Training/06_insurance_project/src/services/ProductService.js)
    *   [PaymentService.js](file:///D:/Monocept/React-Training/06_insurance_project/src/services/PaymentService.js)
*   [ ] Implement dynamic sidebar menu based on active role (`userData.role`).
*   [ ] Create route guards to protect dashboards from unauthenticated access.

### Task 2: Customer Portal Completion
*   [ ] **Dashboard Calculations:** Aggregate pending claim count, active policies, and payment timelines client-side from the respective endpoints.
*   [ ] **Complete Profile Form:** Create a profile card/form where a new customer must enter DOB, nominee name, address, nominee relation, etc., calling `POST /api/customers` if they don't have one, or `PUT /api/customers/{id}` if updating.
*   [ ] **Browse Products & Plans:**
    *   Fetch all products (`GET /api/products`).
    *   On product select, fetch all plans (`GET /api/plans`) and filter by `productId` client-side.
*   [ ] **Policy Purchase Form:** Modal or page displaying selected plan details, letting user pick a start date and calling `POST /api/policies/purchase`.
*   [ ] **Record Payment Flow:** Simulates gateway processing. Let user select a policy with a pending payment status, input payment mode, generate a random transaction reference, and call `POST /api/payments` with `paymentStatus = SUCCESS`.
*   [ ] **File Claim Form (Multipart):** Implement a file upload form that constructs `FormData`, appending the `"claim"` metadata JSON string and `"files"` list, calling `POST /api/claims`.

### Task 3: Agent Portal Implementation
*   [ ] **Agent Portal Screen:** Create `/agentdashboard` matching the layout specifications in `Design.md`.
*   [ ] **Clients List & Registration:** List all customers (`GET /api/customers`). Add a form to create a user and customer profile.
*   [ ] **Issue Policy Form:** Allow agents to select a client and a plan to issue a policy via `POST /api/policies/issue`.
*   [ ] **Claim Review List:** Display all claims. Allow agent to click a claim, write remarks, recommend approval/rejection, and call `PUT /api/claims/{id}/review`.

### Task 4: Admin Portal Completion
*   [ ] **Manage Users/Agents:** Interface to view all users (`GET /api/users`), create agents (`POST /api/users/agent`), and activate/deactivate accounts (`PUT /api/users/{id}/activate` / `/deactivate`).
*   [ ] **Manage Products & Plans:**
    *   Products: Create (`POST`), update (`PUT`), and deactivate (`PUT .../deactivate`).
    *   Plans: Create (`POST`), update (`PUT`), and deactivate (`PUT .../deactivate`).
*   [ ] **Claims Decisioning:** Detailed claims list showing agent recommendation. Admin can approve or reject the claim with remarks via `PUT /api/claims/{id}/decision`.
*   [ ] **Auditing Policies & Payments:** Page to list and audit all policies and payments in the system.

---

## 4. Verification Plan

### Manual Verification
*   **Role Redirect Check:** Log in as Admin, Agent, and Customer separately. Verify redirection to `/admindashboard`, `/agentdashboard`, and `/userdashboard`.
*   **Token Refresh & Storage:** Verify that JWT tokens are correctly saved in `localStorage` and automatically attached by `api.js` on subsequent requests.
*   **Multipart Claim Upload:** Test filing a claim with mock PDF/image files and verify that it matches the backend multipart requirements.
