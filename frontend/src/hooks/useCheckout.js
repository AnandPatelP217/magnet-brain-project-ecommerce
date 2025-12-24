import { useState } from 'react'
import { createOrder, confirmPayment } from '../services/orderService'

export const useCheckout = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clientSecret, setClientSecret] = useState('')
  const [publishableKey, setPublishableKey] = useState('')

  const initiateCheckout = async (email, items) => {
    setLoading(true)
    setError(null)

    try {
      const data = await createOrder({ customerEmail: email, items })
      setClientSecret(data.clientSecret)
      setPublishableKey(data.publishableKey)
      return data
    } catch (err) {
      setError(err.message || 'Something went wrong')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async (stripe, elements) => {
    setLoading(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      return { success: true }
    } catch (err) {
      setError(err.message || 'Payment failed')
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
    initiateCheckout,
    processPayment
  }
}
