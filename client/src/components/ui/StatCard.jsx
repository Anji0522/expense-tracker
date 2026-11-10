import React from 'react'

export const StatCard = ({ title, value, subtitle, icon: Icon, color = '#6366F1', trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon-wrap" style={{ backgroundColor: `${color}20`, color }}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {(subtitle || trend !== undefined) && (
        <div className="stat-footer">
          {trend !== undefined && (
            <span className={`stat-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}

export default StatCard
