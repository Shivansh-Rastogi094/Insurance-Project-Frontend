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
import EditPlanModal from '../components/EditPlanModal';
import { useToast } from '../components/ToastProvider';
import '../styles/PlanCatalog.css';

const fetchPlansList = async () => {
  const res = await readAllPlans();
  return res?.data?.content || [];
};

const calculateCustomerAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

const getAgeLoadingDetails = (age) => {
  if (!age || age <= 30) return { percent: 0, label: 'Base Rate (Age ≤ 30)' };
  if (age < 45) return { percent: 15, label: '+15% Risk Loading (Age 30–44)' };
  if (age < 60) return { percent: 35, label: '+35% Risk Loading (Age 45–59)' };
  return { percent: 60, label: '+60% Senior Risk Loading (Age 60+)' };
};

const getSmokerLoadingDetails = (isSmoker, age) => {
  if (!isSmoker) return { percent: 0, label: 'Non-Smoker' };
  if (!age || age < 30) return { percent: 15, label: '+15% Smoker Loading (Age < 30)' };
  if (age < 45) return { percent: 25, label: '+25% Smoker Loading (Age 30–44)' };
  if (age < 60) return { percent: 50, label: '+50% Smoker Loading (Age 45–59)' };
  return { percent: 75, label: '+75% Smoker Loading (Age 60+)' };
};

const getFrequencyMultiplier = (freq) => {
  if (freq === 'HALF_YEARLY') return 0.55;
  if (freq === 'QUARTERLY') return 0.275;
  return 1.0; // ANNUAL
};

const getAdjustedPremium = (basePremium, age, isSmoker, freq, productType = '') => {
  if (!basePremium) return 0;
  const isMotorOrTravel = productType && (productType.toUpperCase() === 'MOTOR' || productType.toUpperCase() === 'TRAVEL');
  const agePct = getAgeLoadingDetails(age).percent;
  const smokerPct = isMotorOrTravel ? 0 : getSmokerLoadingDetails(isSmoker, age).percent;
  const totalPercent = agePct + smokerPct;
  const annualRate = basePremium * (1 + totalPercent / 100);
  const installmentRate = annualRate * getFrequencyMultiplier(freq);
  return Math.round(installmentRate);
};

const getAgeAdjustedPremium = (basePremium, age) => getAdjustedPremium(basePremium, age, false, 'ANNUAL');



