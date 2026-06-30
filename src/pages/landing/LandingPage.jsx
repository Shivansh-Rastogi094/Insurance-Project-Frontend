import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/LandingPage.css";

/* ─────────────────────────────────────────
   NAV links
   ───────────────────────────────────────── */
const NAV_LINKS = [
  { id: "home",     label: "Home" },
  { id: "about",    label: "About" },
  { id: "plans",    label: "Plans" },
  { id: "pricing",  label: "Pricing" },
  { id: "features", label: "Features" },
  { id: "claims",   label: "Claims" },
];

/* ─────────────────────────────────────────
   PLANS data (Revolut styled)
   ───────────────────────────────────────── */
const PLANS = [
  {
    name: "Term Life Gold",
    type: "Life Protection",
    coverage: "₹50 Lakh",
    premium: "₹8,000",
    period: "/yr",
    features: ["Comprehensive Death Benefit", "Critical Illness Cover", "Tax Benefits u/s 80C"],
    badge: "",
  },
  {
    name: "Health Shield Plus",
    type: "Health Protection",
    coverage: "₹10 Lakh",
    premium: "₹12,000",
    period: "/yr",
    features: ["Hospitalisation Cover", "Cashless Treatment", "Pre & Post Care"],
    badge: "Popular",
    featured: true,
  },
  {
    name: "Motor Protect Pro",
    type: "Asset Protection",
    coverage: "₹15 Lakh",
    premium: "₹5,500",
    period: "/yr",
    features: ["Own Damage Cover", "Third-Party Liability", "Roadside Assistance"],
    badge: "",
  },
  {
    name: "Platinum Life Shield",
    type: "Premium Protection",
    coverage: "₹1 Crore",
    premium: "₹22,000",
    period: "/yr",
    features: ["High-value Death Cover", "Accidental Disability", "Waiver of Premium"],
    badge: "Premium",
  },
];

/* ─────────────────────────────────────────
   PRICING data (Revolut styled)
   ───────────────────────────────────────── */
const PRICING = [
  {
    tier: "Basic",
    price: "₹499",
    period: "/mo",
    desc: "Perfect for individuals starting their insurance journey.",
    items: ["1 Active Policy Cover", "Standard Email Support", "Basic Claims Portal", "Secure OTP Login"],
    cta: "Get Started",
    featured: false,
  },
  {
    tier: "Standard",
    price: "₹1,299",
    period: "/mo",
    desc: "Ideal for families needing comprehensive protection.",
    items: ["Up to 3 Active Policies", "24/7 Priority Support", "Full Claims Portal with Uploads", "Dedicated Agent Assignment", "Instant Policy PDF"],
    cta: "Choose Standard",
    featured: true,
  },
  {
    tier: "Enterprise",
    price: "₹3,999",
    period: "/mo",
    desc: "For businesses requiring bulk coverage and admin tools.",
    items: ["Unlimited Policies", "Dedicated Agent & Manager", "Admin Dashboard access", "Analytics & Claim Reports", "Custom Agreement Terms"],
    cta: "Contact Sales",
    featured: false,
  },
];

/* ─────────────────────────────────────────
   FEATURES data (Revolut styled)
   ───────────────────────────────────────── */
const FEATURES = [
  { icon: <i className="ph ph-lock-key"></i>, title: "Secure OTP Login", desc: "Multi-factor authentication via email OTP ensures your policies and personal data remain fully protected." },
  { icon: <i className="ph ph-file-text"></i>, title: "Instant Issuance", desc: "Purchase policies and receive your official digital certificates in seconds — zero paperwork, zero delays." },
  { icon: <i className="ph ph-lightning"></i>, title: "Fast Claims Processing", desc: "Submit claim details and upload supporting documents directly. Track verification status in real-time." },
  { icon: <i className="ph ph-user-tie"></i>, title: "Dedicated Agents", desc: "Every customer is assigned a licensed insurance agent for personalized guidance, reviews, and claims support." },
  { icon: <i className="ph ph-chart-bar"></i>, title: "Role-Based Dashboards", desc: "Tailored interfaces for Customers, Agents, and Administrators with live data, analytics, and action items." },
  { icon: <i className="ph ph-palette"></i>, title: "Premium Dark Theme", desc: "A sleek, modern interface designed for high legibility and comfort across all devices." },
];

