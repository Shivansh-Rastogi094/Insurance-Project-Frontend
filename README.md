# 🛡️ InsureSpace by Crown Assurance — Enterprise Insurance Policy & Claims Management System

**InsureSpace** is a premium, multi-role enterprise web application designed to streamline the lifecycle of insurance policies, payments, and claims. Built with a focus on modern user experiences, secure authorization, and robust backend engineering, it integrates a rich React 19 client frontend with a Java Spring Boot REST API backend.

Designed around a sleek, fintech-inspired aesthetic (referencing premium designs like Revolut), the platform supports distinct portals for **Customers**, **Agents**, and **Administrators**.

---

## 🚀 Key Highlights for Recruiters

### 💻 Frontend Architecture & UX
*   **Advanced Role-Based Access Control (RBAC):** Built a custom `ProtectedRoute` system managing user portals for three distinct personas (Customer, Agent, Admin) with automatic route redirection and access restriction.
*   **Dynamic Document & PDF Generation:** Built on-the-fly PDF creation using `jspdf` and `jspdf-autotable`, permitting users and admins to export invoices, policies, claims, and filtered user listings.
*   **Highly Responsive Premium UI:** Implemented a full CSS-variable-based design system featuring light/dark mode support, fluid custom grid layouts, card micro-interactions, custom scrollbars, and seamless transitions without heavy styling framework dependencies.
*   **Enterprise Integration Ready:** Created modular Axios interceptors to handle automatic JWT injection, file-attachment uploads (`multipart/form-data`), and elegant error logging.

### ⚙️ Backend Architecture & APIs
*   **Monolithic Layered Architecture:** Implemented Java 17 and Spring Boot following clear separation of concerns: Presentation (`/controller`), Business Logic (`/service`), and Data Access (`/repository`).
*   **Secure Stateless Security:** Configured Spring Security to utilize JWT (JSON Web Tokens) for request interception, validation, and role authorization.
*   **Asynchronous & Cloud Integrations:** Integrates Cloud upload via Cloudinary SDK (for claim document management), Twilio SDK (for SMS alerts), and Spring Mail (for transactional notifications).
*   **API Standardization:** Employs a global `@ControllerAdvice` for consistent JSON error response formatting and features automatic API documentation via SpringDoc OpenAPI (Swagger UI).

---

## 🛠️ Tech Stack Summary

### Frontend Stack
*   **Core & Build:** React 19, Vite (Fast HMR & build optimization)
*   **Routing & State:** React Router DOM v7 (Nested & protected routes), React Context API
*   **HTTP Client & UX:** Axios (interceptors & error handlers), React Loading Skeleton, custom CSS animations

### Backend Stack
*   **Language & Framework:** Java 17, Spring Boot 3.x, Spring Security, Maven
*   **Database & ORM:** MySQL, Spring Data JPA (Hibernate)
*   **Cloud & Comms:** Cloudinary (Document storage), Twilio (SMS), JavaMailSender (Email)
*   **API Docs & Utilities:** Swagger/OpenAPI, Lombok, ModelMapper

---

## 👥 Interactive User Roles & Flows

### 1. Customer Portal (Policyholder)
*   **Personalized Dashboard:** Dynamic client-side metrics calculating active policies, pending claims, total premiums paid, and next upcoming renewal.
*   **Product Catalog & Purchasing:** Fluid catalog filters allowing users to search products (Health, Motor, Travel) and plans, purchase new policies, and request policy cancellations.
*   **Claims Submission:** Submit claims by uploading supporting documentation files using an integrated multipart form data handler.
*   **Payment Gateway Interface:** Manage premiums, process payments, and instantly download transaction receipts.

### 2. Insurance Agent Portal
*   **Client Management:** Searchable and filterable client directory displaying all assigned policyholders.
*   **Policy Analytics:** Active audit of current customer policies and payment logs.
*   **Claims Review Workflow:** Two-stage claims vetting. Agents review customer claims, attach administrative remarks, and recommend claim approvals or rejections to system admins.

### 3. System Administrator Portal
*   **User Management:** Centralized control to create agents, register users, and activate/deactivate accounts.
*   **Product & Plan CRUD:** Complete control over global insurance categories, creating products, managing individual coverage plans, and configuring rates.
*   **Claims Decision Centre:** Review agent recommendations, inspect uploaded documents, and make final binding decisions (Approve/Reject) on claims.
*   **Audit Logging:** View system-wide transaction history and policy allocations.

---

## 📂 Codebase & Project Structure

### 💻 Frontend Structure (`/` - Current Workspace)
```
src/
├── api/          # Axios instance and JWT request interceptor configuration
├── assets/       # Static assets, branding, and icons
├── components/   # Reusable UI components (Sidebar, Card, Toast, Modal, ProtectedRoute, DownloadButton)
├── context/      # React Context providers (AuthContext, ThemeContext)
├── hooks/        # Custom React Hooks
├── pages/        # Route views (Dashboards, Claims, Catalog, Payments, Profile, Login/Register)
│   └── landing/  # Responsive landing page sections (Home, Plans, Features, Pricing)
├── services/     # API Service layers matching Java Spring Boot endpoints
├── styles/       # CSS stylesheet definitions
└── utils/        # Utility helpers, including high-fidelity PDF templates (pdfGenerator.js)
```

### ⚙️ Backend Structure (`/backend` repository reference)
```
src/main/java/com/monocept/app/
├── config/       # Bean configurations (Swagger, Cloudinary, Security Beans)
├── controller/   # REST API Endpoints (exposing DTOs, preventing over-posting)
├── dto/          # Data Transfer Objects for Request/Response payloads
├── enums/        # Constant enumerations (e.g., Role, PolicyStatus)
├── exception/    # Custom exceptions and Global Exception Handler (@ControllerAdvice)
├── model/        # JPA Entities / Database tables
├── repository/   # Spring Data JPA interfaces for MySQL queries
├── security/     # JWT filters, entry points, and custom user details
├── service/      # Business logic implementations (loosely coupled interface/impl)
└── util/         # Helper classes (Email Sender, File uploaders)
```

---

## ⚙️ Getting Started (Frontend Workspace)

### Prerequisites
*   Node.js (v18+ recommended)
*   An active instance of the backend Spring Boot API running on port `8080`

### Installation & Run

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Shivansh-Rastogi094/Insurance-Project-Frontend.git
    cd Insurance-Project-Frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    VITE_BACKEND_URL=http://localhost:8080/api/
    ```

4.  **Launch Dev Server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.