const PlanCatalog = () => {

  const toast = useToast();
  const { type, productId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const { data: plans , loading, error, execute: loadPlans } = useFetch(fetchPlansList);

  // Purchase Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedFrequency, setSelectedFrequency] = useState('ANNUAL');
  const [isSmokerSelection, setIsSmokerSelection] = useState(false);
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
    setIsSmokerSelection(Boolean(customerProfile?.isSmoker));
    setSelectedFrequency(plan.premiumType || 'ANNUAL');
    setSelectedPlan(plan);
  };

  const isAdminOrAgent = userData?.role === 'ADMIN' || userData?.role === 'AGENT';

  // Filter plans matching this product ID and active status (roles ADMIN/AGENT see all)
  const productPlans = (Array.isArray(plans) ? plans : []).filter(
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
        startDate: purchaseDate,
        isSmoker: isSmokerSelection,
        premiumType: selectedFrequency
      };
      await purchasePolicy(payload);
      toast.success(`🎉 Policy created! Redirecting to Payments to complete your first premium installment.`);
      setSelectedPlan(null);

      
      // Redirect to payments page so the customer can pay the pending premium immediately
      if (userData?.role === 'CUSTOMER') {
        navigate('/payments');
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
    
    // Premium amount is optional (auto-calculated at runtime using actuarial formula if left empty)
    if (formData.premiumAmount && formData.premiumAmount !== '') {
      const premiumVal = parseFloat(formData.premiumAmount);
      if (isNaN(premiumVal) || premiumVal <= 0) {
        errors.premiumAmount = "Premium amount must be greater than zero if provided.";
      }
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

  const handleSaveFromEditModal = async (updatedPlanData) => {
    try {
      setPurchasing(true);
      const payload = {
        productId: updatedPlanData.productId || editingPlan?.productId || parsedProductId,
        planName: updatedPlanData.planName.trim(),
        coverageAmount: parseFloat(updatedPlanData.coverageAmount),
        premiumAmount: parseFloat(updatedPlanData.premiumAmount),
        premiumType: updatedPlanData.premiumType,
        duration: parseInt(updatedPlanData.duration, 10),
        termsAndConditions: (updatedPlanData.termsAndConditions || '').trim(),
        active: updatedPlanData.active
      };
      await updatePlan(updatedPlanData.id || editingPlan.id, payload);
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
              {productPlans.map((plan) => {
                const currentCustomerAge = calculateCustomerAge(customerProfile?.dateOfBirth);
                const ageLoading = getAgeLoadingDetails(currentCustomerAge);
                const effectivePremium = getAdjustedPremium(plan.premiumAmount, currentCustomerAge, Boolean(customerProfile?.isSmoker), plan.premiumType || 'ANNUAL');


                return (
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
                          <span className="plan-detail-value mono" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: '700' }}>
                              ₹{effectivePremium.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            {currentCustomerAge && ageLoading.percent > 0 && (
                              <span style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 'normal' }}>
                                Base ₹{plan.premiumAmount.toLocaleString('en-IN')} ({ageLoading.label})
                              </span>
                            )}
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedPlan && (
        <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title="🛡️ Confirm Policy Purchase">
              <div className="modal-body">
                <p>You are initiating a request to buy the following insurance plan:</p>
                
                {(() => {
                  const currentCustomerAge = calculateCustomerAge(customerProfile?.dateOfBirth);
                  const isMotorOrTravel = categoryTypeCode === 'MOTOR' || categoryTypeCode === 'TRAVEL' || (selectedPlan?.productName || '').toLowerCase().includes('motor') || (selectedPlan?.productName || '').toLowerCase().includes('travel');
                  const ageLoading = getAgeLoadingDetails(currentCustomerAge);
                  const smokerLoading = isMotorOrTravel ? { percent: 0, label: 'Not Applicable' } : getSmokerLoadingDetails(isSmokerSelection, currentCustomerAge);
                  const effectiveInstallment = getAdjustedPremium(selectedPlan.premiumAmount, currentCustomerAge, isSmokerSelection, selectedFrequency, categoryTypeCode);

                  return (
                    <div className="modal-plan-summary">
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {selectedPlan.planName}
                      </div>
                      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div><strong>Product Name:</strong> {selectedPlan.productName}</div>
                        <div><strong>Sum Insured:</strong> ₹{selectedPlan.coverageAmount.toLocaleString('en-IN')}</div>
                        <div><strong>Coverage Term:</strong> {selectedPlan.durationYears} Years</div>

                        {/* Interactive Billing Frequency Selector */}
                        <div style={{ marginTop: '4px' }}>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            💳 SELECT BILLING FREQUENCY (3 OPTIONS)
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedFrequency('ANNUAL')}
                              style={{
                                padding: '8px 6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: selectedFrequency === 'ANNUAL' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: selectedFrequency === 'ANNUAL' ? 'rgba(79, 70, 229, 0.08)' : 'var(--card)',
                                color: selectedFrequency === 'ANNUAL' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              Annual (1x/yr)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedFrequency('HALF_YEARLY')}
                              style={{
                                padding: '8px 6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: selectedFrequency === 'HALF_YEARLY' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: selectedFrequency === 'HALF_YEARLY' ? 'rgba(79, 70, 229, 0.08)' : 'var(--card)',
                                color: selectedFrequency === 'HALF_YEARLY' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              Half-Yearly (2x)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedFrequency('QUARTERLY')}
                              style={{
                                padding: '8px 6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: selectedFrequency === 'QUARTERLY' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: selectedFrequency === 'QUARTERLY' ? 'rgba(79, 70, 229, 0.08)' : 'var(--card)',
                                color: selectedFrequency === 'QUARTERLY' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              Quarterly (4x)
                            </button>
                          </div>
                        </div>

                        {/* Interactive Smoker Status Toggle (Only for Life & Health, NOT Motor/Travel) */}
                        {!isMotorOrTravel ? (
                          <div style={{ marginTop: '4px', background: isSmokerSelection ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)', border: isSmokerSelection ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: '700', color: isSmokerSelection ? '#EF4444' : '#10B981' }}>
                                🚬 Tobacco / Smoker Status
                              </span>
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                <input
                                  type="checkbox"
                                  checked={isSmokerSelection}
                                  onChange={(e) => setIsSmokerSelection(e.target.checked)}
                                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                Applicant is a Smoker
                              </label>
                            </div>
                            {isSmokerSelection && (
                              <div style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px' }}>
                                ⚠️ Smoker Surcharge Applied: <strong>{smokerLoading.label}</strong> (Premium increases by 15% to 75%)
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ marginTop: '4px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#64748B' }}>
                            ℹ️ <strong>Smoker Surcharge N/A:</strong> Tobacco risk loading is not applicable for {categoryMeta.title || 'Motor / Travel'} Insurance policies.
                          </div>
                        )}

                        
                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12.5px' }}>
                            <span>Base Annual Premium:</span>
                            <span className="mono">₹{selectedPlan.premiumAmount.toLocaleString('en-IN')}</span>
                          </div>
                          {currentCustomerAge !== null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#64748B' }}>
                              <span>Applicant Age ({currentCustomerAge} yrs):</span>
                              <span style={{ color: ageLoading.percent > 0 ? '#D97706' : '#10B981', fontWeight: '600' }}>
                                {ageLoading.label}
                              </span>
                            </div>
                          )}
                          {isSmokerSelection && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#EF4444' }}>
                              <span>Smoker Risk Surcharge:</span>
                              <span style={{ fontWeight: '600' }}>{smokerLoading.label}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#4F46E5' }}>
                            <span>Selected Billing Frequency:</span>
                            <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>{selectedFrequency}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px dashed #CBD5E1', paddingTop: '6px', marginTop: '4px', fontSize: '14px' }}>
                            <span>Effective Installment Premium:</span>
                            <span className="mono" style={{ color: '#10B981' }}>
                              ₹{effectiveInstallment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
                  {purchasing ? 'Processing...' : '✅ Confirm & Go to Payment'}
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
                  <label className="form-label">
                    Premium (₹) <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>(Auto-Calculated via Formula)</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={newPlan.premiumAmount}
                    onChange={(e) => setNewPlan({ ...newPlan, premiumAmount: e.target.value })}
                    placeholder="Leave blank to auto-calculate via formula"
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

      {/* Edit Plan Modal Component */}
      <EditPlanModal
        isOpen={showEditModal && !!editingPlan}
        onClose={() => { setShowEditModal(false); setEditingPlan(null); }}
        plan={editingPlan}
        onSave={handleSaveFromEditModal}
        submitting={purchasing}
      />
    </>
  );
};

export default PlanCatalog;
