import React from 'react'
import { Search, Filter, X } from 'lucide-react'

export const FilterBar = ({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  categories = [],
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(search || categoryId || startDate || endDate)

  return (
    <div className="filter-bar">
      <div className="filter-search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search by description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {search && (
          <button
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="filter-controls">
        <div className="filter-item">
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item date-range">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="filter-date-input"
            title="Start Date"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="filter-date-input"
            title="End Date"
          />
        </div>

        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={onClearFilters}>
            <Filter size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterBar
