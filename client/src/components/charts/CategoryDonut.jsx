import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'
import { useAuth } from '../../context/AuthContext'

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const entry = payload[0]
    return (
      <div className="chart-tooltip">
        <p className="tooltip-name" style={{ color: entry.payload.color }}>
          {entry.name}
        </p>
        <p className="tooltip-value">
          {formatCurrency(entry.value, currency)}
        </p>
      </div>
    )
  }
  return null
}

export const CategoryDonut = ({ data = [] }) => {
  const { user } = useAuth()

  if (!data || data.length === 0) {
    return (
      <div className="empty-chart">
        <p>No category expenses recorded yet.</p>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.name,
    value: Number(item.amount),
    color: item.color || '#6366F1',
  }))

  return (
    <div className="chart-wrapper" style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={user?.currency} />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(val) => <span className="legend-text">{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CategoryDonut
