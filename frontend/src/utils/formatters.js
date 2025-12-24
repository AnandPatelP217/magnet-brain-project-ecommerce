export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

export const formatAmount = (amount) => {
  return `$${amount.toFixed(2)}`
}
