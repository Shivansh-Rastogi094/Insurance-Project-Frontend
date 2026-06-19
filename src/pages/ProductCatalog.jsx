import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readAllProducts } from '../services/ProductService';
import { readAllPlans } from '../services/PlanService';

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

  .header-title-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
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

  .product-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 360px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .product-card:hover {
    box-shadow: var(--shadow-premium);
    transform: translateY(-5px);
    border-color: rgba(37, 99, 168, 0.2);
  }

  .product-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
  }

  .card-life::before { background: linear-gradient(90deg, #3B82F6, #1D4ED8); }
  .card-health::before { background: linear-gradient(90deg, #10B981, #047857); }
  .card-motor::before { background: linear-gradient(90deg, #F59E0B, #B45309); }
  .card-travel::before { background: linear-gradient(90deg, #8B5CF6, #6D28D9); }

  .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .card-life .card-icon { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
  .card-health .card-icon { background: rgba(16, 185, 129, 0.1); color: #10B981; }
  .card-motor .card-icon { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
  .card-travel .card-icon { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

  .status-dot-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--success);
    background: rgba(22, 163, 74, 0.08);
    padding: 4px 10px;
    border-radius: var(--radius-badge);
  }

  .status-pulse {
    width: 6px;
    height: 6px;
    background: var(--success);
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
    animation: pulse 1.8s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
  }

  .product-info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
  }

  .product-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }

  .product-desc {
    font-size: 13.5px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .plans-badge {
    margin-top: auto;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--primary-light);
    background: rgba(37, 99, 168, 0.08);
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid rgba(37, 99, 168, 0.12);
  }

  .explore-btn {
    width: 100%;
    padding: 13px;
    font-size: 13.5px;
    font-weight: 600;
    color: #ffffff;
    background: var(--primary);
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(26, 60, 94, 0.1);
  }

  .explore-btn:hover {
    background: var(--primary-light);
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -2px rgba(37, 99, 168, 0.2);
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
    .header {
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

const ProductCatalog = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryTypeCode = type ? type.toUpperCase() : '';

  const getCategoryMeta = () => {
    switch (categoryTypeCode) {
      case 'LIFE':
        return { title: 'Life Insurance', icon: '👥', className: 'card-life' };
      case 'HEALTH':
        return { title: 'Health Insurance', icon: '🏥', className: 'card-health' };
      case 'MOTOR':
        return { title: 'Motor Insurance', icon: '🚗', className: 'card-motor' };
      case 'TRAVEL':
        return { title: 'Travel Insurance', icon: '✈️', className: 'card-travel' };
      default:
        return { title: `${type} Insurance`, icon: '🛡️', className: 'card-life' };
    }
  };

  const categoryMeta = getCategoryMeta();

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products and plans in parallel
      const [productRes, planRes] = await Promise.all([
        readAllProducts(),
        readAllPlans()
      ]);

      if (productRes && productRes.data && productRes.data.content) {
        setProducts(productRes.data.content);
      } else {
        setProducts([]);
      }

      if (planRes && planRes.data && planRes.data.content) {
        setPlans(planRes.data.content);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Error loading catalog data:", err);
      setError("Failed to retrieve plans or products catalog. Please ensure the backend is available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, [type]);

  // Filter products matching this category and active status
  const categoryProducts = products.filter(
    (p) => p.productType === categoryTypeCode && p.active
  );

  // Count active plans belonging to a product
  const getPlanCountForProduct = (productId, productName) => {
    return plans.filter(
      (plan) => plan.active && (plan.productId === productId || plan.productName === productName)
    ).length;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <Sidebar title="Policyholder Portal" />

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

          <div className="header">
            <button className="back-btn" onClick={() => navigate('/policy')}>
              ← Back to Categories
            </button>
            <div className="header-title-area">
              <div className="header-text">
                <h2>{categoryMeta.title} Offerings</h2>
                <p>Browse detailed products and discover plan options suited for you</p>
              </div>
            </div>
          </div>

          <div className="divider" />

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading catalog items...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button className="explore-btn" style={{ marginTop: '20px', width: 'auto' }} onClick={loadCatalogData}>
                Retry Loading
              </button>
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="empty-catalog-container">
              <div className="empty-icon">📂</div>
              <h3>No Products Available</h3>
              <p>We couldn't find any active products under {categoryMeta.title} at this moment. Please check back later or explore other categories.</p>
              <button className="explore-btn" style={{ width: 'auto' }} onClick={() => navigate('/policy')}>
                Browse Other Portfolios
              </button>
            </div>
          ) : (
            <div className="grid-container">
              {categoryProducts.map((product) => {
                const planCount = getPlanCountForProduct(product.id, product.productName);
                return (
                  <div className={`product-card ${categoryMeta.className}`} key={product.id}>
                    <div>
                      <div className="card-header-row">
                        <div className="card-icon">{categoryMeta.icon}</div>
                        <div className="status-dot-badge">
                          <span className="status-pulse"></span>
                          Active
                        </div>
                      </div>
                      <div className="product-info-section">
                        <h3 className="product-title">{product.productName}</h3>
                        <p className="product-desc">{product.description}</p>
                      </div>
                    </div>
                    <div>
                      <div className="plans-badge" style={{ marginBottom: '20px' }}>
                        📋 {planCount} {planCount === 1 ? 'Plan' : 'Plans'} Available
                      </div>
                      <button 
                        className="explore-btn"
                        onClick={() => alert(`Exploring plans for ${product.productName}...`)}
                      >
                        Explore Plans
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCatalog;
