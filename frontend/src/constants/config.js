export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const STRIPE_CONFIG = {
  returnUrl: `${window.location.origin}/success`,
  cancelUrl: `${window.location.origin}/failed`
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10
}
