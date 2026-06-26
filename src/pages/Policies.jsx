import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { readAllPolicies, cancelPolicy } from '../services/PolicyService';
import Modal from '../components/Modal';
import DownloadButton from '../components/DownloadButton';
import { generatePolicyListPDF } from '../utils/pdfGenerator';

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

  .summary-card.active-policies::before {
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

  .summary-card.active-policies .card-icon {
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

  .filter-bar {
    margin: 0 40px 24px;
  }

  .policies-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .policies-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  }

  .policies-table th {
    background: rgba(255, 255, 255, 0.01);
    border-bottom: 1px solid var(--border);
    padding: 16px 24px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.05em;
  }

  .policies-table td {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    color: var(--text-primary);
    white-space: nowrap;
    vertical-align: middle;
  }

  .policies-table tr:last-child td {
    border-bottom: none;
  }

  .policies-table tr:hover td {
    background: rgba(37, 99, 168, 0.02);
  }

  .policy-number {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--primary-light);
  }

  .amount-val {
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-badge.active {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-badge.pending,
  .status-badge.inactive {
    background: rgba(245, 158, 11, 0.1);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .status-badge.cancelled,
  .status-badge.terminated {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
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

  .action-btn.cancel-policy {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
    background: rgba(239, 68, 68, 0.02);
  }

  .action-btn.cancel-policy:hover {
    background: #ef4444;
    color: #ffffff;
    border-color: #ef4444;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
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
    max-width: 500px;
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
    margin-bottom: 12px;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }
`;

const Policies = () => {
  const { userData } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minCoverage, setMinCoverage] = useState('');
  const [maxCoverage, setMaxCoverage] = useState('');

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setMinCoverage('');
    setMaxCoverage('');
  };

  // Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [targetPolicy, setTargetPolicy] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState('PAGE'); // 'PAGE', 'FULL', 'CUSTOM'
  const [customExportLimit, setCustomExportLimit] = useState('50');
  const [exporting, setExporting] = useState(false);

  const fetchPoliciesData = useCallback(async (page = 0) => {
    const response = await readAllPolicies(page, pageSize);
    return response?.data || response || {};
  }, []);

  const { data, loading, error, execute: loadPolicies } = useFetch(fetchPoliciesData);

  useEffect(() => {
    loadPolicies(currentPage);
  }, [currentPage, loadPolicies]);

  const policiesList = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;

  // Compute filtered policies list
  const filteredPolicies = policiesList.filter(policy => {
    if (statusFilter && (policy.policyStatus || '').toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const policyNum = (policy.policyNumber || '').toLowerCase();
      const planName = (policy.planName || '').toLowerCase();
      const customerName = (policy.customerName || policy.customer?.fullName || '').toLowerCase();
      const productType = (policy.productType || '').toLowerCase();

      if (
        !policyNum.includes(q) &&
        !planName.includes(q) &&
        !customerName.includes(q) &&
        !productType.includes(q)
      ) {
        return false;
      }
    }
    if (minCoverage) {
      const min = parseFloat(minCoverage);
      if (!isNaN(min) && (policy.coverageAmount || 0) < min) {
        return false;
      }
    }
    if (maxCoverage) {
      const max = parseFloat(maxCoverage);
      if (!isNaN(max) && (policy.coverageAmount || 0) > max) {
        return false;
      }
    }
    return true;
  });

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  const handleCancelClick = (policy) => {
    setTargetPolicy(policy);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetPolicy) return;

    try {
      setCancelSubmitting(true);
      await cancelPolicy(targetPolicy.id);
      alert(`Policy ${targetPolicy.policyNumber} has been successfully cancelled.`);
      setShowCancelModal(false);
      loadPolicies(currentPage);
    } catch (err) {
      console.error("Policy cancellation failed:", err);
      alert(`Operation failed: ${err?.response?.data?.message || err.message}`);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    setExporting(true);
    try {
      let policiesToExport = [];
      if (exportRange === 'PAGE') {
        policiesToExport = policiesList;
      } else {
        const limit = exportRange === 'FULL' ? totalElements : parseInt(customExportLimit);
        if (!limit || limit <= 0) {
          alert("Please enter a valid count.");
          setExporting(false);
          return;
        }
        const res = await readAllPolicies(0, limit);
        policiesToExport = res?.data?.content || res?.content || [];
      }

      if (policiesToExport.length === 0) {
        alert("No policies found inside chosen range.");
      } else {
        generatePolicyListPDF(policiesToExport);
      }
      setShowExportModal(false);
    } catch (err) {
      console.error("Export list failed:", err);
      alert("Failed to export list. Please try again.");
    } finally {
      setExporting(false);
    }
  };

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
              <div className="user-avatar" title={userData?.fullName || 'Staff User'}>
                {initials}
              </div>
            </div>
          </div>

          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="header-text">
              <h2>Policies Directory</h2>
              <p>Monitor customer policy registrations, coverage parameters, and issue cancellations</p>
            </div>
            <button
              onClick={() => {
                setExportRange('PAGE');
                setCustomExportLimit('50');
                setShowExportModal(true);
              }}
              title="Export Policies Report Options"
              className="page-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none'
              }}
            >
              📊 Export List
            </button>
          </div>

          <div className="divider" />

          {/* Metrics row */}
          <div className="metrics-row">
            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">Total Policies</span>
                <span className="card-icon">🗂️</span>
              </div>
              <div className="card-value">{totalElements}</div>
            </div>
            <div className="summary-card active-policies">
              <div className="card-header">
                <span className="card-title">Active Insurances</span>
                <span className="card-icon">🟢</span>
              </div>
              <div className="card-value">
                {policiesList.length > 0
                  ? policiesList.filter(p => p.policyStatus === 'ACTIVE').length
                  : 0}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Fetching policies registry...</p>
            </div>
          ) : error ? (
            <div className="loading-container" style={{ color: 'var(--danger)' }}>
              <p>⚠️ Error loading policies: {error}</p>
              <button className="page-btn" style={{ marginTop: '12px' }} onClick={() => loadPolicies(currentPage)}>
                Retry
              </button>
            </div>
          ) : policiesList.length === 0 ? (
            <div className="loading-container">
              <p>📋 No policies registered in the system database.</p>
            </div>
          ) : (
            <>
              {/* Filter Bar */}
              <div className="filter-bar">
                <div className="filter-group">
                  <label className="filter-label">Search</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Search Policy No, Plan, Customer, Product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Status</label>
                  <select
                    className="filter-input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Min Coverage (₹)</label>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min"
                    value={minCoverage}
                    onChange={(e) => setMinCoverage(e.target.value)}
                  />
                </div>

                <div className="filter-group" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="filter-label">Max Coverage (₹)</label>
                    <input
                      type="number"
                      className="filter-input"
                      placeholder="Max"
                      value={maxCoverage}
                      onChange={(e) => setMaxCoverage(e.target.value)}
                    />
                  </div>
                  {(searchQuery || statusFilter || minCoverage || maxCoverage) && (
                    <button
                      type="button"
                      className="clear-filter-btn"
                      onClick={handleClearFilters}
                      title="Clear All Filters"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {filteredPolicies.length === 0 ? (
                <div className="empty-state" style={{ 
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)',
                  fontSize: '13.5px',
                  fontStyle: 'italic',
                  border: '1px dashed var(--border)',
                  borderRadius: '8px',
                  background: 'var(--card)'
                }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🔍</span>
                  <h3>No Matching Policies</h3>
                  <p style={{ marginTop: '4px' }}>No policies match your filter criteria. Try adjusting your search query or status filters.</p>
                  <button className="action-btn" style={{ marginTop: '12px' }} onClick={handleClearFilters}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <div className="policies-table-wrapper">
                    <table className="policies-table">
                      <thead>
                        <tr>
                          <th>Policy Number</th>
                          <th>Plan Name</th>
                          <th>Policyholder</th>
                          <th>Product Type</th>
                          <th>Max Cover</th>
                          <th>Available Cover</th>
                          <th>Premium</th>
                          <th>Start Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPolicies.map((policy) => {
                          const policyholder = policy.customerName || policy.customer?.fullName || 'N/A';
                          const planName = policy.planName || 'Insurance Plan';
                          const productType = policy.productType || 'N/A';
                          const coverage = policy.coverageAmount || 0;
                          const availCoverage = policy.remainingCoverage !== undefined && policy.remainingCoverage !== null ? policy.remainingCoverage : coverage;
                          const premium = policy.premiumAmount || 0;
                          const freq = policy.premiumType ? `/${policy.premiumType.toLowerCase()}` : '';
                          const startDate = policy.startDate
                            ? new Date(policy.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A';
                          const statusClass = (policy.policyStatus || 'PENDING').toLowerCase();

                          return (
                            <tr key={policy.id}>
                              <td className="policy-number">{policy.policyNumber}</td>
                              <td style={{ fontWeight: '600' }}>{planName}</td>
                              <td>{policyholder}</td>
                              <td>{productType}</td>
                              <td className="amount-val">₹{coverage.toLocaleString('en-IN')}</td>
                              <td className="amount-val" style={{ color: 'var(--primary)' }}>₹{availCoverage.toLocaleString('en-IN')}</td>
                              <td className="amount-val">₹{premium.toLocaleString('en-IN')}{freq}</td>
                              <td>{startDate}</td>
                              <td>
                                <span className={`status-badge ${statusClass}`}>
                                  {policy.policyStatus || 'PENDING'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <DownloadButton
                                    type="policy"
                                    data={policy}
                                    extraData={{ customerName: policy.customerName || policy.customer?.fullName }}
                                    label="📥"
                                    title="Download Policy PDF"
                                    className="action-btn"
                                    style={{
                                      padding: '6px 10px',
                                      fontSize: '12px',
                                      borderColor: 'var(--border)'
                                    }}
                                  />
                                  <button
                                    className="action-btn cancel-policy"
                                    onClick={() => handleCancelClick(policy)}
                                    disabled={policy.policyStatus === 'CANCELLED'}
                                    style={{
                                      opacity: policy.policyStatus === 'CANCELLED' ? 0.5 : 1,
                                      cursor: policy.policyStatus === 'CANCELLED' ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    {policy.policyStatus === 'CANCELLED' ? 'Cancelled' : 'Cancel Policy'}
                                  </button>
                                </div>
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
                        Showing Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> (<strong>{totalElements}</strong> total policies)
                      </div>
                      <div className="pagination-controls">
                        <button
                          className="page-btn"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                          disabled={currentPage === 0 || loading}
                        >
                          Previous
                        </button>
                        <button
                          className="page-btn"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                          disabled={currentPage === totalPages - 1 || loading}
                        >
                          Next
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

      {/* Confirmation Modal */}
      {showCancelModal && targetPolicy && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => { if (!cancelSubmitting) setShowCancelModal(false); }}
          title="⚠️ Cancel Insurance Policy"
          maxWidth="440px"
        >
          <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Are you sure you want to cancel policy <strong style={{ color: 'var(--text-primary)' }}>{targetPolicy.policyNumber}</strong>?
            <br />
            <br />
            This will terminate coverage for plan <strong>{targetPolicy.planName}</strong> associated with policyholder <strong>{targetPolicy.customerName || targetPolicy.customer?.fullName || 'N/A'}</strong>. This action is permanent and cannot be undone.
          </div>

          <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelSubmitting}
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
              No, Keep Policy
            </button>
            <button
              type="button"
              className="btn-confirm"
              onClick={handleConfirmCancel}
              disabled={cancelSubmitting}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                opacity: cancelSubmitting ? 0.6 : 1
              }}
            >
              {cancelSubmitting ? 'Cancelling...' : 'Yes, Cancel Policy'}
            </button>
          </div>
        </Modal>
      )}
      {/* Export Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => { if (!exporting) setShowExportModal(false); }}
          title="📊 Export Policies Directory PDF"
          maxWidth="460px"
        >
          <form onSubmit={handleExportSubmit} style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              Select your export range preference. The report will extract registered policies directly from the database:
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
                Current Page ({policiesList.length} policies)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="exportRange"
                  checked={exportRange === 'FULL'}
                  onChange={() => setExportRange('FULL')}
                  disabled={exporting}
                />
                Full List ({totalElements} total policies)
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

export default Policies;
