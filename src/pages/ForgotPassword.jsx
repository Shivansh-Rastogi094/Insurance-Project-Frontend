import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordService } from "../services/AuthService";
import "../styles/Login.css";
import { useToast } from '../components/ToastProvider';

const ForgotPassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    try {
      await ForgotPasswordService(email.trim());
      toast.info("A 6-digit recovery OTP code has been sent to your email!");
      navigate("/reset-password", { state: { email: email.trim() } });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to send verification code. Ensure your email is registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="login-header">
            <div className="login-logo"><i className="ph ph-key"></i></div>
            <h2>Password Recovery</h2>
            <p>Enter your registered email address to receive a secure recovery code.</p>
          </div>

          {error && <p className="error-text" style={{ color: "#EF4444", marginBottom: "16px", textAlign: "center", fontWeight: "600" }}>⚠️ {error}</p>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. user@insurance.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" style={{ marginTop: "24px" }} disabled={loading}>
            {loading ? "Sending OTP..." : "Request Recovery Code"}
          </button>
        </form>

        <div className="login-footer">
          <p style={{ margin: 0 }}>
            Remembered your password?{" "}
            <a onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>Back to Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
