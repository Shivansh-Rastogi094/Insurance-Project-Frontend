# Insurance Policy & Claims Management System — Design Document

## Overview

A multi-role web application for managing insurance policies, products, plans, payments, claims, and claim histories. Three distinct user roles — **Customer (Policyholder)**, **Agent**, and **Admin** — each operate within tailored dashboards with scoped access and responsibilities.

This frontend is designed to consume a Java Spring Boot REST API backend secured via stateless JWT tokens.

---

## 1. Design System

### 1.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#1A3C5E` | Primary actions, headers, nav backgrounds |
| `--primary-light` | `#2563A8` | Hover states, active links |
| `--accent` | `#0FA89E` | Badges, highlights, success states |
| `--warning` | `#F59E0B` | Pending status, alerts |
| `--danger` | `#DC2626` | Rejected claims, errors, cancellations |
| `--success` | `#16A34A` | Approved claims, active policies |
| `--surface` | `#F8FAFC` | Page background |
| `--card` | `#FFFFFF` | Card/panel backgrounds |
| `--border` | `#E2E8F0` | Dividers, input borders |
| `--text-primary` | `#0F172A` | Headings, primary text |
| `--text-secondary` | `#64748B` | Labels, subtitles, metadata |
| `--sidebar-bg` | `#0F2540` | Sidebar background (all roles) |
| `--sidebar-text` | `#CBD5E1` | Sidebar menu items |
| `--sidebar-active` | `#0FA89E` | Active sidebar item indicator |

### 1.2 Typography

| Role | Font | Usage |
|---|---|---|
| Display | `Inter` 700–800 | Dashboard headings, stat cards |
| Body | `Inter` 400–500 | Paragraphs, table content, labels |
| Mono | `JetBrains Mono` | Policy IDs, claim numbers, amounts |

**Type Scale:**

```
h1: 28px / 700
h2: 22px / 600
h3: 18px / 600
body: 14px / 400
label: 12px / 500 uppercase tracked
mono: 13px / 400
```

### 1.3 Component Tokens

```
Border Radius:  card=12px, button=8px, badge=999px, input=8px
Shadow:         card=0 1px 4px rgba(0,0,0,0.07)
Spacing Unit:   4px base, scale ×2 ×4 ×6 ×8 ×12 ×16
Sidebar Width:  240px (collapsed: 64px)
Topbar Height:  60px
```

### 1.4 Status Badge System

| Status | Color | Usage |
|---|---|---|
| `ACTIVE` / `SUCCESS` | `--success` | Active policy, approved claim, successful payment |
| `PENDING` / `SUBMITTED` / `UNDER_REVIEW` | `--warning` | Under review, awaiting action |
| `REJECTED` / `CANCELLED` | `--danger` | Rejected claim, cancelled policy |
| `EXPIRED` | `--text-secondary` | Lapsed policies |
| `PROCESSING` / `RECOMMENDED` | `--primary-light` | Claim processing or recommended by agent |

---

## 2. Layout Architecture

### 2.1 Shell Layout (All Roles)

```
┌──────────────────────────────────────────────────┐
│  TOPBAR (60px): Logo | Role badge | User avatar  │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│ SIDEBAR  │           MAIN CONTENT                │
│ (240px)  │           (fluid)                     │
│          │                                       │
│ Nav menu │  Breadcrumb > Page Title              │
│          │  ─────────────────────────────        │
│          │  Page Body (cards, tables, forms)     │
│          │                                       │
└──────────┴───────────────────────────────────────┘
```

### 2.2 Sidebar Navigation per Role

**Customer (Policyholder)**
```
 Dashboard
 My Policies
 Products & Plans
 Payments
 My Claims
 Profile
```

**Agent**
```
 Dashboard
 Clients
 Policies
 Products & Plans
 Payments
 Claims
 Profile
```

**Admin**
```
 Dashboard
 Users (Activate/Deactivate, Create Agents)
 Products (Manage)
 Plans (Manage)
 Policies (All)
 Payments (All)
 Claims (All & Decision)
 Settings
```

---

## 3. Dashboards

### 3.1 Customer Dashboard

