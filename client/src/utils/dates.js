export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export const getMonthName = (monthString) => {
  // Format: YYYY-MM
  if (!monthString) return ''
  const [year, month] = monthString.split('-')
  const date = new Date(year, parseInt(month, 10) - 1, 1)
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

export const getTodayString = () => {
  return new Date().toISOString().split('T')[0]
}
