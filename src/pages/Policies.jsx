import React, { useEffect, useState, useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { readAllPolicies, cancelPolicy } from '../services/PolicyService';
import Modal from '../components/Modal';
import { generatePolicyListPDF } from '../utils/pdfGenerator';
import { useToast } from '../components/ToastProvider';
import PolicyFilterBar from '../components/policies/PolicyFilterBar';
import PoliciesTable from '../components/policies/PoliciesTable';
import '../styles/Policy.css';

const Policies = () => {
  const toast = useToast();
  const { userData } = useAuth();

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

  const fetchPoliciesData = useCallback(async () => {
    const response = await readAllPolicies(0, 1000);
    return response?.data || response || {};
  }, []);

  const { data, setData, loading, error, execute: loadPolicies } = useFetch(fetchPoliciesData);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const policiesList = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = data?.totalElements || policiesList.length;

  // Compute filtered policies list (always from full list)
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

  const handleCancelClick = (e, policy) => {
    if (e && e.preventDefault) e.preventDefault();
    const target = policy || e;
    const role = userData?.role;
    if (role !== 'ADMIN' && role !== 'SUPER_AGENT') {
      toast.error('Only Admin and Super Agent can cancel policies.');
      return;
    }
    setTargetPolicy(target);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!targetPolicy) return;

    try {
      setCancelSubmitting(true);
      await cancelPolicy(targetPolicy.id);
      toast.success(`Policy ${targetPolicy.policyNumber} has been successfully cancelled.`);
      
      // Dynamically update local state immediately so status and summary counts update without a page reload
      setData(prevData => {
        if (!prevData) return prevData;
        if (Array.isArray(prevData)) {
          return prevData.map(p => p.id === targetPolicy.id ? { ...p, policyStatus: 'CANCELLED' } : p);
        }
        return {
          ...prevData,
          content: (prevData.content || []).map(p =>
            p.id === targetPolicy.id ? { ...p, policyStatus: 'CANCELLED' } : p
          )
        };
      });

      setShowCancelModal(false);
    } catch (err) {
      console.error("Policy cancellation failed:", err);
      toast.error(`Operation failed: ${err?.response?.data?.message || err.message}`);
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
          toast.error("Please enter a valid count.");
          setExporting(false);
          return;
        }
        const res = await readAllPolicies(0, limit);
        policiesToExport = res?.data?.content || res?.content || [];
      }

      if (policiesToExport.length === 0) {
        toast.error("No policies found inside chosen range.");
      } else {
        generatePolicyListPDF(policiesToExport);
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
      <div className="policy-page page-container">
        <Sidebar title={userData?.role === 'AGENT' ? 'Officer Workspace' : 'Admin Panel'} />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">
              <div className="brand-glyph-sm">C</div>
              <span>Crown Assurance</span>
            </div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.role || 'STAFF'}</span>
              <div className="user-avatar" title={userData?.fullName || 'Staff User'}>
                {initials}
              </div>
            </div>
          </div>

          <div className="header">
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
              className="btn-export"
            >
              <><i className="ph ph-chart-bar"></i> Export List</>
            </button>
          </div>

          {/* Metrics row */}
          <div className="metrics-row">
            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">Total Policies</span>
                <i className="card-icon ph ph-files" style={{ color: 'var(--primary-light)' }}></i>
              </div>
              <div className="card-value">{totalElements}</div>
            </div>
            <div className="summary-card active-policies">
              <div className="card-header">
                <span className="card-title">Active Insurances</span>
                <i className="card-icon ph ph-check-circle" style={{ color: 'var(--success)' }}></i>
              </div>
              <div className="card-value">
                {policiesList.length > 0
                  ? policiesList.filter(p => p.policyStatus === 'ACTIVE').length
                  : 0}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container" style={{ width: '100%', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height={60} />
              <Skeleton count={5} height={50} style={{ marginBottom: '8px' }} />
            </div>
          ) : error ? (
            <div className="loading-container" style={{ color: 'var(--danger)' }}>
              <p><i className="ph ph-warning-triangle"></i> Error loading policies: {error}</p>
              <button className="page-btn" style={{ marginTop: '12px' }} onClick={() => loadPolicies()}>
                Retry
              </button>
            </div>
          ) : policiesList.length === 0 ? (
            <div className="loading-container">
              <p><i className="ph ph-clipboard"></i> No policies registered in the system database.</p>
            </div>
          ) : (
            <>
              <PolicyFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                minCoverage={minCoverage}
                setMinCoverage={setMinCoverage}
                maxCoverage={maxCoverage}
                setMaxCoverage={setMaxCoverage}
                handleClearFilters={handleClearFilters}
              />

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
                  <i className="ph ph-magnifying-glass" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                  <h3>No Matching Policies</h3>
                  <p style={{ marginTop: '4px' }}>No policies match your filter criteria. Try adjusting your search query or status filters.</p>
                  <button className="action-btn" style={{ marginTop: '12px' }} onClick={handleClearFilters}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <PoliciesTable
                    policies={filteredPolicies}
                    onCancelClick={handleCancelClick}
                    userRole={userData?.role}
                  />
                  <div className="pagination-info" style={{ padding: '12px 4px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Showing <strong>{filteredPolicies.length}</strong> of <strong>{totalElements}</strong> policies (newest first)
                  </div>
                </>
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
          title={<><i className="ph ph-warning-triangle"></i> Cancel Insurance Policy</>}
          maxWidth="440px"
        >
          <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Are you sure you want to cancel policy <strong style={{ color: 'var(--text-primary)' }}>{targetPolicy.policyNumber}</strong>?
            <br />
            <br />
            This will terminate coverage for plan <strong>{targetPolicy.planName}</strong> associated with policyholder <strong>{targetPolicy.customerName || targetPolicy.customer?.fullName || 'N/A'}</strong>. This action is permanent and cannot be undone.
            <br />
            <br />
            <span style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              <i className="ph ph-warning" style={{ fontSize: '16px', color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
              <span>
                <strong style={{ color: '#ef4444' }}>Note:</strong> Cancellation will be <strong>blocked</strong> if this policy has any unresolved claims (SUBMITTED, UNDER REVIEW, or RECOMMENDED). All claims must be finalized (APPROVED or REJECTED) first.
              </span>
            </span>
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
          title={<><i className="ph ph-chart-bar"></i> Export Policies Directory PDF</>}
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
