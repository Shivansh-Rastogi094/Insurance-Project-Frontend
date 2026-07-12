import React, { useState } from 'react';
import Modal from '../Modal';
import { createAgentAccount } from '../../services/UserService';
import { useToast } from '../ToastProvider';

const AddUserModal = ({ show, onClose, onUserCreated }) => {
  const toast = useToast();
  const [agentSubmitting, setAgentSubmitting] = useState(false);
  const [agentData, setAgentData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'AGENT',
    specialization: 'HEALTH'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agentData.fullName.trim() || !agentData.email.trim() || !agentData.password.trim() || !agentData.phoneNumber.trim()) {
      toast.error("All fields are required.");
      return;
    }
    if (agentData.role === 'AGENT' && !agentData.specialization) {
      toast.error("Specialization is required for Agent role.");
      return;
    }

    const payload = {
      fullName: agentData.fullName,
      email: agentData.email,
      password: agentData.password,
      phoneNumber: agentData.phoneNumber,
      role: agentData.role,
      ...(agentData.role === 'AGENT' ? { specialization: agentData.specialization } : {})
    };

    try {
      setAgentSubmitting(true);
      await createAgentAccount(payload);
      toast.success("Agent account created successfully!");
      
      // Reset form
      setAgentData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'AGENT',
        specialization: 'HEALTH'
      });

      onUserCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create agent:", err);
      toast.error(`Failed to create agent: ${err?.response?.data?.message || err.message}`);
    } finally {
      setAgentSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={() => { if (!agentSubmitting) onClose(); }}
      title={<><i className="ph ph-sparkle"></i> Add New Agent</>}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Full Name</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="e.g. Alex Kumar"
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
            placeholder="e.g. alexkumar@gmail.com"
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
            placeholder="Min. 8 characters"
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

        {/* Role Selector */}
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Agent Role</label>
          <select
            required
            className="form-input"
            value={agentData.role}
            onChange={(e) => setAgentData({ ...agentData, role: e.target.value, specialization: e.target.value === 'AGENT' ? 'HEALTH' : '' })}
            disabled={agentSubmitting}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          >
            <option value="AGENT">Agent — Specialization-restricted</option>
            <option value="SUPER_AGENT">Super Agent — All policy types</option>
          </select>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {agentData.role === 'SUPER_AGENT'
              ? '⚡ Super Agent can review claims across ALL policy types (SUPER specialization auto-assigned).'
              : '🎯 Agent is restricted to claims matching their selected policy specialization.'}
          </span>
        </div>

        {/* Specialization — only for regular AGENT */}
        {agentData.role === 'AGENT' && (
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Policy Specialization</label>
            <select
              required
              className="form-input"
              value={agentData.specialization}
              onChange={(e) => setAgentData({ ...agentData, specialization: e.target.value })}
              disabled={agentSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            >
              <option value="HEALTH">HEALTH — Health insurance claims</option>
              <option value="MOTOR">MOTOR — Motor / vehicle claims</option>
              <option value="LIFE">LIFE — Life insurance claims</option>
              <option value="TRAVEL">TRAVEL — Travel insurance claims</option>
            </select>
          </div>
        )}

        <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
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
  );
};

export default AddUserModal;
