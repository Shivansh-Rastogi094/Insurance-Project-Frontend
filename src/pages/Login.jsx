import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginService } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
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
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await LoginService(user);

      login(response.data);

      switch (response.data.role) {
        case "ADMIN":
          navigate("/admindashboard");
          break;
        case "AGENT":
          navigate("/agentdashboard");
          break;
        case "CUSTOMER":
          navigate("/userdashboard");
          break;
        default:
          alert("Unknown role");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed: " + (error?.response?.data?.message || "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}>
          <div className="login-header">
            <div className="login-logo-container">🛡️</div>
            <h2>Sign In</h2>
            <p>Insurance Policy & Claims Management System</p>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon-left">✉️</span>
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
              <span className="input-icon-left">🔒</span>
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
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "-8px", marginBottom: "20px" }}>
            <span style={{ fontSize: "12.5px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="checkbox" id="rememberMe" style={{ accentColor: "var(--primary-light)" }} />
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
            {loading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <div className="login-footer-premium">
          <p style={{ margin: 0 }}>
            Don't have an account?{" "}
            <a onClick={() => navigate("/register")}>Register here</a>
          </p>
          <p style={{ marginTop: "12px", marginBottom: 0 }}>
            <a onClick={() => navigate("/")}>← Back to Landing Page</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;