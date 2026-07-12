import React from 'react';

const UserFilterBar = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  handleClearFilters
}) => {
  const isFilterActive = searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Search</label>
        <input
          type="text"
          className="filter-input"
          placeholder="Search Name, Email, Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label className="filter-label">Filter by Role</label>
        <select 
          className="filter-input" 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="AGENT">Officer (Agent)</option>
          <option value="SUPER_AGENT">Super Officer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div className="filter-group">
        <label className="filter-label">Filter by Login Status</label>
        <select 
          className="filter-input" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
      </div>
      {isFilterActive && (
        <button 
          className="clear-filter-btn" 
          onClick={handleClearFilters}
          title="Clear All Filters"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default UserFilterBar;