**Purpose:** Give the policyholder an instant health-check of their policies, upcoming renewals, and open claims.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Good morning, Shivansh 👋                 [+ Buy Policy]   │
├──────────┬──────────┬──────────┬──────────────────────────-─┤
│ Active   │ Pending  │ Total    │ Next Renewal               │
│ Policies │ Claims   │ Premium  │ 22 Jul 2026                │
│   3      │   1      │ ₹48,000  │ Health Shield Pro          │
├──────────┴──────────┴──────────┴────────────────────────────┤
│ My Policies (quick view)          │ Recent Claims            │
│ ─────────────────────────────     │ ──────────────────────── │
│ [Policy Card × 3 with status]     │ [Claim row × 3]          │
├───────────────────────────────────┴──────────────────────────┤
│ Upcoming Premium Payments (timeline strip)                    │
└───────────────────────────────────────────────────────-──────┘
```

*Note: Since there is no backend `/api/dashboard` endpoint, the counts, sums, and timelines are calculated client-side by fetching the customer's policies (`GET /api/policies/my`), claims (`GET /api/claims/my`), and payments (`GET /api/payments/my`).*

---

### 3.2 Agent Dashboard

**Purpose:** Give the agent a productivity view: clients they manage, policies issued, and claims awaiting their recommendation/review.

*Note: Counts and client activities are computed client-side by querying `/api/customers`, `/api/policies`, and `/api/claims`.*

---

### 3.3 Admin Dashboard

**Purpose:** System-wide analytics, operational health, and quick stats.

*Note: System-wide metrics are calculated client-side by aggregating data from `GET /api/users`, `GET /api/products`, `GET /api/policies`, `GET /api/payments`, and `GET /api/claims`.*

---

## 4. Screen Designs & Features

### 4.1 Products Screen

*   **Accessible by:** Admin (CRUD), Agent (Read), Customer (Browse)
*   **Endpoints:**
    *   `GET /api/products?page=0&size=10` (All roles)
    *   `POST /api/products` (Admin only)
    *   `PUT /api/products/{id}` (Admin only)
    *   `PUT /api/products/{id}/deactivate` (Admin only)

**Layout:**
```
Products Screen
─────────────────────────────────────────────────────────────────────────────
Search: [___________________]   Filter: [Category ▼]  [Status ▼]  [+ Add Product] (Admin)

┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  🏥 Health Insurance   │  │  🚗 Motor Insurance    │  │  ✈️ Travel Insurance    │
│  ───────────────────   │  │  ───────────────────   │  │  ───────────────────   │
│  Active Offerings      │  │  Active Offerings      │  │  Active Offerings      │
│  [ACTIVE]              │  │  [ACTIVE]              │  │  [ACTIVE]              │
│  [View Plans] [Deact]  │  │  [View Plans] [Deact]  │  │  [View Plans] [Deact]  │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

---

### 4.2 Plans Screen

*   **Accessible by:** Admin (CRUD), Agent (Read), Customer (Browse & Compare)
*   **Endpoints:**
    *   `GET /api/plans?page=0&size=10` (All roles)
    *   `GET /api/plans/{id}` (All roles)
    *   `POST /api/plans` (Admin only)
    *   `PUT /api/plans/{id}` (Admin only)
    *   `PUT /api/plans/{id}/deactivate` (Admin only)

**Layout:**
```
Plans Catalog — Health Insurance
─────────────────────────────────────────────────────────────────────────────
← Back to Products                     Filter: [Sum Insured ▼]   [+ Add Plan] (Admin)

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  ⭐ Health Shield Pro             │  │  💎 Health Shield Elite          │
│  ──────────────────────────────  │  │  ──────────────────────────────  │
│  Coverage: ₹10,00,000            │  │  Coverage: ₹25,00,000            │
│  Premium: ₹7,800/yr (ANNUAL)     │  │  Premium: ₹14,500/yr (ANNUAL)    │
│  Duration: 20 years              │  │  Duration: 25 years              │
│  Status: ACTIVE                  │  │  Status: ACTIVE                  │
│                                  │  │                                  │
│  [Compare [ ] ]   [Buy Now]      │  │  [Compare [ ] ]   [Buy Now]      │
└──────────────────────────────────┘  └──────────────────────────────────┘
```

---

### 4.3 Policies Screen

