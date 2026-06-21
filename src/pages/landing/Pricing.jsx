import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import "../../styles/Pricing.css";

const TIERS = [
  {
    tier: "Basic", price: "₹499", period: "/month", color: "#2563A8",
    desc: "Perfect for individuals starting their insurance journey.",
    items: ["1 Policy Coverage","Email Support","Basic Claims Portal","OTP Verification","Mobile App Access"],
    cta: "Get Started",
  },
  {
    tier: "Standard", price: "₹1,299", period: "/month", color: "#0FA89E", popular: true,
    desc: "Ideal for families needing comprehensive protection.",
    items: ["Up to 3 Policies","Priority Support","Full Claims Portal","Document Upload","Agent Assignment","SMS Alerts"],
    cta: "Most Popular",
  },
  {
    tier: "Premium", price: "₹2,499", period: "/month", color: "#8B5CF6",
    desc: "Advanced coverage with dedicated agent and analytics.",
    items: ["Up to 8 Policies","24/7 Dedicated Agent","Advanced Claims","Bulk Upload","Reports & Analytics","Custom Nominee"],
    cta: "Go Premium",
  },
  {
    tier: "Enterprise", price: "₹3,999", period: "/month", color: "#F59E0B",
    desc: "For businesses requiring bulk coverage and admin tools.",
    items: ["Unlimited Policies","Dedicated Manager","Admin Dashboard","Full Analytics","Custom Terms","SLA Guarantee"],
    cta: "Contact Sales",
  },
];

const FAQ = [
  { q: "Is there a free trial?", a: "Yes! The Basic plan comes with a 30-day money-back guarantee. No questions asked." },
  { q: "Can I switch plans?", a: "Absolutely. You can upgrade or downgrade your plan at any time from your dashboard." },
  { q: "Are there hidden charges?", a: "No. Crown Assurance has a zero hidden charges policy. What you see is what you pay." },
  { q: "How are premiums calculated?", a: "Premiums depend on your coverage amount, age, and policy type. Our agents help you find the best rate." },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <LandingLayout>
      <div className="pricing-page">
        <div className="pricing-inner">
          <div className="page-hero">
            <div className="ph-b1"/><div className="ph-b2"/>
            <span className="page-hero-icon">💰</span>
            <h1>Simple, Transparent Pricing</h1>
            <p>No hidden fees. Cancel anytime. Choose the plan that fits your protection needs.</p>
          </div>

          <div className="pricing-grid">
            {TIERS.map(p => (
              <div className={`pricing-card${p.popular ? " popular" : ""}`} key={p.tier}>
                {p.popular && <div className="popular-badge">⭐ Most Popular</div>}
                <div className="pricing-tier">{p.tier}</div>
                <div><span className="pricing-price">{p.price}</span><span className="pricing-period">{p.period}</span></div>
                <p className="pricing-desc">{p.desc}</p>
                <ul className="pricing-items">
                  {p.items.map(i => <li key={i}><span style={{color:p.color,fontWeight:700}}>✓</span> {i}</li>)}
                </ul>
                <button
                  className={`btn-pricing ${p.popular ? "btn-filled" : "btn-outline"}`}
                  onClick={() => navigate("/register")}
                >{p.cta}</button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="faq-title">Frequently Asked Questions</div>
            {FAQ.map((f, i) => (
              <div className="faq-item" key={i}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className={`faq-chevron${openFaq === i ? " open" : ""}`}>▼</span>
                </div>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Pricing;
