import 'react-loading-skeleton/dist/skeleton.css';
import React from 'react'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import AgentDashboard from './pages/AgentDashboard'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import UserDashboard from './pages/UserDashboard'
import Policy from './pages/Policy'
import Claims from './pages/Claims'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import ProductCatalog from './pages/ProductCatalog'
import PlanCatalog from './pages/PlanCatalog'
import Customers from './pages/Customers'
import Users from './pages/Users'
import Policies from './pages/Policies'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './components/ToastProvider'
import { ThemeProvider } from './context/ThemeContext'
import { useAuth } from './context/AuthContext'

// Landing Page (Redesigned Single Page)
import LandingPage from './pages/landing/LandingPage'

import ContactUs from './pages/ContactUs'
import CustomerQueries from './pages/CustomerQueries'
import NotFound from './pages/NotFound'

// BUG-007: GuestRoute — redirects authenticated users away from auth pages
const GuestRoute = ({ children }) => {
  const { isAuthenticated, userData } = useAuth();
  if (!isAuthenticated) return children;
  // Redirect to the appropriate dashboard
  if (userData?.role === 'ADMIN') return <Navigate to="/admindashboard" replace />;
  if (userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') return <Navigate to="/agentdashboard" replace />;
  if (userData?.role === 'CUSTOMER') return <Navigate to="/userdashboard" replace />;
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
      <Routes>
        {/* ── Landing (public) ── */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/about"       element={<LandingPage />} />
        <Route path="/plans"       element={<LandingPage />} />
        <Route path="/pricing"     element={<LandingPage />} />
        <Route path="/features"    element={<LandingPage />} />
        <Route path="/claims-info" element={<LandingPage />} />
        <Route path="/calculator"  element={<LandingPage />} />

        {/* ── Auth (BUG-007: wrapped in GuestRoute) ── */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/verify-otp" element={<GuestRoute><VerifyOtp /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

        {/* ── App (protected) ── */}
        {/* ── Contact & Support (accessible to all) ── */}
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/support" element={<ContactUs />} />
        <Route path="/queries" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT', 'CUSTOMER']}>
            <CustomerQueries />
          </ProtectedRoute>
        } />
        <Route path="/admindashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/agentdashboard" element={
          <ProtectedRoute allowedRoles={['AGENT', 'SUPER_AGENT']}>
            <AgentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/policy" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT', 'CUSTOMER']}>
            <Policy />
          </ProtectedRoute>
        } />
        <Route path="/policy/:type" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT', 'CUSTOMER']}>
            <ProductCatalog />
          </ProtectedRoute>
        } />
        <Route path="/policy/:type/:productId/plans" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT', 'CUSTOMER']}>
            <PlanCatalog />
          </ProtectedRoute>
        } />
        <Route path="/claims" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT', 'CUSTOMER']}>
            <Claims />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT', 'CUSTOMER']}>
            <Payments />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT', 'CUSTOMER']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT']}>
            <Customers />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/policies" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'SUPER_AGENT']}>
            <Policies />
          </ProtectedRoute>
        } />

        {/* BUG-006: 404 catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