/* ─────────────────────────────────────────
   CLAIMS steps (Revolut styled)
   ───────────────────────────────────────── */
const CLAIM_STEPS = [
  { step: "01", icon: <i className="ph ph-file-text"></i>, title: "File a Claim", desc: "Log in, select your active policy, and submit the online claim form with incident details." },
  { step: "02", icon: <i className="ph ph-paperclip"></i>, title: "Upload Docs", desc: "Attach receipts, medical reports, or damage photos directly from your smartphone or PC." },
  { step: "03", icon: <i className="ph ph-magnifying-glass"></i>, title: "Agent Review", desc: "Your assigned agent reviews the documents and submits their recommendation within 48 hours." },
  { step: "04", icon: <i className="ph ph-check-circle"></i>, title: "Instant Decision", desc: "The Administrator makes the final decision. Once approved, funds are disbursed immediately." },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const isScrollingRef = useRef(false);

  // Track scroll for navbar color transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer to highlight active nav link on scroll
  useEffect(() => {
    const observers = [];
    
    NAV_LINKS.forEach((link) => {
      const el = document.getElementById(link.id);
      if (!el) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Only update active section if the user is scrolling naturally, 
            // not during a programmatic click scroll
            if (entry.isIntersecting && !isScrollingRef.current) {
              setActiveSection(link.id);
            }
          });
        },
        {
          rootMargin: "-20% 0px -60% 0px", // Trigger when section occupies the main viewport area
        }
      );
      
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Scroll to section when URL path changes (e.g. on direct entry or route change)
  useEffect(() => {
    let sectionId = "home";
    if (location.pathname === "/about") sectionId = "about";
    else if (location.pathname === "/plans") sectionId = "plans";
    else if (location.pathname === "/pricing") sectionId = "pricing";
    else if (location.pathname === "/features") sectionId = "features";
    else if (location.pathname === "/claims-info") sectionId = "claims";

    const el = document.getElementById(sectionId);
    if (el) {
      isScrollingRef.current = true;
      setActiveSection(sectionId);
      
      // Perform scroll
      const offset = 64; // Navbar height
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: location.pathname === "/" ? "auto" : "smooth"
      });

      // Release scroll lock after transition
      const timer = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleNavClick = (id) => {
    setMenuOpen(false);
    
    // Update route path based on the clicked section
    if (id === "home") {
      navigate("/");
    } else if (id === "claims") {
      navigate("/claims-info");
    } else {
      navigate(`/${id}`);
    }
  };

  return (
    <div className="rev-landing">
      {/* ══════════ NAVBAR ══════════ */}
      <nav className={`rev-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="rev-nav-inner">
          {/* Logo */}
          <a className="rev-nav-logo" onClick={() => handleNavClick("home")}>
            <div className="rev-logo-glyph">C</div>
            <span>Crown Assurance</span>
          </a>

          {/* Menu Links */}
          <ul className="rev-nav-menu">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  className={`rev-nav-link ${activeSection === link.id ? "active" : ""}`}
                  onClick={() => handleNavClick(link.id)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="rev-nav-actions">
            <a className="rev-nav-login" onClick={() => navigate("/login")}>
              Log in
            </a>
            <button className="rev-btn rev-btn-sm rev-btn-primary" onClick={() => navigate("/register")}>
              Get started
            </button>
            <button className="rev-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="rev-mobile-overlay">
          <ul className="rev-mobile-menu">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  className="rev-mobile-link"
                  onClick={() => handleNavClick(link.id)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="rev-mobile-actions">
            <button className="rev-btn rev-btn-lg rev-btn-outline-dark" onClick={() => navigate("/login")}>
              Log in
            </button>
            <button className="rev-btn rev-btn-lg rev-btn-brand" onClick={() => navigate("/register")}>
              Get started
            </button>
          </div>
        </div>
      )}

      {/* ══════════ HERO SECTION (Dark Canvas) ══════════ */}
      <section id="home" className="rev-hero">
        <div className="rev-container">
          <div className="rev-hero-grid">
            <div className="rev-hero-text">
              <span className="rev-hero-badge">🛡️ IRDAI Registered &amp; Fully Secure</span>
              <h1 className="rev-display-xxl rev-hero-title">
                Insurance.<br />
                <span>Beyond.</span>
              </h1>
              <p className="rev-body-lg rev-hero-sub">
                Ditch the paperwork. Crown Assurance delivers instant digital policies, automated claims, and expert dedicated agents in one seamless platform.
              </p>
              <div className="rev-hero-ctas">
                <button className="rev-btn rev-btn-lg rev-btn-primary" onClick={() => navigate("/register")}>
                  Get started free
                </button>
                <button className="rev-btn rev-btn-lg rev-btn-outline-dark" onClick={() => handleNavClick("plans")}>
                  Browse plans
                </button>
              </div>
              <div className="rev-hero-stats">
                <div className="rev-stat-item">
                  <span className="rev-stat-val">₹500Cr+</span>
                  <span className="rev-stat-lbl">Claims Settled</span>
                </div>
                <div className="rev-stat-item">
                  <span className="rev-stat-val">100k+</span>
                  <span className="rev-stat-lbl">Active Policies</span>
                </div>
                <div className="rev-stat-item">
                  <span className="rev-stat-val">99.8%</span>
                  <span className="rev-stat-lbl">Settlement Rate</span>
                </div>
              </div>
            </div>

            {/* Smartphone CSS Mockup */}
            <div className="rev-hero-visual">
              <div className="rev-phone-container">
                <div className="rev-phone-notch"></div>
                <div className="rev-phone-screen">
                  <div className="rev-phone-header">
                    <div className="rev-phone-profile">JD</div>
                    <i className="rev-phone-bell ph ph-bell"></i>
                  </div>
                  
                  <div className="rev-phone-balance-section">
                    <span className="rev-phone-bal-lbl">Active Coverage Value</span>
                    <h2 className="rev-phone-bal-val">₹1.50 Cr</h2>
                  </div>

                  <div className="rev-phone-card-preview">
                    <span className="rev-phone-card-type">Health Shield Plus</span>
                    <div className="rev-phone-card-number">•••• •••• •••• 9823</div>
                    <div className="rev-phone-card-footer">
                      <span className="rev-phone-card-status">● Active</span>
                      <span className="rev-phone-logo">🛡️</span>
                    </div>
                  </div>

                  <div className="rev-phone-actions-grid">
                    <button className="rev-phone-action-btn" onClick={() => navigate("/login")}>
                      <span><i className="ph ph-plus"></i></span> Buy Policy
                    </button>
                    <button className="rev-phone-action-btn" onClick={() => navigate("/login")}>
                      <span><i className="ph ph-credit-card"></i></span> Pay Premium
                    </button>
                  </div>

                  <div className="rev-phone-quick-claim">
                    <div className="rev-phone-qc-text">
                      <span className="rev-phone-qc-title">Need to claim?</span>
                      <span className="rev-phone-qc-desc">File digitally in 4 steps</span>
                    </div>
                    <div className="rev-phone-qc-go" onClick={() => navigate("/login")}>→</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT SECTION (Light Canvas) ══════════ */}
      <section id="about" className="rev-band-light">
        <div className="rev-container">
          <div className="rev-about-layout">
            <div className="rev-about-graphic">
              <div className="rev-badge-strip">
                <div className="rev-badge-strip-icon">🏛️</div>
                <div>
                  <div className="rev-badge-strip-title">IRDAI Regulated</div>
                  <div className="rev-badge-strip-sub">Registration No. CA-2020-001</div>
                </div>
              </div>
              <div className="rev-badge-strip">
                <div className="rev-badge-strip-icon"><i className="ph ph-lock-key"></i></div>
                <div>
                  <div className="rev-badge-strip-title">ISO 27001 Certified</div>
                  <div className="rev-badge-strip-sub">Fintech-grade data encryption</div>
                </div>
              </div>
              <div className="rev-badge-strip">
                <div className="rev-badge-strip-icon"><i className="ph ph-device-mobile"></i></div>
                <div>
                  <div className="rev-badge-strip-title">100% Digital Experience</div>
                  <div className="rev-badge-strip-sub">Zero physical paperwork required</div>
                </div>
              </div>
            </div>

            <div className="rev-about-text">
              <span className="rev-section-tag">Who we are</span>
              <h2 className="rev-display-lg">Reimagining protection for the digital age.</h2>
              <p className="rev-body-lg">
                Crown Assurance is India's premier digital-first insurer. Established in 2020, we combine cutting-edge technology with regulatory trust to make insurance simple, transparent, and instantly accessible.
              </p>
              <p className="rev-body-md">
                We believe you should have absolute control over your financial protection. Our unified web portal allows you to purchase tailor-made policies, schedule payments, and upload claim documents in seconds — all under the guidance of a dedicated, expert agent assigned specifically to you.
              </p>
              <div className="rev-about-pills">
                <span className="rev-pill-tag">No Hidden Fees</span>
                <span className="rev-pill-tag">Paperless Onboarding</span>
                <span className="rev-pill-tag">Instant Policy PDFs</span>
                <span className="rev-pill-tag">Dedicated Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PLANS SECTION (Dark Canvas) ══════════ */}
      <section id="plans" className="rev-band-dark">
        <div className="rev-container">
          <div className="rev-section-header">
            <span className="rev-section-tag">Our Plans</span>
            <h2 className="rev-display-lg">Coverage tailored to your lifestyle.</h2>
            <p className="rev-body-lg">Select from our range of comprehensive policies designed to protect what matters most.</p>
          </div>

          <div className="rev-plans-grid">
            {PLANS.map((plan) => (
              <div className={`rev-plan-card ${plan.featured ? "featured" : ""}`} key={plan.name}>
                {plan.badge && <span className="rev-plan-badge">{plan.badge}</span>}
                <div className="rev-plan-top">
                  <span className="rev-plan-name">{plan.name}</span>
                  <span className="rev-plan-type">{plan.type}</span>
                  <h3 className="rev-plan-coverage">{plan.coverage}</h3>
                  <span className="rev-plan-coverage-lbl">Max Coverage Limit</span>
                  
                  <ul className="rev-plan-features">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="rev-plan-bottom">
                  <div className="rev-plan-premium">
                    {plan.premium}
                    <span>{plan.period}</span>
                  </div>
                  <button 
                    className={`rev-btn rev-btn-md ${plan.featured ? "rev-btn-primary" : "rev-btn-outline-dark"}`}
                    onClick={() => navigate("/register")}
                  >
                    Buy now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRICING SECTION (Light Canvas) ══════════ */}
      <section id="pricing" className="rev-band-light">
        <div className="rev-container">
          <div className="rev-section-header rev-header-light">
            <span className="rev-section-tag">Pricing</span>
            <h2 className="rev-display-lg">Simple, transparent pricing.</h2>
            <p className="rev-body-lg">Choose a subscription tier that matches your frequency and protection scale. No hidden fees.</p>
          </div>

          <div className="rev-pricing-grid">
            {PRICING.map((price) => (
              <div className={`rev-pricing-card ${price.featured ? "featured" : ""}`} key={price.tier}>
                {price.featured && <span className="rev-pricing-popular-badge">Most Popular</span>}
                <div className="rev-pricing-top">
                  <span className="rev-pricing-tier">{price.tier}</span>
                  <h3 className="rev-pricing-price">
                    {price.price}
                    <span>{price.period}</span>
                  </h3>
                  <p className="rev-pricing-desc">{price.desc}</p>
                  
                  <ul className="rev-pricing-features">
                    {price.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <button 
                  className={`rev-btn rev-btn-lg ${price.featured ? "rev-btn-brand" : "rev-btn-soft"}`}
                  onClick={() => navigate("/register")}
                >
                  {price.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES SECTION (Dark Canvas) ══════════ */}
      <section id="features" className="rev-band-dark">
        <div className="rev-container">
          <div className="rev-section-header">
            <span className="rev-section-tag">Features</span>
            <h2 className="rev-display-lg">Everything you need, in one place.</h2>
            <p className="rev-body-lg">Explore the tools and capabilities that make Crown Assurance a smarter insurance platform.</p>
          </div>

          <div className="rev-features-grid">
            {FEATURES.map((feat) => (
              <div className="rev-feature-card" key={feat.title}>
                <div className="rev-feature-icon">{feat.icon}</div>
                <h3 className="rev-feature-title">{feat.title}</h3>
                <p className="rev-feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CLAIMS SECTION (Light Canvas) ══════════ */}
      <section id="claims" className="rev-band-light">
        <div className="rev-container">
          <div className="rev-section-header rev-header-light">
            <span className="rev-section-tag">Claims</span>
            <h2 className="rev-display-lg">Claims made simple.</h2>
            <p className="rev-body-lg">Our fully digital, four-step verification process ensures rapid approvals without the stress.</p>
          </div>

          <div className="rev-claims-steps">
            {CLAIM_STEPS.map((step) => (
              <div className="rev-claim-step" key={step.step}>
                <div className="rev-claim-num">{step.step}</div>
                <div className="rev-claim-icon">{step.icon}</div>
                <h3 className="rev-claim-title">{step.title}</h3>
                <p className="rev-claim-desc">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="rev-claims-cta-box">
            <button className="rev-btn rev-btn-lg rev-btn-brand" onClick={() => navigate("/register")}>
              🛡️ Start your claim journey
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER (Dark Canvas) ══════════ */}
      <footer className="rev-footer">
        <div className="rev-container">
          <div className="rev-footer-grid">
            <div className="rev-footer-info">
              <div className="rev-footer-logo">
                <div className="rev-logo-glyph">C</div>
                <span>Crown Assurance</span>
              </div>
              <p className="rev-footer-desc">
                India's smartest digital insurance platform. Delivering trust, efficiency, and round-the-clock peace of mind.
              </p>
            </div>
            <div className="rev-footer-col">
              <h4>Products</h4>
              <ul className="rev-footer-links">
                <li><a onClick={() => handleNavClick("plans")}>Life Protection</a></li>
                <li><a onClick={() => handleNavClick("plans")}>Health Shield</a></li>
                <li><a onClick={() => handleNavClick("plans")}>Motor Protect</a></li>
              </ul>
            </div>
            <div className="rev-footer-col">
              <h4>Company</h4>
              <ul className="rev-footer-links">
                <li><a onClick={() => handleNavClick("about")}>About Us</a></li>
                <li><a onClick={() => handleNavClick("features")}>Features</a></li>
                <li><a onClick={() => handleNavClick("pricing")}>Pricing</a></li>
              </ul>
            </div>
            <div className="rev-footer-col">
              <h4>Legal</h4>
              <ul className="rev-footer-links">
                <li><a onClick={() => navigate("/login")}>Privacy Policy</a></li>
                <li><a onClick={() => navigate("/login")}>Terms of Service</a></li>
                <li><a onClick={() => navigate("/login")}>IRDAI Disclosures</a></li>
              </ul>
            </div>
          </div>

          <div className="rev-footer-bottom">
            <p className="rev-footer-legal">
              Disclaimer: Insurance is the subject matter of solicitation. Crown Assurance Pvt. &amp; Ltd. is a registered corporate agent under IRDAI License No. CA-2020-001. All insurance products are underwritten by respective partner insurance companies. For more details on risk factors, terms and conditions, please read the sales brochure carefully before concluding a sale.
            </p>
            <p className="rev-footer-copy">
              © {new Date().getFullYear()} Crown Assurance Pvt. &amp; Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
