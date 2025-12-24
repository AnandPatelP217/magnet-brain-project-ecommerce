import api from './api'

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders/create', orderData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
    if (params.orderStatus) queryParams.append('orderStatus', params.orderStatus)

    const response = await api.get(`/orders?${queryParams}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getOrderByPaymentIntent = async (paymentIntentId) => {
  try {
    const response = await api.get(`/orders/payment-intent/${paymentIntentId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/orders/verify', paymentData)
    return response.data
  } catch (error) {
    throw error
  }
}
