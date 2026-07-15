import React, { useEffect, useState } from 'react';
import { readClaimHistory } from '../../services/ClaimService';
import { readAllUsers } from '../../services/UserService';

const ClaimHistoryTimeline = ({ claimId, userData }) => {
  const [claimHistoryList, setClaimHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    const loadUsersLookup = async () => {
      if (userData?.role === 'ADMIN') {
        try {
          const res = await readAllUsers(0, 500);
          const list = res?.data?.content || res?.content || [];
          const map = {};
          list.forEach(u => {
            if (u.email && u.fullName) {
              map[u.email.toLowerCase()] = u.fullName;
            }
          });
          setUsersMap(map);
        } catch (err) {
          console.error("Failed to load users for lookup:", err);
        }
      }
    };
    loadUsersLookup();
  }, [userData]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!claimId) return;
      try {
        setLoadingHistory(true);
        const res = await readClaimHistory(claimId);
        setClaimHistoryList(res?.data || res || []);
      } catch (err) {
        console.error("Failed to load claim history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [claimId]);

  const getUpdaterDisplayName = (email) => {
    if (!email) return 'N/A';
    const lowerEmail = email.toLowerCase();
    
    // Check users map
    if (usersMap && usersMap[lowerEmail]) {
      return `${usersMap[lowerEmail]} (${email})`;
    }
    
    // Check hardcoded defaults
    if (lowerEmail === 'admin@insurance.com') {
      return `System Admin (${email})`;
    }
    if (lowerEmail === 'agent@insurance.com') {
      return `Company Agent (${email})`;
    }
    if (lowerEmail === 'customer@insurance.com') {
      return `John Doe (${email})`;
    }
    
    // Check if it's the current user
    if (userData && userData.email && userData.email.toLowerCase() === lowerEmail) {
      return `${userData.fullName} (${email})`;
    }
    
    // Fallback: parse the email prefix and capitalize
    const namePart = email.split('@')[0];
    if (namePart) {
      const formattedName = namePart
        .split(/[\._\-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      return `${formattedName} (${email})`;
    }
    return email;
  };

  if (loadingHistory) {
    return (
      <div className="loading-container" style={{ minHeight: '150px' }}>
        <div className="spinner"></div>
        <p>Fetching history entries...</p>
      </div>
    );
  }

  if (claimHistoryList.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13.5px', fontStyle: 'italic' }}>
        No status audit transitions logged for this claim.
      </div>
    );
  }

  return (
    <div className="history-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
      {claimHistoryList.map((item, idx) => {
        const formattedDate = item.updatedDate 
          ? new Date(item.updatedDate).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Date unknown';
        
        return (
          <div key={item.id || idx} className="timeline-item" style={{ 
            display: 'flex', 
            gap: '16px', 
            position: 'relative',
            paddingBottom: idx === claimHistoryList.length - 1 ? '0' : '20px',
          }}>
            {/* Connector line */}
            {idx !== claimHistoryList.length - 1 && (
              <div className="timeline-connector" style={{
                position: 'absolute',
                left: '19px',
                top: '38px',
                bottom: 0,
                width: '2px',
                background: 'var(--border)'
              }}></div>
            )}

            {/* Indicator Circle */}
            <div className={`timeline-circle ${item.newStatus.toLowerCase()}`} style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--surface)',
              border: '2px solid var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              zIndex: 2,
              flexShrink: 0
            }}>
              {item.newStatus === 'APPROVED' ? <i className="ph ph-check-circle"></i> : item.newStatus === 'REJECTED' ? <i className="ph ph-x-circle"></i> : <i className="ph ph-hourglass"></i>}
            </div>

            {/* Content details card */}
            <div className="timeline-card" style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              flex: 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '6px' }}>Status:</span>
                  {item.previousStatus && (
                    <span className={`status-badge ${item.previousStatus.toLowerCase()}`} style={{ marginRight: '6px', fontSize: '10px', padding: '2px 6px' }}>
                      {item.previousStatus}
                    </span>
                  )}
                  {item.previousStatus && <span style={{ marginRight: '6px', color: 'var(--text-secondary)' }}>➔</span>}
                  <span className={`status-badge ${item.newStatus.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                    {item.newStatus}
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  {formattedDate}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px', fontStyle: 'italic' }}>
                " {item.remarks || 'No remarks'} "
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Updated by: <strong style={{ color: 'var(--text-primary)' }}>{getUpdaterDisplayName(item.updatedBy)}</strong>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClaimHistoryTimeline;
