import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { submitQuery } from '../services/CustomerQueryService';
import '../styles/LandingPage.css';

const ContactUs = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    email: userData?.email || '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await submitQuery(formData);
      toast.success('Your message has been sent successfully! Our support team will get back to you shortly.');
      
      setFormData({
        fullName: userData?.fullName || '',
        email: userData?.email || '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
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
              {userData?.fullName || "Guest"} | {userData?.role || "USER"}
            </span>
            <div className="user-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }} title={userData?.fullName || "User"}>
              {initials}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '32px 40px 60px' }}>
          <div className="header-text" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Contact Us</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              We are here to help you. Have a question about our policies, claims, or coverage? Get in touch with our team.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '32px', alignItems: 'start' }}>
            {/* Info Panel */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Get in Touch</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37, 99, 168, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    <i className="ph ph-envelope-simple"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Email Support</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>support@crownassurance.com</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37, 99, 168, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    <i className="ph ph-phone"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Phone Support</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>+91 1800 234 5678 (Toll Free)</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37, 99, 168, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    <i className="ph ph-map-pin"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Corporate Office</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
                      Crown Towers, Level 12, Financial District, Gachibowli, Hyderabad - 500032
                    </p>
                  </div>
                </div>
              </div>

              {userData && (
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => navigate('/queries')}
                    style={{ background: 'transparent', border: '1.5px solid var(--primary)', color: 'var(--primary)', width: '100%', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <i className="ph ph-chat-text" style={{ fontSize: '16px' }}></i> View My Support Queries
                  </button>
                </div>
              )}
            </div>

            {/* Form Panel */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Send Us a Message</h3>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Full Name {userData?.fullName && <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, marginLeft: '4px' }}>🔒 (Locked)</span>}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-input"
                      value={formData.fullName}
                      onChange={handleChange}
                      readOnly={!!userData?.fullName}
                      placeholder="John Doe"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: userData?.fullName ? 'rgba(0,0,0,0.04)' : 'var(--surface)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        cursor: userData?.fullName ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Email Address {userData?.email && <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, marginLeft: '4px' }}>🔒 (Locked)</span>}
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={!!userData?.email}
                      placeholder="john@example.com"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: userData?.email ? 'rgba(0,0,0,0.04)' : 'var(--surface)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        cursor: userData?.email ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-input"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Inquiry about Life Gold Plan"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Message</label>
                  <textarea
                    name="message"
                    rows="5"
                    className="form-input"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 168, 0.25)',
                    transition: 'all 0.2s ease',
                    marginTop: '8px'
                  }}
                >
                  {submitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
