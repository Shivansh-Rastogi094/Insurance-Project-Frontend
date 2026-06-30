import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const AccessDenied = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (userData?.role === 'ADMIN') return '/admindashboard';
    if (userData?.role === 'AGENT') return '/agentdashboard';
    if (userData?.role === 'CUSTOMER') return '/userdashboard';
    return '/login';
  };

  const getDashboardLabel = () => {
    if (userData?.role === 'ADMIN') return 'Admin Dashboard';
    if (userData?.role === 'AGENT') return 'Agent Dashboard';
    if (userData?.role === 'CUSTOMER') return 'Customer Dashboard';
    return 'Login Page';
  };

  const roleTitle = userData?.role 
    ? `${userData.role.charAt(0) + userData.role.slice(1).toLowerCase()} Portal`
    : 'Portal';

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  return (
    <div className="page-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      <Sidebar title={roleTitle} />
      
      <div className="main-content" style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
        <div className="topbar" style={{
          height: '60px',
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px'
        }}>
          <div className="topbar-logo">🛡️ InsureSpace</div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="role-badge" style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--danger)',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '4px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase'
            }}>{userData?.role || 'GUEST'}</span>
            <div className="user-avatar" style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 600,
              border: '2px solid var(--border)'
            }}>
              {initials}
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            padding: '40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-premium)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              fontSize: '56px',
              background: 'rgba(239, 68, 68, 0.08)',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <i className="ph ph-prohibit"></i>
            </div>
            
            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0
            }}>Access Restricted</h2>
            
            <p style={{
              fontSize: '14.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0
            }}>
              You do not have permission to view this page. Access is restricted to authorized roles only.
            </p>

            <div style={{
              width: '100%',
              height: '1px',
              background: 'var(--border)',
              margin: '8px 0'
            }}></div>

            <button
              onClick={() => navigate(getDashboardPath())}
              style={{
                background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 168, 0.2)',
                transition: 'transform 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ⬅️ Return to {getDashboardLabel()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userData, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userData?.role)) {
    return <AccessDenied />;
  }

  return children;
};
