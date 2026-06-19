import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginService } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";

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

const loginStyles = `
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 10% 20%, rgb(15, 37, 64) 0%, rgb(26, 60, 94) 90%);
    padding: 24px;
    font-family: var(--font-body);
  }

  .login-card {
    background: var(--card);
    width: 100%;
    max-width: 440px;
    padding: 40px;
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-premium);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .login-logo {
    font-size: 48px;
    margin-bottom: 12px;
    display: inline-block;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  }

  .login-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .login-header p {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 6px;
  }

  .form-group {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
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
    padding: 12px 16px;
    font-size: 14px;
    font-family: inherit;
    border: 1px solid var(--border);
    border-radius: var(--radius-input);
    color: var(--text-primary);
    background-color: var(--surface);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary-light);
    box-shadow: 0 0 0 3px rgba(37, 99, 168, 0.15);
    background-color: var(--card);
  }

  .error-text {
    font-size: 12px;
    color: var(--danger);
    font-weight: 500;
    margin-top: 4px;
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    color: #ffffff;
    background: var(--primary);
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
    margin-top: 8px;
    box-shadow: 0 4px 6px -1px rgba(26, 60, 94, 0.2);
  }

  .login-btn:hover {
    background: var(--primary-light);
    box-shadow: 0 10px 15px -3px rgba(26, 60, 94, 0.3);
  }

  .login-btn:active {
    transform: scale(0.98);
  }
`;

  return (
    <div className="login-page">
      <style>{loginStyles}</style>
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
      </div>
    </div>
  );
};

export default Login;