*   **Accessible by:** Customer (Own only), Agent (Assigned clients/All), Admin (All)
*   **Endpoints:**
    *   `POST /api/policies/purchase` (Customer payload: `{ planId, startDate }`)
    *   `POST /api/policies/issue` (Admin/Agent payload: `{ customerId, planId, startDate }`)
    *   `GET /api/policies/my?page=0&size=10` (Customer list)
    *   `GET /api/policies?page=0&size=10` (Admin/Agent list)
    *   `GET /api/policies/{id}` (Details view)
    *   `PUT /api/policies/{id}/cancel` (Admin/Agent cancel action)

**Layout - Customer Policy Listing:**
```
My Policies                                              [+ Buy New Policy]
─────────────────────────────────────────────────────────────────────────────
Search ID: [_______________]  Filter: [Status ▼]

┌───────────────────────────────────────────────────────────────────────────┐
│ Policy: POL-2026-00182  •  Health Shield Pro                              │
│ ───────────────────────────────────────────────────────────────────────── │
│ Coverage: ₹10,00,000     Premium: ₹7,800/yr (ANNUAL)                      │
│ Start Date: 01 Jul 2026  Expiry Date: 30 Jun 2027                         │
│ Status: [ACTIVE]         Actions: [View Details] [File Claim] [Pay Premium]│
└───────────────────────────────────────────────────────────────────────────┘
```

**Layout - Detailed Policy Summary View:**
```
Policy Details: POL-2026-00182                         [Download PDF] [Cancel]
─────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────┬────────────────────────────────────┐
│ 🛡️ Plan Coverage Info                 │ 👤 Policyholder Details            │
│ ──────────────────────────────────── │ ────────────────────────────────── │
│ Product: Health Insurance            │ Name: Shivansh Gupta               │
│ Plan Name: Health Shield Pro         │ DOB: 12 Aug 2002                   │
│ Sum Insured: ₹10,00,000              │ Address: 123 Main Street           │
│ Premium Amount: ₹7,800               │ City: Scranton, PA                 │
│ Billing Schedule: ANNUAL             │ Nominee: Carol Vance               │
│ Status: ACTIVE                       │ Nominee Relation: Spouse           │
└──────────────────────────────────────┴────────────────────────────────────┘
```

---

### 4.4 Payments Screen

*   **Accessible by:** Customer (Own list & Record), Agent (View list), Admin (All list & Record)
*   **Endpoints:**
    *   `POST /api/payments` (Record payment: `{ policyId, amount, paymentMode, transactionReference, paymentStatus }`)
    *   `GET /api/payments/my?page=0&size=10` (Customer history)
    *   `GET /api/payments?page=0&size=10` (Admin/Agent history)
    *   `GET /api/payments/policy/{policyId}` (Policy specific list)

**Layout - Payments Listing:**
```
Payment Transactions
─────────────────────────────────────────────────────────────────────────────
Filter: [Policy ▼]  [Status ▼]                       Total Premium Paid: ₹20,200

 Transaction ID   Policy No.      Amount    Date Paid    Payment Mode    Status
 ────────────────────────────────────────────────────────────────────────────
 TXN_REF_00182    POL-2026-00182  ₹7,800    01 Jul 2026  UPI             SUCCESS
 TXN_REF_00091    POL-2026-00091  ₹12,400   15 Mar 2026  NetBanking      SUCCESS
```

**Layout - Make/Record Payment Form Modal:**
```
Make Premium Payment
─────────────────────────────────────────────────────────────────────────────
Select Policy:      [POL-2026-00182 — Health Shield Pro ▼]
Premium Amount:     ₹7,800.00 (Autofilled)

Choose Payment Mode:
(●) UPI (GPay/PhonePe)   ( ) Debit/Credit Card   ( ) Net Banking

Transaction Reference:  [TXN123456789              ] (Enter simulated ID)
Payment Status Check:   (●) SUCCESS             ( ) FAILED

                                          [Cancel] [Record Payment Receipt]
```

---

### 4.5 Claims Screen

