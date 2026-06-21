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
import Register         from './pages/Register'
import VerifyOtp        from './pages/VerifyOtp'

// Landing sub-pages
import Home        from './pages/landing/Home'
import About       from './pages/landing/About'
import Plans       from './pages/landing/Plans'
import Pricing     from './pages/landing/Pricing'
import Features    from './pages/landing/Features'
import ClaimsInfo  from './pages/landing/ClaimsInfo'

function App() {
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

        {/* ── App (protected) ── */}
        <Route path="/admindashboard"                element={<AdminDashboard />} />
        <Route path="/userdashboard"                 element={<UserDashboard />} />
        <Route path="/agentdashboard"                element={<AgentDashboard />} />
        <Route path="/policy"                        element={<Policy />} />
        <Route path="/policy/:type"                  element={<ProductCatalog />} />
        <Route path="/policy/:type/:productId/plans" element={<PlanCatalog />} />
        <Route path="/claims"                        element={<Claims />} />
        <Route path="/payments"                      element={<Payments />} />
        <Route path="/profile"                       element={<Profile />} />
        <Route path="/customers"                     element={<Customers />} />
      </Routes>
    </>
  )
}

export default App
