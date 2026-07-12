import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readAllPlans, createPlan, updatePlan, deactivatePlan } from '../services/PlanService';
import { purchasePolicy } from '../services/PolicyService';
import { getCustomerProfile } from '../services/CustomerService';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import '../styles/PlanCatalog.css';

const fetchPlansList = async () => {
  const res = await readAllPlans();
  return res?.data?.content || [];
};

const PlanCatalog = () => {
  const toast = useToast();
  const { type, productId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const { data: plans , loading, error, execute: loadPlans } = useFetch(fetchPlansList);

  // Purchase Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().substring(0, 10));
  const [purchasing, setPurchasing] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Add Plan Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    planName: '',
    coverageAmount: '',
    premiumAmount: '',
    premiumType: 'ANNUAL',
    duration: '',
    termsAndConditions: '',
    active: true
  });

  // Edit Plan Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formErrors, setFormErrors] = useState({});

  const categoryTypeCode = type ? type.toUpperCase() : '';
  const parsedProductId = Number(productId);

  const getCategoryMeta = () => {
    switch (categoryTypeCode) {
      case 'LIFE':
        return { title: 'Life Insurance', className: 'card-life' };
      case 'HEALTH':
        return { title: 'Health Insurance', className: 'card-health' };
      case 'MOTOR':
        return { title: 'Motor Insurance', className: 'card-motor' };
      case 'TRAVEL':
        return { title: 'Travel Insurance', className: 'card-travel' };
      default:
        return { title: `${type} Insurance`, className: 'card-life' };
    }
  };

  const categoryMeta = getCategoryMeta();

  useEffect(() => {
    loadPlans();
  }, [loadPlans, productId]);

  useEffect(() => {
    const checkProfile = async () => {
      if (userData?.role === 'CUSTOMER') {
        try {
          setCheckingProfile(true);
          const res = await getCustomerProfile();
          setCustomerProfile(res?.data || null);
        } catch (err) {
          console.error("Error fetching customer profile:", err);
          setCustomerProfile(null);
        } finally {
          setCheckingProfile(false);
        }
      }
    };
    checkProfile();
  }, [userData]);

  const handleBuyPlanClick = (plan) => {
    if (userData?.role === 'CUSTOMER' && !customerProfile) {
      toast.info("⚠️ You must complete your customer profile before purchasing a policy. Redirecting to your profile page...");
      navigate('/profile');
      return;
    }
    setSelectedPlan(plan);
  };

  const isAdminOrAgent = userData?.role === 'ADMIN' || userData?.role === 'AGENT';

  // Filter plans matching this product ID and active status (roles ADMIN/AGENT see all)
  const productPlans = plans.filter(
    (p) => p.productId === parsedProductId && (isAdminOrAgent ? true : p.active)
  );

  // Retrieve the product name dynamically from matched plans
  const productName = productPlans.length > 0 
    ? productPlans[0].productName 
    : `Product #${productId}`;

  // Handle purchasing submission
  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;
    try {
      setPurchasing(true);
      const payload = {
        planId: selectedPlan.id,
        startDate: purchaseDate
      };
      await purchasePolicy(payload);
      toast.success(`Success! You have purchased the ${selectedPlan.planName} plan.`);
      setSelectedPlan(null);
      
      // Redirect to customer dashboard to view updated policies
      if (userData?.role === 'CUSTOMER') {
        navigate('/userdashboard');
      } else {
        navigate('/policy');
      }
    } catch (err) {
      console.error("Error purchasing policy:", err);
      toast.error(err?.response?.data?.message || "Failed to purchase policy. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const validatePlanForm = (formData) => {
    const errors = {};
    if (!formData.planName || formData.planName.trim() === '') {
      errors.planName = "Plan name is required.";
    }
    
    const coverageVal = parseFloat(formData.coverageAmount);
    if (isNaN(coverageVal) || coverageVal <= 0) {
      errors.coverageAmount = "Coverage amount must be greater than zero.";
    }
    
    const premiumVal = parseFloat(formData.premiumAmount);
    if (isNaN(premiumVal) || premiumVal <= 0) {
      errors.premiumAmount = "Premium amount must be greater than zero.";
    }
    
    const durationVal = parseInt(formData.duration, 10);
    if (isNaN(durationVal) || durationVal <= 0) {
      errors.duration = "Coverage duration must be greater than zero.";
    }
    
    return errors;
  };

  const handleAddPlanSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePlanForm(newPlan);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setPurchasing(true);
      const payload = {
        productId: parsedProductId,
        planName: newPlan.planName.trim(),
        coverageAmount: parseFloat(newPlan.coverageAmount),
        premiumAmount: parseFloat(newPlan.premiumAmount),
        premiumType: newPlan.premiumType,
        duration: parseInt(newPlan.duration, 10),
        termsAndConditions: newPlan.termsAndConditions.trim(),
        active: newPlan.active
      };
      await createPlan(payload);
      toast.success("Plan created successfully!");
      setShowAddModal(false);
      setNewPlan({
        planName: '',
        coverageAmount: '',
        premiumAmount: '',
        premiumType: 'ANNUAL',
        duration: '',
        termsAndConditions: '',
        active: true
      });
      setFormErrors({});
      loadPlans();
    } catch (err) {
      console.error("Error creating plan:", err);
      toast.error(err?.response?.data?.message || "Failed to create plan. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleOpenEditModal = (plan) => {
    setEditingPlan({
      id: plan.id,
      productId: plan.productId,
      planName: plan.planName,
      coverageAmount: plan.coverageAmount,
      premiumAmount: plan.premiumAmount,
      premiumType: plan.premiumType,
      duration: plan.durationYears, // Map durationYears back to duration
      termsAndConditions: plan.termsAndConditions || '',
      active: plan.active
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleEditPlanSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePlanForm(editingPlan);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setPurchasing(true);
      const payload = {
        productId: editingPlan.productId,
        planName: editingPlan.planName.trim(),
        coverageAmount: parseFloat(editingPlan.coverageAmount),
        premiumAmount: parseFloat(editingPlan.premiumAmount),
        premiumType: editingPlan.premiumType,
        duration: parseInt(editingPlan.duration, 10),
        termsAndConditions: editingPlan.termsAndConditions.trim(),
        active: editingPlan.active
      };
      await updatePlan(editingPlan.id, payload);
      toast.success("Plan updated successfully!");
      setShowEditModal(false);
      setEditingPlan(null);
      setFormErrors({});
      loadPlans();
    } catch (err) {
      console.error("Error updating plan:", err);
      toast.error(err?.response?.data?.message || "Failed to update plan. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleDeactivatePlan = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this plan? This action cannot be undone.")) {
      try {
        console.log("Deactivating plan with ID:", id);
        // setLoading(true);
        await deactivatePlan(id);
        toast.success("Plan deactivated successfully!");
        loadPlans();
      } catch (err) {
        console.error("Error deactivating plan:", err);
        toast.error(err?.response?.data?.message || "Failed to deactivate plan. Please try again.");
      } finally {
        // setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="plan-catalog-page page-container">
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
                {(userData?.fullName || "User").split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
              </div>
            </div>
          </div>

          <div className="header-container">
            <div className="header-info">
              <button className="back-btn" onClick={() => navigate(`/policy/${type.toLowerCase()}`)}>
                ← Back to Products
              </button>
              <div className="header-text">
                <h2>{productName} Plans Catalog</h2>
                <p>Compare premiums, coverages, durations, and find the perfect package</p>
              </div>
            </div>
            {userData?.role === 'ADMIN' && (
              <button className="add-plan-btn" onClick={() => setShowAddModal(true)}>
                + Add Plan
              </button>
            )}
          </div>

          <div className="divider" />

          {loading ? (
            <div className="loading-container" style={{ width: '100%', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height={60} />
              <Skeleton count={5} height={50} style={{ marginBottom: '8px' }} />
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button className="buy-btn" style={{ marginTop: '20px', width: 'auto' }} onClick={loadPlans}>
                Retry Loading
              </button>
            </div>
          ) : productPlans.length === 0 ? (
            <div className="empty-catalog-container">
              <div className="empty-icon"><i className="ph ph-clipboard"></i></div>
              <h3>No Plans Offered</h3>
              <p>We couldn't find any active plans under {productName} right now. Please explore other products.</p>
              <button className="buy-btn" style={{ width: 'auto' }} onClick={() => navigate(`/policy/${type.toLowerCase()}`)}>
                Go Back to Products
              </button>
            </div>
          ) : (
            <div className="grid-container">
              {productPlans.map((plan) => (
                <div className={`plan-card ${categoryMeta.className}`} key={plan.id}>
                  <div>
                    {isAdminOrAgent && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                        <span className={`status-badge ${plan.active ? 'active' : 'inactive'}`}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: plan.active ? '#10B981' : '#EF4444',
                            display: 'inline-block'
                          }}></span>
                          {plan.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    )}
                    <h3 className="plan-name">{plan.planName}</h3>
                    
                    <div className="plan-details-list">
                      <div className="plan-detail-row">
                        <span className="plan-detail-label">Sum Insured Coverage</span>
                        <span className="plan-detail-value highlight mono">
                          ₹{plan.coverageAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="plan-detail-row">
                        <span className="plan-detail-label">Premium Installment</span>
                        <span className="plan-detail-value mono">
                          ₹{plan.premiumAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="plan-detail-row">
                        <span className="plan-detail-label">Billing Frequency</span>
                        <span className="plan-detail-value" style={{ textTransform: 'uppercase', fontSize: '12px' }}>
                          {plan.premiumType}
                        </span>
                      </div>
                      
                      <div className="plan-detail-row">
                        <span className="plan-detail-label">Coverage Term</span>
                        <span className="plan-detail-value">
                          {plan.durationYears} Years
                        </span>
                      </div>
                    </div>

                    <div className="plan-detail-label" style={{ fontSize: '12px', fontWeight: '600' }}>
                      Terms & Conditions:
                    </div>
                    <div className="terms-section">
                      {plan.termsAndConditions || "No special terms specified."}
                    </div>
                  </div>

                  {userData?.role === 'CUSTOMER' && (
                    <div style={{ marginTop: '24px' }}>
                      <button 
                        className="buy-btn"
                        onClick={() => handleBuyPlanClick(plan)}
                        disabled={checkingProfile}
                      >
                        {checkingProfile ? 'Checking Profile...' : 'Buy Plan'}
                      </button>
                    </div>
                  )}

                  {userData?.role === 'ADMIN' && (
                    <div className="admin-actions-container">
                      <button 
                        className="btn-update"
                        onClick={() => handleOpenEditModal(plan)}
                      >
                        Update
                      </button>
                      <button 
                        className="btn-deactivate"
                        onClick={() => handleDeactivatePlan(plan.id)}
                        disabled={!plan.active}
                      >
                         {plan.active ? 'Deactivate' : 'Deactivated'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedPlan && (
        <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title="🛡️ Confirm Policy Purchase">
              <div className="modal-body">
                <p>You are initiating a request to buy the following insurance plan:</p>
                
                <div className="modal-plan-summary">
                  <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {selectedPlan.planName}
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Product Name:</strong> {selectedPlan.productName}</div>
                    <div><strong>Sum Insured:</strong> ₹{selectedPlan.coverageAmount.toLocaleString('en-IN')}</div>
                    <div><strong>Premium:</strong> ₹{selectedPlan.premiumAmount.toLocaleString('en-IN')} ({selectedPlan.premiumType})</div>
                    <div><strong>Term:</strong> {selectedPlan.durationYears} Years</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Policy Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-cancel" 
                  onClick={() => setSelectedPlan(null)}
                  disabled={purchasing}
                >
                  Cancel
                </button>
                <button 
                  className="btn-confirm" 
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                >
                  {purchasing ? 'Processing...' : 'Confirm Purchase'}
                </button>
              </div>
        </Modal>
      )}

      {/* Add Plan Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormErrors({}); }} title={<><i className="ph ph-sparkle"></i> Add New Plan</>} maxWidth="520px">
            <form onSubmit={handleAddPlanSubmit} style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Plan Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newPlan.planName}
                  onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                  placeholder="e.g. Gold Life Shield"
                />
                {formErrors.planName && <div className="form-error">⚠️ {formErrors.planName}</div>}
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Sum Insured Coverage (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={newPlan.coverageAmount}
                    onChange={(e) => setNewPlan({ ...newPlan, coverageAmount: e.target.value })}
                    placeholder="e.g. 5000000"
                  />
                  {formErrors.coverageAmount && <div className="form-error">⚠️ {formErrors.coverageAmount}</div>}
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Premium Installment (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={newPlan.premiumAmount}
                    onChange={(e) => setNewPlan({ ...newPlan, premiumAmount: e.target.value })}
                    placeholder="e.g. 12000"
                  />
                  {formErrors.premiumAmount && <div className="form-error">⚠️ {formErrors.premiumAmount}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Billing Frequency</label>
                  <select 
                    className="form-input"
                    value={newPlan.premiumType}
                    onChange={(e) => setNewPlan({ ...newPlan, premiumType: e.target.value })}
                  >
                    <option value="ANNUAL">ANNUAL</option>
                    <option value="ONE_TIME">ONE TIME</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Coverage Term (Years)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                    placeholder="e.g. 20"
                  />
                  {formErrors.duration && <div className="form-error">⚠️ {formErrors.duration}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Terms & Conditions</label>
                <textarea 
                  className="form-input" 
                  value={newPlan.termsAndConditions}
                  onChange={(e) => setNewPlan({ ...newPlan, termsAndConditions: e.target.value })}
                  placeholder="Enter terms and conditions..."
                  rows="3"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  id="add-active-plan"
                  checked={newPlan.active}
                  onChange={(e) => setNewPlan({ ...newPlan, active: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="add-active-plan" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  Mark as Active
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button 
                  type="button"
                  className="btn-cancel" 
                  onClick={() => { setShowAddModal(false); setFormErrors({}); }}
                  disabled={purchasing}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-confirm" 
                  disabled={purchasing}
                >
                  {purchasing ? 'Adding...' : 'Add Plan'}
                </button>
              </div>
            </form>
      </Modal>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <Modal isOpen={showEditModal && !!editingPlan} onClose={() => { setShowEditModal(false); setFormErrors({}); }} title="✏️ Edit Plan" maxWidth="520px">
              <form onSubmit={handleEditPlanSubmit} style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Plan Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingPlan.planName}
                    onChange={(e) => setEditingPlan({ ...editingPlan, planName: e.target.value })}
                    placeholder="e.g. Gold Life Shield"
                  />
                  {formErrors.planName && <div className="form-error">⚠️ {formErrors.planName}</div>}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Sum Insured Coverage (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-input" 
                      value={editingPlan.coverageAmount}
                      onChange={(e) => setEditingPlan({ ...editingPlan, coverageAmount: e.target.value })}
                      placeholder="e.g. 5000000"
                    />
                    {formErrors.coverageAmount && <div className="form-error">⚠️ {formErrors.coverageAmount}</div>}
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Premium Installment (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-input" 
                      value={editingPlan.premiumAmount}
                      onChange={(e) => setEditingPlan({ ...editingPlan, premiumAmount: e.target.value })}
                      placeholder="e.g. 12000"
                    />
                    {formErrors.premiumAmount && <div className="form-error">⚠️ {formErrors.premiumAmount}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Billing Frequency</label>
                    <select 
                      className="form-input"
                      value={editingPlan.premiumType}
                      onChange={(e) => setEditingPlan({ ...editingPlan, premiumType: e.target.value })}
                    >
                      <option value="ANNUAL">ANNUAL</option>
                      <option value="ONE_TIME">ONE_TIME</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Coverage Term (Years)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editingPlan.duration}
                      onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value })}
                      placeholder="e.g. 20"
                    />
                    {formErrors.duration && <div className="form-error">⚠️ {formErrors.duration}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Terms & Conditions</label>
                  <textarea 
                    className="form-input" 
                    value={editingPlan.termsAndConditions}
                    onChange={(e) => setEditingPlan({ ...editingPlan, termsAndConditions: e.target.value })}
                    placeholder="Enter terms and conditions..."
                    rows="3"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                  <input 
                    type="checkbox" 
                    id="edit-active-plan"
                    checked={editingPlan.active}
                    onChange={(e) => setEditingPlan({ ...editingPlan, active: e.target.checked })}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="edit-active-plan" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                    Mark as Active
                  </label>
                </div>

                <div className="modal-actions" style={{ marginTop: '24px' }}>
                  <button 
                    type="button"
                    className="btn-cancel" 
                    onClick={() => { setShowEditModal(false); setFormErrors({}); }}
                    disabled={purchasing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-confirm" 
                    disabled={purchasing}
                  >
                    {purchasing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
        </Modal>
      )}
    </>
  );
};

export default PlanCatalog;
