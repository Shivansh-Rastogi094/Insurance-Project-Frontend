import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ResetPasswordService } from "../services/AuthService";
import "../styles/Login.css";

const ResetPassword = () => {
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

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
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
      alert("Password has been reset successfully! Please sign in with your new password.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Password reset failed. Verify your recovery OTP code and email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="login-header">
            <div className="login-logo">🛡️</div>
            <h2>Reset Password</h2>
            <p>Setup your new password using the recovery OTP code sent to your email.</p>
          </div>

          {error && <p className="error-text" style={{ color: "#EF4444", marginBottom: "16px", textAlign: "center", fontWeight: "600" }}>⚠️ {error}</p>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="name@example.com"
            />
          </div>

          <div className="form-group" style={{ marginTop: "16px" }}>
            <label className="form-label">Recovery OTP Code</label>
            <input
              type="text"
              className="form-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              disabled={loading}
              placeholder="6-digit code"
              style={{ letterSpacing: "2px", fontWeight: "bold" }}
            />
          </div>

          <div className="form-group" style={{ marginTop: "16px" }}>
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="At least 8 characters"
            />
          </div>

          <button type="submit" className="login-btn" style={{ marginTop: "24px" }} disabled={loading}>
            {loading ? "Resetting..." : "Save Password & Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p style={{ margin: 0 }}>
            Did not receive OTP?{" "}
            <a onClick={() => navigate("/forgot-password")} style={{ cursor: "pointer" }}>Resend Request</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
