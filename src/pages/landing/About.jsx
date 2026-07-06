import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import "../../styles/About.css";

const About = () => {
  const navigate = useNavigate();

  const TEAM = [
    { avatar: <i className="ph ph-user-tie"></i>, name: "Rajesh Sharma",   role: "CEO & Founder"       },
    { avatar: <i className="ph ph-user"></i>, name: "Priya Nair",       role: "CTO"                 },
    { avatar: <i className="ph ph-scales"></i>, name: "Amit Verma",      role: "Head of Claims"      },
    { avatar: <i className="ph ph-user-focus"></i>, name: "Sneha Patel",      role: "Chief Risk Officer"  },
  ];

  return (
    <LandingLayout>
      <div className="about-page">
        <div className="about-inner">
          {/* Page hero banner */}
          <div className="page-hero">
            <div className="page-hero-blob1" /><div className="page-hero-blob2" />
            <span className="page-hero-icon">ℹ️</span>
            <h1>About Crown Assurance</h1>
            <p>India's fastest-growing digital insurance company — built on trust, transparency, and technology.</p>
          </div>

          {/* Story */}
          <div className="about-grid">
            <div className="about-visual">
              <i className="about-visual-icon ph ph-trophy"></i>
              <div className="about-visual-title">Crown Assurance Pvt. &amp; Ltd.</div>
              <div className="about-visual-sub">Est. 2020 &bull; IRDAI Regulated &bull; ISO Certified</div>
            </div>
            <div className="about-text">
              <span className="section-badge">Our Story</span>
              <h2>Who We Are</h2>
              <p>Crown Assurance was founded in 2020 with a single mission: make insurance simple, digital, and accessible for every Indian. We combine cutting-edge technology with expert agents to deliver a seamless experience from purchase to claim settlement.</p>
              <p>We are IRDAI regulated, ISO 27001 certified, and committed to zero hidden charges — what you see is what you pay.</p>
              <div className="about-pills">
                {["IRDAI Registered","ISO 27001 Certified","Zero Hidden Charges","Paperless Onboarding","Instant Policy PDF"].map(t => (
                  <span className="about-pill" key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="team-section">
            <div className="team-header">
              <span className="section-badge">Leadership</span>
              <h2>Meet Our Team</h2>
              <p>The experts driving insurance innovation in India</p>
            </div>
            <div className="team-grid">
              {TEAM.map((m) => (
                <div className="team-card" key={m.name}>
                  <span className="team-avatar">{m.avatar}</span>
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="about-cta">
            <h2>Ready to Join the Crown Family?</h2>
            <p>Get insured in minutes — completely digital, completely transparent.</p>
            <button className="btn-about-cta" onClick={() => navigate("/register")}><i className="ph ph-rocket"></i> Create Free Account</button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default About;
