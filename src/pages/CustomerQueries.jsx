import React, { useEffect, useState, useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { useFetch } from '../hooks/useFetch';
import Modal from '../components/Modal';
import { readMyQueries, readAllQueries, replyToQuery, submitQuery } from '../services/CustomerQueryService';

const CustomerQueries = () => {
  const toast = useToast();
  const { userData } = useAuth();
  const isCustomer = userData?.role === 'CUSTOMER';

  const fetchQueriesData = useCallback(async () => {
    if (isCustomer) {
      return await readMyQueries();
    } else {
      const response = await readAllQueries(0, 100);
      return response?.data?.content || response?.content || [];
    }
  }, [isCustomer]);

  const { data: queriesList = [], loading, execute: loadQueries } = useFetch(fetchQueriesData);

  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add New Query modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuery, setNewQuery] = useState({
    subject: '',
    message: ''
  });

  const handleCreateQuery = async (e) => {
    e.preventDefault();
    if (!newQuery.subject.trim() || !newQuery.message.trim()) {
      toast.error('Please enter both subject and message.');
      return;
    }

    try {
      setSubmitting(true);
      await submitQuery({
        fullName: userData?.fullName || 'Customer',
        email: userData?.email || '',
        subject: newQuery.subject,
        message: newQuery.message
      });

      toast.success('Your query has been submitted successfully!');
      setShowAddModal(false);
      setNewQuery({ subject: '', message: '' });
      loadQueries();
    } catch (err) {
      console.error('Error submitting query:', err);
      toast.error(err?.response?.data?.message || 'Failed to submit query. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  const filteredQueries = (Array.isArray(queriesList) ? queriesList : []).filter(q => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      (q.subject || '').toLowerCase().includes(term) ||
      (q.fullName || '').toLowerCase().includes(term) ||
      (q.email || '').toLowerCase().includes(term) ||
      (q.message || '').toLowerCase().includes(term) ||
      (q.status || '').toLowerCase().includes(term)
    );
  });

  const handleOpenReplyModal = (query) => {
    setSelectedQuery(query);
    setReplyText(query.response || '');
    setReplyStatus(query.status === 'PENDING' ? 'RESOLVED' : query.status);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedQuery) return;
    if (!replyText.trim()) {
      toast.error('Response message cannot be empty.');
      return;
    }

    try {
      setSubmitting(true);
      await replyToQuery(selectedQuery.id, {
        response: replyText,
        status: replyStatus
      });

      toast.success(`Response saved & email sent to ${selectedQuery.email}!`);
      setSelectedQuery(null);
      loadQueries();
    } catch (err) {
      console.error('Error replying to query:', err);
      toast.error(err?.response?.data?.message || 'Failed to send response.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="ph ph-check-circle"></i> RESOLVED</span>;
      case 'IN_PROGRESS':
        return <span style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="ph ph-clock"></i> IN PROGRESS</span>;
      case 'CLOSED':
        return <span style={{ background: 'rgba(100, 116, 139, 0.12)', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="ph ph-lock-key"></i> CLOSED</span>;
      default:
        return <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="ph ph-hourglass"></i> PENDING</span>;
    }
  };

  return (
    <div className="page-container" style={{ background: 'var(--surface)', minHeight: '100vh', display: 'flex' }}>
      <Sidebar />

      <div className="main-content" style={{ flex: 1, marginLeft: '240px', minWidth: 0 }}>
        {/* Topbar */}
        <div className="topbar" style={{ height: '60px', background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="topbar-logo" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-glyph-sm" style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>C</div>
            <span>Crown Assurance</span>
          </div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="role-badge" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-light)', background: 'rgba(37, 99, 168, 0.1)', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              {userData?.fullName || "User"} | {userData?.role || "GUEST"}
            </span>
            <div className="user-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }} title={userData?.fullName || "User"}>
              {initials}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '32px 40px 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
                {isCustomer ? "My Support Inquiries & Queries" : "Customer Support Queries Portal"}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                {isCustomer
                  ? "Track the status of your inquiries submitted to Crown Assurance support team"
                  : "Review, respond to, and resolve inquiries submitted by policyholders and visitors"}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {isCustomer && (
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(37, 99, 168, 0.25)'
                  }}
                >
                  <i className="ph ph-plus-circle" style={{ fontSize: '16px' }}></i> Add New Query
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', minWidth: '240px' }}>
                <i className="ph ph-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
                <input
                  type="text"
                  placeholder="Search subject, name, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height={80} count={4} style={{ borderRadius: '12px' }} />
            </div>
          ) : filteredQueries.length === 0 ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
              <i className="ph ph-chat-teardrop-text" style={{ fontSize: '42px', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}></i>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No Support Queries Found</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {searchQuery ? `No queries matching "${searchQuery}"` : "Have a question? Submit an inquiry through our Contact Us page."}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredQueries.map((item) => {
                const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <div key={item.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{item.subject}</h4>
                          {getStatusBadge(item.status)}
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                          From <strong>{item.fullName}</strong> ({item.email}) • <span style={{ fontFamily: 'var(--font-mono)' }}>{dateStr}</span>
                        </p>
                      </div>

                      {(userData?.role === 'AGENT' || userData?.role === 'SUPER_AGENT') && (
                        (item.status === 'RESOLVED' || item.status === 'CLOSED') ? (
                          <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ph ph-lock-key"></i> Status Finalized
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenReplyModal(item)}
                            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <i className="ph ph-arrow-u-up-left"></i> Respond to Query
                          </button>
                        )
                      )}
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px', marginTop: '14px', fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      <strong style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Inquiry Message:</strong>
                      {item.message}
                    </div>

                    {item.response && (
                      <div style={{ background: 'rgba(37, 99, 168, 0.04)', borderLeft: '3px solid var(--primary)', padding: '14px 16px', borderRadius: '0 8px 8px 0', marginTop: '12px', fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                        <strong style={{ display: 'block', fontSize: '11.5px', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Support Team Response:</strong>
                        {item.response}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedQuery && (
        <Modal
          isOpen={!!selectedQuery}
          onClose={() => { if (!submitting) setSelectedQuery(null); }}
          title={<><i className="ph ph-chat-text"></i> Respond to Customer Query</>}
          maxWidth="540px"
        >
          <form onSubmit={handleSendReply} style={{ marginTop: '12px' }}>
            <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Subject: {selectedQuery.subject}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>From: {selectedQuery.fullName} ({selectedQuery.email})</p>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Query Status</label>
              <select
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-primary)', fontSize: '13px' }}
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Response Message</label>
              <textarea
                rows="5"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the customer here..."
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13.5px', fontFamily: 'inherit', resize: 'vertical' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedQuery(null)}
                disabled={submitting}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                {submitting ? 'Sending...' : 'Send Response & Email'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Query Modal for Customers */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => { if (!submitting) setShowAddModal(false); }}
          title={<><i className="ph ph-plus-circle"></i> Submit New Support Query</>}
          maxWidth="520px"
        >
          <form onSubmit={handleCreateQuery} style={{ marginTop: '12px' }}>
            <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '14px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Customer Account:</span> {userData?.fullName} ({userData?.email}) <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}><i className="ph ph-lock-key"></i> (Locked to authenticated user)</span>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Subject</label>
              <input
                type="text"
                value={newQuery.subject}
                onChange={(e) => setNewQuery(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g. Inquiry regarding claim status or premium payment"
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13.5px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Detailed Message</label>
              <textarea
                rows="5"
                value={newQuery.message}
                onChange={(e) => setNewQuery(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your question or issue in detail..."
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13.5px', fontFamily: 'inherit', resize: 'vertical' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                {submitting ? 'Submitting...' : 'Submit Query'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CustomerQueries;
