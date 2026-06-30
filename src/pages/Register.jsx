import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterService } from "../services/AuthService";
import "../styles/Register.css";

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
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">C</div>
          <h2>Create Account</h2>
          <p>Secure registration for policies &amp; claims</p>
        </div>

        {apiError && <div className="reg-api-error">{apiError}</div>}
        {success && <div className="reg-success-msg">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="reg-form-group">
            <label className="reg-form-label">Full Name</label>
            <input
              id="reg-fullName"
              type="text"
              name="fullName"
              className={`reg-form-input${errors.fullName ? " input-error" : ""}`}
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <span className="reg-error-text">{errors.fullName}</span>
            )}
          </div>

          <div className="reg-form-group">
            <label className="reg-form-label">Email Address</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              className={`reg-form-input${errors.email ? " input-error" : ""}`}
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="reg-error-text">{errors.email}</span>
            )}
          </div>

          <div className="reg-form-group">
            <label className="reg-form-label">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              className={`reg-form-input${errors.password ? " input-error" : ""}`}
              placeholder="Min 8 chars, uppercase, number, special char"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="reg-error-text">{errors.password}</span>
            )}
          </div>

          <div className="reg-form-group">
            <label className="reg-form-label">Phone Number</label>
            <input
              id="reg-phoneNumber"
              type="tel"
              name="phoneNumber"
              className={`reg-form-input${errors.phoneNumber ? " input-error" : ""}`}
              placeholder="10-digit mobile number"
              value={form.phoneNumber}
              onChange={handleChange}
              maxLength={10}
            />
            {errors.phoneNumber && (
              <span className="reg-error-text">{errors.phoneNumber}</span>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? <><div className="spinner" /> Registering...</> : "Create Account"}
          </button>
        </form>

        <div className="register-footer">
          <p style={{ margin: 0 }}>
            Already have an account?{" "}
            <a onClick={() => navigate("/login")}>Sign in here</a>
          </p>
          <p style={{ marginTop: "12px", marginBlockEnd: 0 }}>
            <a className="register-footer-back" onClick={() => navigate("/")}>← Back to Landing Page</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
