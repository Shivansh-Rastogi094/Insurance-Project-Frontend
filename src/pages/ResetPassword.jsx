import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ResetPasswordService } from "../services/AuthService";
import "../styles/Login.css";
import { useToast } from '../components/ToastProvider';

const ResetPassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim() || !newPassword.trim()) return;

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP code must be exactly 6 digits.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(newPassword)) {
      setError("Password must include uppercase, a number, and a special character.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await ResetPasswordService({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim()
      });
      toast.success("Password has been reset successfully! Please sign in with your new password.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Password reset failed. Verify your recovery OTP code and email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow"></div>
      <div className="auth-content-container">
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <div className="login-header">
              <img src="/logo1.png" alt="Crown Assurance Logo" className="login-logo-premium" />
              <h2>Reset Password</h2>
              <p>Setup your new password using the recovery OTP code sent to your email.</p>
            </div>

            {error && <p className="error-text" style={{ color: "#EF4444", marginBottom: "16px", textAlign: "center", fontWeight: "600" }}><i className="ph ph-warning-triangle"></i> {error}</p>}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><i className="ph ph-envelope"></i></span>
                <input
                  type="email"
                  className="form-input-premium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Recovery OTP Code</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><i className="ph ph-key"></i></span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input-premium"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setOtp(val);
                  }}
                  maxLength={6}
                  required
                  disabled={loading}
                  placeholder="6-digit code"
                  style={{ letterSpacing: "2px", fontWeight: "bold" }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><i className="ph ph-lock"></i></span>
                <input
                  type="password"
                  className="form-input-premium"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <button type="submit" className="login-btn-premium" style={{ marginTop: "24px" }} disabled={loading}>
              {loading ? "Resetting..." : "Save Password & Sign In"}
            </button>
          </form>

          <div className="login-footer-premium">
            <p style={{ margin: 0 }}>
              Did not receive OTP?{" "}
              <a onClick={() => navigate("/forgot-password")} style={{ cursor: "pointer" }}>Resend Request</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
