import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readAllProducts } from '../services/ProductService';

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

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .btn-admin {
    background: var(--primary);
    color: #ffffff;
    border: none;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(26, 60, 94, 0.15);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-admin:hover {
    background: var(--primary-light);
    transform: translateY(-1px);
  }

  .btn-admin-secondary {
    background: transparent;
    color: var(--primary-light);
    border: 1.5px solid var(--primary-light);
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-admin-secondary:hover {
    background: rgba(37, 99, 168, 0.05);
    transform: translateY(-1px);
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 8px 40px 24px;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    padding: 0 40px 40px;
  }

  .tall-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    height: 600px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .tall-card:hover {
    box-shadow: var(--shadow-premium);
    transform: translateY(-6px);
  }

  .tall-card::before {
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

  .card-header-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 24px;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .card-life .card-icon { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
  .card-health .card-icon { background: rgba(16, 185, 129, 0.1); color: #10B981; }
  .card-motor .card-icon { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
  .card-travel .card-icon { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .card-subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 4px;
  }

  .product-list-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    margin-bottom: 20px;
    padding-right: 4px;
    scrollbar-width: thin;
  }

  .product-item {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 14px;
    background: var(--surface);
    transition: all 0.2s ease;
  }

  .product-item:hover {
    border-color: var(--primary-light);
    background: var(--card);
    transform: translateX(2px);
  }

  .product-item-name {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .product-item-desc {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
    line-height: 1.4;
  }

  .view-more-btn {
    width: 100%;
    padding: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-light);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    margin-top: auto;
  }

  .view-more-btn:hover {
    color: #ffffff;
    background: var(--primary-light);
    border-color: var(--primary-light);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    border: 1px dashed var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 12px;
    font-style: italic;
    text-align: center;
    padding: 16px;
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

  @media (max-width: 1200px) {
    .grid-container {
      grid-template-columns: repeat(2, 1fr);
    }
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
      margin: 8px 20px 20px;
    }
  }
`;

const Policy = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await readAllProducts();
      if (response && response.data && response.data.content) {
        setProducts(response.data.content);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please check if backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by type (active only or all, depending on preference. Here we show active only if active field is true)
  const getFilteredProducts = (type) => {
    return products.filter((p) => p.productType === type && p.active);
  };

  const productTypes = [
    {
      id: 'life',
      typeCode: 'LIFE',
      title: 'Life Insurance',
      subtitle: 'Protection for your loved ones',
      icon: '👥',
      className: 'card-life'
    },
    {
      id: 'health',
      typeCode: 'HEALTH',
      title: 'Health Insurance',
      subtitle: 'Medical security & support',
      icon: '🏥',
      className: 'card-health'
    },
    {
      id: 'motor',
      typeCode: 'MOTOR',
      title: 'Motor Insurance',
      subtitle: 'Vehicle damage & safety cover',
      icon: '🚗',
      className: 'card-motor'
    },
    {
      id: 'travel',
      typeCode: 'TRAVEL',
      title: 'Travel Insurance',
      subtitle: 'Secure your journeys',
      icon: '✈️',
      className: 'card-travel'
    }
  ];

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
            <div className="header-text">
              <h2>Products & Plans Catalog</h2>
              <p>Explore all available insurance products structured by categories</p>
            </div>
            {userData?.role === "ADMIN" && (
              <div className="header-actions">
                <button className="btn-admin-secondary" onClick={() => alert("Add Policy Clicked (Admin feature details coming soon!)")}>
                  + Add Policy
                </button>
                <button className="btn-admin" onClick={() => alert("Add Product Clicked (Admin feature details coming soon!)")}>
                  + Add Product
                </button>
              </div>
            )}
          </div>

          <div className="divider" />

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Fetching products from catalog...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button className="btn-admin" style={{ marginTop: '20px' }} onClick={fetchProducts}>
                Retry Loading
              </button>
            </div>
          ) : (
            <div className="grid-container">
              {productTypes.map((category) => {
                const categoryProducts = getFilteredProducts(category.typeCode);
                const displayedProducts = categoryProducts.slice(0, 4);

                return (
                  <div className={`tall-card ${category.className}`} key={category.id}>
                    <div className="card-header-section">
                      <div className="card-icon">{category.icon}</div>
                      <h3 className="card-title">{category.title}</h3>
                      <p className="card-subtitle">{category.subtitle}</p>
                    </div>

                    <div className="product-list-container">
                      {categoryProducts.length === 0 ? (
                        <div className="empty-state">
                          No active products available in this category
                        </div>
                      ) : (
                        displayedProducts.map((prod) => (
                          <div className="product-item" key={prod.id}>
                            <h4 className="product-item-name">{prod.productName}</h4>
                            <p className="product-item-desc">{prod.description}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <button 
                      className="view-more-btn"
                      onClick={() => navigate(`/policy/${category.typeCode.toLowerCase()}`)}
                    >
                      View More
                    </button>
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

export default Policy;