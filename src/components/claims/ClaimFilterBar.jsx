import React from 'react';

const ClaimFilterBar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  myAssignedOnly,
  setMyAssignedOnly,
  matchSpecializationOnly,
  setMatchSpecializationOnly,
  userData,
  isAgent,
  handleClearFilters
}) => {
  const isFilterActive = searchQuery || statusFilter || minAmount || maxAmount || myAssignedOnly || matchSpecializationOnly;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Search</label>
        <input
          type="text"
          className="filter-input"
          placeholder="Search Claim No, Policy, Reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Status</label>
        <select
          className="filter-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="RECOMMENDED">RECOMMENDED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Min Amount (₹)</label>
        <input
          type="number"
          className="filter-input"
          placeholder="Min"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
      </div>

      <div className="filter-group" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="filter-label">Max Amount (₹)</label>
          <input
            type="number"
            className="filter-input"
            placeholder="Max"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="clear-filter-btn"
          onClick={handleClearFilters}
          title="Clear All Filters"
          style={{
            visibility: isFilterActive ? 'visible' : 'hidden',
            opacity: isFilterActive ? 1 : 0,
            transition: 'opacity 0.2s ease, visibility 0.2s'
          }}
        >
          Clear
        </button>
      </div>

      {isAgent && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="myAssignedOnly"
              checked={myAssignedOnly}
              onChange={(e) => setMyAssignedOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="myAssignedOnly" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
              Show only claims assigned to me
            </label>
          </div>

          {userData?.specialization && userData?.specialization !== 'SUPER' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="matchSpecializationOnly"
                checked={matchSpecializationOnly}
                onChange={(e) => setMatchSpecializationOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="matchSpecializationOnly" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                Show only claims matching my specialization ({userData.specialization})
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimFilterBar;
