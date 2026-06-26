import React, { useEffect } from 'react'
import './App.css'
import AdminDashboard   from './pages/AdminDashboard'
import AgentDashboard   from './pages/AgentDashboard'
import { Routes, Route } from 'react-router-dom'
import Login            from "./pages/Login"
import UserDashboard    from './pages/UserDashboard'
import Policy           from './pages/Policy'
import Claims           from './pages/Claims'
import Payments         from './pages/Payments'
import Profile          from './pages/Profile'
import ProductCatalog   from './pages/ProductCatalog'
import PlanCatalog      from './pages/PlanCatalog'
import Customers        from './pages/Customers'
import Users            from './pages/Users'
import Policies         from './pages/Policies'
import Register         from './pages/Register'
import VerifyOtp        from './pages/VerifyOtp'
import ForgotPassword   from './pages/ForgotPassword'
import ResetPassword    from './pages/ResetPassword'
import { ProtectedRoute } from './components/ProtectedRoute'

// Landing sub-pages
import Home        from './pages/landing/Home'
import About       from './pages/landing/About'
import Plans       from './pages/landing/Plans'
import Pricing     from './pages/landing/Pricing'
import Features    from './pages/landing/Features'
import ClaimsInfo  from './pages/landing/ClaimsInfo'

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  return (
    <>
      <Routes>
        {/* ── Landing (public) ── */}
        <Route path="/"            element={<Home />} />
        <Route path="/about"       element={<About />} />
        <Route path="/plans"       element={<Plans />} />
        <Route path="/pricing"     element={<Pricing />} />
        <Route path="/features"    element={<Features />} />
        <Route path="/claims-info" element={<ClaimsInfo />} />

        {/* ── Auth ── */}
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/verify-otp"  element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── App (protected) ── */}
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
          <ProtectedRoute allowedRoles={['AGENT']}>
            <AgentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/policy" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'CUSTOMER']}>
            <Policy />
          </ProtectedRoute>
        } />
        <Route path="/policy/:type" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'CUSTOMER']}>
            <ProductCatalog />
          </ProtectedRoute>
        } />
        <Route path="/policy/:type/:productId/plans" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'CUSTOMER']}>
            <PlanCatalog />
          </ProtectedRoute>
        } />
        <Route path="/claims" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'CUSTOMER']}>
            <Claims />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <Payments />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT', 'CUSTOMER']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT']}>
            <Customers />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/policies" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'AGENT']}>
            <Policies />
          </ProtectedRoute>
        } />
      </Routes>
      {/* Everything works as expected project complete */}
    </>
  )
}

export default App

