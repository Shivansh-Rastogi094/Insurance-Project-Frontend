import React, { useEffect, useState } from 'react';
import { readAllUsers } from '../services/UserService';
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



  @media (max-width: 968px) {
    .main-content {
      margin-left: 0;
    }
  }

  @media (max-width: 768px) {
    .topbar {
      padding: 0 16px;
      height: 56px;
    }

    .topbar-logo span {
      font-size: 14px;
    }

    .role-badge {
      font-size: 10px;
      padding: 3px 8px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }

    .header {
      padding: 20px 16px 12px;
    }

    .header h2 {
      font-size: 20px;
    }

    .header p {
      font-size: 13px;
    }

    .divider {
      margin: 8px 16px 20px;
    }

    .section-label {
      padding: 0 16px;
      margin-bottom: 12px;
    }

    .cards {
      padding: 0 16px 20px;
      gap: 16px;
    }
  }

  @media (max-width: 576px) {
    .topbar {
      padding: 0 12px;
      height: 50px;
    }

    .topbar-logo span {
      font-size: 13px;
    }

    .topbar-right {
      gap: 10px;
    }

    .role-badge {
      font-size: 9px;
      padding: 2px 6px;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header {
      padding: 16px 12px 8px;
    }

    .header h2 {
      font-size: 18px;
    }

    .header p {
      font-size: 12px;
    }

    .divider {
      margin: 6px 12px 16px;
    }

    .section-label {
      padding: 0 12px;
    }

    .cards {
      padding: 0 12px 16px;
      gap: 12px;
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 400px) {
    .topbar-logo span {
      display: none;
    }

    .header h2 {
      font-size: 16px;
    }

    .cards {
      padding: 0 8px 12px;
    }
  }
`;
const fetchDashboardData = async () => {
  const [userRes, productRes, claimRes, policyRes, paymentRes] = await Promise.all([
    readAllUsers(0, 1000),
    readAllProducts(0, 1000),
    readAllClaims(0, 1000),
    readAllPolicies(0, 1000),
    readAllPayments(0, 1000)
  ]);
  
  const payments = paymentRes?.data?.content
    ? paymentRes.data.content.reduce((sum, payment) => sum + payment.amount, 0)
    : 0;

  const claims = claimRes?.data?.content
    ? claimRes.data.content.reduce((sum, claim) => sum + claim.claimAmount, 0)
    : 0;
    
  return {
    totalPayments: payments,
    totalClaims: claims,
    users: userRes?.data?.totalElements ?? userRes?.data?.content?.length ?? 0,
    products: productRes?.data?.totalElements ?? productRes?.data?.content?.length ?? 0,
    claimsCount: claimRes?.data?.totalElements ?? claimRes?.data?.content?.length ?? 0,
    policies: policyRes?.data?.totalElements ?? policyRes?.data?.content?.length ?? 0,
    paymentsCount: paymentRes?.data?.totalElements ?? paymentRes?.data?.content?.length ?? 0
  };
};

const Dashboard = () => {
  const {userData} = useAuth();

  const { data, loading, execute } = useFetch(fetchDashboardData);

  useEffect(() => {
    execute();
  }, [execute]);

  const { totalPayments = 0, totalClaims = 0, users = 0, products = 0, claimsCount = 0, policies = 0, paymentsCount = 0 } = data || {};

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <Sidebar title="Admin Dashboard"/>
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">
              <div className="brand-glyph-sm">C</div>
              <span>Crown Assurance</span>
            </div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.fullName || "Admin"}</span>
              <div className="user-avatar" title={ userData?.fullName || "Admin User"}>
                {(userData?.fullName || "Admin").split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
              </div>
            </div>
          </div>

          <div className="header">
            <h2>Good Morning, {userData?.fullName || "Admin"} <i className="ph ph-hand-waving"></i></h2>
            <p>Overview of your current system metrics</p>
          </div>

          <div className="divider" />

          <p className="section-label">System Overview</p>
          
          <div className="cards">
            <Card title="Users" value={users} icon={<i className="ph ph-users"></i>} accent="accent-blue" sub="Registered accounts" />
            <Card title="Products" value={products} icon={<i className="ph ph-package"></i>} accent="accent-blue" sub="Active offerings" />
            <Card title="Policies" value={policies} icon={<i className="ph ph-file-text"></i>} accent="accent-blue" sub="Issued policies" />
            <Card title="Claims" value={claimsCount} icon={<i className="ph ph-file-arrow-up"></i>} accent="accent-amber" sub="Filed claims" />
            <Card title="Payments" value={paymentsCount} icon={<i className="ph ph-credit-card"></i>} accent="accent-blue" sub="Transactions logged" />
            <Card title="Total Claims Paid" value={totalClaims.toLocaleString('en-IN')} icon={<i className="ph ph-coins"></i>} accent="accent-amber" prefix="₹" sub="Cumulative claim amount" />
            <Card title="Total Payments Received" value={totalPayments.toLocaleString('en-IN')} icon={<i className="ph ph-trend-up"></i>} accent="accent-green" prefix="₹" sub="Cumulative premium collected" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;