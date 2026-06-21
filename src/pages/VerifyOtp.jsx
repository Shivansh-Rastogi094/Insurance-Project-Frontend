import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { VerifyOtpService, ResendOtpService, VerifyMobileOtpService } from "../services/AuthService";
import "../styles/VerifyOtp.css";

const RESEND_COOLDOWN = 60; // seconds

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from Register page via navigate state
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [step, setStep] = useState(1); // 1 = Email OTP, 2 = Mobile OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown for Resend OTP
  const [cooldown, setCooldown] = useState(emailFromState ? RESEND_COOLDOWN : 0);
  const timerRef = useRef(null);

  // OTP input refs for auto-focus
  const inputRefs = useRef([]);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [step]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only single digit
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setOtpError("");
    setApiError("");
    // Move focus forward
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const updated = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(updated);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const validate = () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    }
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      setOtpError("Please enter all 6 digits");
      valid = false;
    }
    return valid;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    setSuccessMsg("");
    try {
      if (step === 1) {
        await VerifyOtpService({ email, otp: otp.join("") });
        setSuccessMsg("📧 Email OTP verified successfully! Now please verify your mobile OTP...");
        setTimeout(() => {
          setStep(2);
          setOtp(["", "", "", "", "", ""]);
          setSuccessMsg("");
        }, 1500);
      } else {
        await VerifyMobileOtpService({ email, otp: otp.join("") });
        setSuccessMsg("📱 Mobile OTP verified successfully! Account is now activated. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        `Invalid or expired ${step === 1 ? 'Email' : 'Mobile'} OTP. Please try again.`;
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    if (!email.trim()) {
      setEmailError("Please enter your email first");
      return;
    }
    setResending(true);
    setApiError("");
    setSuccessMsg("");
    try {
      await ResendOtpService(email);
      setSuccessMsg("📧 OTP resent. Please check your email inbox / phone messages.");
      setCooldown(RESEND_COOLDOWN);
      // Clear OTP boxes
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      setApiError(msg);
    } finally {
      setResending(false);
    }
  };

  const otpStr = otp.join("");

  return (
    <div className="otp-page">
      <div className="otp-card">

        {/* Header */}
        <div className="otp-header">
          <div className="otp-icon">{step === 1 ? "📧" : "📱"}</div>
          <h2>{step === 1 ? "Verify Your Email" : "Verify Your Mobile Number"}</h2>
          <p>
            {step === 1 ? (
              <>
                We sent a 6-digit OTP to{" "}
                {emailFromState
                  ? <strong>{emailFromState}</strong>
                  : "your registered email."
                }
                {" "}Enter it below to proceed.
              </>
            ) : (
              <>
                We sent a 6-digit OTP to your registered phone number. Enter it below to activate your account.
              </>
            )}
          </p>
        </div>

        {/* Alerts */}
        {apiError  && <div className="otp-api-error">{apiError}</div>}
        {successMsg && <div className="otp-success-msg">{successMsg}</div>}

        <form onSubmit={handleVerify} noValidate>

          {/* Email field (editable in case state wasn't passed) */}
          <div className="otp-form-group">
            <label className="otp-form-label">Registered Email</label>
            <input
              id="otp-email"
              type="email"
              className={`otp-email-input${emailError ? " input-error" : ""}`}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); setApiError(""); }}
              disabled={loading || step === 2}
            />
            {emailError && <span className="otp-error-text">{emailError}</span>}
          </div>

          {/* OTP 6-box input */}
          <div>
            <span className="otp-boxes-label">{step === 1 ? "Email One-Time Password (OTP)" : "Mobile One-Time Password (OTP)"}</span>
            <div className="otp-boxes" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-box-${i}`}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`otp-box${digit ? " box-filled" : ""}${otpError ? " box-error" : ""}`}
                  disabled={loading}
                />
              ))}
            </div>
            {otpError && <p className="otp-error-text">{otpError}</p>}
          </div>

          {/* Verify button */}
          <button
            type="submit"
            className="verify-btn"
            disabled={loading || otpStr.length < 6}
            style={{
              background: step === 2 ? "linear-gradient(135deg, var(--accent), #0d968d)" : "linear-gradient(135deg, var(--primary-light), var(--primary))"
            }}
          >
            {loading ? (
              <><div className="otp-spinner" /> Verifying...</>
            ) : (
              `✔ Verify ${step === 1 ? 'Email' : 'Mobile'} OTP`
            )}
          </button>
        </form>

        {/* Resend OTP */}
        {step === 1 && (
          <div className="resend-row">
            Didn't receive the OTP?{" "}
            {cooldown > 0 ? (
              <span>
                Resend in <span className="resend-countdown">{cooldown}s</span>
              </span>
            ) : (
              <button
                className="resend-btn"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        )}

        {/* Back to login */}
        <div className="otp-footer">
          <a onClick={() => navigate("/login")}>← Back to Login</a>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;
