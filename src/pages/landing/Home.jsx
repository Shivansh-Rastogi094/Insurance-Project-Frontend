import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import "../../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  const QUICK_PAGES = [
    { icon: "ℹ️", label: "About Us",  desc: "Our story, mission, and values",   path: "/about"      },
    { icon: <i className="ph ph-clipboard"></i>, label: "Plans",     desc: "Life, Health & Motor plans",        path: "/plans"      },
    { icon: <i className="ph ph-coin"></i>, label: "Pricing",   desc: "Simple transparent pricing",        path: "/pricing"    },
    { icon: <i className="ph ph-sparkle"></i>, label: "Features",  desc: "What makes us different",           path: "/features"   },
    { icon: "🛡️", label: "Claims",   desc: "How our claims process works",      path: "/claims-info"},
    { icon: <i className="ph ph-phone"></i>, label: "Contact",   desc: "Get started — create an account",   path: "/register"   },
  ];

  return (
    <LandingLayout>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-blob hblob1" />
        <div className="home-blob hblob2" />
        <div className="home-content">
          <div className="hero-badge"><i className="ph ph-sparkle"></i> Trusted by 1,00,000+ customers</div>
          <h1 className="hero-title">
            India's Smartest<br />
            <span className="grad">Insurance Platform</span>
          </h1>
          <p className="hero-sub">
            Crown Assurance Pvt. &amp; Ltd. — Secure your life, health, and assets
            with AI-powered policy management, instant claims, and dedicated agents.
          </p>
          <div className="hero-btns">
            <button className="btn-hprimary" onClick={() => navigate("/register")}><i className="ph ph-rocket"></i> Get Started Free</button>
            <button className="btn-hghost"   onClick={() => navigate("/plans")}><i className="ph ph-clipboard"></i> Browse Plans</button>
          </div>
          <div className="hero-stats">
            {[["₹500Cr+","Claims Settled"],["1L+","Happy Customers"],["99.8%","Claim Approval"],["24/7","Agent Support"]].map(([v,l]) => (
              <div className="hstat" key={l}>
                <div className="hstat-val">{v}</div>
                <div className="hstat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className="trust-strip">
        <div className="trust-inner">
          {[[<i className="ph ph-bank"></i>,"IRDAI Regulated"],[<i className="ph ph-lock-key"></i>,"ISO 27001 Certified"],[<i className="ph ph-lightning"></i>,"Instant Policy"],[<i className="ph ph-handshake"></i>,"Zero Hidden Fees"],[<i className="ph ph-device-mobile"></i>,"100% Digital"]].map(([ic,tx]) => (
            <div className="trust-item" key={tx}>
              <span className="trust-icon">{ic}</span>
              <span className="trust-text">{tx}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Navigation Cards ── */}
      <section className="quick-section">
        <div className="quick-inner">
          <div className="quick-header">
            <h2>Explore Crown Assurance</h2>
            <p>Everything you need in one place — tap a card to learn more</p>
          </div>
          <div className="quick-grid">
            {QUICK_PAGES.map((p) => (
              <div className="quick-card" key={p.path} onClick={() => navigate(p.path)}>
                <span className="quick-card-icon">{p.icon}</span>
                <div className="quick-card-label">{p.label}</div>
                <div className="quick-card-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Home;
