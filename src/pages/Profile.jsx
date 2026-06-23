import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getCustomerProfile, createCustomerProfile, updateCustomerProfile } from '../services/CustomerService';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import Modal from '../components/Modal';

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

  .profile-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 32px;
    padding: 0 40px 40px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .profile-sidebar-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 30px;
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: fit-content;
  }

  .large-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 20px;
    box-shadow: 0 8px 16px rgba(37, 99, 168, 0.2);
    border: 3px solid var(--border);
  }

  .profile-name {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .profile-email {
    font-size: 13.5px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 24px;
  }

  .status-badge.complete {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-badge.incomplete {
    background: rgba(245, 158, 11, 0.1);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .cta-btn {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(37, 99, 168, 0.2);
  }

  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(37, 99, 168, 0.3);
    filter: brightness(1.1);
  }

  .profile-details-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 40px;
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .details-section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .detail-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail-value {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .detail-value.empty {
    font-style: italic;
    color: var(--text-secondary);
    font-weight: 400;
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
    max-width: 520px;
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

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 16px;
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

  .form-error {
    color: #EF4444;
    font-size: 11.5px;
    margin-top: 4px;
    font-weight: 500;
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
    background: var(--accent);
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
    background: #0d968d;
  }

  .btn-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 400px;
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

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
    }
    .profile-grid {
      grid-template-columns: 1fr;
      padding: 0 20px 20px;
    }
    .header {
      padding: 24px 20px 16px;
    }
    .divider {
      margin: 8px 20px 24px;
    }
  }
`;

const Profile = () => {
  const { userData } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const response = await getCustomerProfile();
      return response?.data || null;
    } catch (err) {
      console.error("Failed to load customer profile:", err);
      return null;
    }
  }, []);

  const { data: profile, loading, execute: loadProfile } = useFetch(fetchProfileData);

  useEffect(() => {
    loadProfile();
  }, []);

  const validationFn = (values) => {
    const errors = {};
    const textRegex = /^[a-zA-Z\s.-]+$/;

    Object.keys(values).forEach(key => {
      if (!values[key] || values[key].toString().trim() === '') {
        errors[key] = "This field is required.";
      }
    });

    if (values.dateOfBirth) {
      const dob = new Date(values.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (isNaN(dob.getTime())) {
        errors.dateOfBirth = "Invalid date format.";
      } else if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old.";
      }
    }

    if (values.city && !textRegex.test(values.city)) errors.city = "City can only contain alphabetic characters.";
    if (values.state && !textRegex.test(values.state)) errors.state = "State can only contain alphabetic characters.";
    if (values.nomineeName && !textRegex.test(values.nomineeName)) errors.nomineeName = "Nominee name can only contain alphabetic characters.";
    if (values.nomineeRelation && !textRegex.test(values.nomineeRelation)) errors.nomineeRelation = "Nominee relation can only contain alphabetic characters.";
    if (values.pinCode && !/^\d{6}$/.test(values.pinCode)) errors.pinCode = "Pin Code must be exactly 6 digits.";

    return errors;
  };

  const { values: formData, errors: formErrors, handleChange, setValues: setFormData, resetForm, validateForm } = useForm({
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    nomineeName: '',
    nomineeRelation: ''
  }, validationFn);

  const openFormModal = () => {
    if (profile) {
      setFormData({
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pinCode: profile.pinCode || '',
        nomineeName: profile.nomineeName || '',
        nomineeRelation: profile.nomineeRelation || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (profile) {
      // Real Update Action
      try {
        setSubmitting(true);
        const payload = {
          dateOfBirth: formData.dateOfBirth,
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pinCode: formData.pinCode.toString().trim(),
          nomineeName: formData.nomineeName.trim(),
          nomineeRelation: formData.nomineeRelation.trim()
        };
        let updateId = profile.id;
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            if (decoded.userId) {
              updateId = decoded.userId;
            }

          } catch (e) {
            console.error("Error decoding token for userId:", e);
          }
        }
        await updateCustomerProfile(updateId, payload);
        alert("Profile updated successfully!");
        setShowModal(false);
        loadProfile();
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to update profile. Please check the backend console logs.");
      } finally {
        setSubmitting(false);
      }
    } else {
      // Real Creation Action
      try {
        setSubmitting(true);
        const payload = {
          dateOfBirth: formData.dateOfBirth,
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pinCode: formData.pinCode.toString().trim(),
          nomineeName: formData.nomineeName.trim(),
          nomineeRelation: formData.nomineeRelation.trim()
        };
        await createCustomerProfile(payload);
        alert("Profile completed successfully!");
        setShowModal(false);
        loadProfile();
      } catch (err) {
        console.error("Error creating profile:", err);
        alert("Failed to complete profile. Please check the backend console logs.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <Sidebar title="Customer Portal" />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">🛡️ InsureSpace</div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.role || "CUSTOMER"}</span>
              <div className="user-avatar" title={userData?.fullName || "User"}>
                {initials}
              </div>
            </div>
          </div>

          <div className="header">
            <div className="header-text">
              <h2>My Profile</h2>
              <p>Manage your personal details, address, and nominee information</p>
            </div>
          </div>

          <div className="divider" />

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading profile details...</p>
            </div>
          ) : (
            <div className="profile-grid">
              <div className="profile-sidebar-card">
                <div className="large-avatar">{initials}</div>
                <div className="profile-name">{userData?.fullName || "Valued Customer"}</div>
                <div className="profile-email">{userData?.email || "customer@insurespace.com"}</div>

                <div className={`status-badge ${profile ? 'complete' : 'incomplete'}`}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: profile ? '#10B981' : '#F59E0B',
                    display: 'inline-block'
                  }}></span>
                  {profile ? 'Profile Complete' : 'Profile Incomplete'}
                </div>

                <button className="cta-btn" onClick={openFormModal}>
                  {profile ? 'Update Your Profile' : 'Complete Your Profile'}
                </button>
              </div>

              <div className="profile-details-card">
                <div>
                  <div className="details-section-title">📍 Address & Residence</div>
                  <div className="details-grid">
                    <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                      <span className="detail-label">Street Address</span>
                      <span className={`detail-value ${!profile?.address ? 'empty' : ''}`}>
                        {profile?.address || 'Not Provided'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">City</span>
                      <span className={`detail-value ${!profile?.city ? 'empty' : ''}`}>
                        {profile?.city || 'Not Provided'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">State</span>
                      <span className={`detail-value ${!profile?.state ? 'empty' : ''}`}>
                        {profile?.state || 'Not Provided'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Pin Code</span>
                      <span className={`detail-value ${!profile?.pinCode ? 'empty' : ''}`}>
                        {profile?.pinCode || 'Not Provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="details-section-title">👥 Personal & Nominee Details</div>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Date of Birth</span>
                      <span className={`detail-value ${!profile?.dateOfBirth ? 'empty' : ''}`}>
                        {profile?.dateOfBirth
                          ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Not Provided'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Nominee Name</span>
                      <span className={`detail-value ${!profile?.nomineeName ? 'empty' : ''}`}>
                        {profile?.nomineeName || 'Not Provided'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Nominee Relation</span>
                      <span className={`detail-value ${!profile?.nomineeRelation ? 'empty' : ''}`}>
                        {profile?.nomineeRelation || 'Not Provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { if (!submitting) setShowModal(false); }}
        title={profile ? 'Update Profile Details' : 'Complete Profile Setup'}
        maxWidth="520px"
      >
        <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            {formErrors.dateOfBirth && <div className="form-error">⚠️ {formErrors.dateOfBirth}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 456 Maple Avenue"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            {formErrors.address && <div className="form-error">⚠️ {formErrors.address}</div>}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Scranton"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              {formErrors.city && <div className="form-error">⚠️ {formErrors.city}</div>}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. PA"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              {formErrors.state && <div className="form-error">⚠️ {formErrors.state}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pin Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 185030"
              value={formData.pinCode}
              onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
            />
            {formErrors.pinCode && <div className="form-error">⚠️ {formErrors.pinCode}</div>}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nominee Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Carol Vance"
                value={formData.nomineeName}
                onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
              />
              {formErrors.nomineeName && <div className="form-error">⚠️ {formErrors.nomineeName}</div>}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nominee Relation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Spouse"
                value={formData.nomineeRelation}
                onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
              />
              {formErrors.nomineeRelation && <div className="form-error">⚠️ {formErrors.nomineeRelation}</div>}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Profile;