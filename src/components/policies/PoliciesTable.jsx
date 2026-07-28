import React from 'react';
import DownloadButton from '../DownloadButton';

const PoliciesTable = ({ policies, onCancelClick, userRole }) => {
  const canCancelPolicy = userRole === 'ADMIN' || userRole === 'SUPER_AGENT';

  return (
    <div className="table-container">
      <div className="policies-table-wrapper">
        <table className="policies-table">
          <thead>
            <tr>
              <th>Policy Number</th>
              <th>Plan Name</th>
              <th>Policyholder</th>
              <th>Product Type</th>
              <th>Max Cover</th>
              <th>Available Cover</th>
              <th>Premium</th>
              <th>Start Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => {
              const policyholder = policy.customerName || policy.customer?.fullName || 'N/A';
              const planName = policy.planName || 'Insurance Plan';
              const productType = policy.productType || 'N/A';
              const coverage = policy.coverageAmount || 0;
              const availCoverage = policy.remainingCoverage !== undefined && policy.remainingCoverage !== null ? policy.remainingCoverage : coverage;
              const premium = policy.premiumAmount || 0;
              const freq = policy.premiumType ? `/${policy.premiumType.toLowerCase()}` : '';
              const startDate = policy.startDate
                ? new Date(policy.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A';
              const rawStatus = policy.policyStatus || 'PENDING_PAYMENT';
              const statusClass = rawStatus === 'PENDING_PAYMENT' ? 'pending' : rawStatus.toLowerCase();
              const statusLabel = rawStatus === 'PENDING_PAYMENT' ? 'Pending Payment' : rawStatus.charAt(0) + rawStatus.slice(1).toLowerCase();

              return (
                <tr key={policy.id}>
                  <td className="policy-number">{policy.policyNumber}</td>
                  <td style={{ fontWeight: '600' }}>{planName}</td>
                  <td>{policyholder}</td>
                  <td>{productType}</td>
                  <td className="amount-val">₹{coverage.toLocaleString('en-IN')}</td>
                  <td className="amount-val" style={{ color: 'var(--primary)' }}>₹{availCoverage.toLocaleString('en-IN')}</td>
                  <td className="amount-val">₹{premium.toLocaleString('en-IN')}{freq}</td>
                  <td>{startDate}</td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <DownloadButton
                        type="policy"
                        data={policy}
                        extraData={{ customerName: policy.customerName || policy.customer?.fullName }}
                        label={<i className="ph ph-download" />}
                        title="Download Policy PDF"
                        className="action-btn"
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          borderColor: 'var(--border)'
                        }}
                      />
                      {canCancelPolicy && (() => {
                        const isCancelled = policy.policyStatus === 'CANCELLED';
                        const isNotCancellable = isCancelled || policy.policyStatus === 'EXPIRED';
                        return (
                          <button
                            className="action-btn cancel-policy"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isNotCancellable) onCancelClick(e, policy);
                            }}
                            disabled={isNotCancellable}
                            title={
                              isCancelled
                                ? 'This policy is already cancelled'
                                : policy.policyStatus === 'EXPIRED'
                                ? 'Expired policies cannot be cancelled'
                                : 'Cancel this policy (blocked if pending claims exist)'
                            }
                            style={{
                              opacity: isNotCancellable ? 0.45 : 1,
                              cursor: isNotCancellable ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isCancelled ? 'Cancelled' : 'Cancel Policy'}
                          </button>
                        );
                      })()}
                    </div>
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

export default PoliciesTable;
