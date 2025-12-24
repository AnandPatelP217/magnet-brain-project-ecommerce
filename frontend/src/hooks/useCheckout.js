import { useState } from 'react'
import { createOrder } from '../services/orderService'

export const useCheckout = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clientSecret, setClientSecret] = useState('')
  const [publishableKey, setPublishableKey] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')

  const initiateCheckout = async (email, items) => {
    setLoading(true)
    setError(null)

    try {
      const data = await createOrder({ customerEmail: email, items })
      setClientSecret(data.clientSecret)
      setPublishableKey(data.publishableKey)
      setPaymentIntentId(data.paymentIntentId)
      return data
    } catch (err) {
      setError(err.message || 'Something went wrong')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    clientSecret,
    publishableKey,
    paymentIntentId,
    initiateCheckout
  }
}
