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
  handleClearFilters
}) => {
  const isFilterActive = searchQuery || statusFilter || minAmount || maxAmount;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Search</label>
        <div className="search-input-wrapper">
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="filter-input with-icon"
            placeholder="Search Claim No, Policy, Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
    </div>
  );
};

export default ClaimFilterBar;
