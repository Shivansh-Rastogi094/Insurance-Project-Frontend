import React, { useEffect, useCallback, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { readAllClaims, readMyClaims } from '../services/ClaimService';
import { readMyPolicies } from '../services/PolicyService';
import Modal from '../components/Modal';
import { generateClaimListPDF } from '../utils/pdfGenerator';
import { useToast } from '../components/ToastProvider';
import ClaimFilterBar from '../components/claims/ClaimFilterBar';
import ClaimsTable from '../components/claims/ClaimsTable';
import ClaimHistoryTimeline from '../components/claims/ClaimHistoryTimeline';
import FileClaimModal from '../components/claims/FileClaimModal';
import ClaimReviewModal from '../components/claims/ClaimReviewModal';
import '../styles/Claims.css';

const Claims = () => {
  const toast = useToast();
  const { userData } = useAuth();
  const isCustomer = userData?.role === 'CUSTOMER';
  const isAgent = userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT';
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [myAssignedOnly, setMyAssignedOnly] = useState(false);
  const [matchSpecializationOnly, setMatchSpecializationOnly] = useState(false);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setMinAmount('');
    setMaxAmount('');
    setMyAssignedOnly(false);
    setMatchSpecializationOnly(false);
  };

  // Export Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState('PAGE');
  const [customExportLimit, setCustomExportLimit] = useState('50');
  const [exporting, setExporting] = useState(false);

  // File Claim Modal State
  const [showFileModal, setShowFileModal] = useState(false);

  // Review Claim Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewClaim, setSelectedReviewClaim] = useState(null);

  // Claim History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryClaim, setSelectedHistoryClaim] = useState(null);

  // Load claims data using useFetch hook
  const fetchClaimsData = useCallback(async (page = 0) => {
    if (isCustomer) {
      const response = await readMyClaims();
      return response || [];
    } else {
      const response = await readAllClaims(page, pageSize);
      return response?.data || response || {};
    }
  }, [isCustomer]);

  const { data = isCustomer ? [] : {}, loading, execute: loadClaims } = useFetch(fetchClaimsData);

  useEffect(() => {
    loadClaims(currentPage);
  }, [currentPage, loadClaims]);

  // Safely extract claims array and pagination info
  const claimsList = [...(isCustomer
    ? (Array.isArray(data) ? data : [])
    : (data?.content || []))].sort((a, b) => (b.id || 0) - (a.id || 0));
  const totalPages = isCustomer ? 1 : (data?.totalPages || 1);
  const totalElements = isCustomer ? claimsList.length : (data?.totalElements || 0);

  // Compute filtered claims
  const filteredClaims = claimsList.filter(claim => {
    if (statusFilter && (claim.claimStatus || '').toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    if (myAssignedOnly && claim.agentEmail !== userData?.email) {
      return false;
    }
    if (matchSpecializationOnly && userData?.specialization && userData?.specialization !== 'SUPER') {
      if (claim.productType !== userData.specialization) {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const claimNum = (claim.claimNumber || `CLM-${claim.id}`).toLowerCase();
      const policyNum = (claim.policyNumber || '').toLowerCase();
      const customerName = (claim.customerName || '').toLowerCase();
      const claimReason = (claim.claimReason || '').toLowerCase();

      if (
        !claimNum.includes(q) &&
        !policyNum.includes(q) &&
        !customerName.includes(q) &&
        !claimReason.includes(q)
      ) {
        return false;
      }
    }
    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min) && (claim.claimAmount || 0) < min) {
        return false;
      }
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max) && (claim.claimAmount || 0) > max) {
        return false;
      }
    }
    return true;
  });

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  // Fetch active policies for user dropdown when filing a claim
  const { data: policiesData = [], execute: loadPolicies } = useFetch(readMyPolicies);

  useEffect(() => {
    if (isCustomer) {
      loadPolicies();
    }
  }, [isCustomer, loadPolicies]);

  // Filter active policies
  const activePolicies = Array.isArray(policiesData)
    ? policiesData.filter(p => p.policyStatus === 'ACTIVE')
    : [];

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    setExporting(true);
    try {
      let claimsToExport = [];
      if (isCustomer) {
        claimsToExport = filteredClaims;
      } else {
        if (exportRange === 'PAGE') {
          claimsToExport = filteredClaims;
        } else {
          const limit = exportRange === 'FULL' ? totalElements : parseInt(customExportLimit);
          if (!limit || limit <= 0) {
            toast.error("Please enter a valid count.");
            setExporting(false);
            return;
          }
          const res = await readAllClaims(0, limit);
          claimsToExport = res?.data?.content || res?.content || [];
        }
      }

      if (claimsToExport.length === 0) {
        toast.error("No claims found inside chosen range.");
      } else {
        generateClaimListPDF(claimsToExport);
      }
      setShowExportModal(false);
    } catch (err) {
      console.error("Export list failed:", err);
      toast.error("Failed to export claims list. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleReviewTrigger = (claim) => {
    setSelectedReviewClaim(claim);
    setShowReviewModal(true);
  };

  const handleHistoryTrigger = (claim) => {
    setSelectedHistoryClaim(claim);
    setShowHistoryModal(true);
  };

  return (
    <>
      <div className="claims-page page-container">
        <Sidebar title={isCustomer ? "Customer Portal" : "Insurance Admin"} />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">
              <div className="brand-glyph-sm">C</div>
              <span>Crown Assurance</span>
            </div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.role || "GUEST"}</span>
              <div className="user-avatar" title={userData?.fullName || "User"}>
                {initials}
              </div>
            </div>
          </div>

          <div className="header">
            <div className="header-text">
              <h2>{isCustomer ? "My Claims" : "Claims Management"}</h2>
              <p>
                {isCustomer
                  ? "Track, monitor, and check history of your submitted insurance claims"
                  : "Review, audit, and process customer submitted claims database"}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setExportRange('PAGE');
                  setCustomExportLimit('50');
                  setShowExportModal(true);
                }}
                title="Export Claims Report Options"
                className="btn-export"
              >
                <><i className="ph ph-chart-bar"></i> Export List</>
              </button>
              {isCustomer && (
                <button className="file-claim-btn" onClick={() => setShowFileModal(true)} style={{ height: '40px' }}>
                  + File New Claim
                </button>
              )}
            </div>
          </div>

          <div className="claims-container">
            {loading ? (
              <div className="loading-container" style={{ width: '100%', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Skeleton height={60} />
                <Skeleton count={5} height={50} style={{ marginBottom: '8px' }} />
              </div>
            ) : claimsList.length === 0 ? (
              <div className="empty-state">
                <i className="empty-state-icon ph ph-clipboard"></i>
                <h3>No Claims Found</h3>
                <p>
                  {isCustomer
                    ? "You haven't filed any insurance claims yet."
                    : "No insurance claims are currently logged in the system."}
                </p>
              </div>
            ) : (
              <>
                <ClaimFilterBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  minAmount={minAmount}
                  setMinAmount={setMinAmount}
                  maxAmount={maxAmount}
                  setMaxAmount={setMaxAmount}
                  myAssignedOnly={myAssignedOnly}
                  setMyAssignedOnly={setMyAssignedOnly}
                  matchSpecializationOnly={matchSpecializationOnly}
                  setMatchSpecializationOnly={setMatchSpecializationOnly}
                  userData={userData}
                  isAgent={isAgent}
                  handleClearFilters={handleClearFilters}
                />

                {filteredClaims.length === 0 ? (
                  <div className="empty-state" style={{ marginTop: '0' }}>
                    <i className="empty-state-icon ph ph-magnifying-glass"></i>
                    <h3>No Matching Claims</h3>
                    <p>No claims match your filter criteria. Try adjusting your search query or status filters.</p>
                    <button className="action-btn" style={{ marginTop: '12px' }} onClick={handleClearFilters}>
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <ClaimsTable
                      filteredClaims={filteredClaims}
                      userData={userData}
                      onReview={handleReviewTrigger}
                      onHistory={handleHistoryTrigger}
                      isCustomer={isCustomer}
                      isAgent={isAgent}
                    />

                    {/* Pagination footer */}
                    {!isCustomer && totalPages > 1 && (
                      <div className="pagination-footer">
                        <div className="pagination-info">
                          Showing Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> (<strong>{totalElements}</strong> total claims)
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
      </div>

      {/* File Claim Modal */}
      {showFileModal && (
        <FileClaimModal
          show={showFileModal}
          onClose={() => setShowFileModal(false)}
          activePolicies={activePolicies}
          onClaimFiled={() => loadClaims(currentPage)}
        />
      )}

      {/* Review/Decision Claim Modal */}
      {showReviewModal && selectedReviewClaim && (
        <ClaimReviewModal
          show={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          claim={selectedReviewClaim}
          userData={userData}
          onClaimReviewed={() => loadClaims(currentPage)}
        />
      )}

      {/* Claim Audit History Modal */}
      {showHistoryModal && selectedHistoryClaim && (
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title={<><i className="ph ph-clipboard"></i> Claim Status Audit History</>}
          maxWidth="600px"
        >
          <div className="modal-summary" style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Claim Reference:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedHistoryClaim.claimNumber || `CLM-${selectedHistoryClaim.id}`}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', marginBottom: '8px', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Incident Reason:</span>
              <strong style={{ color: 'var(--text-primary)', lineHeight: '1.4', wordBreak: 'break-word' }}>
                {selectedHistoryClaim.claimReason || 'N/A'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Requested Amount:</span>
              <strong style={{ color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
                ₹{selectedHistoryClaim.claimAmount?.toLocaleString('en-IN') || 0}
              </strong>
            </div>
            {selectedHistoryClaim.agentSuggestedAmount !== null && selectedHistoryClaim.agentSuggestedAmount !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Passed Amount:</span>
                <strong style={{ color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedHistoryClaim.agentSuggestedAmount.toLocaleString('en-IN')}
                </strong>
              </div>
            )}
          </div>

          <ClaimHistoryTimeline
            claimId={selectedHistoryClaim.id}
            userData={userData}
          />

          <div className="modal-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Export Claims Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => { if (!exporting) setShowExportModal(false); }}
          title={<><i className="ph ph-chart-bar"></i> Export Claims Directory PDF</>}
          maxWidth="460px"
        >
          <form onSubmit={handleExportSubmit} style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              Select your export range preference. The report will extract claims directly from the system database:
            </p>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Export Option</label>
              
              {isCustomer ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="exportRange"
                    checked={true}
                    readOnly
                  />
                  My Claims list ({filteredClaims.length} records)
                </label>
              ) : (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportRange"
                      checked={exportRange === 'PAGE'}
                      onChange={() => setExportRange('PAGE')}
                      disabled={exporting}
                    />
                    Current Page ({filteredClaims.length} claims)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportRange"
                      checked={exportRange === 'FULL'}
                      onChange={() => setExportRange('FULL')}
                      disabled={exporting}
                    />
                    Full List ({totalElements} total claims)
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
                </>
              )}
            </div>

            {!isCustomer && exportRange === 'CUSTOM' && (
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

export default Claims;