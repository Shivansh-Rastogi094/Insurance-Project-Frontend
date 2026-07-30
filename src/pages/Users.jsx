import React, { useEffect, useState, useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { readAllUsers, activateUser, deactivateUser } from '../services/UserService';
import Modal from '../components/Modal';
import { generateUserListPDF } from '../utils/pdfGenerator';
import { useToast } from '../components/ToastProvider';
import UserFilterBar from '../components/users/UserFilterBar';
import UsersTable from '../components/users/UsersTable';
import AddUserModal from '../components/users/AddUserModal';
import '../styles/Users.css';

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

  // Add Officer Modal
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState('PAGE');
  const [customExportLimit, setCustomExportLimit] = useState('50');
  const [exporting, setExporting] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
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
        usersToExport = res?.data?.content || res?.content || [];
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
      <div className="users-page page-container">
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

          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
            <UserFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              handleClearFilters={handleClearFilters}
            />
          )}

          {loading ? (
            <div className="loading-container" style={{ width: '100%', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height={60} />
              <Skeleton count={5} height={50} style={{ marginBottom: '8px' }} />
            </div>
          ) : error ? (
            <div className="loading-container" style={{ color: 'var(--danger)' }}>
              <p><i className="ph ph-warning-triangle"></i> Error loading user directory: {error}</p>
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
                <>
                  <UsersTable
                    users={filteredUsers}
                    userData={userData}
                    onActionClick={handleActionClick}
                  />

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
                </>
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
        <AddUserModal
          show={showAddAgentModal}
          onClose={() => setShowAddAgentModal(false)}
          onUserCreated={() => loadUsers(currentPage)}
        />
      )}

      {/* Export Users Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => { if (!exporting) setShowExportModal(false); }}
          title={<><i className="ph ph-chart-bar"></i> Export Users Directory PDF</>}
          maxWidth="460px"
        >
          <form onSubmit={handleExportSubmit} style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              Select your export range preference. The report will extract accounts matching current status and role filter criteria:
            </p>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Export Option</label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="exportRange"
                  checked={exportRange === 'PAGE'}
                  onChange={() => setExportRange('PAGE')}
                  disabled={exporting}
                />
                Current Page ({filteredUsers.length} accounts)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="exportRange"
                  checked={exportRange === 'FULL'}
                  onChange={() => setExportRange('FULL')}
                  disabled={exporting}
                />
                Full List ({totalElements} total registered accounts)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="exportRange"
                  checked={exportRange === 'CUSTOM'}
                  onChange={() => setExportRange('CUSTOM')}
                  disabled={exporting}
                />
                Custom Quantity Limit
              </label>
            </div>

            {exportRange === 'CUSTOM' && (
              <div className="form-group" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">Quantity to Extract</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max={totalElements}
                  value={customExportLimit}
                  onChange={(e) => setCustomExportLimit(parseInt(e.target.value) || '')}
                  disabled={exporting}
                  placeholder="e.g. 50"
                  required
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
                {exporting ? 'Generating...' : 'Export PDF'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default Users;
