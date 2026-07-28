import React, { useState } from 'react';
import Modal from '../Modal';
import { createClaim } from '../../services/ClaimService';
import { useToast } from '../ToastProvider';

const FileClaimModal = ({ show, onClose, activePolicies, onClaimFiled }) => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [claimForm, setClaimForm] = useState({
    policyId: '',
    claimAmount: '',
    claimReason: '',
    incidentDate: ''
  });
  const [claimDocuments, setClaimDocuments] = useState([]);
  const [formErrors, setFormErrors] = useState({});

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

    setClaimDocuments(
      claimDocuments.map((doc, i) =>
        i === index
          ? {
              documentName: nameWithoutExt,
              documentType: ext === 'JPG' ? 'JPEG' : ext,
              documentReference: file.name,
              fileObject: file
            }
          : doc
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!claimForm.policyId) errors.policyId = "Please select an active policy.";

    const amt = parseFloat(claimForm.claimAmount);
    if (isNaN(amt) || amt <= 0) {
      errors.claimAmount = "Please enter a valid positive claim amount.";
    } else {
      const selectedPolObj = activePolicies.find(p => p.id.toString() === claimForm.policyId.toString());
      if (selectedPolObj) {
        const availableCoverage = selectedPolObj.remainingCoverage !== undefined && selectedPolObj.remainingCoverage !== null 
          ? selectedPolObj.remainingCoverage 
          : selectedPolObj.coverageAmount;
          
        if (amt > availableCoverage) {
          errors.claimAmount = `Claim amount cannot exceed available remaining coverage of ₹${availableCoverage.toLocaleString('en-IN')}`;
        }
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
      if (!doc.fileObject && !doc.documentReference.trim()) {
        errors[`docRef_${idx}`] = "Please select a file or enter a document reference.";
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErr = Object.values(errors)[0];
      toast.error(`Validation Error: ${firstErr}`);
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      
      const claimData = {
        policyId: parseInt(claimForm.policyId),
        claimAmount: parseFloat(claimForm.claimAmount),
        claimReason: claimForm.claimReason.trim(),
        incidentDate: claimForm.incidentDate,
        documents: claimDocuments.map(d => ({
          documentName: d.documentName.trim(),
          documentType: d.documentType,
          documentReference: d.documentReference ? d.documentReference.trim() : ''
        }))
      };
      
      formData.append("claim", JSON.stringify(claimData));
      
      // Append selected files
      claimDocuments.forEach(doc => {
        if (doc.fileObject) {
          formData.append("files", doc.fileObject);
        }
      });

      await createClaim(formData);
      toast.success("Claim filed successfully!");
      onClaimFiled();
      onClose();
    } catch (err) {
      console.error("Failed to file claim:", err);
      toast.error(err?.response?.data?.message || "Filing claim failed. Please check inputs or logs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={() => { if (!submitting) onClose(); }}
      title={<><i className="ph ph-file-text"></i> File New Insurance Claim</>}
      maxWidth="550px"
    >
      <form onSubmit={handleSubmit} style={{ marginTop: '12px' }}>
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
            {activePolicies.map(p => {
              const availableCoverage = p.remainingCoverage !== undefined && p.remainingCoverage !== null ? p.remainingCoverage : p.coverageAmount;
              return (
                <option key={p.id} value={p.id}>
                  {p.planName} ({p.policyNumber}) - Max: ₹{p.coverageAmount.toLocaleString('en-IN')} | Avail: ₹{availableCoverage.toLocaleString('en-IN')}
                </option>
              );
            })}
          </select>
          {formErrors.policyId && <div className="form-error"><i className="ph ph-warning-circle" style={{ marginRight: '4px' }}></i>{formErrors.policyId}</div>}
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
          {formErrors.claimAmount && <div className="form-error"><i className="ph ph-warning-circle" style={{ marginRight: '4px' }}></i>{formErrors.claimAmount}</div>}
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
          {formErrors.incidentDate && <div className="form-error"><i className="ph ph-warning-circle" style={{ marginRight: '4px' }}></i>{formErrors.incidentDate}</div>}
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
          {formErrors.claimReason && <div className="form-error"><i className="ph ph-warning-circle" style={{ marginRight: '4px' }}></i>{formErrors.claimReason}</div>}
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
              <i className="ph ph-plus"></i> Add Document
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
                  <i className="ph ph-trash" style={{ fontSize: '14px' }}></i>
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
                  <i className="ph ph-folder"></i> Choose File
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
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-confirm"
            style={{ background: 'var(--primary)' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FileClaimModal;
