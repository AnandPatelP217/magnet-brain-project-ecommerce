export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  CREATED: 'created',
  CAPTURED: 'captured',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

export const STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-100',
  created: 'text-blue-600 bg-blue-100',
  captured: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
  cancelled: 'text-gray-600 bg-gray-100',
  processing: 'text-blue-600 bg-blue-100',
  shipped: 'text-purple-600 bg-purple-100',
  delivered: 'text-green-600 bg-green-100'
}
