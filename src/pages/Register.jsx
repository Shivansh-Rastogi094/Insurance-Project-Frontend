import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterService } from "../services/AuthService";
import "../styles/Login.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(form.password)
    ) {
      newErrors.password =
        "Password must include uppercase, a number, and a special character";
    }

    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await RegisterService({ ...form, role: "CUSTOMER" });
      // Navigate to OTP verification page, passing the email so it pre-fills
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow"></div>
      {/* ══════════ TOP NAVBAR ══════════ */}
      <nav className="auth-nav">
        <div className="auth-nav-inner">
          <a className="auth-nav-logo" onClick={() => navigate("/")}>
            <img src="/logo1.png" alt="Crown Assurance Logo" className="auth-logo-img" />
            <span>Crown Assurance</span>
          </a>
          <ul className="auth-nav-menu">
            <li><a onClick={() => navigate("/")}>Home</a></li>
            <li><a onClick={() => navigate("/plans")}>Plans</a></li>
            <li><a onClick={() => navigate("/claims-info")}>Claims</a></li>
            <li><a onClick={() => navigate("/contact")}>Support</a></li>
          </ul>
          <div className="auth-nav-actions">
            <button className="auth-btn-brand" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="auth-content-container">
        <div className="auth-split-layout">
          {/* Left Panel: Brand Showcase */}
          <div className="auth-left-panel">
            <div className="brand-showcase-content">
              <span className="brand-badge"><i className="ph-fill ph-sparkles"></i> Crown Premium</span>
              <h1>Smart Insurance,<br/>Simpler Life.</h1>
              <p className="brand-tagline">
                Experience India's most advanced digital coverage. Settle claims in minutes with zero paperwork.
              </p>
              
              <div className="claims-process-timeline">
                <h4><i className="ph-fill ph-info"></i> Instant Claim Process</h4>
                <div className="process-steps">
                  <div className="process-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Submit Request</h5>
                      <p>File claims and upload bills in under 2 minutes on our portal.</p>
                    </div>
                  </div>
                  <div className="process-step-line"></div>
                  <div className="process-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Smart Verification</h5>
                      <p>Our intelligent system matches coverages for automated approval.</p>
                    </div>
                  </div>
                  <div className="process-step-line"></div>
                  <div className="process-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Direct Settlement</h5>
                      <p>Approved funds hit your bank account within minutes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form Card */}
          <div className="auth-right-panel">
            <div className="register-card">
              <div className="register-header">
                <img src="/logo1.png" alt="Crown Assurance Logo" className="register-logo-premium" />
                <h2>Create Account</h2>
                <p>Secure registration for policies &amp; claims</p>
              </div>

              {apiError && <div className="reg-api-error">{apiError}</div>}
              {success && <div className="reg-success-msg">{success}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><i className="ph ph-user"></i></span>
                    <input
                      id="reg-fullName"
                      type="text"
                      name="fullName"
                      className="form-input-premium"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="reg-error-text">{errors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><i className="ph ph-envelope"></i></span>
                    <input
                      id="reg-email"
                      type="email"
                      name="email"
                      className="form-input-premium"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && (
                    <span className="reg-error-text">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><i className="ph ph-lock"></i></span>
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-input-premium"
                      placeholder="Min 8 chars, uppercase, number, special char"
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <i className="ph ph-eye-slash"></i> : <i className="ph ph-eye"></i>}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="reg-error-text">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><i className="ph ph-phone"></i></span>
                    <input
                      id="reg-phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      className="form-input-premium"
                      placeholder="10-digit mobile number"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      maxLength={10}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <span className="reg-error-text">{errors.phoneNumber}</span>
                  )}
                </div>

                <button type="submit" className="login-btn-premium" disabled={loading}>
                  {loading ? <>Registering...</> : <>Create Account <i className="ph ph-arrow-right"></i></>}
                </button>
              </form>

              <div className="register-footer">
                <p style={{ margin: 0 }}>
                  Already have an account?{" "}
                  <a onClick={() => navigate("/login")}>Sign in here</a>
                </p>
                <p style={{ marginTop: "12px", marginBlockEnd: 0 }}>
                  <a className="register-footer-back" onClick={() => navigate("/")}><i className="ph ph-arrow-left"></i> Back to Landing Page</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ ACHIEVEMENTS / STATS SECTION ══════════ */}
      <section className="auth-stats-section">
        <div className="auth-container">
          <div className="auth-stats-grid">
            <div className="auth-stat-card glass-card">
              <div className="auth-stat-icon"><i className="ph ph-shield-check"></i></div>
              <h3>10M+</h3>
              <p>Policies issued</p>
            </div>
            <div className="auth-stat-card glass-card">
              <div className="auth-stat-icon"><i className="ph ph-chart-line-up"></i></div>
              <h3>98%</h3>
              <p>Claim approval rate</p>
            </div>
            <div className="auth-stat-card glass-card">
              <div className="auth-stat-icon"><i className="ph ph-clock"></i></div>
              <h3>24/7</h3>
              <p>Customer support</p>
            </div>
            <div className="auth-stat-card glass-card">
              <div className="auth-stat-icon"><i className="ph ph-calendar"></i></div>
              <h3>15+</h3>
              <p>Years in business</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="auth-footer">
        <div className="auth-container">
          <div className="auth-footer-grid">
            <div className="auth-footer-info">
              <div className="auth-footer-logo">
                <img src="/logo1.png" alt="Crown Assurance Logo" className="auth-logo-img" />
                <span>Crown Assurance</span>
              </div>
              <p className="auth-footer-desc">
                India's smartest digital insurance platform. Delivering trust, efficiency, and round-the-clock peace of mind.
              </p>
            </div>
            <div className="auth-footer-col">
              <h4>Quick Links</h4>
              <ul className="auth-footer-links">
                <li><a onClick={() => navigate("/")}>Home</a></li>
                <li><a onClick={() => navigate("/plans")}>Plans</a></li>
                <li><a onClick={() => navigate("/claims-info")}>Claims</a></li>
                <li><a onClick={() => navigate("/contact")}>Support</a></li>
              </ul>
            </div>
            <div className="auth-footer-col">
              <h4>Legal</h4>
              <ul className="auth-footer-links">
                <li><a onClick={() => navigate("/login")}>Privacy Policy</a></li>
                <li><a onClick={() => navigate("/login")}>Terms of Service</a></li>
                <li><a onClick={() => navigate("/login")}>Cookies Policy</a></li>
                <li><a onClick={() => navigate("/login")}>IRDAI Disclosures</a></li>
              </ul>
            </div>
            <div className="auth-footer-col">
              <h4>Contact</h4>
              <ul className="auth-footer-links contact-info-links">
                <li><i className="ph ph-envelope-simple"></i> support@crownassurance.com</li>
                <li><i className="ph ph-phone"></i> +91 1800 234 5678</li>
                <li><i className="ph ph-map-pin"></i> Hyderabad, India</li>
              </ul>
            </div>
          </div>

          <div className="auth-footer-bottom">
            <p className="auth-footer-legal">
              Disclaimer: Insurance is the subject matter of solicitation. Crown Assurance Pvt. &amp; Ltd. is a registered corporate agent under IRDAI License No. CA-2020-001. All insurance products are underwritten by respective partner insurance companies. For more details on risk factors, terms and conditions, please read the sales brochure carefully before concluding a sale.
            </p>
            <div className="auth-footer-bottom-row">
              <p className="auth-footer-copy">
                © {new Date().getFullYear()} Crown Assurance Pvt. &amp; Ltd. All rights reserved.
              </p>
              <div className="auth-footer-socials">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn"><i className="ph ph-linkedin-logo"></i></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter/X"><i className="ph ph-twitter-logo"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram"><i className="ph ph-instagram-logo"></i></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;