*   **Accessible by:** Customer (Raise & View), Agent (Review), Admin (Decision)
*   **Endpoints:**
    *   `POST /api/claims` (Multipart upload: `"claim"` metadata JSON part + `"files"` list part)
    *   `GET /api/claims/my?page=0&size=10` (Customer claims)
    *   `GET /api/claims?page=0&size=10` (Admin/Agent claims)
    *   `PUT /api/claims/{id}/review` (Agent recommendation payload)
    *   `PUT /api/claims/{id}/decision` (Admin final decision payload)

**Layout - File Claim Form (Multipart Upload):**
```
Raise New Insurance Claim
─────────────────────────────────────────────────────────────────────────────
Select Active Policy*:   [POL-2026-00182 — Health Shield Pro ▼]
Claimed Amount*:         [₹ 12,500       ]
Incident Date*:          [20-05-2026     ]
Claim Reason*:           [Hospitalization due to seasonal flu _________]

Upload Supporting Bills/Reports (Max 5MB each)*:
[Choose Files] 📄 Medical_Bill.pdf, 📄 Doctor_Prescription.png

                                               [Save Draft] [Submit Claim →]
```

**Layout - Detailed Claim Status & Review Center:**
```
Claim Assessment: CLM-2026-00078
─────────────────────────────────────────────────────────────────────────────
Workflow Timeline:
[●] Filed (20 May) ───► [●] Agent Reviewed (22 May) ───► [○] Admin Approved (Pending)

┌──────────────────────────────────────┬────────────────────────────────────┐
│ Summary Details                      │ Submitted Documents                │
│ ──────────────────                   │ ───────────────────                │
│ Claimed Amount: ₹12,500              │ 📄 Medical_Bill.pdf       [View]   │
│ Reason: Hospitalization (flu)        │ 📄 Discharge_Summary.pdf  [View]   │
│ Policy ID: POL-2026-00182            │                                    │
│ Agent Recommendation: RECOMMENDED    │ Agent Remarks:                     │
│ Recommended Date: 22 May 2026        │ "Verified. Eligible for payout."   │
└──────────────────────────────────────┴────────────────────────────────────┘
[Agent Box] Recommended Status: [RECOMMENDED ▼]  Remarks: [________________] [Submit]
[Admin Box] Final Decision:     [APPROVED ▼]     Remarks: [________________] [Submit]
```

---

### 4.6 Profile Screen

*   **Accessible by:** All users
*   **Endpoints:**
    *   `GET /api/customers/profile` (Customer own)
    *   `POST /api/customers` (Create customer profile)
    *   `PUT /api/customers/{id}` (Update customer profile)

**Layout - Profile View & Update Form:**
```
My Profile Settings
─────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────┬────────────────────────────────────┐
│ 👤 Account Credentials               │ 📝 Personal Customer Details       │
│ ─────────────────────                │ ───────────────────────────        │
│ Full Name: Shivansh Gupta            │ Date of Birth*:   [12-08-2002  ]   │
│ Email Address: shivansh@insurance.com│ Address*:         [123 Main St ]   │
│ Phone Number:  +91 98765 43210       │ City*:            [Scranton    ]   │
│ Security Status: ACTIVE              │ State*: [PA ▼]  PinCode*: [18503 ] │
│ Role Group: CUSTOMER                 │ Nominee Name*:    [Carol Vance ]   │
│                                      │ Nominee Relation*:[Spouse      ]   │
└──────────────────────────────────────┴────────────────────────────────────┘
                                                      [Discard] [Save Profile]
```

---

## 5. Role-Based Access Control (RBAC) Summary

| Screen / Action | Customer | Agent | Admin |
|---|---|---|---|
| View dashboard | ✅ (Own data) | ✅ (Clients summary) | ✅ (System stats) |
| Manage Products | ❌ Read only | ❌ Read only | ✅ CRUD |
| Manage Plans | ❌ Read only | ❌ Read only | ✅ CRUD |
| View Policies | ✅ Own (`/my`) | ✅ All | ✅ All |
| Purchase Policy | ✅ Yes (`/purchase`) | ❌ | ❌ |
| Issue Policy | ❌ | ✅ Yes (`/issue`) | ✅ Yes (`/issue`) |
| View Payments | ✅ Own (`/my`) | ✅ All | ✅ All |
| Record Payment | ✅ Yes | ❌ | ✅ Yes |
| File Claim | ✅ Yes (with files) | ❌ | ❌ |
| Review Claim | ❌ | ✅ Yes (`/review`) | ❌ |
| Claim Decision | ❌ | ❌ | ✅ Yes (`/decision`) |
| Manage Users | ❌ | ❌ | ✅ (Activate/Deactivate, Create Agent) |

