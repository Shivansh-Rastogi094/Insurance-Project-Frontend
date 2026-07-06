import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/Navbar.css";



const NAV_LINKS = [
  { path: "/",          label: "Home",     icon: <i className="ph ph-house"></i> },
  { path: "/about",     label: "About",    icon: "ℹ️" },
  { path: "/plans",     label: "Plans",    icon: <i className="ph ph-clipboard"></i> },
  { path: "/pricing",   label: "Pricing",  icon: <i className="ph ph-coin"></i> },
  { path: "/features",  label: "Features", icon: <i className="ph ph-sparkle"></i> },
  { path: "/claims-info", label: "Claims",  icon: "🛡️" },
  { path: "/register",  label: "Contact",  icon: <i className="ph ph-phone"></i> },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <nav className={`ca-nav${scrolled ? " scrolled" : ""}`}>
        <div className="ca-nav-inner">
          {/* Brand */}
          <div className="ca-brand" onClick={() => navigate("/")}>
            <span className="ca-brand-icon">🛡️</span>
            <span className="ca-brand-name">
              Crown Assurance
              <span className="ca-brand-sub">Pvt. &amp; Ltd.</span>
            </span>
          </div>

          {/* Desktop links */}
          <ul className="ca-nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.path}>
                <a
                  className={location.pathname === l.path ? "active" : ""}
                  onClick={() => navigate(l.path)}
                >
                  <span className="ni">{l.icon}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="ca-nav-actions">
            <button className="ca-theme-btn" onClick={toggleTheme} title={theme === 'dark' ? "Light mode" : "Dark mode"}>
              {theme === 'dark' ? <i className="ph ph-sun"></i> : <i className="ph ph-moon"></i>}
            </button>
            <button className="ca-btn-ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="ca-btn-primary" onClick={() => navigate("/register")}>Register</button>
            <button className="ca-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`ca-mobile-menu${menuOpen ? " open" : ""}`}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.path}
              className={location.pathname === l.path ? "active" : ""}
              onClick={() => navigate(l.path)}
            >
              <span>{l.icon}</span> {l.label}
            </a>
          ))}
          <div className="ca-mobile-actions">
            <button className="ca-btn-ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="ca-btn-primary" onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>
      </nav>
    </>
  );
};

/* ── Shared Footer ── */
export const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="ca-footer">
      <div className="ca-footer-brand">🛡️ Crown Assurance Pvt. &amp; Ltd.</div>
      <div className="ca-footer-links">
        {NAV_LINKS.map((l) => (
          <a key={l.path} onClick={() => navigate(l.path)}>{l.label}</a>
        ))}
      </div>
      <div className="ca-footer-copy">
        © {new Date().getFullYear()} Crown Assurance Pvt. &amp; Ltd. All rights reserved. | IRDAI Reg. No. CA-2020-001
      </div>
    </footer>
  );
};

/* ── Layout wrapper used by every landing sub-page ── */
const LandingLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="ca-page">
        {children}
        <Footer />
      </div>
    </>
  );
};

export default LandingLayout;
