import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readAllCustomers } from '../services/CustomerService';
import { useFetch } from '../hooks/useFetch';
import Modal from '../components/Modal';
import DownloadButton from '../components/DownloadButton';
import { generateCustomerListPDF } from '../utils/pdfGenerator';
import { useToast } from '../components/ToastProvider';

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
  }

  .header h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .header p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 8px 40px 24px;
  }

  .summary-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 24px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-card);
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    width: 320px;
    margin: 0 40px 24px;
  }

  .summary-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--primary-light);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }

  .card-icon {
    font-size: 20px;
    background: rgba(37, 99, 168, 0.1);
    color: var(--primary-light);
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-mono);
    margin-top: 12px;
  }

  .card-sub {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .table-container {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
    margin: 0 40px 40px;
    box-shadow: var(--shadow-card);
  }

  .filter-bar {
    margin: 0 40px 24px;
  }

  .customers-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  }

  .customers-table th {
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--border);
    padding: 16px 24px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.05em;
  }

  .customers-table td {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    color: var(--text-primary);
    white-space: nowrap;
  }

  .customers-table tr:last-child td {
    border-bottom: none;
  }

  .customers-table tr:hover td {
    background: rgba(37, 99, 168, 0.02);
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 300px;
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

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 300px;
    color: var(--danger);
    padding: 40px;
    text-align: center;
  }

  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 250px;
    color: var(--text-secondary);
    text-align: center;
    background: var(--card);
    border: 1px dashed var(--border);
    border-radius: var(--radius-card);
    margin: 0 40px 40px;
    padding: 40px;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
    }
    .table-container {
      margin: 0 20px 20px;
      overflow-x: auto;
    }
    .summary-card {
      margin: 0 20px 20px;
      width: calc(100% - 40px);
    }
    .header {
      padding: 24px 20px 16px;
    }
    .divider {
      margin: 8px 20px 24px;
    }
    .empty-container {
      margin: 0 20px 20px;
    }
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

  .customers-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .action-btn {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .action-btn:hover {
    border-color: var(--primary-light);
    color: var(--primary-light);
    background: rgba(37, 99, 168, 0.02);
  }
`;

const Customers = () => {
  const toast = useToast();
  const { userData } = useAuth();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [nomineeQuery, setNomineeQuery] = useState('');

  const handleClearFilters = () => {
    setSearchQuery('');
    setNomineeQuery('');
  };

  const fetchCustomersData = async () => {
    const response = await readAllCustomers();
    if (response && response.data) {
      return {
        customersList: response.data.content || [],
        total: response.data.totalElements !== undefined ? response.data.totalElements : (response.data.content?.length || 0)
      };
    }
    return { customersList: [], total: 0 };
  };

  const { data, loading, error, execute: fetchCustomers } = useFetch(fetchCustomersData);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState('PAGE'); // 'PAGE', 'FULL', 'CUSTOM'
  const [customExportLimit, setCustomExportLimit] = useState('50');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const customers = data?.customersList || [];
  const totalCount = data?.total || 0;

  // Compute filtered customers list
  const filteredCustomers = customers.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fullName = (c.fullName || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phoneNumber || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      const state = (c.state || '').toLowerCase();

      if (
        !fullName.includes(q) &&
        !email.includes(q) &&
        !phone.includes(q) &&
        !city.includes(q) &&
        !state.includes(q)
      ) {
        return false;
      }
    }
    if (nomineeQuery) {
      const q = nomineeQuery.toLowerCase();
      const nomineeName = (c.nomineeName || '').toLowerCase();
      const nomineeRelation = (c.nomineeRelation || '').toLowerCase();

      if (!nomineeName.includes(q) && !nomineeRelation.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    setExporting(true);
    try {
      let customersToExport = [];
      if (exportRange === 'PAGE') {
        customersToExport = customers;
      } else {
        const limit = exportRange === 'FULL' ? totalCount : parseInt(customExportLimit);
        if (!limit || limit <= 0) {
          toast.error("Please enter a valid count.");
          setExporting(false);
          return;
        }
        const res = await readAllCustomers(0, limit);
        customersToExport = res?.data?.content || [];
      }

      if (customersToExport.length === 0) {
        toast.error("No customers found inside chosen range.");
      } else {
        generateCustomerListPDF(customersToExport);
      }
      setShowExportModal(false);
    } catch (err) {
      console.error("Export list failed:", err);
      toast.error("Failed to export list. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <Sidebar title={userData?.role === 'AGENT' ? 'Agent Workspace' : 'Admin Panel'} />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">
              <div className="brand-glyph-sm">C</div>
              <span>Crown Assurance</span>
            </div>
            <div className="topbar-right">
              <span className="role-badge">{userData?.role || 'STAFF'}</span>
              <div className="user-avatar" title={userData?.fullName || 'User'}>
                {initials}
              </div>
            </div>
          </div>

          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="header-text">
              <h2>Customers Directory</h2>
              <p>View and manage client contact details, address, and nominee records</p>
            </div>
            <button
              onClick={() => {
                setExportRange('PAGE');
                setCustomExportLimit('50');
                setShowExportModal(true);
              }}
              title="Export Customers Report Options"
              className="btn-export"
            >
              <><i className="ph ph-chart-bar"></i> Export List</>
            </button>
          </div>

          <div className="divider" />

          {loading ? (
            <div className="loading-container" style={{ width: '100%', padding: '0 40px', alignItems: 'stretch' }}>
              <div className="skeleton skeleton-row" style={{ height: '60px' }}></div>
              <div className="skeleton skeleton-row"></div>
              <div className="skeleton skeleton-row"></div>
              <div className="skeleton skeleton-row"></div>
              <div className="skeleton skeleton-row"></div>
              <div className="skeleton skeleton-row"></div>
            </div>
          ) : error ? (
            <div className="error-container" style={{ textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
              <p>⚠️ {error}</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-container" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <p><i className="ph ph-clipboard"></i> No customer records found in the system database.</p>
            </div>
          ) : (
            <>
              {/* Active Customers Metric Card */}
              <div className="summary-card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <span className="card-title">Active Customers</span>
                  <i className="card-icon ph ph-users"></i>
                </div>
                <div className="card-value">{totalCount}</div>
                <div className="card-sub">Registered Customers with Complete profile</div>
              </div>

              {/* Filter Bar */}
              <div className="filter-bar" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                <div className="filter-group">
                  <label className="filter-label">Search</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Search Customer Name, Email, Phone, Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Nominee Search</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Nominee Name or Relation..."
                    value={nomineeQuery}
                    onChange={(e) => setNomineeQuery(e.target.value)}
                  />
                </div>

                <div className="filter-group" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-end' }}>
                  {(searchQuery || nomineeQuery) && (
                    <button
                      type="button"
                      className="clear-filter-btn"
                      onClick={handleClearFilters}
                      title="Clear All Filters"
                      style={{ width: '100%' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="empty-state" style={{ 
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)',
                  fontSize: '13.5px',
                  fontStyle: 'italic',
                  border: '1px dashed var(--border)',
                  borderRadius: '8px',
                  background: 'var(--card)'
                }}>
                  <i className="ph ph-magnifying-glass" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                  <h3>No Matching Customers</h3>
                  <p style={{ marginTop: '4px' }}>No customers match your filter criteria. Try adjusting your search query or nominee name.</p>
                  <button className="action-btn" style={{ marginTop: '12px' }} onClick={handleClearFilters}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <div className="customers-table-wrapper">
                    <table className="customers-table">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Email Address</th>
                          <th>Phone Number</th>
                          <th>Date of Birth</th>
                          <th>Location</th>
                          <th>Nominee</th>
                          <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((c) => (
                          <tr key={c.id || c.email}>
                            <td style={{ fontWeight: '600' }}>{c.fullName || 'N/A'}</td>
                            <td>{c.email || 'N/A'}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{c.phoneNumber || 'N/A'}</td>
                            <td>
                              {c.dateOfBirth 
                                ? new Date(c.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'N/A'}
                            </td>
                            <td>
                              {c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state || 'N/A'}
                            </td>
                            <td>
                              {c.nomineeName 
                                ? `${c.nomineeName} (${c.nomineeRelation || 'Nominee'})` 
                                : 'N/A'}
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                              <DownloadButton
                                type="customer"
                                data={c}
                                label={<i className="ph ph-download" />}
                                title="Download Customer PDF Profile"
                                className="action-btn"
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  borderColor: 'var(--border)'
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => { if (!exporting) setShowExportModal(false); }}
          title={<><i className="ph ph-chart-bar"></i> Export Customers Directory PDF</>}
          maxWidth="460px"
        >
          <form onSubmit={handleExportSubmit} style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              Select your export range preference. The report will extract registered customers directly from the database:
            </p>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Export Option</label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="exportRange"
                  checked={exportRange === 'PAGE'}
                  onChange={() => setExportRange('PAGE')}
                  disabled={exporting}
                />
                Current Page ({customers.length} customers)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="exportRange"
                  checked={exportRange === 'FULL'}
                  onChange={() => setExportRange('FULL')}
                  disabled={exporting}
                />
                Full List ({totalCount} total customers)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="exportRange"
                  checked={exportRange === 'CUSTOM'}
                  onChange={() => setExportRange('CUSTOM')}
                  disabled={exporting}
                />
                Custom Quantity Limit
              </label>
            </div>

            {exportRange === 'CUSTOM' && (
              <div className="form-group" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label">Quantity to Extract</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max={totalCount}
                  value={customExportLimit}
                  onChange={(e) => setCustomExportLimit(parseInt(e.target.value) || '')}
                  disabled={exporting}
                  placeholder="e.g. 50"
                  required
                />
              </div>
            )}

            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowExportModal(false)}
                disabled={exporting}
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
                disabled={exporting}
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: exporting ? 0.6 : 1
                }}
              >
                {exporting ? 'Generating...' : 'Export PDF'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default Customers;
