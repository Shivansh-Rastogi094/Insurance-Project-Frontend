import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import "../../styles/ClaimsInfo.css";

const STEPS = [
  { step: "01", icon: "📝", title: "File a Claim",       desc: "Log in to your dashboard, select the policy, and fill out the incident details form." },
  { step: "02", icon: "📎", title: "Upload Documents",    desc: "Attach supporting documents — photos, FIR, medical reports, certificates — directly from your device." },
  { step: "03", icon: "🔍", title: "Agent Review",        desc: "Your assigned agent verifies the documents and submits a recommendation within 48 business hours." },
  { step: "04", icon: "✅", title: "Admin Decision",      desc: "Admin approves or rejects the claim. You receive an instant email notification with full details." },
  { step: "05", icon: "💳", title: "Settlement",          desc: "Approved claim amounts are transferred directly to your registered bank account within 3–5 working days." },
];

const FAQS = [
  { q: "How long does a claim take?",           a: "Agent review takes up to 48 hours. Admin decision follows in 1–2 business days. Settlement within 3–5 days." },
  { q: "What documents are required?",          a: "It depends on the policy type. Generally: incident report, identity proof, policy document, and supporting evidence." },
  { q: "Can I track my claim status?",          a: "Yes! Log into your dashboard and visit the Claims section to see real-time status updates and history." },
  { q: "What if my claim is rejected?",         a: "You will receive a detailed explanation. You may re-submit with additional documents or contact your agent." },
];

const ClaimsInfo = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(null);

  return (
    <LandingLayout>
      <div className="ci-page">
        <div className="ci-inner">
          <div className="page-hero">
            <div className="ph-b1"/><div className="ph-b2"/>
            <span className="page-hero-icon">🛡️</span>
            <h1>How Claims Work</h1>
            <p>Our 5-step digital claims process is fast, transparent, and completely paperless.</p>
          </div>

          <div className="steps-section">
            <div className="steps-title">📋 The Claims Process</div>
            {STEPS.map(s => (
              <div className="step-row" key={s.step}>
                <div className="step-num-circle">{s.step}</div>
                <span className="step-icon">{s.icon}</span>
                <div>
                  <div className="step-text-title">{s.title}</div>
                  <div className="step-text-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ci-cta">
            <h2>Ready to File a Claim?</h2>
            <p>Register now and access our full claims portal with real-time tracking.</p>
            <button className="btn-ci-cta" onClick={() => navigate("/register")}>🛡️ Start Your Claim</button>
          </div>

          <div className="faq-title">Claims FAQs</div>
          {FAQS.map((f, i) => (
            <div className="faq-item" key={i}>
              <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                {f.q} <span className={`faq-v${open===i?" open":""}`}>▼</span>
              </div>
              {open === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </LandingLayout>
  );
};

export default ClaimsInfo;
