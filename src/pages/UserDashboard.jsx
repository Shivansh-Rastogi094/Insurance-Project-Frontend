import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { readMyPolicies } from '../services/PolicyService';
import Card from '../components/Card';
import { readMyClaims } from '../services/ClaimService';
import { readMyPayements } from '../services/PaymentService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const styles = `
  .dashboard-container {
    font-family: var(--font-body);
    background: var(--surface);
    min-height: 100vh;
    display: flex;
    position: relative;
  }

  .main-content {
    flex: 1;
    margin-left: 240px;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    height: 60px;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .topbar-logo {
    font-size: 16px;
    font-weight: 700;
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .role-badge {
    font-size: 12px;
    font-weight: 600;
    color: var(--primary-light);
    background: rgba(37, 99, 168, 0.1);
    padding: 4px 10px;
    border-radius: var(--radius-badge);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--primary);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    border: 2px solid var(--border);
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .user-avatar:hover {
    transform: scale(1.05);
  }

  .header {
    padding: 32px 40px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-text h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .header-text p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 8px 40px 24px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    padding: 0 40px;
    margin-bottom: 16px;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
    padding: 0 40px 32px;
  }

  .agent-remarks,
.admin-remarks {
  max-width: 220px;
  text-align: right;
  font-size: 11px;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: 6px;
  word-break: break-word;
}

  .agent-remarks {
    background: rgba(37, 99, 168, 0.08);
    color: var(--primary-light);
    border: 1px solid rgba(37, 99, 168, 0.15);
  }

  .admin-remarks {
    background: rgba(22, 163, 74, 0.08);
    color: var(--success);
    border: 1px solid rgba(22, 163, 74, 0.15);
  }

  /* Two column grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 24px;
    padding: 0 40px 32px;
  }

  .dashboard-section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 24px;
    box-shadow: var(--shadow-card);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
  }

  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .compact-policy-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .compact-policy-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    transition: all 0.2s ease;
  }

  .compact-policy-card:hover {
    transform: translateX(4px);
    border-color: var(--primary-light);
    background: var(--card);
  }

  .policy-info h5 {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .policy-info p {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .policy-meta {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* Badges */
  .status-badge {
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 700;
    border-radius: var(--radius-badge);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-badge.active { background: rgba(22, 163, 74, 0.1); color: var(--success); }
  .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
  .status-badge.processing { background: rgba(37, 99, 168, 0.1); color: var(--primary-light); }
  .status-badge.expired { background: rgba(100, 116, 139, 0.1); color: var(--text-secondary); }
  .status-badge.rejected { background: rgba(220, 38, 38, 0.1); color: var(--danger); }

  /* Claims List */
  .claims-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .claim-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 4px;
    border-bottom: 1px solid var(--border);
  }

  .claim-row:last-child {
    border-bottom: none;
  }

  .claim-info h5 {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .claim-info p {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .claim-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .claim-amount {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  /* Payments timeline strip */
  .payments-timeline-section {
    margin: 0 40px 40px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 24px;
    box-shadow: var(--shadow-card);
  }

  .timeline-container {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding: 8px 4px;
    scrollbar-width: thin;
  }

  .timeline-card {
    flex: 1;
    min-width: 260px;
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    border-left: 4px solid var(--warning);
    transition: all 0.2s ease;
  }

  .timeline-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .timeline-card.success-border {
    border-left-color: var(--success);
  }

  .timeline-date {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .timeline-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 4px;
  }

  .timeline-amount {
    font-size: 14px;
    font-weight: 700;
    color: var(--primary-light);
    margin-top: 8px;
    font-family: var(--font-mono);
  }

  /* Header and text buttons */
  .btn-primary {
    background: var(--primary);
    color: #ffffff;
    border: none;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 4px 6px -1px rgba(26, 60, 94, 0.15);
  }

  .btn-primary:hover {
    background: var(--primary-light);
  }

  .btn-primary:active {
    transform: scale(0.98);
  }

  .btn-outline {
    background: transparent;
    color: var(--primary-light);
    border: 1.5px solid var(--primary-light);
    padding: 6px 12px;
    font-size: 11.5px;
    font-weight: 600;
    font-family: inherit;
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-outline:hover {
    background: var(--primary-light);
    color: #ffffff;
  }

  .text-btn {
    background: transparent;
    border: none;
    color: var(--accent);
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
  }

  .text-btn:hover {
    text-decoration: underline;
  }

  @media (max-width: 900px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const UserDashboard = () => {
  const [policy, setPolicy] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  // const [plans, setPlans] = useState([]);

  const {userData} = useAuth();
  const navigate = useNavigate();
  const myPolicies = async () => {
    try {
      const response = await readMyPolicies();    
      const sortedResponse = [...(response || [])].sort((a, b) => (b.id || b.policyId || 0) - (a.id || a.policyId || 0));
      setPolicy(sortedResponse);
    } catch (e) {
      setPolicy([]);
    }
  };

  const myClaims = async () => {
    try {
      const response = await readMyClaims();
      const sortedResponse = [...(response || [])].sort((a, b) => (b.id || 0) - (a.id || 0));
      setClaims(sortedResponse);
    } catch (e) {
      setClaims([]);
    }
  };

  const myPayments = async()=>{
    const response = await readMyPayements();
    setPayments(response);
  }

  // const myPlans =async()=>{
  //   const response = await readMyPlans();
  //   setPlans(response)
  // }

  useEffect(() => {
    myPolicies();
    myClaims();
    myPayments();

  }, []);

  const activePoliciesCount = policy.filter(p => (p.policyStatus) === "ACTIVE").length;
  
  const pendingClaimsCount = claims.filter(c => (c.claimStatus) === "SUBMITTED").length;
  
  
  const totalPremiumPaidVal = payments.reduce(
    (sum, p) => p.paymentStatus === "SUCCESS" ? sum + p.amount : sum,
    0
  );

  const totalClaimAvailableVal = policy.reduce(
    (sum, p) => p.policyStatus === "ACTIVE" 
      ? sum + (p.remainingCoverage !== undefined && p.remainingCoverage !== null ? p.remainingCoverage : p.coverageAmount) 
      : sum,
    0
  );

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <Sidebar title="Policyholder Portal" />
        
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-logo">🛡️ InsureSpace</div>
            <div className="topbar-right">
              <span className="role-badge">{userData.fullName} | {userData.role}</span>
              <div className="user-avatar" title={userData?.fullName || "User"}>
                {(userData?.fullName || "User").split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
              </div>
            </div>
          </div>

          <div className="header">
            <div className="header-text">
              <h2>Good Morning, {userData?.fullName} 👋</h2>
              <p>Welcome back to your dashboard. Here is your policy health-check.</p>
            </div>
            <button className="btn-primary" onClick={()=>{navigate("/policy")}}>+ Buy Policy</button>
          </div>

          <div className="divider" />

          <p className="section-label">Account Summary</p>

          <div className="cards">
            <Card title="Active Policies" value={activePoliciesCount} icon="🛡️" accent="accent-blue" sub="Currently active coverage" />
            <Card title="Pending Claims" value={pendingClaimsCount} icon="⏳" accent="accent-amber" sub="Awaiting review" />
            <Card title="Total Premium Paid" value={totalPremiumPaidVal.toLocaleString('en-IN')} icon="💵" prefix="₹" accent="accent-green" sub="Total premiums settled" />
            <Card title="Total Claim Available" value={totalClaimAvailableVal.toLocaleString('en-IN')} icon="💰" prefix="₹" accent="accent-blue" sub="Max cover available" />
          </div>

          <div className="dashboard-grid">
            {/* My Policies Column */}
            <div className="dashboard-section">
              <div className="section-header">
                <span className="section-title">My Policies (Quick View)</span>
                <button className="text-btn" onClick={() => navigate("/payments")}>View All</button>
              </div>
              <div className="compact-policy-list">
                {policy.slice(0, 3).map((p, index) => {
                  const rawStatus =  p.policyStatus;
                  const statusLabel = rawStatus === "PENDING_PAYMENT" ? "Inactive" : rawStatus.toLowerCase();
                  const badgeClass = rawStatus === "PENDING_PAYMENT" ? "expired" : rawStatus.toLowerCase();
                  return (
                    <div className="compact-policy-card" key={p.id || p.policyId || index}>
                      <div className="policy-info">
                        <h5>{p.planName}</h5>
                        <p>{p.productType} • {p.policyNumber}</p>
                      </div>
                      <div className="policy-meta">
                        <span className={`status-badge ${badgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <span className="section-title">Recent Claims</span>
                <button className="text-btn" onClick={() => navigate("/claims")}>View All</button>
              </div>
              <div className="claims-list">
                {claims.slice(0, 2).map((c, index) => {
                  const status = (c.claimStatus).toLowerCase();
                  const claimNum = c.claimNumber;
                  const assocPolicy = c.policyNumber ;
                  const agentRemarks = c.agentRemarks ==="null" ? "Pending" : c.agentRemarks
                  const adminRemarks = c.adminRemarks ==="null" ? "Pending" : c.adminRemarks
                  return (
                    <div className="claim-row" key={c.id || index}>
                      <div className="claim-info">
                        <h5>{claimNum}</h5>
                        {assocPolicy && (
                          <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '12px', marginTop: '2px' }}>
                            {assocPolicy}
                          </p>
                        )}
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Date: {c.incidentDate || "Recent"}
                        </p>
                        {(c.claimReason) && (
                          <p className="claim-desc" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                            Reason: {c.claimReason }
                          </p>
                        )}
                      </div>
                      <div className="claim-meta">
                        <span className="claim-amount">₹{(c.claimAmount).toLocaleString('en-IN')}</span>
                        <span className={`status-badge ${status}`}>
                          {status}
                        </span>
                       <span className="agent-remarks">
                          Officer: {agentRemarks || "No remarks"}
                        </span>
                        <span className="admin-remarks">
                          Admin: {adminRemarks || "No remarks"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;