import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import AgentDashboard from './pages/AgentDashboard'
import { Routes,Route } from 'react-router-dom'
import Login from "./pages/Login"
import UserDashboard from './pages/UserDashboard'
import Policy from './pages/Policy'
import Claims from './pages/Claims'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import ProductCatalog from './pages/ProductCatalog'
import PlanCatalog from './pages/PlanCatalog'
import Customers from './pages/Customers'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/admindashboard" element={<AdminDashboard/>}/> 
        <Route path="/userdashboard" element={<UserDashboard/>}></Route>
        <Route path="/agentdashboard" element={<AgentDashboard/>}></Route>
        <Route path="/policy" element={<Policy/>}></Route>
        <Route path="/policy/:type" element={<ProductCatalog/>}></Route>
        <Route path="/policy/:type/:productId/plans" element={<PlanCatalog/>}></Route>
        <Route path="/claims" element={<Claims/>}></Route>
        <Route path="/payments" element={<Payments/>}></Route>
        <Route path="/profile" element={<Profile/>}></Route>
        <Route path="/customers" element={<Customers/>}></Route>
      </Routes>
    </>
  )
}

export default App