---

## 6. API Endpoint Mapping (Corrected Reference)

| Category | HTTP Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register customer |
| **Auth** | `POST` | `/api/auth/verify-otp` | Verify email OTP |
| **Auth** | `POST` | `/api/auth/resend-otp?email={email}` | Resend OTP |
| **Auth** | `POST` | `/api/auth/login` | Login (returns JWT + role + details) |
| **Users** | `POST` | `/api/users/agent` | Create agent (Admin) |
| **Users** | `GET` | `/api/users` | List all users (Admin) |
| **Users** | `PUT` | `/api/users/{id}/activate` | Activate user (Admin) |
| **Users** | `PUT` | `/api/users/{id}/deactivate` | Deactivate user (Admin) |
| **Customers** | `POST` | `/api/customers` | Complete Customer Profile |
| **Customers** | `GET` | `/api/customers/profile` | Get own customer profile (Customer) |
| **Customers** | `GET` | `/api/customers/{id}` | Get customer profile by ID (Admin/Agent) |
| **Customers** | `GET` | `/api/customers` | Get all customers (Admin/Agent) |
| **Customers** | `PUT` | `/api/customers/{id}` | Update customer profile |
| **Products** | `GET` | `/api/products` | Get all products |
| **Products** | `POST` | `/api/products` | Create product (Admin) |
| **Products** | `PUT` | `/api/products/{id}` | Update product (Admin) |
| **Products** | `PUT` | `/api/products/{id}/deactivate` | Deactivate product (Admin) |
| **Plans** | `GET` | `/api/plans` | Get all plans |
| **Plans** | `GET` | `/api/plans/{id}` | Get plan by ID |
| **Plans** | `POST` | `/api/plans` | Create plan (Admin) |
| **Plans** | `PUT` | `/api/plans/{id}` | Update plan (Admin) |
| **Plans** | `PUT` | `/api/plans/{id}/deactivate` | Deactivate plan (Admin) |
| **Policies** | `POST` | `/api/policies/purchase` | Purchase policy (Customer) |
| **Policies** | `POST` | `/api/policies/issue` | Issue policy to customer (Admin/Agent) |
| **Policies** | `GET` | `/api/policies/my` | Get customer's policies (Customer) |
| **Policies** | `GET` | `/api/policies` | Get all policies (Admin/Agent) |
| **Policies** | `GET` | `/api/policies/{id}` | Get policy details |
| **Policies** | `PUT` | `/api/policies/{id}/cancel` | Cancel policy (Admin/Agent) |
| **Payments** | `POST` | `/api/payments` | Record payment |
| **Payments** | `GET` | `/api/payments/my` | Get own payments (Customer) |
| **Payments** | `GET` | `/api/payments` | Get all payments (Admin/Agent) |
| **Payments** | `GET` | `/api/payments/policy/{policyId}` | Get payments of a policy |
| **Claims** | `POST` | `/api/claims` | Submit claim (JSON/Multipart) |
| **Claims** | `GET` | `/api/claims/my` | Get own claims (Customer) |
| **Claims** | `GET` | `/api/claims` | Get all claims (Admin/Agent) |
| **Claims** | `GET` | `/api/claims/{id}` | Get claim details |
| **Claims** | `PUT` | `/api/claims/{id}/review` | Review claim recommendation (Agent) |
| **Claims** | `PUT` | `/api/claims/{id}/decision` | Final claim decision (Admin) |
| **Claim History** | `GET` | `/api/claim-history/{claimId}` | Audit trail of claim states |

---

## 7. Design Adjustments & Empty States

*   **Responsive Adaptation:** Layout collapses sidebar to a bottom menu or header-hamburger on mobile screens (< 768px).
*   **Empty State Management:** Appropriate placeholder states when `/my` endpoints return empty pages for policies, payments, or claims.
*   **Loading & Transitions:** Micro-interactions (hover effect transitions, skeleton loading blocks for dashboard cards) are implemented client-side to maintain a premium feel.