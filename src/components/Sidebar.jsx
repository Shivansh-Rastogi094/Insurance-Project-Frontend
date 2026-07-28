import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
const styles = `
  .sidebar {
    font-family: var(--font-body);
    width: 240px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    z-index: 1000;
    color: var(--sidebar-text);
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px 24px;
    border-bottom: 1px solid var(--sidebar-border);
    margin-bottom: 24px;
  }

  .sidebar-brand-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 4px 10px rgba(73, 79, 223, 0.2);
  }

  .sidebar-brand h2 {
    font-size: 15px;
    font-weight: 700;
    color: var(--sidebar-active);
    letter-spacing: -0.2px;
    line-height: 1.2;
  }

  .sidebar-brand span {
    font-size: 11px;
    color: var(--sidebar-text);
    opacity: 0.8;
    font-weight: 500;
    display: block;
    margin-top: 2px;
  }

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sidebar-text);
    opacity: 0.6;
    padding: 0 20px;
    margin-bottom: 12px;
  }

  .sidebar ul {
    list-style: none;
    padding: 0 12px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sidebar ul li a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--sidebar-text);
    text-decoration: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .sidebar ul li a i {
    font-size: 18px;
    color: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar ul li a:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--sidebar-active);
  }

  .sidebar ul li a.active-link {
    background: rgba(79, 70, 229, 0.2);
    color: var(--sidebar-active);
    font-weight: 700;
  }

  .sidebar ul li a.active-link i {
    color: #818cf8;
  }

  .sidebar ul li a.active-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 4px;
    background: #6366f1;
    border-radius: 0 4px 4px 0;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 16px 20px 0;
    border-top: 1px solid var(--sidebar-border);
  }

  .sidebar-footer p {
    font-size: 11px;
    color: var(--sidebar-text);
    opacity: 0.6;
    font-weight: 500;
    margin-top: 12px;
  }

  .logout-btn {
    width: 100%;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--sidebar-text);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    margin-bottom: 4px;
  }

  .logout-btn:hover {
    background: rgba(226, 59, 74, 0.1);
    color: #e23b4a;
  }
  
  .theme-btn {
    width: 100%;
    background: transparent;
    border: 1px solid var(--sidebar-border);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--sidebar-text);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    margin-bottom: 8px;
  }

  .theme-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--sidebar-active);
    border-color: var(--sidebar-active);
  }
`;

const Sidebar = ({ title }) => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const defaultTitle = userData?.role === "ADMIN"
    ? "Admin Panel"
    : (userData?.role === "AGENT" || userData?.role === "SUPER_AGENT")
    ? "Agent Workspace"
    : "Customer Portal";
  const displayTitle = title || defaultTitle;

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const getLinks = () => {
    if (userData?.role === "CUSTOMER") {
      return [
        { label: "Dashboard", path: "/userdashboard", icon: <i className="ph ph-squares-four"></i> },
        { label: "Products & Plans", path: "/policy", icon: <i className="ph ph-package"></i> },
        { label: "My Policies & Payments", path: "/payments", icon: <i className="ph ph-credit-card"></i> },
        { label: "My Claims", path: "/claims", icon: <i className="ph ph-shield-check"></i> },
        { label: "Contact Us", path: "/contact", icon: <i className="ph ph-envelope-simple"></i> },
        { label: "My Queries", path: "/queries", icon: <i className="ph ph-chat-text"></i> },
        { label: "Profile", path: "/profile", icon: <i className="ph ph-user"></i> }
      ];
    } else if (userData?.role === "AGENT" || userData?.role === "SUPER_AGENT") {
      return [
        { label: "Dashboard", path: "/agentdashboard", icon: <i className="ph ph-squares-four"></i> },
        { label: "Products & Plans", path: "/policy", icon: <i className="ph ph-package"></i> },
        { label: "Policies", path: "/policies", icon: <i className="ph ph-file-text"></i> },
        { label: "Payments", path: "/payments", icon: <i className="ph ph-credit-card"></i> },
        { label: "Claims", path: "/claims", icon: <i className="ph ph-shield-check"></i> },
        { label: "Customers", path: "/customers", icon: <i className="ph ph-users-three"></i> },
        { label: "Customer Queries", path: "/queries", icon: <i className="ph ph-chat-text"></i> }
      ];
    } else {
      return [
        { label: "Dashboard", path: "/admindashboard", icon: <i className="ph ph-squares-four"></i> },
        { label: "Products & Plans", path: "/policy", icon: <i className="ph ph-package"></i> },
        { label: "Users", path: "/users", icon: <i className="ph ph-users"></i> },
        { label: "Policies", path: "/policies", icon: <i className="ph ph-file-text"></i> },
        { label: "Payments", path: "/payments", icon: <i className="ph ph-credit-card"></i> },
        { label: "Claims", path: "/claims", icon: <i className="ph ph-shield-check"></i> },
        { label: "Customers", path: "/customers", icon: <i className="ph ph-users-three"></i> },
        { label: "Customer Queries", path: "/queries", icon: <i className="ph ph-chat-text"></i> }
      ];
    }
  };

  const links = getLinks();

  return (
    <>
      <style>{styles}</style>
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><i className="ph-fill ph-shield"></i></div>
          <div>
            <h2>{displayTitle}</h2>
            <span>
              {userData?.role === 'SUPER_AGENT'
                ? `Super Officer Panel${userData?.specialization ? ` • ${userData.specialization}` : ''}`
                : userData?.role === 'AGENT'
                ? `Officer Panel${userData?.specialization ? ` • ${userData.specialization}` : ''}`
                : userData?.role === 'CUSTOMER'
                ? 'Customer Portal'
                : 'Admin Panel'}
            </span>
          </div>
        </div>

        <p className="sidebar-section-label">Navigation</p>

        <ul>
          {links.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  isActive ? "active-link" : ""
                }
              >
                {link.icon && <span role="img" aria-hidden="true">{link.icon}</span>}
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <><i className="ph ph-sun"></i> Light Mode</> : <><i className="ph ph-moon"></i> Dark Mode</>}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <p>Insurance Management System</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;