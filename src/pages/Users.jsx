import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { readAllUsers, activateUser, deactivateUser, createAgentAccount } from '../services/UserService';
import Modal from '../components/Modal';
import DownloadButton from '../components/DownloadButton';
import { generateUserListPDF } from '../utils/pdfGenerator';
import { useToast } from '../components/ToastProvider';

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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-text h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .header-text p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 8px 40px 24px;
  }

  .metrics-row {
    display: flex;
    gap: 24px;
    padding: 0 40px 24px;
    flex-wrap: wrap;
  }

  .summary-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 20px 24px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100px;
    width: 260px;
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

  .summary-card.active-users::before {
    background: var(--success);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  .card-icon {
    font-size: 18px;
    background: rgba(37, 99, 168, 0.08);
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .summary-card.active-users .card-icon {
    background: rgba(16, 185, 129, 0.08);
  }

  .card-value {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-mono);
    margin-top: 8px;
  }

  .table-container {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
    margin: 0 40px 40px;
    box-shadow: var(--shadow-card);
  }

  .users-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  }

  .users-table th {
    background: rgba(255, 255, 255, 0.01);
    border-bottom: 1px solid var(--border);
    padding: 16px 24px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.05em;
  }

  .users-table td {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    color: var(--text-primary);
    white-space: nowrap;
    vertical-align: middle;
  }

  .users-table tr:last-child td {
    border-bottom: none;
  }

  .users-table tr:hover td {
    background: rgba(37, 99, 168, 0.02);
  }

  .user-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .user-badge.admin {
    background: rgba(147, 51, 234, 0.1);
    color: #a855f7;
    border: 1px solid rgba(147, 51, 234, 0.2);
  }

  .user-badge.agent {
    background: rgba(37, 99, 168, 0.1);
    color: var(--primary-light);
    border: 1px solid rgba(37, 99, 168, 0.2);
  }

  .user-badge.customer {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-dot {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
  }

  .status-dot::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-dot.active::before {
    background-color: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  }

  .status-dot.inactive::before {
    background-color: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  }

  .action-btn {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn.deactivate {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
    background: rgba(239, 68, 68, 0.02);
  }

  .action-btn.deactivate:hover {
    background: #ef4444;
    color: #ffffff;
    border-color: #ef4444;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
  }

  .action-btn.activate {
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.2);
    background: rgba(16, 185, 129, 0.02);
  }

  .action-btn.activate:hover {
    background: #10b981;
    color: #ffffff;
    border-color: #10b981;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
  }

  .pagination-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.01);
    border-top: 1px solid var(--border);
  }

  .pagination-info {
    font-size: 12.5px;
    color: var(--text-secondary);
  }

  .pagination-controls {
    display: flex;
    gap: 8px;
  }

  .page-btn {
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .page-btn:hover:not(:disabled) {
    border-color: var(--primary-light);
    color: var(--primary-light);
  }

  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
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

  @media (max-width: 968px) {
    .main-content {
      margin-left: 0;
    }
    .table-container {
      margin: 0 20px 20px;
    }
    .metrics-row,
    .header {
      padding: 24px 20px 16px;
    }
    .divider {
      margin: 8px 20px 24px;
    }
  }

  .btn-primary {
    background: var(--primary);
    color: #ffffff;
    border: none;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 4px 6px -1px rgba(26, 60, 94, 0.15);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-primary:hover {
    background: var(--primary-light);
  }

  .btn-primary:active {
    transform: scale(0.98);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .form-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  .form-input {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-input);
    color: var(--text-primary);
    background-color: var(--surface);
    font-family: inherit;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary-light);
    background-color: var(--card);
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .modal-content {
    background: var(--card);
    border-radius: var(--radius-card);
    width: 100%;
    max-width: 480px;
    box-shadow: var(--shadow-premium);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 32px;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .modal-body {
    margin-bottom: 24px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .btn-cancel {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    padding: 10px 18px;
    font-size: 13.5px;
    font-weight: 600;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-cancel:hover {
    background: var(--surface);
    color: var(--text-primary);
  }

  .btn-confirm {
    background: var(--primary);
    color: #ffffff;
    border: none;
    padding: 10px 18px;
    font-size: 13.5px;
    font-weight: 600;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-confirm:hover {
    background: var(--primary-light);
  }

  .filter-bar {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 20px 24px;
    margin: 0 40px 24px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto;
    gap: 16px;
    align-items: end;
    box-shadow: var(--shadow-card);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    .filter-bar {
      grid-template-columns: 1fr;
      margin: 0 20px 24px;
    }
  }
`;

const Users = () => {
  const toast = useToast();
  const { userData } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Modals state
  const [showActionModal, setShowActionModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState('PAGE'); // 'PAGE', 'FULL', 'CUSTOM'
  const [customExportLimit, setCustomExportLimit] = useState('50');
  const [exporting, setExporting] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
  };

  // Add Agent Modal state
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [agentData, setAgentData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'AGENT'
  });
  const [agentSubmitting, setAgentSubmitting] = useState(false);

  const handleAddAgentSubmit = async (e) => {
    e.preventDefault();
    if (!agentData.fullName.trim() || !agentData.email.trim() || !agentData.password.trim() || !agentData.phoneNumber.trim()) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setAgentSubmitting(true);
      await createAgentAccount(agentData);
      toast.success("Agent account created successfully!");
      setShowAddAgentModal(false);
      // Reset form
      setAgentData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'AGENT'
      });
      // Refresh list
      loadUsers(currentPage);
    } catch (err) {
      console.error("Failed to create agent:", err);
      toast.error(`Failed to create agent: ${err?.response?.data?.message || err.message}`);
    } finally {
      setAgentSubmitting(false);
    }
  };

  const fetchUsersData = useCallback(async (page = 0) => {
    const response = await readAllUsers(page, pageSize);
    return response?.data || response || {};
  }, []);

  const { data, loading, error, execute: loadUsers } = useFetch(fetchUsersData);

  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage, loadUsers]);

  const usersList = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = !searchQuery || 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && user.active) ||
      (statusFilter === 'DEACTIVATED' && !user.active);

    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Calculate active and total count from fetched page (or display metrics)
  const activeCount = usersList.filter(u => u.active).length;

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  const handleActionClick = (user) => {
    setTargetUser(user);
    setRemarks('');
    setShowActionModal(true);
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!targetUser) return;
    if (!remarks.trim()) {
      toast.error("Please enter remarks explaining your decision.");
      return;
    }

    try {
      setModalSubmitting(true);
      const payload = { remarks: remarks.trim() };
      
      if (targetUser.active) {
        await deactivateUser(targetUser.id, payload);
        toast.success(`User "${targetUser.fullName}" deactivated successfully.`);
      } else {
        await activateUser(targetUser.id, payload);
        toast.success(`User "${targetUser.fullName}" activated successfully.`);
      }

      setShowActionModal(false);
      loadUsers(currentPage);
    } catch (err) {
      console.error("Action execution failed:", err);
      toast.error(`Operation failed: ${err?.response?.data?.message || err.message}`);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    setExporting(true);
    try {
      let usersToExport = [];
      if (exportRange === 'PAGE') {
        usersToExport = filteredUsers;
      } else {
        const limit = exportRange === 'FULL' ? totalElements : parseInt(customExportLimit);
        if (!limit || limit <= 0) {
          toast.error("Please enter a valid count.");
          setExporting(false);
          return;
        }
        const res = await readAllUsers(0, limit);
        const list = res?.data?.content || res?.content || [];
        
        // Apply filters to the fetched list
        usersToExport = list.filter(user => {
          const matchesSearch = !searchQuery || 
            user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            user.role?.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
          const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && user.active) ||
            (statusFilter === 'DEACTIVATED' && !user.active);

          return matchesSearch && matchesRole && matchesStatus;
        });
      }

      if (usersToExport.length === 0) {
        toast.error("No users found matching current filters inside chosen range.");
      } else {
        generateUserListPDF(usersToExport, { role: roleFilter, status: statusFilter, search: searchQuery });
      }
      setShowExportModal(false);
    } catch (err) {
      console.error("Export list failed:", err);
      toast.error("Failed to export list. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <Sidebar title="Admin Panel" />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">
              <div className="brand-glyph-sm">C</div>
              <span>Crown Assurance</span>
            </div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.role || 'ADMIN'}</span>
              <div className="user-avatar" title={userData?.fullName || 'Admin User'}>
                {initials}
              </div>
            </div>
          </div>

          <div className="header">
            <div className="header-text">
              <h2>Users Directory</h2>
              <p>Manage system credentials, user activation status, and administrative role rights</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {filteredUsers.length > 0 && (
                <button
                  className="btn-export"
                  onClick={() => {
                    setExportRange('PAGE');
                    setCustomExportLimit('50');
                    setShowExportModal(true);
                  }}
                  title="Export Users Report Options"
                >
                  <><i className="ph ph-chart-bar"></i> Export List</>
                </button>
              )}
              {userData?.role === 'ADMIN' && (
                <button className="btn-primary" onClick={() => setShowAddAgentModal(true)}>
                  + Add Officer
                </button>
              )}
            </div>
          </div>

          <div className="divider" />

          {/* Metrics section */}
          <div className="metrics-row">
            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">Registered Accounts</span>
                <i className="card-icon ph ph-users"></i>
              </div>
              <div className="card-value">{totalElements}</div>
            </div>
            <div className="summary-card active-users">
              <div className="card-header">
                <span className="card-title">Active Logins</span>
                <i className="card-icon ph ph-check-circle" style={{color: "var(--success-color)"}}></i>
              </div>
              <div className="card-value">
                {usersList.length > 0 
                  ? usersList.filter(u => u.active).length 
                  : 0}
              </div>
            </div>
          </div>

          {/* Filters section */}
          {!loading && !error && usersList.length > 0 && (
            <div className="filter-bar">
              <div className="filter-group">
                <label className="filter-label">Search</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Search Name, Email, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">Filter by Role</label>
                <select 
                  className="filter-input" 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="AGENT">Officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Filter by Login Status</label>
                <select 
                  className="filter-input" 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVATED">Deactivated</option>
                </select>
              </div>
              {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button 
                  className="clear-filter-btn" 
                  onClick={handleClearFilters}
                  title="Clear All Filters"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="loading-container" style={{ width: '100%', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height={60} />
              <Skeleton count={5} height={50} style={{ marginBottom: '8px' }} />
            </div>
          ) : error ? (
            <div className="loading-container" style={{ color: 'var(--danger)' }}>
              <p>⚠️ Error loading user directory: {error}</p>
              <button className="page-btn" style={{ marginTop: '12px' }} onClick={() => loadUsers(currentPage)}>
                Retry
              </button>
            </div>
          ) : usersList.length === 0 ? (
            <div className="loading-container">
              <p><i className="ph ph-clipboard"></i> No registered user accounts found.</p>
            </div>
          ) : (
            <>
              {filteredUsers.length === 0 ? (
                <div className="empty-state" style={{ 
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)',
                  fontSize: '13.5px',
                  fontStyle: 'italic',
                  border: '1px dashed var(--border)',
                  borderRadius: '8px',
                  background: 'var(--card)',
                  margin: '0 40px 40px'
                }}>
                  <i className="ph ph-magnifying-glass" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                  <h3>No Matching Users</h3>
                  <p style={{ marginTop: '4px' }}>No user accounts match your filter criteria. Try adjusting your search query or role/status filters.</p>
                  <button className="btn-primary" style={{ marginTop: '12px', background: 'var(--primary)' }} onClick={handleClearFilters}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <div className="users-table-wrapper">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Email Address</th>
                          <th>Phone Number</th>
                          <th>System Role</th>
                          <th>Login Status</th>
                          <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => {
                          const isSelf = user.email === userData?.email;
                          const roleClass = (user.role || 'CUSTOMER').toLowerCase();
                          
                          return (
                            <tr key={user.id}>
                              <td style={{ fontWeight: '600' }}>
                                {user.fullName} {isSelf && <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>(You)</span>}
                              </td>
                              <td>{user.email}</td>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>{user.phoneNumber || 'N/A'}</td>
                              <td>
                                <span className={`user-badge ${roleClass}`}>
                                  {user.role =="AGENT"? "Officer" : user.role}
                                </span>
                              </td>
                              <td>
                                <span className={`status-dot ${user.active ? 'active' : 'inactive'}`}>
                                  {user.active ? 'Active' : 'Deactivated'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', paddingRight: '24px', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <DownloadButton
                                  type="user"
                                  data={user}
                                  label={<><i className="ph ph-download" /> PDF</>}
                                  title="Download Profile Receipt PDF"
                                  className="action-btn"
                                  style={{
                                    background: "rgba(37, 99, 168, 0.05)",
                                    border: "1px solid rgba(37, 99, 168, 0.1)",
                                    color: "var(--primary-light)",
                                    padding: "6px 10px",
                                    fontSize: "12px"
                                  }}
                                />
                                <button
                                  className={`action-btn ${user.active ? 'deactivate' : 'activate'}`}
                                  onClick={() => handleActionClick(user)}
                                  disabled={isSelf}
                                  title={isSelf ? "You cannot deactivate or activate your own admin account" : ""}
                                  style={{ opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                                >
                                  {user.active ? 'Deactivate' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  {totalPages > 1 && (
                    <div className="pagination-footer">
                      <div className="pagination-info">
                        Showing Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> (<strong>{totalElements}</strong> total users)
                      </div>
                      <div className="pagination-controls">
                        <button
                          className="page-btn"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                          disabled={currentPage === 0 || loading}
                        >
                          <i className="ph ph-arrow-left"></i> Previous
                        </button>
                        <button
                          className="page-btn"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                          disabled={currentPage === totalPages - 1 || loading}
                        >
                          Next <i className="ph ph-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation remarks modal */}
      {showActionModal && targetUser && (
        <Modal
          isOpen={showActionModal}
          onClose={() => { if (!modalSubmitting) setShowActionModal(false); }}
          title={targetUser.active ? <><i className="ph ph-lock-key"></i> Confirm User Deactivation</> : <><i className="ph ph-lock-key-open"></i> Confirm User Activation</>}
          maxWidth="460px"
        >
          <form onSubmit={handleConfirmAction} style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              You are modifying status for user <strong style={{ color: 'var(--text-primary)' }}>{targetUser.fullName}</strong> ({targetUser.email}).
              This operation will immediately {targetUser.active ? 'revoke' : 'restore'} login and workspace rights for this account.
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Remarks / Rationale</label>
              <textarea
                className="form-input"
                style={{ 
                  minHeight: '90px', 
                  fontFamily: 'inherit', 
                  resize: 'vertical',
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
                placeholder={targetUser.active ? "Enter reason for deactivation (e.g. Account suspended, Policy breach)" : "Enter reason for activation (e.g. Identity verified, Appeal approved)"}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required
                disabled={modalSubmitting}
              />
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowActionModal(false)}
                disabled={modalSubmitting}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-confirm"
                disabled={modalSubmitting}
                style={{
                  background: targetUser.active ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: modalSubmitting ? 0.6 : 1
                }}
              >
                {modalSubmitting ? 'Processing...' : targetUser.active ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {/* Add Agent Modal */}
      {showAddAgentModal && (
        <Modal
          isOpen={showAddAgentModal}
          onClose={() => { if (!agentSubmitting) setShowAddAgentModal(false); }}
          title={<><i className="ph ph-sparkle"></i> Add New Agent</>}
          maxWidth="480px"
        >
          <form onSubmit={handleAddAgentSubmit} style={{ marginTop: '16px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. alex"
                value={agentData.fullName}
                onChange={(e) => setAgentData({ ...agentData, fullName: e.target.value })}
                disabled={agentSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="e.g. alexKh@gmail.com"
                value={agentData.email}
                onChange={(e) => setAgentData({ ...agentData, email: e.target.value })}
                disabled={agentSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="e.g. Alex123"
                value={agentData.password}
                onChange={(e) => setAgentData({ ...agentData, password: e.target.value })}
                disabled={agentSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Phone Number</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 9876543211"
                value={agentData.phoneNumber}
                onChange={(e) => setAgentData({ ...agentData, phoneNumber: e.target.value })}
                disabled={agentSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowAddAgentModal(false)}
                disabled={agentSubmitting}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-confirm"
                disabled={agentSubmitting}
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: agentSubmitting ? 0.6 : 1
                }}
              >
                {agentSubmitting ? 'Creating...' : 'Create Officer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => { if (!exporting) setShowExportModal(false); }}
          title={<><i className="ph ph-chart-bar"></i> Export Users Directory PDF</>}
          maxWidth="460px"
        >
          <form onSubmit={handleExportSubmit} style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Select your export range preference. The report will respect your current filters: 
              <strong style={{ color: 'var(--text-primary)' }}> Role: {roleFilter}</strong> and 
              <strong style={{ color: 'var(--text-primary)' }}> Status: {statusFilter}</strong>.
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Export Option</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="exportRange"
                    value="PAGE"
                    checked={exportRange === 'PAGE'}
                    onChange={() => setExportRange('PAGE')}
                    disabled={exporting}
                  />
                  Current Page List (max {pageSize} users)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="exportRange"
                    value="FULL"
                    checked={exportRange === 'FULL'}
                    onChange={() => setExportRange('FULL')}
                    disabled={exporting}
                  />
                  Full System Directory ({totalElements} users)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="exportRange"
                    value="CUSTOM"
                    checked={exportRange === 'CUSTOM'}
                    onChange={() => setExportRange('CUSTOM')}
                    disabled={exporting}
                  />
                  Custom Quantity
                </label>
              </div>
            </div>

            {exportRange === 'CUSTOM' && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Quantity to Extract</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  required
                  className="form-input"
                  value={customExportLimit}
                  onChange={(e) => setCustomExportLimit(parseInt(e.target.value) || '')}
                  disabled={exporting}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="e.g. 50"
                />
              </div>
            )}

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowExportModal(false)}
                disabled={exporting}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-confirm"
                disabled={exporting}
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: exporting ? 0.6 : 1
                }}
              >
                {exporting ? 'Exporting...' : 'Generate PDF'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default Users;
