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

const getAdjustedPremium = (basePremium, age, isSmoker, freq, productType = '', selectedCoverage = 0, minCoverage = 0) => {
  if (!basePremium) return 0;
  let effectiveBase = basePremium;
  if (selectedCoverage > 0 && minCoverage > 0) {
    effectiveBase = basePremium * (selectedCoverage / minCoverage);
  }
  const isMotorOrTravel = productType && (productType.toUpperCase() === 'MOTOR' || productType.toUpperCase() === 'TRAVEL');
  const agePct = getAgeLoadingDetails(age).percent;
  const smokerPct = isMotorOrTravel ? 0 : getSmokerLoadingDetails(isSmoker, age).percent;
  const totalPercent = agePct + smokerPct;
  const annualRate = effectiveBase * (1 + totalPercent / 100);
  const installmentRate = annualRate * getFrequencyMultiplier(freq);
  return Number(installmentRate.toFixed(2));
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
  const [selectedCoverage, setSelectedCoverage] = useState(50000);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedFrequency, setSelectedFrequency] = useState('ANNUAL');
  const [isSmokerSelection, setIsSmokerSelection] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Policyholder Detail State
  const [isBuyingForSelf, setIsBuyingForSelf] = useState(true);
  const [holderName, setHolderName] = useState('');
  const [holderAddress, setHolderAddress] = useState('');
  const [holderPhone, setHolderPhone] = useState('');
  const [holderAadhaar, setHolderAadhaar] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purchaseErrors, setPurchaseErrors] = useState({});


  // Add Plan Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    planName: '',
    minCoverageAmount: '',
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

  const fillSelfDetails = () => {
    setHolderName(customerProfile?.fullName || customerProfile?.user?.fullName || userData?.fullName || '');
    const fullAddr = [customerProfile?.address, customerProfile?.city, customerProfile?.state, customerProfile?.pinCode]
      .filter(Boolean).join(', ');
    setHolderAddress(fullAddr || customerProfile?.address || '');
    setHolderPhone(userData?.phoneNumber || customerProfile?.phone || customerProfile?.mobileNumber || '');
    setHolderAadhaar(customerProfile?.aadhaarNumber || '');
  };

  const openPurchaseModal = (plan) => {
    setSelectedPlan(plan);
    const minCov = plan.minCoverageAmount || plan.coverageAmount || 50000;
    setSelectedCoverage(minCov);
    if (plan.premiumType === 'ONE_TIME') {
      setSelectedFrequency('ONE_TIME');
    } else {
      setSelectedFrequency('ANNUAL');
    }
    setIsBuyingForSelf(true);
    setHolderName(customerProfile?.fullName || customerProfile?.user?.fullName || userData?.fullName || '');
    const fullAddr = [customerProfile?.address, customerProfile?.city, customerProfile?.state, customerProfile?.pinCode]
      .filter(Boolean).join(', ');
    setHolderAddress(fullAddr || customerProfile?.address || '');
    setHolderPhone(userData?.phoneNumber || customerProfile?.phone || customerProfile?.mobileNumber || '');
    setHolderAadhaar(customerProfile?.aadhaarNumber || '');
    setVehicleNumber('');
    setPurchaseErrors({});
  };

  const handleBuyPlanClick = (plan) => {
    if (userData?.role === 'CUSTOMER' && !customerProfile) {
      toast.info("You must complete your customer profile before purchasing a policy. Redirecting to your profile page...");
      navigate('/profile');
      return;
    }
    setIsSmokerSelection(Boolean(customerProfile?.isSmoker));
    openPurchaseModal(plan);
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
    
    // Validation
    const errs = {};
    if (!holderName || !holderName.trim()) errs.holderName = "Holder Name is required.";
    if (!holderAddress || !holderAddress.trim()) errs.holderAddress = "Holder Address is required.";
    
    const phoneClean = holderPhone ? holderPhone.trim() : '';
    if (!phoneClean || !/^[6-9]\d{9}$/.test(phoneClean)) {
      errs.holderPhone = "Phone must be a valid 10-digit mobile number starting with 6-9.";
    }

    const isMotorPlan = categoryTypeCode === 'MOTOR' || (selectedPlan?.productName || '').toLowerCase().includes('motor');
    
    const aadhaarClean = holderAadhaar ? holderAadhaar.trim() : '';
    if (!isMotorPlan) {
      if (!aadhaarClean || !/^\d{12}$/.test(aadhaarClean)) {
        errs.holderAadhaar = "Aadhaar must be a 12-digit numeric number.";
      }
    }

    if (isMotorPlan) {
      const vClean = vehicleNumber ? vehicleNumber.trim().toUpperCase() : '';
      if (!vClean) {
        errs.vehicleNumber = "Vehicle registration number is required for Motor insurance.";
      } else if (!/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(vClean)) {
        errs.vehicleNumber = "Please enter a valid car registration number (e.g. MH01AB1234).";
      }
    }

    if (Object.keys(errs).length > 0) {
      setPurchaseErrors(errs);
      toast.error("Please resolve validation errors in the purchase form.");
      return;
    }

    try {
      setPurchasing(true);
      const payload = {
        planId: selectedPlan.id,
        startDate: purchaseDate,
        isSmoker: isSmokerSelection,
        premiumType: selectedFrequency,
        selectedCoverageAmount: Number(selectedCoverage),
        holderName: holderName.trim(),
        holderAddress: holderAddress.trim(),
        holderPhone: phoneClean,
        holderAadhaar: aadhaarClean,
        vehicleNumber: isMotorPlan ? vehicleNumber.trim().toUpperCase() : null
      };
      await purchasePolicy(payload);
      toast.success(<><i className="ph ph-party-popper" style={{ marginRight: '6px' }}></i>Policy created! Redirecting to Payments to complete your first premium installment.</>);
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
    
    const coverageVal = parseFloat(formData.minCoverageAmount || formData.coverageAmount);
    if (isNaN(coverageVal) || coverageVal < 50000) {
      errors.minCoverageAmount = "Minimum coverage amount must be at least ₹50,000.";
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

    if (!formData.termsAndConditions || formData.termsAndConditions.trim().length < 20) {
      errors.termsAndConditions = "Terms & conditions are required and must be at least 20 characters.";
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
        minCoverageAmount: parseFloat(newPlan.minCoverageAmount || newPlan.coverageAmount),
        premiumAmount: newPlan.premiumAmount ? parseFloat(newPlan.premiumAmount) : null,
        premiumType: newPlan.premiumType,
        duration: parseInt(newPlan.duration, 10),
        durationYears: parseInt(newPlan.duration, 10),
        termsAndConditions: newPlan.termsAndConditions.trim(),
        active: newPlan.active
      };
      await createPlan(payload);
      toast.success("Plan created successfully!");
      setShowAddModal(false);
      setNewPlan({
        planName: '',
        minCoverageAmount: '',
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
      minCoverageAmount: plan.minCoverageAmount || plan.coverageAmount,
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
        minCoverageAmount: parseFloat(updatedPlanData.minCoverageAmount || updatedPlanData.coverageAmount),
        premiumAmount: updatedPlanData.premiumAmount ? parseFloat(updatedPlanData.premiumAmount) : null,
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
              <div className="error-icon"><i className="ph ph-warning-triangle"></i></div>
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
                          <span className="plan-detail-label">Sum Insured Range</span>
                          <span className="plan-detail-value highlight mono" style={{ fontSize: '13.5px' }}>
                            ₹{(plan.minCoverageAmount || plan.coverageAmount || 50000).toLocaleString('en-IN')} — ₹{(plan.maxCoverageAmount || (plan.minCoverageAmount || plan.coverageAmount || 50000) + 2000000).toLocaleString('en-IN')}
                          </span>
                        </div>
                        
                        <div className="plan-detail-row">
                          <span className="plan-detail-label">Base Premium (from)</span>
                          <span className="plan-detail-value mono" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className="amount">₹{(plan.premiumAmount || 0).toLocaleString('en-IN')}</span>
                            <span className="subtext" style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>/year at Min Coverage</span>
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
        <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title={<><i className="ph ph-shield-check" style={{ marginRight: '8px' }}></i>Confirm Policy Purchase</>}>
              <div className="modal-body">
                <p>You are initiating a request to buy the following insurance plan:</p>
                
                {(() => {
                  const currentCustomerAge = calculateCustomerAge(customerProfile?.dateOfBirth);
                  const isMotorOrTravel = categoryTypeCode === 'MOTOR' || categoryTypeCode === 'TRAVEL' || (selectedPlan?.productName || '').toLowerCase().includes('motor') || (selectedPlan?.productName || '').toLowerCase().includes('travel');
                  const isMotorPlan = categoryTypeCode === 'MOTOR' || (selectedPlan?.productName || '').toLowerCase().includes('motor');
                  const ageLoading = getAgeLoadingDetails(currentCustomerAge);
                  const smokerLoading = isMotorOrTravel ? { percent: 0, label: 'Not Applicable' } : getSmokerLoadingDetails(isSmokerSelection, currentCustomerAge);
                  
                  const minCov = selectedPlan.minCoverageAmount || selectedPlan.coverageAmount || 50000;
                  const maxCov = selectedPlan.maxCoverageAmount || (minCov + 2000000);
                  const effectiveInstallment = getAdjustedPremium(selectedPlan.premiumAmount, currentCustomerAge, isSmokerSelection, selectedFrequency, categoryTypeCode, selectedCoverage, minCov);

                  return (
                    <div className="modal-plan-summary" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
                        {selectedPlan.planName}
                      </div>

                      {/* 1. Sum Insured Coverage Range Slider */}
                      <div style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="ph ph-target"></i> SELECT DESIRED COVERAGE AMOUNT
                          </label>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace' }}>
                            ₹{Number(selectedCoverage).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={minCov}
                          max={maxCov}
                          step={50000}
                          value={selectedCoverage}
                          onChange={(e) => setSelectedCoverage(Number(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <span>Min: ₹{minCov.toLocaleString('en-IN')}</span>
                          <span>Max: ₹{maxCov.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* 2. Interactive Billing Frequency Selector */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <i className="ph ph-credit-card"></i> SELECT BILLING FREQUENCY
                        </label>
                        {selectedPlan?.premiumType === 'ONE_TIME' ? (
                          <div style={{ padding: '10px 12px', background: 'rgba(79, 70, 229, 0.08)', border: '1.5px solid var(--primary)', borderRadius: '6px', color: 'var(--primary)', fontWeight: '700', fontSize: '12.5px', textAlign: 'center' }}>
                            ONE-TIME LUMP SUM (100% Single Payment)
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedFrequency('ANNUAL')}
                              style={{
                                padding: '8px 6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: selectedFrequency === 'ANNUAL' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                                background: selectedFrequency === 'ANNUAL' ? 'rgba(79, 70, 229, 0.1)' : 'var(--surface)',
                                color: selectedFrequency === 'ANNUAL' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              ANNUAL (1x)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedFrequency('HALF_YEARLY')}
                              style={{
                                padding: '8px 6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: selectedFrequency === 'HALF_YEARLY' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                                background: selectedFrequency === 'HALF_YEARLY' ? 'rgba(79, 70, 229, 0.1)' : 'var(--surface)',
                                color: selectedFrequency === 'HALF_YEARLY' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              HALF YEARLY (2x)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedFrequency('QUARTERLY')}
                              style={{
                                padding: '8px 6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: selectedFrequency === 'QUARTERLY' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                                background: selectedFrequency === 'QUARTERLY' ? 'rgba(79, 70, 229, 0.1)' : 'var(--surface)',
                                color: selectedFrequency === 'QUARTERLY' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              QUARTERLY (4x)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedFrequency('MONTHLY')}
                              style={{
                                padding: '8px 6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: selectedFrequency === 'MONTHLY' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                                background: selectedFrequency === 'MONTHLY' ? 'rgba(79, 70, 229, 0.1)' : 'var(--surface)',
                                color: selectedFrequency === 'MONTHLY' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              MONTHLY (12x)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 3. Smoker Toggle */}
                      {!isMotorOrTravel ? (
                        <div style={{ background: isSmokerSelection ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)', border: isSmokerSelection ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: '700', color: isSmokerSelection ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <i className="ph ph-warning-octagon"></i> Tobacco / Smoker Status
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
                            <div style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <i className="ph ph-warning-circle"></i> Smoker Surcharge Applied: <strong>{smokerLoading.label}</strong>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* 4. Real-Time Installment Breakdown */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#64748B' }}>
                          <span>Chosen Sum Insured:</span>
                          <span style={{ fontWeight: '700', color: '#1E293B' }}>₹{Number(selectedCoverage).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#4F46E5' }}>
                          <span>Selected Frequency:</span>
                          <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>{selectedFrequency}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px dashed #CBD5E1', paddingTop: '6px', marginTop: '4px', fontSize: '14px' }}>
                          <span>Calculated Installment Premium:</span>
                          <span className="mono" style={{ color: '#10B981' }}>
                            ₹{effectiveInstallment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* 5. Policyholder Details Section */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="ph ph-user-circle" style={{ color: 'var(--primary)', fontSize: '18px' }}></i> Policyholder Information
                          </div>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: 'var(--primary)', background: 'var(--surface)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--primary-light)' }}>
                            <input
                              type="checkbox"
                              checked={isBuyingForSelf}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setIsBuyingForSelf(checked);
                                if (checked) {
                                  fillSelfDetails();
                                } else {
                                  setHolderName('');
                                  setHolderAddress('');
                                  setHolderPhone('');
                                  setHolderAadhaar('');
                                }
                              }}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            Buying for Self (Auto-fill)
                          </label>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                              Full Name <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              value={holderName}
                              onChange={(e) => {
                                setHolderName(e.target.value);
                                if (purchaseErrors.holderName) setPurchaseErrors({ ...purchaseErrors, holderName: '' });
                              }}
                              placeholder="e.g. Rahul Sharma"
                            />
                            {purchaseErrors.holderName && (
                              <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="ph ph-warning-circle"></i> {purchaseErrors.holderName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                              Address <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <textarea
                              rows="2"
                              className="form-input"
                              style={{ resize: 'vertical' }}
                              value={holderAddress}
                              onChange={(e) => {
                                setHolderAddress(e.target.value);
                                if (purchaseErrors.holderAddress) setPurchaseErrors({ ...purchaseErrors, holderAddress: '' });
                              }}
                              placeholder="e.g. Flat 101, Green Enclave, MG Road, Mumbai"
                            />
                            {purchaseErrors.holderAddress && (
                              <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="ph ph-warning-circle"></i> {purchaseErrors.holderAddress}
                              </p>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '14px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                                Phone Number <span style={{ color: '#EF4444' }}>*</span>
                              </label>
                              <input
                                type="text"
                                maxLength="10"
                                className="form-input"
                                value={holderPhone}
                                onChange={(e) => {
                                  setHolderPhone(e.target.value);
                                  if (purchaseErrors.holderPhone) setPurchaseErrors({ ...purchaseErrors, holderPhone: '' });
                                }}
                                placeholder="10-digit Mobile"
                              />
                              {purchaseErrors.holderPhone && (
                                <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <i className="ph ph-warning-circle"></i> {purchaseErrors.holderPhone}
                                </p>
                              )}
                            </div>

                            {!isMotorPlan ? (
                              <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                                  Aadhaar Number <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  maxLength="12"
                                  className="form-input"
                                  value={holderAadhaar}
                                  onChange={(e) => {
                                    setHolderAadhaar(e.target.value);
                                    if (purchaseErrors.holderAadhaar) setPurchaseErrors({ ...purchaseErrors, holderAadhaar: '' });
                                  }}
                                  placeholder="12-digit Aadhaar"
                                />
                                {purchaseErrors.holderAadhaar && (
                                  <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="ph ph-warning-circle"></i> {purchaseErrors.holderAadhaar}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                  Vehicle Number (Car Reg. No) <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ textTransform: 'uppercase' }}
                                  value={vehicleNumber}
                                  onChange={(e) => {
                                    setVehicleNumber(e.target.value);
                                    if (purchaseErrors.vehicleNumber) setPurchaseErrors({ ...purchaseErrors, vehicleNumber: '' });
                                  }}
                                  placeholder="e.g. MH01AB1234"
                                />
                                {purchaseErrors.vehicleNumber && (
                                  <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="ph ph-warning-circle"></i> {purchaseErrors.vehicleNumber}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Policy Start Date */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
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
                  );
                })()}
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
                  {purchasing ? 'Processing...' : <><i className="ph ph-check-circle" style={{ marginRight: '6px' }}></i>Confirm & Go to Payment</>}
                </button>
              </div>
        </Modal>
      )}

      {/* Add Plan Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormErrors({}); }} title={<><i className="ph ph-sparkle"></i> Add New Plan</>} maxWidth="600px">
            <form onSubmit={handleAddPlanSubmit} style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  Plan Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newPlan.planName}
                  onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                  placeholder="e.g. Gold Life Shield"
                />
                {formErrors.planName && <div className="form-error"><i className="ph ph-warning-triangle"></i> {formErrors.planName}</div>}
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Min Coverage Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="number" 
                    step="50000"
                    min="50000"
                    className="form-input" 
                    value={newPlan.minCoverageAmount || newPlan.coverageAmount || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, minCoverageAmount: e.target.value })}
                    placeholder="e.g. 500000 (Min ₹50,000)"
                  />
                  {formErrors.minCoverageAmount && <div className="form-error"><i className="ph ph-warning-triangle"></i> {formErrors.minCoverageAmount}</div>}
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', margin: 0, color: 'var(--text-primary)' }}>
                      Premium (₹)
                    </label>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                      Auto-Calculated
                    </span>
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={newPlan.premiumAmount}
                    onChange={(e) => setNewPlan({ ...newPlan, premiumAmount: e.target.value })}
                    placeholder="Leave blank for auto-calculation"
                  />
                  {formErrors.premiumAmount && <div className="form-error"><i className="ph ph-warning-triangle"></i> {formErrors.premiumAmount}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Billing Frequency <span style={{ color: '#EF4444' }}>*</span>
                  </label>
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
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Coverage Term (Years) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                    placeholder="e.g. 20"
                  />
                  {formErrors.duration && <div className="form-error"><i className="ph ph-warning-triangle"></i> {formErrors.duration}</div>}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  Terms & Conditions <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea 
                  className="form-input" 
                  value={newPlan.termsAndConditions}
                  onChange={(e) => setNewPlan({ ...newPlan, termsAndConditions: e.target.value })}
                  placeholder="Enter terms and conditions (min 20 characters)..."
                  rows="3"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
                {formErrors.termsAndConditions && <div className="form-error">⚠️ {formErrors.termsAndConditions}</div>}
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  id="add-active-plan"
                  checked={newPlan.active}
                  onChange={(e) => setNewPlan({ ...newPlan, active: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="add-active-plan" style={{ margin: 0, cursor: 'pointer', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
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
