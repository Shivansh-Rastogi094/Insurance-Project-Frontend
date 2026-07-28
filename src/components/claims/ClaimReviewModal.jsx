import React, { useState } from 'react';
import Modal from '../Modal';
import { agentReviewClaim, adminDecisionClaim } from '../../services/ClaimService';
import { useToast } from '../ToastProvider';

const ClaimReviewModal = ({ show, onClose, claim, userData, onClaimReviewed }) => {
  const toast = useToast();
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: (userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') ? 'RECOMMENDED' : 'APPROVED',
    remarks: '',
    suggestedAmount: ''
  });
  const [reviewErrors, setReviewErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!reviewForm.status) errors.status = "Please choose a status decision.";
    
    if (userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') {
      const suggestedVal = parseFloat(reviewForm.suggestedAmount);
      if (reviewForm.suggestedAmount && (isNaN(suggestedVal) || suggestedVal <= 0)) {
        errors.suggestedAmount = "Please enter a valid positive suggested amount.";
      } else if (suggestedVal > claim.claimAmount) {
        errors.suggestedAmount = `Suggested amount cannot exceed the requested claim amount of ₹${claim.claimAmount.toLocaleString('en-IN')}`;
      }
    }

    if (!reviewForm.remarks.trim()) errors.remarks = "Please enter review remarks.";

    if (Object.keys(errors).length > 0) {
      setReviewErrors(errors);
      return;
    }

    try {
      setReviewSubmitting(true);

      if (userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') {
        const payload = {
          recommendedStatus: reviewForm.status,
          remarks: reviewForm.remarks.trim(),
          suggestedAmount: reviewForm.suggestedAmount ? parseFloat(reviewForm.suggestedAmount) : null
        };
        await agentReviewClaim(claim.id, payload);
        toast.success(`Claim recommendation submitted successfully as ${reviewForm.status}.`);
      } else {
        const payload = {
          finalDecisionStatus: reviewForm.status,
          remarks: reviewForm.remarks.trim()
        };
        await adminDecisionClaim(claim.id, payload);
        toast.success(`Claim decision submitted successfully as ${reviewForm.status}.`);
      }

      onClaimReviewed();
      onClose();
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(err?.response?.data?.message || "Failed to submit claim review/decision. Please check inputs or logs.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={() => { if (!reviewSubmitting) onClose(); }}
      title={(userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') ? <><i className="ph ph-magnifying-glass"></i> Officer Claim Verification</> : <><i className="ph ph-scales"></i> Admin Claim Decision</>}
      maxWidth="500px"
    >
      <div className="modal-summary" style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Claim Reference:</span>
          <strong style={{ fontFamily: 'var(--font-mono)' }}>{claim.claimNumber || `CLM-${claim.id}`}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Policyholder:</span>
          <strong>{claim.customerName || 'N/A'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Requested Amount:</span>
          <strong style={{ color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
            ₹{claim.claimAmount?.toLocaleString('en-IN') || 0}
          </strong>
        </div>
        {claim.agentSuggestedAmount !== null && claim.agentSuggestedAmount !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Passed Amount:</span>
            <strong style={{ color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
              ₹{claim.agentSuggestedAmount.toLocaleString('en-IN')}
            </strong>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
          <strong style={{ textTransform: 'uppercase' }}>{claim.claimStatus}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            {(userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') ? "Recommended Status" : "Final Decision"}
          </label>
          <select
            className="form-input"
            value={reviewForm.status}
            onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
            required
            disabled={reviewSubmitting}
          >
            {(userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') ? (
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
          {reviewErrors.status && <div className="form-error"><i className="ph ph-warning-circle" style={{ marginRight: '4px' }}></i>{reviewErrors.status}</div>}
        </div>

        {(userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') && (
          <div className="form-group">
            <label className="form-label">Suggested Passed Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              placeholder={`Max: ₹${claim.claimAmount?.toLocaleString('en-IN')}`}
              value={reviewForm.suggestedAmount || ''}
              onChange={(e) => setReviewForm({ ...reviewForm, suggestedAmount: e.target.value })}
              disabled={reviewSubmitting}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Leave empty to approve the full requested amount of ₹{claim.claimAmount?.toLocaleString('en-IN')}.
            </span>
            {reviewErrors.suggestedAmount && <div className="form-error"><i className="ph ph-warning-circle" style={{ marginRight: '4px' }}></i>{reviewErrors.suggestedAmount}</div>}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Review Remarks / Audit Comments</label>
          <textarea
            className="form-input"
            style={{ minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
            placeholder={
              (userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT')
                ? "Enter documents verification notes and recommendations..."
                : "Enter final payout rationale..."
            }
            value={reviewForm.remarks}
            onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })}
            required
            disabled={reviewSubmitting}
          />
          {reviewErrors.remarks && <div className="form-error"><i className="ph ph-warning-circle" style={{ marginRight: '4px' }}></i>{reviewErrors.remarks}</div>}
        </div>

        <div className="modal-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={reviewSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-confirm"
            style={{ background: 'var(--primary)' }}
            disabled={reviewSubmitting}
          >
            {reviewSubmitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClaimReviewModal;
