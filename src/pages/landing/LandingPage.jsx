import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   Dark-mode: write data-theme on <html>
   so ALL pages / components inherit it
───────────────────────────────────────── */
const useDarkMode = () => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return [dark, setDark];
};

/* ─────────────────────────────────────────
   NAV links
───────────────────────────────────────── */
const NAV_LINKS = [
  { id: "home",     label: "Home",     icon: "🏠" },
  { id: "about",    label: "About",    icon: "ℹ️" },
  { id: "plans",    label: "Plans",    icon: "📋" },
  { id: "pricing",  label: "Pricing",  icon: "💰" },
  { id: "features", label: "Features", icon: "✨" },
  { id: "claims",   label: "Claims",   icon: "🛡️" },
  { id: "contact",  label: "Contact",  icon: "📞" },
];

/* ─────────────────────────────────────────
   PLANS data
───────────────────────────────────────── */
const PLANS = [
  {
    name: "Term Life Gold",
    type: "LIFE",
    coverage: "₹50,00,000",
    premium: "₹8,000/yr",
    features: ["Death Benefit", "Critical Illness Cover", "Tax Benefits u/s 80C"],
    badge: "",
  },
  {
    name: "Health Shield Plus",
    type: "HEALTH",
    coverage: "₹10,00,000",
    premium: "₹12,000/yr",
    features: ["Hospitalisation Cover", "Cashless Treatment", "Pre & Post Hospitalisation"],
    badge: "🔥 Popular",
  },
  {
    name: "Motor Protect Pro",
    type: "MOTOR",
    coverage: "₹15,00,000",
    premium: "₹5,500/yr",
    features: ["Own Damage Cover", "Third-Party Liability", "Roadside Assistance"],
    badge: "",
  },
  {
    name: "Platinum Life Shield",
    type: "LIFE",
    coverage: "₹1,00,00,000",
    premium: "₹22,000/yr",
    features: ["Comprehensive Death Benefit", "Accidental Disability", "Waiver of Premium"],
    badge: "⭐ Premium",
  },
];

/* ─────────────────────────────────────────
   PRICING data
───────────────────────────────────────── */
const PRICING = [
  {
    tier: "Basic",
    price: "₹499",
    period: "/month",
    desc: "Perfect for individuals starting their insurance journey.",
    color: "#2563A8",
    items: ["1 Policy Coverage", "Email Support", "Basic Claims Portal", "OTP Verification"],
    cta: "Get Started",
  },
  {
    tier: "Standard",
    price: "₹1,299",
    period: "/month",
    desc: "Ideal for families needing comprehensive protection.",
    color: "#0FA89E",
    popular: true,
    items: ["Up to 3 Policies", "Priority Support", "Full Claims Portal", "Document Upload", "Agent Assignment"],
    cta: "Most Popular",
  },
  {
    tier: "Enterprise",
    price: "₹3,999",
    period: "/month",
    desc: "For businesses requiring bulk coverage and admin tools.",
    color: "#F59E0B",
    items: ["Unlimited Policies", "Dedicated Agent", "Admin Dashboard", "Analytics & Reports", "Custom Terms"],
    cta: "Contact Sales",
  },
];

/* ─────────────────────────────────────────
   FEATURES data
───────────────────────────────────────── */
const FEATURES = [
  { icon: "🔐", title: "Secure OTP Login", desc: "Multi-factor authentication with email OTP ensures only you access your account." },
  { icon: "📄", title: "Instant Policy Issuance", desc: "Purchase or receive a policy in seconds — no paperwork, fully digital." },
  { icon: "⚡", title: "Fast Claims Processing", desc: "File claims with document uploads and track status in real-time." },
  { icon: "👨‍💼", title: "Dedicated Agents", desc: "Every customer gets a personal insurance agent for guidance and reviews." },
  { icon: "📊", title: "Smart Dashboard", desc: "Role-based dashboards for Customers, Agents, and Admins with live data." },
  { icon: "🌙", title: "Dark Mode Support", desc: "Switch between light and dark themes for comfortable viewing anytime." },
];

