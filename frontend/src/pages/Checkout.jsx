import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Checkout({ cart }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [publishableKey, setPublishableKey] = useState('')
  const [stripe, setStripe] = useState(null)
  const [elements, setElements] = useState(null)
  const navigate = useNavigate()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Load Stripe.js
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    script.onload = () => {
      // Stripe will be initialized when we get the publishable key
    }
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Initialize Stripe elements when we have client secret
  useEffect(() => {
    if (clientSecret && publishableKey && window.Stripe) {
      const stripeInstance = window.Stripe(publishableKey)
      setStripe(stripeInstance)

      const appearance = {
        theme: 'stripe',
      }
      const elementsInstance = stripeInstance.elements({ 
        clientSecret, 
        appearance 
      })
      setElements(elementsInstance)

      const paymentElement = elementsInstance.create('payment')
      paymentElement.mount('#payment-element')
    }
  }, [clientSecret, publishableKey])

  const handleInitiateCheckout = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:5000/api/orders/create', {
        customerEmail: email,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      })

      if (response.data.data) {
        setClientSecret(response.data.data.clientSecret)
        setPublishableKey(response.data.data.publishableKey)
      }
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message)
        setLoading(false)
        return
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/success',
        },
        redirect: 'if_required'
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Verify payment on backend
        await axios.post('http://localhost:5000/api/orders/verify', {
          payment_intent_id: paymentIntent.id
        })
        navigate('/success')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed')
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
        <button onClick={() => navigate('/')} className="text-blue-500 hover:underline">
          Go Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        {cart.map(item => (
          <div key={item.id} className="flex justify-between text-sm mb-2">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-2" />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Email Form */}
      {!clientSecret && (
        <form onSubmit={handleInitiateCheckout} className="bg-white p-4 rounded shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </form>
      )}

      {/* Stripe Payment Form */}
      {clientSecret && (
        <form onSubmit={handlePayment} className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">Payment Details</h2>
          <div id="payment-element" className="mb-4"></div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !stripe || !elements}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
        </form>
      )}
    </div>
  )
}

export default Checkout
