import React, { useState, useEffect } from 'react';
import Modal from './Modal';

/**
 * EditPlanModal Component
 * 
 * Reusable modal for editing insurance plans.
 * Built using the application's Modal system and CSS design tokens:
 * - High contrast labels in Light Mode & Dark Mode
 * - Option for Admin to enter custom premium or let backend auto-generate
 * - Full form validation and responsive design
 */
const EditPlanModal = ({ isOpen, onClose, plan, onSave, submitting = false }) => {
  const [formData, setFormData] = useState({
    id: '',
    planName: 'LifeSecure Term Plan',
    minCoverageAmount: '500000',
    premiumAmount: '',
    premiumType: 'ANNUAL',
    duration: '17',
    termsAndConditions: 'Financial protection for your family with comprehensive coverage and guaranteed tax benefits.',
    active: true,
  });

  // State to toggle custom premium entry vs auto-generated premium by backend
  const [overridePremium, setOverridePremium] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plan) {
      const hasCustomPremium = plan.premiumAmount !== undefined && plan.premiumAmount !== null && Number(plan.premiumAmount) > 0;
      const minCov = plan.minCoverageAmount !== undefined ? String(plan.minCoverageAmount) : (plan.coverageAmount !== undefined ? String(plan.coverageAmount) : '500000');

      setFormData({
        id: plan.id || '',
        planName: plan.planName || 'LifeSecure Term Plan',
        minCoverageAmount: minCov,
        premiumAmount: hasCustomPremium ? String(plan.premiumAmount) : '',
        premiumType: plan.premiumType || 'ANNUAL',
        duration: plan.duration !== undefined ? String(plan.duration) : (plan.durationYears ? String(plan.durationYears) : '17'),
        termsAndConditions: plan.termsAndConditions || 'Financial protection for your family with comprehensive coverage and guaranteed tax benefits.',
        active: plan.active !== undefined ? plan.active : true,
      });

      setOverridePremium(hasCustomPremium);
      setErrors({});
    }
  }, [plan]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.planName || !formData.planName.trim()) {
      newErrors.planName = "Plan name is required.";
    }
    const cov = parseFloat(formData.minCoverageAmount);
    if (isNaN(cov) || cov < 50000) {
      newErrors.minCoverageAmount = "Minimum coverage amount must be at least ₹50,000.";
    }

    if (overridePremium) {
      const prem = parseFloat(formData.premiumAmount);
      if (isNaN(prem) || prem <= 0) {
        newErrors.premiumAmount = "Enter a valid custom premium amount greater than zero.";
      }
    }

    const dur = parseInt(formData.duration, 10);
    if (isNaN(dur) || dur <= 0) {
      newErrors.duration = "Coverage duration must be at least 1 year.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (onSave) {
      onSave({
        ...formData,
        minCoverageAmount: parseFloat(formData.minCoverageAmount),
        premiumAmount: overridePremium && formData.premiumAmount ? parseFloat(formData.premiumAmount) : null,
        duration: parseInt(formData.duration, 10)
      });
    }
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-primary)',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<><i className="ph ph-pencil-simple" style={{ marginRight: '8px' }}></i>Edit Insurance Plan</>}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Plan Name */}
        <div>
          <label style={labelStyle}>
            Plan Name <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            style={inputStyle}
            value={formData.planName}
            onChange={(e) => {
              setFormData({ ...formData, planName: e.target.value });
              if (errors.planName) setErrors({ ...errors, planName: '' });
            }}
            placeholder="e.g. LifeSecure Term Plan"
          />
          {errors.planName && (
            <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ph ph-warning-circle"></i> {errors.planName}
            </p>
          )}
        </div>

        {/* Row 1: Min Coverage Amount & Max Coverage Amount (Auto-generated) */}
        <div style={{ display: 'flex', gap: '16px' }}>
          
          {/* Min Coverage Amount */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Min Coverage Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              step="50000"
              min="50000"
              style={inputStyle}
              value={formData.minCoverageAmount}
              onChange={(e) => {
                setFormData({ ...formData, minCoverageAmount: e.target.value });
                if (errors.minCoverageAmount) setErrors({ ...errors, minCoverageAmount: '' });
              }}
              placeholder="e.g. 500000 (Min ₹50,000)"
            />
            {errors.minCoverageAmount && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ph ph-warning-circle"></i> {errors.minCoverageAmount}
              </p>
            )}
          </div>

          {/* Max Coverage Amount (Auto-Calculated) */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>
                Max Coverage Amount (₹)
              </label>
              <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                Auto-Calculated (+₹20L)
              </span>
            </div>
            <input
              type="number"
              disabled
              style={{
                ...inputStyle,
                background: 'rgba(148, 163, 184, 0.08)',
                opacity: 0.85,
                cursor: 'not-allowed',
                fontWeight: '600',
                color: 'var(--primary-light)'
              }}
              value={!isNaN(parseFloat(formData.minCoverageAmount)) ? parseFloat(formData.minCoverageAmount) + 2000000 : ''}
              readOnly
            />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="ph ph-sparkle" style={{ color: 'var(--primary)' }}></i> Auto-set by backend to Min + ₹20,00,000
            </p>
          </div>

        </div>

        {/* Custom Premium Override Checkbox Card */}
        <div style={{
          background: overridePremium ? 'rgba(79, 70, 229, 0.06)' : 'var(--surface)',
          border: overridePremium ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid var(--border)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', margin: 0 }}>
            <input
              type="checkbox"
              checked={overridePremium}
              onChange={(e) => {
                setOverridePremium(e.target.checked);
                if (!e.target.checked) setFormData(prev => ({ ...prev, premiumAmount: '' }));
              }}
              style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
            />
            <div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="ph ph-gear-six" style={{ color: 'var(--primary)' }}></i> Set Custom Premium Installment Amount
              </span>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Unchecked = Backend automatically calculates the actuarial premium based on coverage &amp; term. Checked = Admin specifies a custom fixed premium amount.
              </p>
            </div>
          </label>

          {overridePremium && (
            <div style={{ paddingTop: '10px', borderTop: '1px dashed rgba(79, 70, 229, 0.25)' }}>
              <label style={labelStyle}>
                Custom Premium Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                style={inputStyle}
                value={formData.premiumAmount}
                onChange={(e) => {
                  setFormData({ ...formData, premiumAmount: e.target.value });
                  if (errors.premiumAmount) setErrors({ ...errors, premiumAmount: '' });
                }}
                placeholder="Enter custom installment premium (e.g. 15000)"
                autoFocus
              />
              {errors.premiumAmount && (
                <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="ph ph-warning-circle"></i> {errors.premiumAmount}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Billing Frequency & Coverage Term */}
        <div style={{ display: 'flex', gap: '16px' }}>
          
          {/* Billing Frequency */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Billing Frequency
            </label>
            <select
              style={inputStyle}
              value={formData.premiumType}
              onChange={(e) => setFormData({ ...formData, premiumType: e.target.value })}
            >
              <option value="ANNUAL">ANNUAL</option>
              <option value="ONE_TIME">ONE_TIME</option>
            </select>
          </div>

          {/* Coverage Term (Years) */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Coverage Term (Years) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              style={inputStyle}
              value={formData.duration}
              onChange={(e) => {
                setFormData({ ...formData, duration: e.target.value });
                if (errors.duration) setErrors({ ...errors, duration: '' });
              }}
              placeholder="e.g. 17"
            />
            {errors.duration && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ph ph-warning-circle"></i> {errors.duration}
              </p>
            )}
          </div>

        </div>

        {/* Terms & Conditions */}
        <div>
          <label style={labelStyle}>
            Terms & Conditions
          </label>
          <textarea
            rows="3"
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            placeholder="Financial protection for your family..."
          />
        </div>

        {/* Status Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="edit-modal-active-cb"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="edit-modal-active-cb" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>
            Mark as Active
          </label>
        </div>

        {/* Action Buttons Footer */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justify: 'flex-end',
          marginTop: '12px',
          borderTop: '1px solid var(--border)',
          paddingTop: '16px'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 20px',
              fontSize: '13.5px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer',
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default EditPlanModal;
