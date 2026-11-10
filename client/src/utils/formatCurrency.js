export const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = Number(amount) || 0

  const currencyMap = {
    INR: { locale: 'en-IN', currency: 'INR' },
    USD: { locale: 'en-US', currency: 'USD' },
    EUR: { locale: 'de-DE', currency: 'EUR' },
    GBP: { locale: 'en-GB', currency: 'GBP' },
  }

  const config = currencyMap[currency] || { locale: 'en-US', currency: 'INR' }

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch (err) {
    return `${currency} ${numericAmount.toFixed(2)}`
  }
}

export default formatCurrency
