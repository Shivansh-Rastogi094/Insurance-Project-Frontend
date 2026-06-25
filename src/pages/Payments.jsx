import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readMyPolicies } from '../services/PolicyService';
import { readMyPayements, createPayment } from '../services/PaymentService';
import { useFetch } from '../hooks/useFetch';
import Modal from '../components/Modal';
import DownloadButton from '../components/DownloadButton';

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
    margin: 8px 40px 32px;
  }

  .billing-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 32px;
    padding: 0 40px 40px;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
  }

  .section-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 28px;
    display: flex;
    flex-direction: column;
    height: fit-content;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
  }

  .policies-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .policy-payment-card {
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    padding: 20px;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }

  .policy-payment-card:hover {
    border-color: var(--primary-light);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .plan-info h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .plan-info p {
    font-size: 12.5px;
    color: var(--text-secondary);
    margin-top: 4px;
    font-family: var(--font-mono);
  }

  .status-badge {
    font-size: 10.5px;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: var(--radius-badge);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-badge.active {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-badge.inactive {
    background: rgba(245, 158, 11, 0.1);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-badge.active .pulse-dot {
    background: #10B981;
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    animation: activePulse 1.8s infinite;
  }

  .status-badge.inactive .pulse-dot {
    background: #F59E0B;
  }

  @keyframes activePulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
    70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }

  .card-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    background: var(--card);
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .detail-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .field-val {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .field-val.mono {
    font-family: var(--font-mono);
  }

  .card-action {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .btn-pay {
    background: var(--accent);
    color: #ffffff;
    border: none;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 700;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2);
  }

  .btn-pay:hover {
    background: #0d968d;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -2px rgba(13, 148, 136, 0.3);
  }

  .btn-pay:active {
    transform: translateY(0);
  }

  /* Transactions list styling */
  .txn-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 520px;
    overflow-y: auto;
    scrollbar-width: thin;
    padding-right: 4px;
  }

  .txn-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    transition: all 0.2s ease;
  }

  .txn-item:hover {
    border-color: var(--primary-light);
    background: var(--card);
  }

  .txn-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .txn-ref {
    font-family: var(--font-mono);
    font-size: 12.5px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .txn-meta {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .txn-mode-badge {
    font-size: 9px;
    font-weight: 700;
    background: rgba(100, 116, 139, 0.08);
    color: var(--text-secondary);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--border);
    margin-left: 6px;
  }

  .txn-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .txn-amount {
    font-size: 13.5px;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .txn-status {
    font-size: 10px;
    font-weight: 700;
    color: #10B981;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Checkout Modal Form */
  .modal-summary {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .modal-summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }

  .modal-summary-label {
    color: var(--text-secondary);
  }

  .modal-summary-val {
    font-weight: 600;
    color: var(--text-primary);
  }

  .modal-summary-val.highlight {
    color: var(--accent);
    font-family: var(--font-mono);
    font-weight: 700;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
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
    background: var(--primary);
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
    background: var(--primary-light);
  }

  .btn-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  /* Empty state styling */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary);
    font-size: 13.5px;
    font-style: italic;
    border: 1px dashed var(--border);
    border-radius: 8px;
    background: var(--surface);
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
    .billing-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
    }
    .billing-grid {
      padding: 0 20px 20px;
      gap: 24px;
    }
    .header {
      padding: 24px 20px 16px;
    }
    .divider {
      margin: 8px 20px 24px;
    }
  }
`;

const Payments = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  // Load My Policies and Transaction History via useFetch
  const { data: policiesList = [], loading: policiesLoading, execute: loadPolicies } = useFetch(readMyPolicies);
  const { data: transactionsList = [], loading: transactionsLoading, execute: loadPayments } = useFetch(readMyPayements);

  // Sort policies so that INACTIVE (or non-ACTIVE) ones are on top, then ACTIVE ones.
  const sortedPoliciesList = [...policiesList].sort((a, b) => {
    const aActive = a.policyStatus === 'ACTIVE' ? 1 : 0;
    const bActive = b.policyStatus === 'ACTIVE' ? 1 : 0;
    return aActive - bActive;
  });

  // States
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [txnRef, setTxnRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPolicies();
    loadPayments();
  }, []);

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";



  // Trigger modal and generate transaction reference
  const handleOpenPayModal = (policy) => {
    const randomHex = Math.floor(10000000 + Math.random() * 90000000).toString(16).toUpperCase();
    const dateStr = new Date().toISOString().substring(0, 10).replace(/-/g, '');
    const generatedRef = `TXN-${dateStr}-${randomHex}`;
    
    setSelectedPolicy(policy);
    setPaymentMode('UPI');
    setTxnRef(generatedRef);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!selectedPolicy) return;

    try {
      setSubmitting(true);
      const payload = {
        policyId: selectedPolicy.id,
        amount: selectedPolicy.premiumAmount,
        paymentMode: paymentMode,
        transactionReference: txnRef,
        paymentStatus: 'SUCCESS'
      };

      await createPayment(payload);
      alert(`Payment of ₹${selectedPolicy.premiumAmount.toLocaleString('en-IN')} successful! Policy is now active.`);
      
      // Close modal & reload lists
      setSelectedPolicy(null);
      loadPolicies();
      loadPayments();
    } catch (err) {
      console.error('Error submitting payment:', err);
      alert('Payment processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <Sidebar title="Policyholder Portal" />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">🛡️ InsureSpace</div>
            <div className="topbar-right">
              <span className="role-badge">
                {userData?.fullName || "User"} | {userData?.role || "GUEST"}
              </span>
              <div className="user-avatar" title={userData?.fullName || "User"}>
                {initials}
              </div>
            </div>
          </div>

          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div className="header-text">
              <h2>Billing & Payments</h2>
              <p>Manage your policies, settle premium installments, and track recent transactions</p>
            </div>
            {userData?.role === 'CUSTOMER' && (
              <button 
                className="btn-pay" 
                style={{ background: 'var(--primary)', color: '#ffffff', boxShadow: 'none' }}
                onClick={() => navigate("/policy")}
              >
                + Buy New Policy
              </button>
            )}
          </div>

          <div className="divider" />

          <div className="billing-grid">
            {/* Left Column: All Policies Billing list */}
            <div className="section-card">
              <h3 className="section-title">🛡️ My Policies</h3>
              {policiesLoading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading policy billing records...</p>
                </div>
              ) : policiesList.length === 0 ? (
                <div className="empty-state">
                  No policies found in your account directory.
                </div>
              ) : (
                <div className="policies-stack">
                  {sortedPoliciesList.map((policy) => {
                    const isActive = policy.policyStatus === 'ACTIVE';
                    return (
                      <div className="policy-payment-card" key={policy.id}>
                        <div className="card-top">
                          <div className="plan-info">
                            <h4>{policy.planName}</h4>
                            <p>{policy.policyNumber} • {policy.productType}</p>
                          </div>
                          <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                            <span className="pulse-dot"></span>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="card-details">
                          <div className="detail-field">
                            <span className="field-label">Premium Installment</span>
                            <span className="field-val highlight mono">
                              ₹{policy.premiumAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="detail-field">
                            <span className="field-label">Billing Frequency</span>
                            <span className="field-val" style={{ textTransform: 'uppercase', fontSize: '11.5px' }}>
                              {policy.premiumType}
                            </span>
                          </div>
                          <div className="detail-field">
                            <span className="field-label">Coverage Insured</span>
                            <span className="field-val mono">
                              ₹{policy.coverageAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="card-action" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%', marginTop: '8px' }}>
                          <DownloadButton
                            type="policy"
                            data={policy}
                            extraData={{ customerName: userData?.fullName }}
                            label="📥 Download Schedule"
                            title="Download Policy PDF Schedule"
                            className="btn-pay"
                            style={{
                              background: 'transparent',
                              border: '1.5px solid var(--primary-light)',
                              color: 'var(--primary-light)',
                              boxShadow: 'none',
                              padding: '6px 12px',
                              fontSize: '12px'
                            }}
                          />
                          {!isActive && (
                            <button 
                              className="btn-pay"
                              onClick={() => handleOpenPayModal(policy)}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Pay ₹{policy.premiumAmount.toLocaleString('en-IN')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Transaction Logs */}
            <div className="section-card">
              <h3 className="section-title">📋 Recent Payment Transactions</h3>
              {transactionsLoading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading transactions log...</p>
                </div>
              ) : transactionsList.length === 0 ? (
                <div className="empty-state">
                  No payment transactions have been logged yet.
                </div>
              ) : (
                <div className="txn-list">
                  {transactionsList.map((txn) => {
                    const dateObj = new Date(txn.paymentDate);
                    const formattedDate = dateObj.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div className="txn-item" key={txn.id}>
                        <div className="txn-info">
                          <span className="txn-ref">
                            {txn.transactionReference}
                          </span>
                          <span className="txn-meta">
                            Policy: {txn.policyNumber}
                          </span>
                          <span className="txn-meta">
                            {formattedDate} at {formattedTime}
                            <span className="txn-mode-badge">{txn.paymentMode}</span>
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="txn-right">
                            <span className="txn-amount">
                              ₹{txn.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="txn-status">
                              🛡️ Success
                            </span>
                          </div>
                          <DownloadButton
                            type="payment"
                            data={txn}
                            extraData={{ formattedDate, formattedTime }}
                            label="📥"
                            title="Download PDF Receipt"
                            className="action-btn"
                            style={{
                              background: 'rgba(37, 99, 168, 0.05)',
                              border: '1px solid rgba(37, 99, 168, 0.1)',
                              color: 'var(--primary-light)',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              marginLeft: '8px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Payment Modal */}
      {selectedPolicy && (
        <Modal 
          isOpen={!!selectedPolicy} 
          onClose={() => { if (!submitting) setSelectedPolicy(null); }} 
          title="💳 Secure Payment Portal"
          maxWidth="500px"
        >
          <form onSubmit={handleConfirmPayment} style={{ marginTop: '12px' }}>
            <div className="modal-summary">
              <div className="modal-summary-row">
                <span className="modal-summary-label">Plan Name</span>
                <span className="modal-summary-val">{selectedPolicy.planName}</span>
              </div>
              <div className="modal-summary-row">
                <span className="modal-summary-label">Policy Number</span>
                <span className="modal-summary-val" style={{ fontFamily: 'var(--font-mono)' }}>
                  {selectedPolicy.policyNumber}
                </span>
              </div>
              <div className="modal-summary-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                <span className="modal-summary-label" style={{ fontWeight: '700' }}>Amount to Pay</span>
                <span className="modal-summary-val highlight">
                  ₹{selectedPolicy.premiumAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select 
                className="form-input"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                disabled={submitting}
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Reference Code</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="TXN-YYYYMMDD-XXXXXXXX"
                required
                disabled={submitting}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setSelectedPolicy(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-confirm" 
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Confirm Payment`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default Payments;