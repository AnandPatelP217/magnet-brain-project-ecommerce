import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getOrderByPaymentIntent } from '../services/orderService'

function Failed() {
  const [searchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('Something went wrong with your payment.')
  const [order, setOrder] = useState(null)
  
  const paymentIntentId = searchParams.get('payment_intent')

  useEffect(() => {
    if (paymentIntentId) {
      // Try to fetch order details to show more information
      getOrderByPaymentIntent(paymentIntentId)
        .then(result => {
          setOrder(result.data)
          if (result.data.paymentStatus === 'failed') {
            setErrorMessage('Your payment was declined. Please try another payment method.')
          } else if (result.data.paymentStatus === 'cancelled') {
            setErrorMessage('Your payment was cancelled.')
          }
        })
        .catch(() => {
          // If we can't fetch the order, use default message
        })
    }
  }, [paymentIntentId])

  return (
    <div className="text-center py-20 px-4">
      <div className="text-6xl mb-4">❌</div>
      <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>
      <p className="text-gray-600 mb-6">{errorMessage}</p>
      
      {order && (
        <div className="max-w-md mx-auto bg-white p-4 rounded shadow mb-6">
          <p className="text-sm text-gray-600">Order ID: <span className="font-mono">{order._id}</span></p>
          <p className="text-sm text-gray-600">Payment Status: <span className="font-semibold text-red-600">{order.paymentStatus}</span></p>
        </div>
      )}
      
      <div className="space-x-4">
        <Link 
          to="/cart" 
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </Link>
        <Link 
          to="/" 
          className="inline-block bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}

export default Failed
