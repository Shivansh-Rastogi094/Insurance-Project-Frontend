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

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
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
          alert("Unknown role");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed");
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
              <div className="login-logo">🛡️</div>
              <h2>Sign In</h2>
              <p>Insurance Policy & Claims Management System</p>
            </div>
            
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

            <button type="submit" className="login-btn">Login</button>
          </form>

          <div className="login-footer">
            Don't have an account?{" "}
            <a onClick={() => navigate("/register")}>Register here</a>
          </div>
      </div>
    </div>
  );
};

export default Login;