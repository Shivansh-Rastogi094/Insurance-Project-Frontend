import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readMyPolicies } from '../services/PolicyService';
import { readMyPayments, createPayment, readAllPayments, createRazorpayOrder, verifyRazorpayPayment } from '../services/PaymentService';
import { useFetch } from '../hooks/useFetch';
import Modal from '../components/Modal';
import DownloadButton from '../components/DownloadButton';
import { useToast } from '../components/ToastProvider';
import '../styles/Payments.css';

const Payments = () => {
  const toast = useToast();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const isCustomer = userData?.role === 'CUSTOMER';

  const fetchPaymentsData = React.useCallback(async () => {
    if (isCustomer) {
      const res = await readMyPayments(0, 1000);
      return Array.isArray(res) ? res : (res?.content || []);
    } else {
      const response = await readAllPayments(0, 1000);
      return response?.data?.content || response?.content || (Array.isArray(response?.data) ? response.data : []);
    }
  }, [isCustomer]);

  // Load My Policies and Transaction History via useFetch
  const { data: policiesList = [], loading: policiesLoading, execute: loadPolicies } = useFetch(readMyPolicies);
  const { data: transactionsList = [], loading: transactionsLoading, execute: loadPayments } = useFetch(fetchPaymentsData);

  // Sort policies in descending order (newest / recent first)
  const sortedPoliciesList = [...policiesList].sort((a, b) => {
    return (b.id || 0) - (a.id || 0);
  });

  // Sort recent transactions in descending order (newest payment date / ID first)
  const sortedTransactionsList = [...transactionsList].sort((a, b) => {
    const bTime = new Date(b.paymentDate || 0).getTime();
    const aTime = new Date(a.paymentDate || 0).getTime();
    if (bTime !== aTime) return bTime - aTime;
    return (b.id || 0) - (a.id || 0);
  });

  // States
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [policyPage, setPolicyPage] = useState(0);
  const [policyPageSize, setPolicyPageSize] = useState(2);
  // Segmented Filter State
  const [statusSegment, setStatusSegment] = useState('ALL');

  // Policy Pagination calculation
  const totalPolicyElements = sortedPoliciesList.length;
  const totalPolicyPages = Math.ceil(totalPolicyElements / policyPageSize) || 1;
  const policyStartIndex = policyPage * policyPageSize;
  const policyEndIndex = Math.min(policyStartIndex + policyPageSize, totalPolicyElements);
  const paginatedPolicies = sortedPoliciesList.slice(policyStartIndex, policyEndIndex);

  // Compute exact counts for each segment from the full transaction list
  const segmentCounts = React.useMemo(() => {
    let all = 0, success = 0, pending = 0, failed = 0;
    sortedTransactionsList.forEach(txn => {
      all++;
      const st = String(txn.paymentStatus || '').toUpperCase();
      if (st === 'SUCCESS' || st === 'SUCCESSFUL' || st === 'COMPLETED') {
        success++;
      } else if (st === 'PENDING' || st === 'PROCESSING' || st === 'INITIATED') {
        pending++;
      } else if (st === 'FAILED' || st === 'FAILURE' || st === 'REJECTED') {
        failed++;
      } else {
        pending++; // Default fallback count if status is unknown/other
      }
    });
    return { all, success, pending, failed };
  }, [sortedTransactionsList]);

  // Reset pagination when search query, page size, or status segment changes
  useEffect(() => {
    setCurrentPage(0);
    setPolicyPage(0);
  }, [searchQuery, pageSize, statusSegment]);

  // Filter transactions based on selected segment and search query
  const filteredTransactionsList = sortedTransactionsList.filter((txn) => {
    const st = String(txn.paymentStatus || '').toUpperCase();
    if (statusSegment !== 'ALL') {
      if (statusSegment === 'SUCCESS' && !(st === 'SUCCESS' || st === 'SUCCESSFUL' || st === 'COMPLETED')) return false;
      if (statusSegment === 'PENDING' && !(st === 'PENDING' || st === 'PROCESSING' || st === 'INITIATED')) return false;
      if (statusSegment === 'FAILED' && !(st === 'FAILED' || st === 'FAILURE' || st === 'REJECTED')) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const ref = String(txn.transactionReference || '').toLowerCase();
    const policyNo = String(txn.policyNumber || txn.policyId || '').toLowerCase();
    const mode = String(txn.paymentMode || '').toLowerCase();
    const status = String(txn.paymentStatus || '').toLowerCase();
    const amount = String(txn.amount || '');
    const date = txn.paymentDate ? new Date(txn.paymentDate).toLocaleDateString('en-IN') : '';

    return ref.includes(q) || policyNo.includes(q) || mode.includes(q) || status.includes(q) || amount.includes(q) || date.toLowerCase().includes(q);
  });

  // Pagination calculation
  const totalElements = filteredTransactionsList.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalElements);
  const paginatedTransactions = filteredTransactionsList.slice(startIndex, endIndex);

  // BUG-003 fix: Include loadPolicies and loadPayments in deps to prevent stale closures
  useEffect(() => {
    if (isCustomer) {
      loadPolicies();
    }
    loadPayments();
  }, [isCustomer, loadPolicies, loadPayments]);

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  // Trigger modal
  const handleOpenPayModal = (policy) => {
    setSelectedPolicy(policy);
  };

  // Launch Razorpay Payment Modal & Verification
  const handleConfirmRazorpayPayment = async (policyTarget) => {
    const target = policyTarget || selectedPolicy;
    if (!target) return;

    try {
      setSubmitting(true);
      // 1. Create Razorpay Order from backend
      const orderData = await createRazorpayOrder(target.id);

      // 2. Configure Razorpay Options
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'Crown Assurance',
        description: `Premium Payment for Policy #${orderData.policyNumber}`,
        image: '/logo1.png',
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            setSubmitting(true);
            const verificationPayload = {
              policyId: target.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMode: 'RAZORPAY',
            };

            await verifyRazorpayPayment(verificationPayload);
            toast.success(`Payment Successful via Razorpay! Policy #${orderData.policyNumber} is now Active.`);

            setSelectedPolicy(null);
            loadPolicies();
            loadPayments();
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            toast.error(verifyErr?.response?.data?.message || 'Razorpay payment verification failed.');
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: userData?.fullName || '',
          email: userData?.email || '',
          contact: userData?.phoneNumber || '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      if (!window.Razorpay) {
        toast.error('Razorpay SDK script not loaded. Please refresh the page and try again.');
        setSubmitting(false);
        return;
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response) => {
        toast.error(`Payment Failed: ${response.error?.description || 'Transaction unsuccessful'}`);
        setSubmitting(false);
      });

      razorpayInstance.open();

    } catch (err) {
      console.error('Error initiating Razorpay checkout:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to initiate Razorpay payment.');
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

          <div className="header">
            <div className="header-text">
              <h2>{isCustomer ? "Billing & Payments" : "Customer Payments Log"}</h2>
              <p>
                {isCustomer
                  ? "Manage your policies, settle premium installments, and track recent transactions"
                  : "Monitor and audit all customer premium payment transactions registered in the system"}
              </p>
            </div>
            {isCustomer && (
              <button 
                className="btn-pay" 
                style={{ background: 'var(--primary)', color: '#ffffff', boxShadow: 'none' }}
                onClick={() => navigate("/policy")}
              >
                + Buy New Policy
              </button>
            )}
          </div>

          <div className={`billing-grid ${!isCustomer ? 'full-width' : ''}`}>
            {/* Left Column: All Policies Billing list */}
            {isCustomer && (
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
                  <>
                    {/* Pending Payment Alert Banner */}
                    {sortedPoliciesList.filter(p => p.policyStatus !== 'ACTIVE' && p.policyStatus !== 'CANCELLED').length > 0 && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
                        border: '1.5px solid rgba(245, 158, 11, 0.35)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <i className="ph ph-warning-circle" style={{ color: '#F59E0B', fontSize: '16px' }} />
                          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#92400E' }}>
                            Payment Required — Policy Not Yet Active
                          </span>
                        </div>
                        {sortedPoliciesList
                          .filter(p => p.policyStatus !== 'ACTIVE' && p.policyStatus !== 'CANCELLED')
                          .map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{p.planName}</div>
                                <div style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{p.policyNumber}</div>
                              </div>
                              <button
                                className="btn-pay"
                                onClick={() => handleOpenPayModal(p)}
                                style={{ padding: '7px 16px', fontSize: '12.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                              >
                                <i className="ph ph-credit-card" />
                                ₹{(p.premiumAmount ?? 0).toLocaleString('en-IN')}
                              </button>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    <div className="policies-stack">
                      {paginatedPolicies.map((policy) => {
                        const isActive = policy.policyStatus === 'ACTIVE';
                        const isCancelled = policy.policyStatus === 'CANCELLED';
                        const canPay = !isActive && !isCancelled;
                        const statusClass = isActive ? 'active' : isCancelled ? 'cancelled' : 'inactive';
                        const statusLabel = isActive ? 'Active' : isCancelled ? 'Cancelled' : 'Inactive';
                        return (
                          <div className={`policy-payment-card ${isCancelled ? 'cancelled-card' : ''}`} key={policy.id}>
                            <div className="card-top">
                              <div className="plan-info">
                                <h4>{policy.planName}</h4>
                                <p>{policy.policyNumber} • {policy.productType}</p>
                              </div>
                              <span className={`status-badge ${statusClass}`}>
                                <span className="pulse-dot"></span>
                                {statusLabel}
                              </span>
                            </div>

                            <div className="card-details">
                              <div className="detail-field">
                                <span className="field-label">Premium Installment</span>
                                <span className="field-val highlight mono">
                                  ₹{(policy.premiumAmount ?? 0).toLocaleString('en-IN')}
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

                            {isCancelled && (
                              <div className="cancelled-notice">
                                <i className="ph ph-warning-circle"></i>
                                This policy has been cancelled and cannot be renewed. Please purchase a new policy.
                              </div>
                            )}

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
                              {canPay && (
                                <button 
                                  className="btn-pay"
                                  onClick={() => handleOpenPayModal(policy)}
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                  Pay ₹{(policy.premiumAmount ?? 0).toLocaleString('en-IN')}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Policy Pagination Controls */}
                    {totalPolicyPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Showing <strong>{policyStartIndex + 1}</strong>-<strong>{policyEndIndex}</strong> of <strong>{totalPolicyElements}</strong> policies
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className="btn-cancel"
                            onClick={() => setPolicyPage(prev => Math.max(prev - 1, 0))}
                            disabled={policyPage === 0}
                            style={{
                              padding: '5px 10px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              cursor: policyPage === 0 ? 'not-allowed' : 'pointer',
                              opacity: policyPage === 0 ? 0.5 : 1,
                              background: 'var(--card)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <i className="ph ph-caret-left"></i> Prev
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Page {policyPage + 1} of {totalPolicyPages}
                          </span>
                          <button
                            className="btn-cancel"
                            onClick={() => setPolicyPage(prev => Math.min(prev + 1, totalPolicyPages - 1))}
                            disabled={policyPage >= totalPolicyPages - 1}
                            style={{
                              padding: '5px 10px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              cursor: policyPage >= totalPolicyPages - 1 ? 'not-allowed' : 'pointer',
                              opacity: policyPage >= totalPolicyPages - 1 ? 0.5 : 1,
                              background: 'var(--card)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          >
                            Next <i className="ph ph-caret-right"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Right Column: Transaction Logs */}
            <div className={`section-card ${!isCustomer ? 'full-width' : ''}`}>
              
              {/* Header Title & Search Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>
                  <i className="ph ph-clipboard"></i> {isCustomer ? "Recent Payment Transactions" : "System Payment Transactions"}
                </h3>

                {/* Search Filter Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', minWidth: '240px' }}>
                  <i className="ph ph-magnifying-glass" style={{ color: 'var(--text-muted)', fontSize: '15px' }}></i>
                  <input
                    type="text"
                    placeholder="Search ref, policy no, mode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', width: '100%' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center' }}
                      title="Clear search"
                    >
                      <i className="ph ph-x-circle"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Streamlined Segmented Count Filter Bar */}
              <div className="segmented-filter-bar">
                <button
                  type="button"
                  className={`segmented-item item-all ${statusSegment === 'ALL' ? 'active' : ''}`}
                  onClick={() => setStatusSegment('ALL')}
                >
                  <div className="segment-icon-wrapper">
                    <i className="ph-bold ph-squares-four"></i>
                  </div>
                  <span className="segment-label">All Transactions</span>
                  <span className="segment-count-badge">{segmentCounts.all}</span>
                </button>

                <button
                  type="button"
                  className={`segmented-item item-success ${statusSegment === 'SUCCESS' ? 'active' : ''}`}
                  onClick={() => setStatusSegment('SUCCESS')}
                >
                  <div className="segment-icon-wrapper">
                    <i className="ph-bold ph-check-circle"></i>
                  </div>
                  <span className="segment-label">Successful</span>
                  <span className="segment-count-badge">{segmentCounts.success}</span>
                </button>

                <button
                  type="button"
                  className={`segmented-item item-pending ${statusSegment === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setStatusSegment('PENDING')}
                >
                  <div className="segment-icon-wrapper">
                    <i className="ph-bold ph-clock"></i>
                  </div>
                  <span className="segment-label">Pending</span>
                  <span className="segment-count-badge">{segmentCounts.pending}</span>
                </button>

                <button
                  type="button"
                  className={`segmented-item item-failed ${statusSegment === 'FAILED' ? 'active' : ''}`}
                  onClick={() => setStatusSegment('FAILED')}
                >
                  <div className="segment-icon-wrapper">
                    <i className="ph-bold ph-x-circle"></i>
                  </div>
                  <span className="segment-label">Failed</span>
                  <span className="segment-count-badge">{segmentCounts.failed}</span>
                </button>
              </div>

              {transactionsLoading ? (
                <div className="loading-container" style={{ width: '100%', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Skeleton height={60} />
                  <Skeleton count={5} height={50} style={{ marginBottom: '8px' }} />
                </div>
              ) : filteredTransactionsList.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  <i className="ph ph-magnifying-glass" style={{ fontSize: '32px', marginBottom: '8px', display: 'block', color: 'var(--text-muted)' }}></i>
                  {searchQuery || statusSegment !== 'ALL' ? (
                    <>
                      No transactions match the chosen filter criteria ({statusSegment !== 'ALL' ? `Status: ${statusSegment}` : ''}{searchQuery ? `, Search: "${searchQuery}"` : ''}).
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => { setSearchQuery(''); setStatusSegment('ALL'); }}
                          style={{ background: 'transparent', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: 'var(--primary-light)' }}
                        >
                          Reset All Filters
                        </button>
                      </div>
                    </>
                  ) : "No payment transactions have been logged yet."}
                </div>
              ) : (
                <div className="table-container" style={{ margin: '8px 0 0 0', boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div className="payments-table-wrapper">
                    <table className="payments-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Policy No.</th>
                          <th>Date & Time</th>
                          <th>Method</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTransactions.map((txn) => {
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
                          const st = String(txn.paymentStatus || '').toUpperCase();

                          return (
                            <tr key={txn.id}>
                              <td className="policy-number">{txn.transactionReference}</td>
                              <td className="policy-number">{txn.policyNumber || txn.policyId}</td>
                              <td>{formattedDate} <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>at {formattedTime}</span></td>
                              <td>
                                <span className="txn-mode-badge" style={{ margin: 0 }}>{txn.paymentMode}</span>
                              </td>
                              <td className="amount-val">₹{(txn.amount || 0).toLocaleString('en-IN')}</td>
                              <td>
                                {st === 'SUCCESS' || st === 'SUCCESSFUL' || st === 'COMPLETED' ? (
                                  <span className="txn-status status-success-badge">
                                    <i className="ph-fill ph-check-circle"></i> Success
                                  </span>
                                ) : st === 'FAILED' || st === 'FAILURE' || st === 'REJECTED' ? (
                                  <span className="txn-status status-failed-badge">
                                    <i className="ph-fill ph-x-circle"></i> Failed
                                  </span>
                                ) : st === 'REFUNDED' || st === 'REFUND' ? (
                                  <span className="txn-status status-refunded-badge">
                                    <i className="ph-fill ph-arrow-counter-clockwise"></i> Refunded
                                  </span>
                                ) : (
                                  <span className="txn-status status-pending-badge">
                                    <i className="ph-fill ph-clock"></i> Pending
                                  </span>
                                )}
                              </td>
                              <td>
                                <DownloadButton
                                  type="payment"
                                  data={txn}
                                  extraData={{ formattedDate, formattedTime }}
                                  label={<><i className="ph ph-download"></i> Receipt</>}
                                  title="Download PDF Receipt"
                                  className="action-btn"
                                  style={{
                                    background: 'rgba(37, 99, 168, 0.05)',
                                    border: '1px solid rgba(37, 99, 168, 0.1)',
                                    color: 'var(--primary-light)',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface)', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalElements}</strong> transactions
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>Per page:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => setPageSize(Number(e.target.value))}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn-cancel"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                          disabled={currentPage === 0}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 0 ? 0.5 : 1,
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <i className="ph ph-caret-left"></i> Prev
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                          className="btn-cancel"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                          disabled={currentPage >= totalPages - 1}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          Next <i className="ph ph-caret-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
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
          <div style={{ marginTop: '12px' }}>
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
              <div className="modal-summary-row">
                <span className="modal-summary-label">Payment Gateway</span>
                <span className="modal-summary-val" style={{ fontWeight: '700', color: '#2563eb' }}>
                  Razorpay (UPI / Card / NetBanking)
                </span>
              </div>
              <div className="modal-summary-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                <span className="modal-summary-label" style={{ fontWeight: '700' }}>Amount to Pay</span>
                <span className="modal-summary-val highlight">
                  ₹{(selectedPolicy.premiumAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setSelectedPolicy(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-confirm" 
                onClick={() => handleConfirmRazorpayPayment(selectedPolicy)}
                disabled={submitting}
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
              >
                <i className="ph ph-shield-check" style={{ fontSize: '18px' }}></i>
                {submitting ? 'Processing...' : `Pay ₹${(selectedPolicy.premiumAmount ?? 0).toLocaleString('en-IN')} via Razorpay`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Payments;