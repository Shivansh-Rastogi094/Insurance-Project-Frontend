import React, { useEffect, useCallback, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { readAllClaims, readMyClaims, createClaim, agentReviewClaim, adminDecisionClaim, readClaimHistory } from '../services/ClaimService';
import { readMyPolicies } from '../services/PolicyService';
import Modal from '../components/Modal';

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

  .file-claim-btn {
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(37, 99, 168, 0.2);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .file-claim-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(37, 99, 168, 0.3);
    filter: brightness(1.1);
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 8px 40px 32px;
  }

  .claims-container {
    padding: 0 40px 40px;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
  }

  .table-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }

  .claims-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .claims-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    min-width: 800px;
  }

  .claims-table th {
    background: var(--surface);
    padding: 16px 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
  }

  .claims-table td {
    padding: 18px 20px;
    font-size: 13.5px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }

  .claims-table tr:last-child td {
    border-bottom: none;
  }

  .claims-table tr:hover td {
    background-color: rgba(248, 250, 252, 0.5);
  }

  .claim-number-cell {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--primary-light);
  }

  .policy-number-cell {
    font-family: var(--font-mono);
    font-weight: 500;
    color: var(--text-secondary);
  }

  .amount-cell {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--text-primary);
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

  .status-badge.submitted,
  .status-badge.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .status-badge.approved,
  .status-badge.success {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-badge.rejected {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .remarks-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 250px;
  }

  .remark-item {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1.3;
  }

  .remark-item strong {
    color: var(--text-primary);
  }

  .action-btn {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 8px 14px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-primary);
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .action-btn:hover {
    background: var(--surface);
    border-color: var(--primary-light);
    color: var(--primary-light);
  }

  .action-btn.accent {
    background: var(--accent);
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 4px rgba(15, 168, 158, 0.15);
  }

  .action-btn.accent:hover {
    background: #0d968d;
    color: #ffffff;
    box-shadow: 0 4px 8px rgba(15, 168, 158, 0.25);
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
    max-width: 550px;
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

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 16px;
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

  .form-error {
    color: #EF4444;
    font-size: 11.5px;
    margin-top: 4px;
    font-weight: 500;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
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
    background: var(--accent);
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
    background: #0d968d;
  }

  .btn-confirm:disabled {
    opacity: 0.6;
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

  .empty-state {
    text-align: center;
    padding: 60px 40px;
    color: var(--text-secondary);
    font-size: 14px;
    border: 1.5px dashed var(--border);
    border-radius: var(--radius-card);
    background: var(--card);
    max-width: 600px;
    margin: 20px auto;
  }

  .empty-state-icon {
    font-size: 32px;
    margin-bottom: 16px;
    display: block;
  }

  @media (max-width: 968px) {
    .main-content {
      margin-left: 0;
    }
    .claims-container,
    .header {
      padding: 24px 20px 16px;
    }
    .divider {
      margin: 8px 20px 24px;
    }
  }
`;

const Claims = () => {
  const { userData } = useAuth();
  const isCustomer = userData?.role === 'CUSTOMER';

  // Load claims data using useFetch hook
  const fetchClaimsData = useCallback(async () => {
    if (isCustomer) {
      const response = await readMyClaims();
      return response || [];
    } else {
      const response = await readAllClaims();
      // Unpack paginated content if available, otherwise check direct data
      return response?.data?.content || response?.data || response || [];
    }
  }, [isCustomer]);

  const { data = [], loading, execute: loadClaims } = useFetch(fetchClaimsData);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // Safely extract claims array
  const claimsList = Array.isArray(data) ? data : (data?.content || []);

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

  // File Claim Modal States
  const [showFileModal, setShowFileModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimForm, setClaimForm] = useState({
    policyId: '',
    claimAmount: '',
    claimReason: '',
    incidentDate: ''
  });
  const [claimDocuments, setClaimDocuments] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const handleFileClaim = () => {
    setClaimForm({
      policyId: '',
      claimAmount: '',
      claimReason: '',
      incidentDate: ''
    });
    setClaimDocuments([]);
    setFormErrors({});
    setShowFileModal(true);
  };

  const handleAddDocumentRow = () => {
    setClaimDocuments([
      ...claimDocuments,
      { documentName: '', documentType: 'PDF', documentReference: '' }
    ]);
  };

  const handleRemoveDocumentRow = (index) => {
    setClaimDocuments(claimDocuments.filter((_, i) => i !== index));
  };

  const handleUpdateDocumentRow = (index, field, value) => {
    setClaimDocuments(
      claimDocuments.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const handleFileSelect = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = file.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const mockRef = `https://res.cloudinary.com/ddm3sgigj/image/upload/v1781674834/claims/mock/${cleanFileName}`;

    setClaimDocuments(
      claimDocuments.map((doc, i) =>
        i === index
          ? {
              documentName: nameWithoutExt,
              documentType: ext === 'JPG' ? 'JPEG' : ext,
              documentReference: mockRef
            }
          : doc
      )
    );
  };

  const handleConfirmClaim = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!claimForm.policyId) errors.policyId = "Please select an active policy.";

    const amt = parseFloat(claimForm.claimAmount);
    if (isNaN(amt) || amt <= 0) {
      errors.claimAmount = "Please enter a valid positive claim amount.";
    } else {
      const selectedPolObj = activePolicies.find(p => p.id.toString() === claimForm.policyId.toString());
      if (selectedPolObj && amt > selectedPolObj.coverageAmount) {
        errors.claimAmount = `Claim amount cannot exceed policy coverage limit of ₹${selectedPolObj.coverageAmount.toLocaleString('en-IN')}`;
      }
    }

    if (!claimForm.claimReason.trim()) errors.claimReason = "Please describe the incident reason.";

    if (!claimForm.incidentDate) {
      errors.incidentDate = "Please choose an incident date.";
    } else {
      const selectedDate = new Date(claimForm.incidentDate);
      if (selectedDate > new Date()) {
        errors.incidentDate = "Incident date cannot be in the future.";
      }
    }

    claimDocuments.forEach((doc, idx) => {
      if (!doc.documentName.trim()) errors[`docName_${idx}`] = "Document name is required.";
      if (!doc.documentReference.trim()) errors[`docRef_${idx}`] = "Document link/reference is required.";
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErr = Object.values(errors)[0];
      alert(`Validation Error: ${firstErr}`);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        policyId: parseInt(claimForm.policyId),
        claimAmount: parseFloat(claimForm.claimAmount),
        claimReason: claimForm.claimReason.trim(),
        incidentDate: claimForm.incidentDate,
        documents: claimDocuments.map(d => ({
          documentName: d.documentName.trim(),
          documentType: d.documentType,
          documentReference: d.documentReference.trim()
        }))
      };

      await createClaim(payload);
      alert("Claim filed successfully!");
      setShowFileModal(false);
      loadClaims();
    } catch (err) {
      console.error("Failed to file claim:", err);
      alert("Filing claim failed. Please check your inputs or backend logs.");
    } finally {
      setSubmitting(false);
    }
  };

  // Review Claim Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewClaim, setSelectedReviewClaim] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    status: '',
    remarks: ''
  });
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Claim History states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryClaim, setSelectedHistoryClaim] = useState(null);
  const [claimHistoryList, setClaimHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleGetHistory = async (claim) => {
    setSelectedHistoryClaim(claim);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    setClaimHistoryList([]);
    try {
      const response = await readClaimHistory(claim.id);
      setClaimHistoryList(response?.data || response || []);
    } catch (err) {
      console.error("Failed to load claim history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleReviewClaim = (claim) => {
    setSelectedReviewClaim(claim);
    setReviewForm({
      status: userData?.role === 'AGENT' ? 'RECOMMENDED' : 'APPROVED',
      remarks: ''
    });
    setReviewErrors({});
    setShowReviewModal(true);
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!selectedReviewClaim) return;

    const errors = {};
    if (!reviewForm.status) errors.status = "Please select a status.";
    if (!reviewForm.remarks.trim()) errors.remarks = "Please enter remarks.";

    if (Object.keys(errors).length > 0) {
      setReviewErrors(errors);
      alert(`Validation Error: ${Object.values(errors)[0]}`);
      return;
    }

    try {
      setReviewSubmitting(true);
      const isAgent = userData?.role === 'AGENT';
      
      if (isAgent) {
        const payload = {
          recommendedStatus: reviewForm.status,
          remarks: reviewForm.remarks.trim()
        };
        await agentReviewClaim(selectedReviewClaim.id, payload);
        alert(`Claim review submitted successfully as ${reviewForm.status}.`);
      } else {
        const payload = {
          finalDecisionStatus: reviewForm.status,
          remarks: reviewForm.remarks.trim()
        };
        await adminDecisionClaim(selectedReviewClaim.id, payload);
        alert(`Claim decision submitted successfully as ${reviewForm.status}.`);
      }

      setShowReviewModal(false);
      loadClaims();
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit claim review/decision. Please check inputs or logs.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <Sidebar title={isCustomer ? "Customer Portal" : "Insurance Admin"} />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">🛡️ InsureSpace</div>
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
            {isCustomer && (
              <button className="file-claim-btn" onClick={handleFileClaim}>
                + File New Claim
              </button>
            )}
          </div>

          <div className="divider" />

          <div className="claims-container">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading claims data...</p>
              </div>
            ) : claimsList.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">📋</span>
                <h3>No Claims Found</h3>
                <p>
                  {isCustomer
                    ? "You haven't filed any insurance claims yet."
                    : "No insurance claims are currently logged in the system."}
                </p>
              </div>
            ) : (
              <div className="table-card">
                <div className="claims-table-wrapper">
                  <table className="claims-table">
                    <thead>
                      <tr>
                        <th>Claim ID</th>
                        <th>Policy ID</th>
                        <th>Incident Date</th>
                        <th>Claim Reason</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Documents</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsList.map((claim, idx) => {
                        const claimNum = claim.claimNumber || `CLM-${claim.id || idx}`;
                        const status = (claim.claimStatus || 'SUBMITTED').toLowerCase();
                        const assocPolicy = claim.policyNumber || 'N/A';
                        const incidentDate = claim.incidentDate || 'N/A';
                        const claimReason = claim.claimReason || 'No reason provided';
                        const claimAmount = claim.claimAmount || 0;
                        const agentRemarks = claim.agentRemarks === "null" || !claim.agentRemarks ? "Pending" : claim.agentRemarks;
                        const adminRemarks = claim.adminRemarks === "null" || !claim.adminRemarks ? "Pending" : claim.adminRemarks;

                        return (
                          <tr key={claim.id || idx}>
                            <td className="claim-number-cell">{claimNum}</td>
                            <td className="policy-number-cell">{assocPolicy}</td>
                            <td>{incidentDate}</td>
                            <td>{claimReason}</td>
                            <td className="amount-cell">₹{claimAmount.toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`status-badge ${status}`}>
                                {status}
                              </span>
                            </td>
                            <td>
                              <div className="remarks-block">
                                <span className="remark-item">
                                  <strong>Agent:</strong> {agentRemarks}
                                </span>
                                <span className="remark-item">
                                  <strong>Admin:</strong> {adminRemarks}
                                </span>
                              </div>
                            </td>
                            <td>
                              {claim.documents && claim.documents.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {claim.documents.map((doc, docIdx) => {
                                    const isUrl = doc.documentReference && (doc.documentReference.startsWith('http://') || doc.documentReference.startsWith('https://'));
                                    return (
                                      <button
                                        key={doc.id || docIdx}
                                        className="action-btn"
                                        style={{ 
                                          fontSize: '11px', 
                                          padding: '4px 8px', 
                                          display: 'inline-flex', 
                                          alignItems: 'center', 
                                          gap: '4px',
                                          width: 'fit-content' 
                                        }}
                                        onClick={() => {
                                          if (isUrl) {
                                            window.open(doc.documentReference, '_blank', 'noopener,noreferrer');
                                          } else {
                                            alert(`Document Reference ID: ${doc.documentReference || 'N/A'}\n(Direct file download coming soon!)`);
                                          }
                                        }}
                                        title={isUrl ? "Open document in a new tab" : `Ref: ${doc.documentReference}`}
                                      >
                                        📄 {doc.documentName || `Doc ${doc.id}`} ({doc.documentType || 'File'})
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                  No Documents
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {isCustomer ? (
                                <button
                                  className="action-btn"
                                  onClick={() => handleGetHistory(claim)}
                                >
                                  Claim History
                                </button>
                              ) : (
                                <button
                                  className="action-btn accent"
                                  onClick={() => handleReviewClaim(claim)}
                                >
                                  Review Claim
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Claim Modal */}
      {showFileModal && (
        <Modal
          isOpen={showFileModal}
          onClose={() => { if (!submitting) setShowFileModal(false); }}
          title="📝 File New Insurance Claim"
          maxWidth="550px"
        >
          <form onSubmit={handleConfirmClaim} style={{ marginTop: '12px' }}>
            <div className="form-group">
              <label className="form-label">Select Policy</label>
              <select
                className="form-input"
                value={claimForm.policyId}
                onChange={(e) => setClaimForm({ ...claimForm, policyId: e.target.value })}
                required
                disabled={submitting}
              >
                <option value="">-- Select Active Policy --</option>
                {activePolicies.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.planName} ({p.policyNumber}) - Max Cover: ₹{p.coverageAmount.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
              {formErrors.policyId && <div className="form-error">⚠️ {formErrors.policyId}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Claim Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 50000.00"
                value={claimForm.claimAmount}
                onChange={(e) => setClaimForm({ ...claimForm, claimAmount: e.target.value })}
                required
                disabled={submitting}
              />
              {formErrors.claimAmount && <div className="form-error">⚠️ {formErrors.claimAmount}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Incident Date</label>
              <input
                type="date"
                className="form-input"
                value={claimForm.incidentDate}
                onChange={(e) => setClaimForm({ ...claimForm, incidentDate: e.target.value })}
                required
                disabled={submitting}
              />
              {formErrors.incidentDate && <div className="form-error">⚠️ {formErrors.incidentDate}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Claim</label>
              <textarea
                className="form-input"
                style={{ minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder="Describe the incident in detail..."
                value={claimForm.claimReason}
                onChange={(e) => setClaimForm({ ...claimForm, claimReason: e.target.value })}
                required
                disabled={submitting}
              />
              {formErrors.claimReason && <div className="form-error">⚠️ {formErrors.claimReason}</div>}
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="form-label" style={{ margin: 0, fontSize: '12px' }}>Claim Documents</span>
                <button
                  type="button"
                  className="action-btn"
                  style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  onClick={handleAddDocumentRow}
                  disabled={submitting}
                >
                  ➕ Add Document
                </button>
              </div>

              {claimDocuments.map((doc, index) => (
                <div key={index} style={{ 
                  background: 'var(--surface)', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border)',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 2 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Document Name (e.g. Medical Bill)"
                        value={doc.documentName}
                        onChange={(e) => handleUpdateDocumentRow(index, 'documentName', e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12.5px' }}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <select
                        className="form-input"
                        value={doc.documentType}
                        onChange={(e) => handleUpdateDocumentRow(index, 'documentType', e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12.5px' }}
                        disabled={submitting}
                      >
                        <option value="PDF">PDF</option>
                        <option value="JPEG">JPEG</option>
                        <option value="PNG">PNG</option>
                        <option value="GIF">GIF</option>
                        <option value="DOC">DOC</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="action-btn"
                      style={{ padding: '8px', color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                      onClick={() => handleRemoveDocumentRow(index)}
                      title="Remove Document"
                      disabled={submitting}
                    >
                      🗑️
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Document Reference URL or Code"
                        value={doc.documentReference}
                        onChange={(e) => handleUpdateDocumentRow(index, 'documentReference', e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <label style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      📁 Choose File
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileSelect(index, e)}
                        disabled={submitting}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowFileModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-confirm"
                style={{ background: 'var(--accent)' }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Review/Decision Claim Modal */}
      {showReviewModal && selectedReviewClaim && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => { if (!reviewSubmitting) setShowReviewModal(false); }}
          title={userData?.role === 'AGENT' ? "🔍 Agent Claim Verification" : "⚖️ Admin Claim Decision"}
          maxWidth="500px"
        >
          <div className="modal-summary" style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Claim Reference:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedReviewClaim.claimNumber || `CLM-${selectedReviewClaim.id}`}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Policyholder:</span>
              <strong>{selectedReviewClaim.customerName || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Requested Amount:</span>
              <strong style={{ color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
                ₹{selectedReviewClaim.claimAmount?.toLocaleString('en-IN') || 0}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
              <strong style={{ textTransform: 'uppercase' }}>{selectedReviewClaim.claimStatus}</strong>
            </div>
          </div>

          <form onSubmit={handleConfirmReview}>
            <div className="form-group">
              <label className="form-label">
                {userData?.role === 'AGENT' ? "Recommended Status" : "Final Decision"}
              </label>
              <select
                className="form-input"
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                required
                disabled={reviewSubmitting}
              >
                {userData?.role === 'AGENT' ? (
                  <>
                    <option value="RECOMMENDED">RECOMMENDED (Forward to Admin)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW (Keep Processing)</option>
                  </>
                ) : (
                  <>
                    <option value="APPROVED">APPROVED (Approve Payout)</option>
                    <option value="REJECTED">REJECTED (Decline Payout)</option>
                  </>
                )}
              </select>
              {reviewErrors.status && <div className="form-error">⚠️ {reviewErrors.status}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Review Remarks / Audit Comments</label>
              <textarea
                className="form-input"
                style={{ minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder={
                  userData?.role === 'AGENT'
                    ? "Enter documents verification notes and recommendations..."
                    : "Enter final payout rationale..."
                }
                value={reviewForm.remarks}
                onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })}
                required
                disabled={reviewSubmitting}
              />
              {reviewErrors.remarks && <div className="form-error">⚠️ {reviewErrors.remarks}</div>}
            </div>

            <div className="modal-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowReviewModal(false)}
                disabled={reviewSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-confirm"
                style={{ background: 'var(--accent)' }}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Claim Audit History Modal */}
      {showHistoryModal && selectedHistoryClaim && (
        <Modal
          isOpen={showHistoryModal}
          onClose={() => { if (!loadingHistory) setShowHistoryModal(false); }}
          title="📋 Claim Status Audit History"
          maxWidth="600px"
        >
          <div className="modal-summary" style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Claim Reference:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedHistoryClaim.claimNumber || `CLM-${selectedHistoryClaim.id}`}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Incident Reason:</span>
              <strong>{selectedHistoryClaim.claimReason || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Requested Amount:</span>
              <strong style={{ color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
                ₹{selectedHistoryClaim.claimAmount?.toLocaleString('en-IN') || 0}
              </strong>
            </div>
          </div>

          {loadingHistory ? (
            <div className="loading-container" style={{ minHeight: '150px' }}>
              <div className="spinner"></div>
              <p>Fetching history entries...</p>
            </div>
          ) : claimHistoryList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13.5px', fontStyle: 'italic' }}>
              No status audit transitions logged for this claim.
            </div>
          ) : (
            <div className="history-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {claimHistoryList.map((item, idx) => {
                const formattedDate = item.updatedDate 
                  ? new Date(item.updatedDate).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Date unknown';
                
                return (
                  <div key={item.id || idx} style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    position: 'relative',
                    paddingBottom: idx === claimHistoryList.length - 1 ? '0' : '20px',
                  }}>
                    {/* Connector line */}
                    {idx !== claimHistoryList.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '19px',
                        top: '38px',
                        bottom: 0,
                        width: '2px',
                        background: 'var(--border)'
                      }}></div>
                    )}

                    {/* Indicator Circle */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--surface)',
                      border: '2px solid var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      zIndex: 2,
                      flexShrink: 0
                    }}>
                      {item.newStatus === 'APPROVED' ? '✅' : item.newStatus === 'REJECTED' ? '❌' : '⏳'}
                    </div>

                    {/* Content details card */}
                    <div style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '16px',
                      flex: 1
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '6px' }}>Status:</span>
                          {item.previousStatus && (
                            <span className={`status-badge ${item.previousStatus.toLowerCase()}`} style={{ marginRight: '6px', fontSize: '10px', padding: '2px 6px' }}>
                              {item.previousStatus}
                            </span>
                          )}
                          {item.previousStatus && <span style={{ marginRight: '6px', color: 'var(--text-secondary)' }}>➔</span>}
                          <span className={`status-badge ${item.newStatus.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {item.newStatus}
                          </span>
                        </div>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                          {formattedDate}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px', fontStyle: 'italic' }}>
                        " {item.remarks || 'No remarks'} "
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Updated by: <strong style={{ color: 'var(--text-primary)' }}>{item.updatedBy}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowHistoryModal(false)}
              disabled={loadingHistory}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Claims;