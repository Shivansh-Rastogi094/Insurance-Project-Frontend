import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginService } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("remember_me") === "true";
  });

  const [user, setUser] = useState({
    email: localStorage.getItem("remembered_email") || "",
    password: "",
  });

  const isSubmittingRef = React.useRef(false);

  React.useEffect(() => {
    const sessionExpired = localStorage.getItem("session_expired_toast");
    if (sessionExpired === "true") {
      toast.error("Your session has expired. Please login again to continue.");
      localStorage.removeItem("session_expired_toast");
    }
  }, []);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
    // Clear errors when typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  const handleQuickFill = (email, password) => {
    setUser({ email, password });
    setErrors({});
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!user.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(user.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    if (!user.password.trim()) {
      newErrors.password = "Password is required";
    } else if (user.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (isSubmittingRef.current || loading) return;
    if (!validate()) return;

    try {
      isSubmittingRef.current = true;
      setLoading(true);
      setApiError("");
      const response = await LoginService(user);

      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
        localStorage.setItem("remembered_email", user.email);
      } else {
        localStorage.removeItem("remember_me");
        localStorage.removeItem("remembered_email");
      }

      login(response.data);

      switch (response.data.role) {
        case "ADMIN":
          navigate("/admindashboard");
          break;
        case "AGENT":
        case "SUPER_AGENT":
          navigate("/agentdashboard");
          break;
        case "CUSTOMER":
          navigate("/userdashboard");
          break;
        default:
          setApiError("Unknown user role.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed: " + (error?.response?.data?.message || "Invalid credentials"));
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
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
            <button className="auth-btn-brand" onClick={() => navigate("/register")}>
              Register
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
            <div className="login-card">
              <form noValidate onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}>
                <div className="login-header">
                  <img src="/logo1.png" alt="Crown Assurance Logo" className="login-logo-premium" />
                  <h2>Sign In</h2>
                  <p>Secure access to your policies &amp; claims</p>
                </div>
                  
                {apiError && <div className="login-api-error">{apiError}</div>}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><i className="ph ph-envelope"></i></span>
                    <input
                      type="email"
                      name="email"
                      className="form-input-premium"
                      placeholder="Enter email address"
                      value={user.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><i className="ph ph-lock"></i></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-input-premium"
                      placeholder="Enter password"
                      value={user.password}
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
                  {errors.password && <p className="error-text">{errors.password}</p>}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "-8px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "12.5px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: "var(--primary-light)" }}
                    />
                    <label htmlFor="rememberMe" style={{ cursor: "pointer", userSelect: "none" }}>Remember me</label>
                  </span>
                  <a
                    onClick={() => navigate("/forgot-password")}
                    style={{ fontSize: "12.5px", color: "var(--primary-light)", cursor: "pointer", fontWeight: "600" }}
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="login-btn-premium"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : <>Sign In <i className="ph ph-arrow-right"></i></>}
                </button>
              </form>

              <div className="login-footer-premium">
                <p style={{ margin: 0 }}>
                  Don't have an account?{" "}
                  <a onClick={() => navigate("/register")}>Register here</a>
                </p>
                <p style={{ marginTop: "12px", marginBottom: 0 }}>
                  <a className="login-footer-back" onClick={() => navigate("/")}><i className="ph ph-arrow-left"></i> Back to Landing Page</a>
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

export default Login;