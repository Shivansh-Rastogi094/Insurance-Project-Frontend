import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginService } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const {login} = useAuth();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" });
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
    if (!validate()) return;

    try {
      setApiError("");
      const response = await LoginService(user);
      
      login(response.data)

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
          setApiError("Unknown user role.");
      }
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "Login failed. Invalid email or password.";
      setApiError(msg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form onSubmit={(e)=>{
          e.preventDefault();
          handleLogin()
          }}>
            <div className="login-header">
              <div className="login-logo">C</div>
              <h2>Sign In</h2>
              <p>Secure access to your policies &amp; claims</p>
            </div>
            
            {apiError && <div className="login-api-error">{apiError}</div>}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter Email"
                value={user.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter Password"
                value={user.password}
                onChange={handleChange}
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "16px" }}>
              <a 
                onClick={() => navigate("/forgot-password")} 
                style={{ fontSize: "12.5px", color: "var(--primary-light)", cursor: "pointer", fontWeight: "500" }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn">Login</button>
          </form>

          <div className="login-footer">
            <p style={{ margin: 0 }}>
              Don't have an account?{" "}
              <a onClick={() => navigate("/register")}>Register here</a>
            </p>
            <p style={{ marginTop: "12px", marginBlockEnd: 0 }}>
              <a className="login-footer-back" onClick={() => navigate("/")}>← Back to Landing Page</a>
            </p>
          </div>
      </div>
    </div>
  );
};

export default Login;