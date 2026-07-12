import React from 'react';
import DownloadButton from '../DownloadButton';

const UsersTable = ({ users, userData, onActionClick }) => {
  return (
    <div className="table-container">
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Role & Specialization</th>
              <th>Login Status</th>
              <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.email === userData?.email;
              const roleClass = (user.role || 'CUSTOMER').toLowerCase();
              
              return (
                <tr key={user.id}>
                  <td style={{ fontWeight: '600' }}>
                    {user.fullName} {isSelf && <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>(You)</span>}
                  </td>
                  <td>{user.email}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{user.phoneNumber || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`user-badge ${roleClass}`}>
                        {user.role === 'AGENT' 
                          ? `OFFICER | ${user.specialization || ''}` 
                          : user.role === 'SUPER_AGENT' 
                          ? `OFFICER | ${user.specialization || 'SUPER'}` 
                          : user.role}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-dot ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '24px', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <DownloadButton
                      type="user"
                      data={user}
                      label={<><i className="ph ph-download" /> PDF</>}
                      title="Download Profile Receipt PDF"
                      className="action-btn"
                      style={{
                        background: "rgba(37, 99, 168, 0.05)",
                        border: "1px solid rgba(37, 99, 168, 0.1)",
                        color: "var(--primary-light)",
                        padding: "6px 10px",
                        fontSize: "12px"
                      }}
                    />
                    <button
                      className={`action-btn ${user.active ? 'deactivate' : 'activate'}`}
                      onClick={() => onActionClick(user)}
                      disabled={isSelf}
                      title={isSelf ? "You cannot deactivate or activate your own admin account" : ""}
                      style={{ opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
