import React, { useEffect, useState } from 'react';
import { readAllCustomers } from '../services/CustomerService';
import { readAllProducts } from '../services/ProductService';
import { readAllClaims } from '../services/ClaimService';
import { readAllPolicies } from '../services/PolicyService';
import { readAllPayments } from '../services/PaymentService';
import Card from '../components/Card';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';

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

  @media (max-width: 1024px) {
    .main-content {
      margin-left: 0;
    }
    .sidebar {
      display: none;
    }
  }
`;

const fetchDashboardData = async () => {
  const [customerRes, productRes, claimRes, policyRes, paymentRes] = await Promise.all([
    readAllCustomers().catch(err => { console.warn("readAllCustomers failed:", err); return { data: { content: [] } }; }),
    readAllProducts().catch(err => { console.warn("readAllProducts failed:", err); return { data: { content: [] } }; }),
    readAllClaims().catch(err => { console.warn("readAllClaims failed:", err); return { data: { content: [] } }; }),
    readAllPolicies().catch(err => { console.warn("readAllPolicies failed:", err); return { data: { content: [] } }; }),
    readAllPayments().catch(err => { console.warn("readAllPayments failed:", err); return { data: { content: [] } }; })
  ]);

  const paymentsSum = paymentRes?.data?.content
    ? paymentRes.data.content.reduce((sum, payment) => sum + payment.amount, 0)
    : 0;

  return {
    clients: customerRes?.data?.content?.length || 0,
    products: productRes?.data?.content?.length || 0,
    policies: policyRes?.data?.content?.length || 0,
    claims: claimRes?.data?.content?.length || 0,
    totalPremium: paymentsSum
  };
};

const AgentDashboard = () => {
  const { userData } = useAuth();

  const { data, loading, execute } = useFetch(fetchDashboardData);

  useEffect(() => {
    execute();
  }, [execute]);

  const { clients = 0, products = 0, policies = 0, claims = 0, totalPremium = 0 } = data || {};

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <Sidebar title="Agent Dashboard" />
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">🛡️ InsureSpace</div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.role || "Officer"} | Workspace</span>
              <div className="user-avatar" title={userData?.fullName || "Officer User"}>
                {(userData?.fullName || "Officer").split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
              </div>
            </div>
          </div>

          <div className="header">
            <h2>Welcome Back, {userData?.fullName || "Officer"} 👋</h2>
            <p>Here is an overview of clients, active policies, and outstanding claims.</p>
          </div>

          <div className="divider" />

          <p className="section-label">Officer Overview</p>
          
          <div className="cards">
            <Card title="Clients" value={clients} icon="👥" accent="accent-blue" sub="Registered clients" />
            <Card title="Insurance Products" value={products} icon="📦" accent="accent-blue" sub="Active offerings" />
            <Card title="Issued Policies" value={policies} icon="🗂️" accent="accent-blue" sub="Managed policies" />
            <Card title="Claims Filed" value={claims} icon="📄" accent="accent-amber" sub="Outstanding claims" />
            <Card title="Premium Collected" value={totalPremium.toLocaleString('en-IN')} icon="✅" accent="accent-green" prefix="₹" sub="Cumulative client payments" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentDashboard;