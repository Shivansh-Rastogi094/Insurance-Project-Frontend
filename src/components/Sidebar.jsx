import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    z-index: 1000;
    color: var(--sidebar-text);
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 24px;
  }

  .sidebar-brand-icon {
    width: 36px;
    height: 36px;
    background: rgba(73, 79, 223, 0.15);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    color: #ffffff;
    font-weight: 700;
  }

  .sidebar-brand h2 {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.2px;
    line-height: 1.2;
  }

  .sidebar-brand span {
    font-size: 11px;
    color: var(--sidebar-text);
    opacity: 0.7;
    font-weight: 400;
    display: block;
    margin-top: 2px;
  }

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sidebar-text);
    opacity: 0.5;
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
    border-radius: var(--radius-button);
    font-size: 14px;
    font-weight: 500;
    color: var(--sidebar-text);
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
  }

  .sidebar ul li a:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
  }

  .sidebar ul li a.active-link {
    background: rgba(73, 79, 223, 0.15);
    color: #ffffff;
    font-weight: 600;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 16px 20px 0;
    border-top: 1px solid var(--border);
  }

  .sidebar-footer p {
    font-size: 11px;
    color: var(--sidebar-text);
    opacity: 0.5;
    font-weight: 400;
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
    border-radius: var(--radius-button);
    font-size: 14px;
    font-weight: 500;
    color: var(--sidebar-text);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    margin-bottom: 4px;
  }

  .logout-btn:hover {
    background: rgba(226, 59, 74, 0.15);
    color: #e23b4a;
  }
  
  .theme-btn {
    width: 100%;
    background: transparent;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--radius-button);
    font-size: 14px;
    font-weight: 500;
    color: var(--sidebar-text);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    margin-bottom: 8px;
  }

  .theme-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
  }
`;

const Sidebar = ({ title }) => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  const defaultTitle = userData?.role === "ADMIN"
    ? "Admin Panel"
    : userData?.role === "AGENT"
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
        { label: "Dashboard", path: "/userdashboard" },
        { label: "Products & Plans", path: "/policy" },
        { label: "My Policies & Payments", path: "/payments" },
        { label: "My Claims", path: "/claims" },
        { label: "Profile", path: "/profile" }
      ];
    } else if (userData?.role === "AGENT") {
      return [
        { label: "Dashboard", path: "/agentdashboard" },
        { label: "Products & Plans", path: "/policy" },
        { label: "Policies", path: "/policies" },
        { label: "Claims", path: "/claims" },
        { label: "Customers", path: "/customers" }
      ];
    } else {
      return [
        { label: "Dashboard", path: "/admindashboard" },
        { label: "Products & Plans", path: "/policy" },
        { label: "Users", path: "/users" },
        { label: "Policies", path: "/policies" },
        { label: "Claims", path: "/claims" },
        { label: "Customers", path: "/customers" }
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
              {userData?.role === 'AGENT'
                ? 'Officer Panel'
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