/* ─────────────────────────────────────────
   CLAIMS steps
───────────────────────────────────────── */
const CLAIM_STEPS = [
  { step: "01", icon: "📝", title: "File a Claim", desc: "Log in, select your policy, and fill out the claim form with incident details." },
  { step: "02", icon: "📎", title: "Upload Documents", desc: "Attach supporting documents (photos, reports, certificates) directly from your device." },
  { step: "03", icon: "🔍", title: "Agent Review", desc: "Your assigned agent verifies documents and submits a recommendation within 48 hours." },
  { step: "04", icon: "✅", title: "Admin Decision", desc: "Admin approves or rejects the claim. You get notified instantly via email." },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver to highlight active nav link
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.id);
    const observers = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (id === "contact") {
      navigate("/register");
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  /* ── inline styles string ── */
  const css = `
    /* ── Reset & Base ── */
    .lp-root { font-family: var(--font-body); background: var(--surface); color: var(--text-primary); }

    /* ── NAVBAR ── */
    .lp-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: var(--nav-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--nav-border);
      transition: box-shadow 0.3s ease, background 0.3s ease;
    }
    .lp-nav.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
    .lp-nav-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 24px;
      height: 64px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .lp-brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; flex-shrink: 0;
    }
    .lp-brand-icon { font-size: 26px; }
    .lp-brand-name {
      font-size: 15px; font-weight: 800; color: var(--text-primary);
      letter-spacing: -0.3px; line-height: 1.15;
    }
    .lp-brand-sub { font-size: 9px; font-weight: 500; color: var(--text-secondary); display: block; letter-spacing: 0.05em; }

    .lp-nav-links {
      display: flex; align-items: center; gap: 2px; list-style: none;
    }
    .lp-nav-links a {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 11px; border-radius: 6px;
      font-size: 13px; font-weight: 500; color: var(--text-secondary);
      text-decoration: none; cursor: pointer;
      transition: color 0.2s ease, background 0.2s ease;
      white-space: nowrap;
    }
    .lp-nav-links a:hover, .lp-nav-links a.active {
      color: var(--primary-light); background: rgba(37,99,168,0.08);
    }
    .lp-nav-links a .nav-icon { font-size: 14px; }

    .lp-nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .btn-ghost {
      padding: 8px 16px; border-radius: var(--radius-button);
      font-size: 13px; font-weight: 600; font-family: inherit;
      color: var(--primary-light); background: transparent;
      border: 1.5px solid var(--primary-light);
      cursor: pointer; transition: all 0.2s ease;
    }
    .btn-ghost:hover { background: rgba(37,99,168,0.1); }

    .btn-primary-nav {
      padding: 8px 18px; border-radius: var(--radius-button);
      font-size: 13px; font-weight: 600; font-family: inherit;
      color: #fff; background: var(--primary-light);
      border: none; cursor: pointer;
      transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(37,99,168,0.3);
    }
    .btn-primary-nav:hover { background: var(--primary); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,168,0.4); }

    /* Dark mode toggle */
    .theme-toggle {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: var(--card); border: 1.5px solid var(--border);
      font-size: 16px; cursor: pointer;
      transition: all 0.2s ease; flex-shrink: 0;
    }
    .theme-toggle:hover { border-color: var(--accent); transform: rotate(20deg); }

    /* Hamburger */
    .lp-hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 4px;
    }
    .lp-hamburger span {
      display: block; width: 22px; height: 2px; border-radius: 2px;
      background: var(--text-primary); transition: all 0.3s ease;
    }

    /* Mobile menu */
    .lp-mobile-menu {
      display: none; flex-direction: column;
      background: var(--nav-bg); border-top: 1px solid var(--nav-border);
      padding: 12px 24px 20px;
    }
    .lp-mobile-menu.open { display: flex; }
    .lp-mobile-menu a {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 0; font-size: 14px; font-weight: 500;
      color: var(--text-secondary); text-decoration: none; cursor: pointer;
      border-bottom: 1px solid var(--border); transition: color 0.2s;
    }
    .lp-mobile-menu a:last-of-type { border-bottom: none; }
    .lp-mobile-menu a:hover, .lp-mobile-menu a.active { color: var(--primary-light); }
    .lp-mobile-actions { display: flex; gap: 10px; margin-top: 14px; }
    .lp-mobile-actions .btn-ghost,
    .lp-mobile-actions .btn-primary-nav { flex: 1; text-align: center; }

    @media (max-width: 900px) {
      .lp-nav-links { display: none; }
      .lp-hamburger { display: flex; }
      .lp-nav-actions .btn-ghost,
      .lp-nav-actions .btn-primary-nav { display: none; }
    }

    /* ── SECTIONS common ── */
    .lp-section { padding: 90px 24px; }
    .lp-section-inner { max-width: 1100px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 56px; }
    .section-badge {
      display: inline-block; padding: 4px 14px; border-radius: var(--radius-badge);
      font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      background: rgba(15,168,158,0.12); color: var(--accent); margin-bottom: 12px;
    }
    .section-header h2 { font-size: clamp(26px,4vw,40px); font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; margin-bottom: 12px; }
    .section-header p { font-size: 16px; color: var(--text-secondary); max-width: 560px; margin: 0 auto; line-height: 1.65; }

    /* ── HERO ── */
    #home {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: var(--hero-bg);
      padding: 100px 24px 60px;
      text-align: center; position: relative; overflow: hidden;
    }
    .hero-blob {
      position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; pointer-events: none;
    }
    .blob1 { width: 500px; height: 500px; background: #0FA89E; top: -100px; left: -100px; }
    .blob2 { width: 400px; height: 400px; background: #2563A8; bottom: -80px; right: -80px; }
    .hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 16px; border-radius: 999px;
      border: 1px solid rgba(15,168,158,0.4); background: rgba(15,168,158,0.08);
      font-size: 12px; font-weight: 600; color: #0FA89E; margin-bottom: 24px;
    }
    .hero-title {
      font-size: clamp(36px, 6vw, 72px); font-weight: 800; letter-spacing: -1.5px;
      color: #fff; line-height: 1.05; margin-bottom: 20px;
    }
    .hero-title .gradient-text {
      background: linear-gradient(90deg, #0FA89E, #60A5FA);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero-sub {
      font-size: 17px; color: rgba(255,255,255,0.72); max-width: 580px;
      margin: 0 auto 36px; line-height: 1.7;
    }
    .hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .btn-hero-primary {
      padding: 14px 32px; border-radius: var(--radius-button);
      font-size: 15px; font-weight: 700; font-family: inherit;
      background: linear-gradient(135deg, #0FA89E, #2563A8);
      color: #fff; border: none; cursor: pointer;
      box-shadow: 0 8px 24px rgba(15,168,158,0.35);
      transition: all 0.25s ease;
    }
    .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(15,168,158,0.45); }
    .btn-hero-ghost {
      padding: 14px 32px; border-radius: var(--radius-button);
      font-size: 15px; font-weight: 700; font-family: inherit;
      background: rgba(255,255,255,0.08); color: #fff;
      border: 1.5px solid rgba(255,255,255,0.25); cursor: pointer;
      backdrop-filter: blur(8px); transition: all 0.25s ease;
    }
    .btn-hero-ghost:hover { background: rgba(255,255,255,0.14); transform: translateY(-2px); }
    .hero-stats {
      display: flex; justify-content: center; gap: 48px; margin-top: 56px; flex-wrap: wrap;
    }
    .hero-stat { text-align: center; }
    .hero-stat-val { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .hero-stat-lbl { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 3px; font-weight: 500; }

    /* ── ABOUT ── */
    #about { background: var(--surface); }
    .about-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
    }
    @media(max-width:768px){ .about-grid { grid-template-columns: 1fr; gap: 36px; } }
    .about-visual {
      background: var(--hero-bg);
      border-radius: 20px; padding: 48px 36px; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .about-visual-icon { font-size: 80px; display: block; margin-bottom: 16px; }
    .about-visual-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .about-visual-sub { font-size: 14px; color: rgba(255,255,255,0.65); }
    .about-text h2 { font-size: 32px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; letter-spacing: -0.5px; }
    .about-text p { font-size: 15px; color: var(--text-secondary); line-height: 1.75; margin-bottom: 14px; }
    .about-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
    .about-pill {
      padding: 5px 14px; border-radius: 999px;
      background: rgba(37,99,168,0.1); color: var(--primary-light);
      font-size: 12px; font-weight: 600; border: 1px solid rgba(37,99,168,0.2);
    }

    /* ── PLANS ── */
    #plans { background: var(--section-alt); }
    .plans-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;
    }
    .plan-card {
      background: var(--card); border-radius: 16px; padding: 28px;
      border: 1px solid var(--border);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      position: relative; overflow: hidden;
    }
    .plan-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--primary-light), var(--accent));
    }
    .plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .plan-badge-tag {
      display: inline-block; font-size: 11px; font-weight: 700;
      padding: 3px 10px; border-radius: 999px; margin-bottom: 12px;
      background: rgba(15,168,158,0.12); color: var(--accent);
    }
    .plan-type-tag {
      display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
      padding: 2px 8px; border-radius: 4px; margin-left: 6px;
      background: rgba(37,99,168,0.1); color: var(--primary-light);
    }
    .plan-name { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
    .plan-coverage { font-size: 26px; font-weight: 800; color: var(--primary-light); margin: 12px 0 4px; }
    .plan-coverage-lbl { font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; }
    .plan-features { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .plan-features li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .plan-features li::before { content: "✓"; color: var(--accent); font-weight: 700; flex-shrink: 0; }
    .plan-premium { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .plan-premium span { font-size: 12px; font-weight: 400; color: var(--text-secondary); }
    .btn-plan {
      width: 100%; margin-top: 16px; padding: 10px;
      border-radius: var(--radius-button); font-size: 13px; font-weight: 600; font-family: inherit;
      background: rgba(37,99,168,0.08); color: var(--primary-light);
      border: 1.5px solid rgba(37,99,168,0.25); cursor: pointer; transition: all 0.2s ease;
    }
    .btn-plan:hover { background: var(--primary-light); color: #fff; border-color: var(--primary-light); }

    /* ── PRICING ── */
    #pricing { background: var(--surface); }
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .pricing-card {
      background: var(--card); border-radius: 20px; padding: 36px 28px;
      border: 1px solid var(--border); position: relative;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .pricing-card.popular {
      border: 2px solid var(--accent);
      box-shadow: 0 0 0 4px rgba(15,168,158,0.1);
      transform: scale(1.03);
    }
    .pricing-card:hover:not(.popular) { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.09); }
    .popular-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: var(--accent); color: #fff;
      font-size: 11px; font-weight: 700; padding: 3px 14px; border-radius: 999px; white-space: nowrap;
    }
    .pricing-tier { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; }
    .pricing-price { font-size: 42px; font-weight: 800; color: var(--text-primary); letter-spacing: -1px; }
    .pricing-period { font-size: 14px; font-weight: 400; color: var(--text-secondary); }
    .pricing-desc { font-size: 13px; color: var(--text-secondary); margin: 10px 0 20px; line-height: 1.55; }
    .pricing-items { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
    .pricing-items li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .pricing-items li::before { content: "✓"; font-weight: 700; flex-shrink: 0; }
    .btn-pricing {
      width: 100%; padding: 12px; border-radius: var(--radius-button);
      font-size: 14px; font-weight: 700; font-family: inherit;
      cursor: pointer; transition: all 0.2s ease;
    }
    .btn-pricing-outline {
      background: transparent; color: var(--primary-light);
      border: 2px solid var(--primary-light);
    }
    .btn-pricing-outline:hover { background: var(--primary-light); color: #fff; }
    .btn-pricing-filled {
      background: linear-gradient(135deg, #0FA89E, #2563A8);
      color: #fff; border: none;
      box-shadow: 0 4px 14px rgba(15,168,158,0.3);
    }
    .btn-pricing-filled:hover { box-shadow: 0 8px 24px rgba(15,168,158,0.45); transform: translateY(-1px); }

    /* ── FEATURES ── */
    #features { background: var(--section-alt); }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .feature-card {
      background: var(--card); border-radius: 16px; padding: 28px;
      border: 1px solid var(--border); display: flex; gap: 16px; align-items: flex-start;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }
    .feature-icon-wrap {
      width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
      background: linear-gradient(135deg, rgba(15,168,158,0.15), rgba(37,99,168,0.15));
      display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .feature-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
    .feature-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }

    /* ── CLAIMS ── */
    #claims { background: var(--surface); }
    .claims-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; }
    .claim-step { text-align: center; position: relative; }
    .claim-step-num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-light), var(--accent));
      color: #fff; font-size: 14px; font-weight: 800;
      margin: 0 auto 14px; box-shadow: 0 6px 16px rgba(37,99,168,0.3);
    }
    .claim-step-icon { font-size: 32px; display: block; margin-bottom: 10px; }
    .claim-step-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .claim-step-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; max-width: 220px; margin: 0 auto; }
    .claims-cta { text-align: center; margin-top: 48px; }
    .btn-claims-cta {
      padding: 14px 36px; border-radius: var(--radius-button);
      font-size: 15px; font-weight: 700; font-family: inherit;
      background: linear-gradient(135deg, #1A3C5E, #0FA89E);
      color: #fff; border: none; cursor: pointer;
      box-shadow: 0 8px 24px rgba(26,60,94,0.3); transition: all 0.25s ease;
    }
    .btn-claims-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(26,60,94,0.4); }

    /* ── CONTACT BANNER (redirects to register) ── */
    #contact {
      background: var(--hero-bg);
      padding: 80px 24px; text-align: center;
    }
    .contact-inner { max-width: 640px; margin: 0 auto; }
    .contact-icon { font-size: 56px; display: block; margin-bottom: 16px; }
    .contact-title { font-size: clamp(24px,4vw,40px); font-weight: 800; color: #fff; margin-bottom: 12px; letter-spacing: -0.5px; }
    .contact-sub { font-size: 16px; color: rgba(255,255,255,0.7); margin-bottom: 32px; line-height: 1.65; }
    .btn-contact {
      padding: 14px 36px; border-radius: var(--radius-button);
      font-size: 15px; font-weight: 700; font-family: inherit;
      background: #fff; color: var(--primary);
      border: none; cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15); transition: all 0.25s ease;
    }
    .btn-contact:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0,0,0,0.25); background: #f0f9ff; }

    /* ── FOOTER ── */
    .lp-footer {
      background: var(--sidebar-bg);
      color: var(--sidebar-text);
      padding: 36px 24px; text-align: center;
    }
    .lp-footer-brand { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .lp-footer-copy { font-size: 12px; color: rgba(203,213,225,0.6); }
    .lp-footer-links { display: flex; justify-content: center; gap: 24px; margin: 14px 0; flex-wrap: wrap; }
    .lp-footer-links a { font-size: 13px; color: var(--sidebar-text); text-decoration: none; cursor: pointer; transition: color 0.2s; }
    .lp-footer-links a:hover { color: var(--accent); }

    /* ── scroll offset for fixed nav ── */
    section[id] { scroll-margin-top: 64px; }
  `;

  return (
    <div className="lp-root">
      <style>{css}</style>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
        <div className="lp-nav-inner">
          {/* Brand */}
          <a className="lp-brand" onClick={() => scrollTo("home")}>
            <span className="lp-brand-icon">🛡️</span>
            <span className="lp-brand-name">
              Crown Assurance
              <span className="lp-brand-sub">Pvt. &amp; Ltd.</span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="lp-nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  className={activeSection === l.id ? "active" : ""}
                  onClick={() => scrollTo(l.id)}
                >
                  <span className="nav-icon">{l.icon}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="lp-nav-actions">
            <button className="theme-toggle" onClick={() => setDark(!dark)} title={dark ? "Light mode" : "Dark mode"}>
              {dark ? "☀️" : "🌙"}
            </button>
            <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="btn-primary-nav" onClick={() => navigate("/register")}>Register</button>
            <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lp-mobile-menu${menuOpen ? " open" : ""}`}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              className={activeSection === l.id ? "active" : ""}
              onClick={() => scrollTo(l.id)}
            >
              <span>{l.icon}</span> {l.label}
            </a>
          ))}
          <div className="lp-mobile-actions">
            <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="btn-primary-nav" onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section id="home">
        <div className="hero-blob blob1" />
        <div className="hero-blob blob2" />
        <div className="hero-content">
          <div className="hero-badge">✨ Trusted by 1,00,000+ customers</div>
          <h1 className="hero-title">
            India's Smartest<br />
            <span className="gradient-text">Insurance Platform</span>
          </h1>
          <p className="hero-sub">
            Crown Assurance Pvt. &amp; Ltd. — Secure your life, health, and assets
            with AI-powered policy management, instant claims, and dedicated agents.
          </p>
          <div className="hero-btns">
            <button className="btn-hero-primary" onClick={() => navigate("/register")}>
              🚀 Get Started Free
            </button>
            <button className="btn-hero-ghost" onClick={() => scrollTo("plans")}>
              📋 Browse Plans
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-val">₹500Cr+</div><div className="hero-stat-lbl">Claims Settled</div></div>
            <div className="hero-stat"><div className="hero-stat-val">1L+</div><div className="hero-stat-lbl">Happy Customers</div></div>
            <div className="hero-stat"><div className="hero-stat-val">99.8%</div><div className="hero-stat-lbl">Claim Approval</div></div>
            <div className="hero-stat"><div className="hero-stat-val">24/7</div><div className="hero-stat-lbl">Agent Support</div></div>
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section id="about" className="lp-section">
        <div className="lp-section-inner">
          <div className="about-grid">
            <div className="about-visual">
              <span className="about-visual-icon">🏆</span>
              <div className="about-visual-title">Crown Assurance Pvt. &amp; Ltd.</div>
              <div className="about-visual-sub">Est. 2020 &bull; IRDAI Regulated &bull; ISO Certified</div>
            </div>
            <div className="about-text">
              <h2>Who We Are</h2>
              <p>
                Crown Assurance is India's fastest-growing digital insurance company,
                offering life, health, and motor insurance products built for the
                modern generation. We combine technology and trust to make insurance
                simple, transparent, and accessible.
              </p>
              <p>
                Our platform gives customers full control — from buying a policy and
                recording payments to filing claims with supporting documents — all
                in one place, from any device.
              </p>
              <div className="about-pills">
                {["IRDAI Registered","ISO 27001 Certified","Zero Hidden Charges","Paperless Onboarding","Instant Policy PDF"].map(t => (
                  <span className="about-pill" key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PLANS ══════════ */}
      <section id="plans" className="lp-section">
        <div className="lp-section-inner">
          <div className="section-header">
            <span className="section-badge">Our Plans</span>
            <h2>Coverage for Every Need</h2>
            <p>Choose from Life, Health, and Motor plans designed to protect what matters most.</p>
          </div>
          <div className="plans-grid">
            {PLANS.map((p) => (
              <div className="plan-card" key={p.name}>
                {p.badge && <span className="plan-badge-tag">{p.badge}</span>}
                <div className="plan-name">
                  {p.name}
                  <span className="plan-type-tag">{p.type}</span>
                </div>
                <div className="plan-coverage">{p.coverage}</div>
                <div className="plan-coverage-lbl">Max Coverage Amount</div>
                <ul className="plan-features">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <div className="plan-premium">Starting at <span>{p.premium}</span></div>
                <button className="btn-plan" onClick={() => navigate("/register")}>
                  Buy Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section id="pricing" className="lp-section">
        <div className="lp-section-inner">
          <div className="section-header">
            <span className="section-badge">Pricing</span>
            <h2>Simple, Transparent Pricing</h2>
            <p>No hidden fees. Cancel anytime. Choose the plan that fits your protection needs.</p>
          </div>
          <div className="pricing-grid">
            {PRICING.map((p) => (
              <div className={`pricing-card${p.popular ? " popular" : ""}`} key={p.tier}>
                {p.popular && <div className="popular-badge">⭐ Most Popular</div>}
                <div className="pricing-tier">{p.tier}</div>
                <div>
                  <span className="pricing-price">{p.price}</span>
                  <span className="pricing-period">{p.period}</span>
                </div>
                <p className="pricing-desc">{p.desc}</p>
                <ul className="pricing-items" style={{ "--check-color": p.color }}>
                  {p.items.map((item) => (
                    <li key={item} style={{ "--check-color": p.color }}>
                      <span style={{ color: p.color }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn-pricing ${p.popular ? "btn-pricing-filled" : "btn-pricing-outline"}`}
                  onClick={() => navigate("/register")}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features" className="lp-section">
        <div className="lp-section-inner">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Everything You Need</h2>
            <p>A complete insurance management system packed with powerful, modern features.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon-wrap">{f.icon}</div>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CLAIMS ══════════ */}
      <section id="claims" className="lp-section">
        <div className="lp-section-inner">
          <div className="section-header">
            <span className="section-badge">Claims</span>
            <h2>Claims Made Simple</h2>
            <p>Our 4-step digital claims process ensures you get your settlement quickly and transparently.</p>
          </div>
          <div className="claims-steps">
            {CLAIM_STEPS.map((s) => (
              <div className="claim-step" key={s.step}>
                <div className="claim-step-num">{s.step}</div>
                <span className="claim-step-icon">{s.icon}</span>
                <div className="claim-step-title">{s.title}</div>
                <p className="claim-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="claims-cta">
            <button className="btn-claims-cta" onClick={() => navigate("/register")}>
              🛡️ Start Your Claim Journey
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ CONTACT (→ Register) ══════════ */}
      <section id="contact">
        <div className="contact-inner">
          <span className="contact-icon">📞</span>
          <h2 className="contact-title">Ready to Get Protected?</h2>
          <p className="contact-sub">
            Join over 1 lakh customers who trust Crown Assurance.
            Create your free account today and get covered in minutes.
          </p>
          <button className="btn-contact" onClick={() => navigate("/register")}>
            Create Free Account →
          </button>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">🛡️ Crown Assurance Pvt. &amp; Ltd.</div>
        <div className="lp-footer-links">
          {NAV_LINKS.map((l) => (
            <a key={l.id} onClick={() => scrollTo(l.id)}>{l.label}</a>
          ))}
        </div>
        <div className="lp-footer-copy">
          © {new Date().getFullYear()} Crown Assurance Pvt. &amp; Ltd. All rights reserved. | IRDAI Reg. No. CA-2020-001
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
