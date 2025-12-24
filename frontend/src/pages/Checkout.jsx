import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts'
import { useCheckout } from '../hooks'
import { ErrorMessage } from '../components'

function Checkout() {
  const [email, setEmail] = useState('')
  const [stripe, setStripe] = useState(null)
  const [elements, setElements] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const navigate = useNavigate()
  
  const { cart, getCartTotal, clearCart } = useCart()
  const { loading, error, clientSecret, publishableKey, paymentIntentId, initiateCheckout } = useCheckout()
  
  const total = getCartTotal()

  // Load Stripe.js
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
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

      const appearance = { theme: 'stripe' }
      const elementsInstance = stripeInstance.elements({ clientSecret, appearance })
      setElements(elementsInstance)

      const paymentElement = elementsInstance.create('payment')
      paymentElement.mount('#payment-element')
    }
  }, [clientSecret, publishableKey])

  const handleInitiateCheckout = async (e) => {
    e.preventDefault()
    
    if (!email) return

    try {
      const items = cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
      
      await initiateCheckout(email, items)
    } catch (err) {
      // Error handled by hook
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setPaymentError(null)

    if (!stripe || !elements) return

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setPaymentError(submitError.message)
        return
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`
        },
        redirect: 'if_required'
      })

      // If payment is successful without redirect
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        clearCart()
        navigate(`/success?payment_intent=${result.paymentIntent.id}`)
      } else if (result.paymentIntent && result.paymentIntent.status === 'processing') {
        clearCart()
        navigate(`/success?payment_intent=${result.paymentIntent.id}`)
      } else if (result.error) {
        setPaymentError(result.error.message)
      }
    } catch (err) {
      setPaymentError(err.message || 'Payment failed')
      console.error('Payment error:', err)
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

          {error && <ErrorMessage message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mt-4"
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

          {(error || paymentError) && <ErrorMessage message={error || paymentError} />}

          <button
            type="submit"
            disabled={loading || !stripe || !elements}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mt-4"
          >
            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 Payment status will be updated automatically via Stripe webhooks
          </p>
        </form>
      )}
    </div>
  )
}

export default Checkout
