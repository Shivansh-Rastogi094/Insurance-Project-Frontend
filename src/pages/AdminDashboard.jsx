import React, { useEffect, useState } from 'react';
import { readAllUsers } from '../services/UserService';
import { readAllProducts } from '../services/ProductService';
import { readAllClaims } from '../services/ClaimService';
import { readAllPolicies } from '../services/PolicyService';
import { readAllPayments } from '../services/PaymentService';
import Card from '../components/Card';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
const styles = `
  .dashboard-container {
    font-family: var(--font-body);
    background: var(--surface);
    min-height: 100vh;
    display: flex;
    position: relative;
  }

  .main-content {
    flex: 1;
    margin-left: 240px;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    height: 60px;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .topbar-logo {
    font-size: 16px;
    font-weight: 700;
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .role-badge {
    font-size: 12px;
    font-weight: 600;
    color: var(--primary-light);
    background: rgba(37, 99, 168, 0.1);
    padding: 4px 10px;
    border-radius: var(--radius-badge);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--primary);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    border: 2px solid var(--border);
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .user-avatar:hover {
    transform: scale(1.05);
  }

  .header {
    padding: 32px 40px 16px;
  }

  .header h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .header p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 8px 40px 24px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    padding: 0 40px;
    margin-bottom: 16px;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 0 40px 40px;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 24px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-card);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 160px;
  }

  .card:hover {
    box-shadow: var(--shadow-premium);
    transform: translateY(-4px);
    border-color: rgba(37, 99, 168, 0.2);
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }

  .card.accent-blue::before { background: var(--primary-light); }
  .card.accent-green::before { background: var(--success); }
  .card.accent-amber::before { background: var(--warning); }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .card-header h4 {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  .card-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: transform 0.2s ease;
  }

  .card:hover .card-icon-wrap {
    transform: scale(1.1);
  }

  .card.accent-blue .card-icon-wrap { background: rgba(37, 99, 168, 0.1); color: var(--primary-light); }
  .card.accent-green .card-icon-wrap { background: rgba(22, 163, 74, 0.1); color: var(--success); }
  .card.accent-amber .card-icon-wrap { background: rgba(245, 158, 11, 0.1); color: var(--warning); }

  .card-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-mono);
    letter-spacing: -0.5px;
    margin-top: auto;
  }

  .card-sub {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
  }

  @media (max-width: 1024px) {
    .main-content {
      margin-left: 0;
    }
    .sidebar {
      display: none;
    }
  }
`;
const Dashboard = () => {
  const [users, setUsers] = useState(0);
  const [claims, setClaims] = useState(0);
  const [products, setProducts] = useState(0);
  const [policies, setPolicies] = useState(0);
  const [payments, setPayments] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);

 const {userData} = useAuth();

  const fetchDashboardData = async () => {
    try {
      const [userRes, productRes, claimRes, policyRes, paymentRes] = await Promise.all([
        readAllUsers(),
        readAllProducts(),
        readAllClaims(),
        readAllPolicies(),
        readAllPayments()
      ]);
      const payments = paymentRes?.data?.content
        ? paymentRes.data.content.reduce((sum, payment) => sum + payment.amount, 0)
        : 0;

      const claims = claimRes?.data?.content
        ? claimRes.data.content.reduce((sum, claim) => sum + claim.claimAmount, 0)
        : 0;
        
      setTotalPayments(payments);
      setTotalClaims(claims);
      setUsers(userRes?.data?.content?.length || 0);
      setProducts(productRes?.data?.content?.length || 0);
      setClaims(claimRes?.data?.content?.length || 0);
      setPolicies(policyRes?.data?.content?.length || 0);
      setPayments(paymentRes?.data?.content?.length || 0);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <Sidebar title="Admin Dashboard"/>
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">🛡️ InsureSpace</div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.fullName || "Admin"}</span>
              <div className="user-avatar" title={ userData?.fullName || "Admin User"}>
                {(userData?.fullName || "Admin").split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
              </div>
            </div>
          </div>

          <div className="header">
            <h2>Good Morning, {userData?.fullName || "Admin"} 👋</h2>
            <p>Overview of your current system metrics</p>
          </div>

          <div className="divider" />

          <p className="section-label">System Overview</p>
          
          <div className="cards">
            <Card title="Users" value={users} icon="👥" accent="accent-blue" sub="Registered accounts" />
            <Card title="Products" value={products} icon="📦" accent="accent-blue" sub="Active offerings" />
            <Card title="Policies" value={policies} icon="🗂️" accent="accent-blue" sub="Issued policies" />
            <Card title="Claims" value={claims} icon="📄" accent="accent-amber" sub="Filed claims" />
            <Card title="Payments" value={payments} icon="💵" accent="accent-blue" sub="Transactions logged" />
            <Card title="Total Claims Paid" value={totalClaims.toLocaleString('en-IN')} icon="💸" accent="accent-amber" prefix="₹" sub="Cumulative claim amount" />
            <Card title="Total Payments Received" value={totalPayments.toLocaleString('en-IN')} icon="✅" accent="accent-green" prefix="₹" sub="Cumulative premium collected" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;