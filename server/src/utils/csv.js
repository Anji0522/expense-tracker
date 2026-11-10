export const generateCsv = (headers, rows) => {
  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '""'
    const stringValue = String(cell).replace(/"/g, '""')
    return `"${stringValue}"`
  }

  const headerLine = headers.map(h => escapeCell(h.label)).join(',')
  const dataLines = rows.map(row =>
    headers.map(h => escapeCell(row[h.key])).join(',')
  )

  return [headerLine, ...dataLines].join('\r\n')
}

export default generateCsv
