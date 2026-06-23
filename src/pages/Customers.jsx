import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readAllCustomers } from '../services/CustomerService';
import { useFetch } from '../hooks/useFetch';

const styles = `
  .page-container {
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

  .summary-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 24px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-card);
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    width: 320px;
    margin: 0 40px 24px;
  }

  .summary-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--primary-light);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  .card-icon {
    font-size: 20px;
    background: rgba(37, 99, 168, 0.1);
    color: var(--primary-light);
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-mono);
    margin-top: 12px;
  }

  .card-sub {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .table-container {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
    margin: 0 40px 40px;
    box-shadow: var(--shadow-card);
  }

  .customers-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  }

  .customers-table th {
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--border);
    padding: 16px 24px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.05em;
  }

  .customers-table td {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    color: var(--text-primary);
    white-space: nowrap;
  }

  .customers-table tr:last-child td {
    border-bottom: none;
  }

  .customers-table tr:hover td {
    background: rgba(37, 99, 168, 0.02);
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 300px;
    color: var(--text-secondary);
  }

  .spinner {
    border: 3.5px solid var(--border);
    border-top: 3.5px solid var(--primary-light);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 300px;
    color: var(--danger);
    padding: 40px;
    text-align: center;
  }

  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 250px;
    color: var(--text-secondary);
    text-align: center;
    background: var(--card);
    border: 1px dashed var(--border);
    border-radius: var(--radius-card);
    margin: 0 40px 40px;
    padding: 40px;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
    }
    .table-container {
      margin: 0 20px 20px;
      overflow-x: auto;
    }
    .summary-card {
      margin: 0 20px 20px;
      width: calc(100% - 40px);
    }
    .header {
      padding: 24px 20px 16px;
    }
    .divider {
      margin: 8px 20px 24px;
    }
    .empty-container {
      margin: 0 20px 20px;
    }
  }
`;

const Customers = () => {
  const { userData } = useAuth();
  const fetchCustomersData = async () => {
    const response = await readAllCustomers();
    if (response && response.data) {
      return {
        customersList: response.data.content || [],
        total: response.data.totalElements !== undefined ? response.data.totalElements : (response.data.content?.length || 0)
      };
    }
    return { customersList: [], total: 0 };
  };

  const { data, loading, error, execute: fetchCustomers } = useFetch(fetchCustomersData);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const customers = data?.customersList || [];
  const totalCount = data?.total || 0;

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <Sidebar title={userData?.role === 'AGENT' ? 'Agent Workspace' : 'Admin Panel'} />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">🛡️ InsureSpace</div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.role || 'STAFF'}</span>
              <div className="user-avatar" title={userData?.fullName || 'User'}>
                {initials}
              </div>
            </div>
          </div>

          <div className="header">
            <div className="header-text">
              <h2>Customers Directory</h2>
              <p>View and manage client contact details, address, and nominee records</p>
            </div>
          </div>

          <div className="divider" />

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Fetching customers directory...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>⚠️ {error}</p>
            </div>
          ) : (
            <>
              {/* Active Customers Metric Card */}
              <div className="summary-card">
                <div className="card-header">
                  <span className="card-title">Active Customers</span>
                  <span className="card-icon">👥</span>
                </div>
                <div className="card-value">{totalCount}</div>
                <div className="card-sub">Registered Customers with Complete profile</div>
              </div>

              {customers.length === 0 ? (
                <div className="empty-container">
                  <p>📋 No customer records found in the system database.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="customers-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email Address</th>
                        <th>Phone Number</th>
                        <th>Date of Birth</th>
                        <th>Location</th>
                        <th>Nominee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id || c.email}>
                          <td style={{ fontWeight: '600' }}>{c.fullName || 'N/A'}</td>
                          <td>{c.email || 'N/A'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{c.phoneNumber || 'N/A'}</td>
                          <td>
                            {c.dateOfBirth 
                              ? new Date(c.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'N/A'}
                          </td>
                          <td>
                            {c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state || 'N/A'}
                          </td>
                          <td>
                            {c.nomineeName 
                              ? `${c.nomineeName} (${c.nomineeRelation || 'Nominee'})` 
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Customers;
