import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readAllProducts, updateProduct, deactivateProduct } from '../services/ProductService';
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

  .action-sub-btn {
    flex: 1;
    padding: 10px;
    background: transparent;
    border: 1.5px solid var(--primary-light);
    color: var(--primary-light);
    border-radius: var(--radius-button);
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .action-sub-btn:hover {
    background: rgba(37, 99, 168, 0.08);
    transform: translateY(-1px);
  }

  .action-sub-btn-danger {
    flex: 1;
    padding: 10px;
    background: transparent;
    border: 1.5px solid var(--danger);
    color: var(--danger);
    border-radius: var(--radius-button);
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .action-sub-btn-danger:hover {
    background: rgba(220, 38, 38, 0.08);
    transform: translateY(-1px);
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
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
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
`;

const ProductCatalog = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin Product Actions state and handlers
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setSubmitting(true);
      const payload = {
        productName: editingProduct.productName,
        productType: editingProduct.productType,
        description: editingProduct.description,
        active: editingProduct.active
      };
      await updateProduct(editingProduct.id, payload);
      alert("Product updated successfully!");
      setEditingProduct(null);
      loadCatalogData();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to deactivate ${product.productName}?`)) {
      return;
    }
    try {
      await deactivateProduct(product.id);
      alert("Product deactivated successfully!");
      loadCatalogData();
    } catch (err) {
      console.error("Error deactivating product:", err);
      alert("Failed to deactivate product. Please try again.");
    }
  };

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

  // Filter products matching this category and active status (show inactive for Admin/Agent)
  const categoryProducts = products.filter((p) => {
    const isAdminOrAgent = userData?.role === 'ADMIN' || userData?.role === 'AGENT';
    return p.productType === categoryTypeCode && (p.active || isAdminOrAgent);
  });

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
                        <div className="status-dot-badge" style={{
                          color: product.active ? 'var(--success)' : 'var(--text-secondary)',
                          background: product.active ? 'rgba(22, 163, 74, 0.08)' : 'rgba(100, 116, 139, 0.08)'
                        }}>
                          <span className="status-pulse" style={{
                            background: product.active ? 'var(--success)' : 'var(--text-secondary)',
                            animation: product.active ? 'pulse 1.8s infinite' : 'none'
                          }}></span>
                          {product.active ? 'Active' : 'Inactive'}
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
                      {userData?.role === "ADMIN" ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button 
                            className="explore-btn"
                            onClick={() => navigate(`/policy/${type}/${product.id}/plans`)}
                          >
                            Explore Plans
                          </button>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="action-sub-btn" 
                              onClick={() => setEditingProduct(product)}
                            >
                              Update
                            </button>
                            <button 
                              className="action-sub-btn-danger" 
                              onClick={() => handleDeactivateProduct(product)}
                            >
                              Deactivate
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="explore-btn"
                          onClick={() => navigate(`/policy/${type}/${product.id}/plans`)}
                        >
                          Explore Plans
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">✏️ Update Product</h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingProduct.productName}
                  onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Type</label>
                <select
                  className="form-input"
                  value={editingProduct.productType}
                  onChange={(e) => setEditingProduct({ ...editingProduct, productType: e.target.value })}
                >
                  <option value="LIFE">LIFE (Life Insurance)</option>
                  <option value="HEALTH">HEALTH (Health Insurance)</option>
                  <option value="MOTOR">MOTOR (Motor Insurance)</option>
                  <option value="TRAVEL">TRAVEL (Travel Insurance)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editingProduct.active}
                  onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                />
                <label htmlFor="edit-active" style={{ fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  Mark as Active
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingProduct(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCatalog;
