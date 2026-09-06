import React, { useState } from 'react';
import DownloadButton from '../DownloadButton';
import { useToast } from '../ToastProvider';

const ClaimsTable = ({
  filteredClaims,
  userData,
  onReview,
  onHistory,
  isCustomer,
  isAgent
}) => {
  const toast = useToast();
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="table-card">
      <div className="claims-table-wrapper">
        <table className="claims-table">
          <colgroup>
            <col style={{ width: '50px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '130px', textAlign: 'right' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '260px' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ width: '50px' }}></th>
              <th style={{ width: '180px' }}>Claim & Policy ID</th>
              <th style={{ width: '80px' }}>Type</th>
              <th style={{ width: '120px' }}>Incident Date</th>
              <th style={{ width: 'auto' }}>Claim Reason</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Amount</th>
              <th style={{ width: '130px' }}>Status</th>
              <th style={{ width: '80px' }}>Docs</th>
              <th style={{ width: '260px', textAlign: 'right', paddingRight: '24px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((claim, idx) => {  
              const claimNum = claim.claimNumber || `CLM-${claim.id || idx}`;
              const status = (claim.claimStatus || 'SUBMITTED').toLowerCase();
              const assocPolicy = claim.policyNumber || 'N/A';
              const policyType = claim.productType || 'N/A';
              const incidentDate = claim.incidentDate || 'N/A';
              const claimReason = claim.claimReason || 'No reason provided';
              const claimAmount = claim.claimAmount || 0;
              const agentRemarks = claim.agentRemarks === "null" || !claim.agentRemarks ? "Pending" : claim.agentRemarks;
              const adminRemarks = claim.adminRemarks === "null" || !claim.adminRemarks ? "Pending" : claim.adminRemarks;
              const isAdminDecided = status === 'approved' || status === 'rejected' || adminRemarks !== "Pending";
              const isExpanded = !!expandedRows[claim.id];

              return (
                <React.Fragment key={claim.id || idx}>
                  <tr className="main-row" onClick={() => toggleRow(claim.id)}>
                    <td>
                      <button 
                        type="button"
                        className={`chevron-btn ${isExpanded ? 'expanded' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(claim.id);
                        }}
                      >
                        <i className="ph ph-caret-down" style={{ fontSize: '15px' }} />
                      </button>
                    </td>
                    <td className="claim-number-cell">
                      <div>{claimNum}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        {assocPolicy}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>
                        {policyType}
                      </span>
                    </td>
                    <td>{incidentDate}</td>
                    <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={claimReason}>
                      {claimReason}
                    </td>
                    <td className="amount-cell" style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700' }}>₹{claimAmount.toLocaleString('en-IN')}</div>
                      {claim.agentSuggestedAmount !== null && claim.agentSuggestedAmount !== undefined && (
                        <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600', marginTop: '2px' }}>
                          Passed: ₹{claim.agentSuggestedAmount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${status}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      {claim.documents && claim.documents.length > 0 ? (
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <i className="ph ph-file-text" style={{ fontSize: '16px' }}></i>
                          {claim.documents.length}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '24px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          className="action-btn"
                          onClick={() => onHistory(claim)}
                        >
                          History
                        </button>
                        {!isCustomer && (
                          userData?.role === 'ADMIN' && status === 'submitted' ? (
                            <button 
                              className="action-btn" 
                              disabled 
                              style={{ cursor: 'not-allowed', opacity: 0.7 }}
                              title="Waiting for Officer recommendation"
                            >
                              Review Pending
                            </button>
                          ) : (
                            <button
                              className={`action-btn ${isAdminDecided ? '' : 'accent'}`}
                              onClick={() => onReview(claim)}
                              disabled={isAdminDecided}
                              style={isAdminDecided ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                              title={isAdminDecided ? "Admin decision has already been finalized" : ""}
                            >
                              {isAdminDecided ? 'Finalized' : ((userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') ? 'Verify' : 'Decide')}
                            </button>
                          )
                        )}
                        <DownloadButton
                          type="claim"
                          data={claim}
                          extraData={{ claimNum }}
                          label={<i className="ph ph-download" />}
                          title="Download PDF Claim Slip"
                          className="action-btn"
                          style={{
                            padding: '6px 10px',
                            fontSize: '14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="detail-row">
                      <td colSpan={9}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div className="detail-row-grid">
                            <div className="detail-col">
                              <span className="detail-col-title">Claim Reason</span>
                              <span className="detail-col-content">{claimReason}</span>
                            </div>
                            <div className="detail-col">
                              <span className="detail-col-title">Officer Remarks</span>
                              <span className="detail-col-content">{agentRemarks}</span>
                            </div>
                            <div className="detail-col">
                              <span className="detail-col-title">Admin Remarks</span>
                              <span className="detail-col-content">{adminRemarks}</span>
                            </div>
                          </div>
                          <div className="detail-docs-section">
                            <span className="detail-col-title" style={{ display: 'block', marginBottom: '8px' }}>Attached Documents</span>
                            {claim.documents && claim.documents.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {claim.documents.map((doc, docIdx) => {
                                  const isUrl = doc.documentReference && (doc.documentReference.startsWith('http://') || doc.documentReference.startsWith('https://'));
                                  return (
                                    <button
                                      key={doc.id || docIdx}
                                      className="action-btn"
                                      style={{ 
                                        fontSize: '12px', 
                                        padding: '6px 12px', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '6px',
                                        width: 'fit-content' 
                                      }}
                                      onClick={() => {
                                        if (isUrl) {
                                          window.open(doc.documentReference, '_blank', 'noopener,noreferrer');
                                        } else {
                                          toast.info(`Document Reference ID: ${doc.documentReference || 'N/A'}\n(Direct file download coming soon!)`);
                                        }
                                      }}
                                      title={isUrl ? "Open document in a new tab" : `Ref: ${doc.documentReference}`}
                                    >
                                      <i className="ph ph-file-text" style={{ fontSize: '14px' }}></i> 
                                      {doc.documentName || `Doc ${doc.id}`} ({doc.documentType || 'File'})
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                No documents attached to this claim.
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClaimsTable;
