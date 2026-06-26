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
    flex-direction: column;
    gap: 12px;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 32px 40px 16px;
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .back-btn {
    background: transparent;
    border: none;
    color: var(--primary-light);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    width: fit-content;
    transition: transform 0.2s ease;
  }

  .back-btn:hover {
    transform: translateX(-4px);
    color: var(--primary);
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

  .add-plan-btn {
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(37, 99, 168, 0.2);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: fit-content;
    align-self: flex-end;
  }

  .add-plan-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(37, 99, 168, 0.3);
    filter: brightness(1.1);
  }

  .add-plan-btn:active {
    transform: translateY(0);
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 8px 40px 32px;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 440px));
    justify-content: center;
    gap: 32px;
    padding: 0 40px 40px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .plan-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 36px 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: auto;
    min-height: 480px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .plan-card:hover {
    box-shadow: var(--shadow-premium);
    transform: translateY(-6px);
    border-color: rgba(37, 99, 168, 0.25);
  }

  .plan-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
  }

  .card-life::before { background: linear-gradient(90deg, #3B82F6, #1D4ED8); }
  .card-health::before { background: linear-gradient(90deg, #10B981, #047857); }
  .card-motor::before { background: linear-gradient(90deg, #F59E0B, #B45309); }
  .card-travel::before { background: linear-gradient(90deg, #8B5CF6, #6D28D9); }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: fit-content;
  }

  .status-badge.active {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-badge.inactive {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .plan-name {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
    letter-spacing: -0.4px;
    text-align: center;
  }

  .plan-details-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    margin-bottom: 24px;
  }

  .plan-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13.5px;
    border-bottom: 1px dashed var(--border);
    padding-bottom: 8px;
  }

  .plan-detail-label {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .plan-detail-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  .plan-detail-value.mono {
    font-family: var(--font-mono);
  }

  .plan-detail-value.highlight {
    color: var(--primary-light);
  }

  .terms-section {
    background: var(--surface);
    border-radius: 8px;
    padding: 12px;
    font-size: 11.5px;
    color: var(--text-secondary);
    line-height: 1.4;
    overflow-y: auto;
    max-height: 80px;
    border: 1px solid var(--border);
    margin-top: 10px;
  }

  .buy-btn {
    width: 100%;
    padding: 14px;
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    background: var(--accent);
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(15, 168, 158, 0.2);
  }

  .buy-btn:hover {
    background: #0d968d;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -2px rgba(15, 168, 158, 0.35);
  }

  .buy-btn:active {
    transform: scale(0.98);
  }

  .admin-actions-container {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .btn-update {
    flex: 1;
    padding: 12px;
    font-size: 13.5px;
    font-weight: 700;
    color: #ffffff;
    background: var(--primary-light);
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 168, 0.2);
  }

  .btn-update:hover {
    background: var(--primary);
    transform: translateY(-1px);
  }

  .btn-deactivate {
    flex: 1;
    padding: 12px;
    font-size: 13.5px;
    font-weight: 700;
    color: #ffffff;
    background: var(--danger);
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
  }

  .btn-deactivate:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-1px);
  }

  .btn-deactivate:disabled {
    background: var(--border);
    color: var(--text-secondary);
    cursor: not-allowed;
    box-shadow: none;
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
    max-width: 480px;
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
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .modal-body {
    margin-bottom: 24px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .modal-plan-summary {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
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

  .empty-catalog-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 350px;
    padding: 40px;
    text-align: center;
    background: var(--card);
    border: 1px dashed var(--border);
    border-radius: var(--radius-card);
    margin: 0 40px 40px;
  }

  .empty-icon {
    font-size: 50px;
    margin-bottom: 16px;
  }

  .empty-catalog-container h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .empty-catalog-container p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 24px;
    max-width: 400px;
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

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 400px;
    color: var(--danger);
    padding: 40px;
    text-align: center;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
    }
    .grid-container {
      grid-template-columns: 1fr;
      padding: 0 20px 20px;
    }
    .header-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding: 24px 20px 16px;
    }
    .divider {
      margin: 8px 20px 24px;
    }
    .empty-catalog-container {
      margin: 0 20px 20px;
    }
  }
`;

const fetchPlansList = async () => {
  const res = await readAllPlans();
  return res?.data?.content || [];
};

const PlanCatalog = () => {
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
      alert("⚠️ You must complete your customer profile before purchasing a policy. Redirecting to your profile page...");
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
      alert(`Success! You have purchased the ${selectedPlan.planName} plan.`);
      setSelectedPlan(null);
      
      // Redirect to customer dashboard to view updated policies
      if (userData?.role === 'CUSTOMER') {
        navigate('/userdashboard');
      } else {
        navigate('/policy');
      }
    } catch (err) {
      console.error("Error purchasing policy:", err);
      alert("Failed to purchase policy. Please try again.");
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
      alert("Plan created successfully!");
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
      alert("Failed to create plan. Please check the backend console.");
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
      alert("Plan updated successfully!");
      setShowEditModal(false);
      setEditingPlan(null);
      setFormErrors({});
      loadPlans();
    } catch (err) {
      console.error("Error updating plan:", err);
      alert("Failed to update plan. Please check the backend console.");
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
        alert("Plan deactivated successfully!");
        loadPlans();
      } catch (err) {
        console.error("Error deactivating plan:", err);
        alert("Failed to deactivate plan. Please check the backend console.");
      } finally {
        // setLoading(false);
      }
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <Sidebar />

        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">🛡️ InsureSpace</div>
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
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading plans catalog...</p>
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
              <div className="empty-icon">📋</div>
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
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormErrors({}); }} title="✨ Add New Plan" maxWidth="520px">
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
