import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readMyPolicies } from '../services/PolicyService';
import { readMyPayements, createPayment } from '../services/PaymentService';
import { useFetch } from '../hooks/useFetch';
import Modal from '../components/Modal';
import DownloadButton from '../components/DownloadButton';
import { useToast } from '../components/ToastProvider';
import '../styles/Payments.css';

const Payments = () => {
  const toast = useToast();
  const { userData } = useAuth();
  const navigate = useNavigate();

  // Load My Policies and Transaction History via useFetch
  const { data: policiesList = [], loading: policiesLoading, execute: loadPolicies } = useFetch(readMyPolicies);
  const { data: transactionsList = [], loading: transactionsLoading, execute: loadPayments } = useFetch(readMyPayements);

  // Sort policies so that INACTIVE (or non-ACTIVE) ones are on top, then ACTIVE ones.
  const sortedPoliciesList = [...policiesList].sort((a, b) => {
    const aActive = a.policyStatus === 'ACTIVE' ? 1 : 0;
    const bActive = b.policyStatus === 'ACTIVE' ? 1 : 0;
    if (aActive !== bActive) return aActive - bActive;
    return (b.id || 0) - (a.id || 0);
  });

  const sortedTransactionsList = [...transactionsList].sort((a, b) => (b.id || 0) - (a.id || 0));

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
      toast.success(`Payment of ₹${selectedPolicy.premiumAmount.toLocaleString('en-IN')} successful! Policy is now active.`);
      
      // Close modal & reload lists
      setSelectedPolicy(null);
      loadPolicies();
      loadPayments();
    } catch (err) {
      console.error('Error submitting payment:', err);
      toast.error(err?.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="payments-page page-container">
        <Sidebar />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">
              <div className="brand-glyph-sm">C</div>
              <span>Crown Assurance</span>
            </div>
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
                <div className="loading-container" style={{ width: '100%', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height={60} />
              <Skeleton count={5} height={50} style={{ marginBottom: '8px' }} />
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
                          <div className="detail-field">
                            <span className="field-label">Available Balance</span>
                            <span className="field-val mono" style={{ color: 'var(--primary)' }}>
                              ₹{(policy.remainingCoverage !== undefined && policy.remainingCoverage !== null ? policy.remainingCoverage : policy.coverageAmount).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="card-action" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%', marginTop: '8px' }}>
                          <DownloadButton
                            type="policy"
                            data={policy}
                            extraData={{ customerName: userData?.fullName }}
                            label={<><i className="ph ph-download" /> Download Schedule</>}
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
              <h3 className="section-title"><i className="ph ph-clipboard"></i> Recent Payment Transactions</h3>
              {transactionsLoading ? (
                <div className="loading-container" style={{ width: '100%', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height={60} />
              <Skeleton count={5} height={50} style={{ marginBottom: '8px' }} />
            </div>
              ) : transactionsList.length === 0 ? (
                <div className="empty-state">
                  No payment transactions have been logged yet.
                </div>
              ) : (
                <div className="txn-list">
                  {sortedTransactionsList.map((txn) => {
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
                            label={<i className="ph ph-download" />}
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
          title={<><i className="ph ph-credit-card"></i> Secure Payment Portal</>}
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