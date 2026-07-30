import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { readAllProducts, createProduct } from '../services/ProductService';
import { useToast } from '../components/ToastProvider';
import PremiumCalculatorWidget from '../components/PremiumCalculatorWidget';

const Policy = () => {
  const toast = useToast();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  
  // Add Product State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    productType: 'LIFE',
    description: '',
    active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createProduct(newProduct);
      toast.success("Product created successfully!");
      setIsAddModalOpen(false);
      // Reset form
      setNewProduct({
        productName: '',
        productType: 'LIFE',
        description: '',
        active: true
      });
      // Refresh list
      fetchProducts();
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error(err?.response?.data?.message || "Failed to create product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
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
    const isAdminOrAgent = userData?.role === 'ADMIN' || userData?.role === 'AGENT';
    return products.filter((p) => p.productType === type && (p.active || isAdminOrAgent));
  };

  const productTypes = [
    {
      id: 'life',
      typeCode: 'LIFE',
      title: 'Life Insurance',
      subtitle: 'Protection for your loved ones',
      icon: <i className="ph ph-users-three"></i>,
      className: 'card-life'
    },
    {
      id: 'health',
      typeCode: 'HEALTH',
      title: 'Health Insurance',
      subtitle: 'Medical security & support',
      icon: <i className="ph ph-heartbeat"></i>,
      className: 'card-health'
    },
    {
      id: 'motor',
      typeCode: 'MOTOR',
      title: 'Motor Insurance',
      subtitle: 'Vehicle damage & safety cover',
      icon: <i className="ph ph-car"></i>,
      className: 'card-motor'
    },
    {
      id: 'travel',
      typeCode: 'TRAVEL',
      title: 'Travel Insurance',
      subtitle: 'Secure your journeys',
      icon: <i className="ph ph-airplane"></i>,
      className: 'card-travel'
    }
  ];

  return (
    <>
      <div className="policy-page page-container">
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

          <div className="header">
            <div className="header-text">
              <h2>Products & Plans Catalog</h2>
              <p>Explore all available insurance products structured by categories</p>
            </div>
            {userData?.role === "ADMIN" && (
              <div className="header-actions">
                <button className="btn-admin" onClick={() => setIsAddModalOpen(true)}>
                  + Add Product
                </button>
              </div>
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
                          <div 
                            className="product-item" 
                            key={prod.id}
                            onClick={() => navigate(`/policy/${category.typeCode.toLowerCase()}/${prod.id}/plans`)}
                          >
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
                      {userData?.role === 'CUSTOMER' ? 'Explore & Buy Plans' : 'View More'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title"><i className="ph ph-package"></i> Add New Product</h3>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g., Term Life Gold"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Type</label>
                <select
                  className="form-input"
                  value={newProduct.productType}
                  onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })}
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
                  placeholder="Briefly describe the product..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="active"
                  checked={newProduct.active}
                  onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })}
                />
                <label htmlFor="active" style={{ fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  Mark as Active immediately
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Policy;