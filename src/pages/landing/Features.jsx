import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import "../../styles/Features.css";

const FEATURES = [
  { icon: "🔐", title: "Secure OTP Authentication",  desc: "Email-based OTP verification with resend countdown ensures only verified users access accounts.", color: "#2563A8" },
  { icon: "📄", title: "Instant Policy Issuance",     desc: "Purchase or receive a policy in seconds — no paperwork, fully digital with instant PDF download.", color: "#0FA89E" },
  { icon: "⚡", title: "Fast Claims Processing",       desc: "File claims with multi-document uploads and track every status change in real-time.", color: "#F59E0B" },
  { icon: "👨‍💼", title: "Dedicated Agents",          desc: "Every customer is paired with a personal insurance agent for expert guidance and claim reviews.", color: "#8B5CF6" },
  { icon: "📊", title: "Role-Based Dashboards",       desc: "Separate, purpose-built dashboards for Customers, Agents, and Admins with live KPI data.", color: "#EC4899" },
  { icon: "🌙", title: "Dark Mode Support",           desc: "Switch between light and dark themes that persist across sessions for comfortable viewing.", color: "#14B8A6" },
  { icon: "📱", title: "Fully Responsive",            desc: "Built mobile-first. Works perfectly on phones, tablets, and desktops without any app install.", color: "#F97316" },
  { icon: "🔔", title: "Real-Time Notifications",     desc: "Get instant email alerts for policy purchases, payment confirmations, and claim decisions.", color: "#22C55E" },
  { icon: "📎", title: "Document Management",         desc: "Upload, store, and retrieve supporting documents for claims securely through the portal.", color: "#6366F1" },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <LandingLayout>
      <div className="features-page">
        <div className="features-inner">
          <div className="page-hero">
            <div className="ph-b1"/><div className="ph-b2"/>
            <span className="page-hero-icon">✨</span>
            <h1>Platform Features</h1>
            <p>Everything you need to manage insurance — policies, payments, and claims — all in one powerful platform.</p>
          </div>

          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feat-card" key={f.title}>
                <div className="feat-icon-wrap" style={{ background: `${f.color}18` }}>
                  {f.icon}
                </div>
                <div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="feat-cta">
            <h2>Experience All Features Free</h2>
            <p>Create your account today and explore the full power of Crown Assurance — no credit card needed.</p>
            <button className="btn-feat-cta" onClick={() => navigate("/register")}>🚀 Start for Free</button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Features;
