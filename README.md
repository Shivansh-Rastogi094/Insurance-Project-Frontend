# 🛡️ InsureSpace by Crown Assurance — Enterprise Insurance Policy & Claims Management System

**InsureSpace** is a premium, multi-role enterprise web portal designed to streamline the lifecycle of insurance policies, payments, and claims. Built with a focus on modern user experiences, secure authorization, and client-side performance, it allows customers, agents, and administrators to seamlessly manage insurance processes in a single unified dashboard.

Designed around a sleek, fintech-inspired aesthetic (referencing premium designs like Revolut), the frontend is built to consume a Java Spring Boot REST API backend secured via stateless JWT tokens.

---

## 🚀 Key Highlights for Recruiters

*   **Advanced Role-Based Access Control (RBAC):** Built a custom `ProtectedRoute` system managing user portals for three distinct personas (Customer, Agent, Admin) with automatic route redirection and access restriction.
*   **Dynamic Document & PDF Generation:** Built on-the-fly PDF creation using `jspdf` and `jspdf-autotable`, permitting users and admins to export invoices, policies, claims, and filtered user listings.
*   **Highly Responsive Premium UI:** Implemented a full CSS-variable-based design system featuring light/dark mode support, fluid custom grid layouts, card micro-interactions, custom scrollbars, and seamless transitions without heavy styling framework dependencies.
*   **Enterprise Integration Ready:** Created modular Axios interceptors to handle automatic JWT injection, file-attachment uploads (`multipart/form-data`), and elegant error logging.

---

## 🛠️ Tech Stack & Architecture

*   **Core:** React 19 (Functional Components, Hooks)
*   **Build Tooling:** Vite (for fast HMR and optimized production bundles)
*   **Routing:** React Router DOM v7 (Nested Routing & Route Guarding)
*   **State Management:** React Context API (Auth Context and Theme Context)
*   **HTTP Client:** Axios (Interceptors, instance configuration)
*   **Document Generation:** jsPDF & jsPDF-AutoTable
*   **UX Enhancements:** React Loading Skeleton (for content loading states), custom Toast Notifications

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

## 📂 Codebase Structure

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

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   An active instance of the **InsureSpace** Backend API

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


