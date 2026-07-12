import React from 'react';

const PolicyFilterBar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  minCoverage,
  setMinCoverage,
  maxCoverage,
  setMaxCoverage,
  handleClearFilters
}) => {
  const isFilterActive = searchQuery || statusFilter || minCoverage || maxCoverage;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Search</label>
        <input
          type="text"
          className="filter-input"
          placeholder="Search Policy No, Plan, Customer, Product..."
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
          <option value="ACTIVE">ACTIVE</option>
          <option value="PENDING">PENDING</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Min Coverage (₹)</label>
        <input
          type="number"
          className="filter-input"
          placeholder="Min"
          value={minCoverage}
          onChange={(e) => setMinCoverage(e.target.value)}
        />
      </div>

      <div className="filter-group" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="filter-label">Max Coverage (₹)</label>
          <input
            type="number"
            className="filter-input"
            placeholder="Max"
            value={maxCoverage}
            onChange={(e) => setMaxCoverage(e.target.value)}
          />
        </div>
        {isFilterActive && (
          <button
            type="button"
            className="clear-filter-btn"
            onClick={handleClearFilters}
            title="Clear All Filters"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default PolicyFilterBar;
