import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyPayment, getOrderByPaymentIntent } from '../services/orderService'
import { Loading, ErrorMessage } from '../components'
import { formatAmount, formatDate } from '../utils'

function Success() {
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pollingCount, setPollingCount] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  
  const paymentIntentId = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    if (!paymentIntentId) {
      setError('No payment information found')
      setLoading(false)
      return
    }

    // Verify payment and fetch order details
    const verifyAndFetchOrder = async () => {
      try {
        // If redirect_status is 'succeeded', verify the payment with backend
        if (redirectStatus === 'succeeded' && !isVerified) {
          try {
            const verifyResult = await verifyPayment({ payment_intent_id: paymentIntentId })
            setOrder(verifyResult.data.order)
            setIsVerified(true)
            setLoading(false)
            return
          } catch (verifyErr) {
            console.warn('Verification failed, falling back to status check:', verifyErr)
            // Fall through to status check if verification fails
          }
        }

        // Fetch order details and poll for webhook updates
        const orderData = await getOrderByPaymentIntent(paymentIntentId)
        setOrder(orderData.data)
        setLoading(false)
        
        // Continue polling if payment is still being processed (max 10 times = 30 seconds)
        if (orderData.data.paymentStatus === 'created' && pollingCount < 10) {
          setTimeout(() => {
            setPollingCount(prev => prev + 1)
          }, 3000) // Poll every 3 seconds
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch order details')
        setLoading(false)
      }
    }

    verifyAndFetchOrder()
  }, [paymentIntentId, redirectStatus, pollingCount, isVerified])

  const getPaymentStatusDisplay = (status) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'text-gray-600' },
      created: { text: 'Processing...', color: 'text-blue-600' },
      authorized: { text: 'Authorized', color: 'text-yellow-600' },
      captured: { text: 'Payment Confirmed', color: 'text-green-600' },
      failed: { text: 'Payment Failed', color: 'text-red-600' },
      cancelled: { text: 'Cancelled', color: 'text-gray-600' }
    }
    return statusMap[status] || { text: status, color: 'text-gray-600' }
  }

  const getOrderStatusDisplay = (status) => {
    const statusMap = {
      created: { text: 'Created', color: 'text-blue-600' },
      processing: { text: 'Processing', color: 'text-yellow-600' },
      shipped: { text: 'Shipped', color: 'text-purple-600' },
      delivered: { text: 'Delivered', color: 'text-green-600' },
      cancelled: { text: 'Cancelled', color: 'text-red-600' }
    }
    return statusMap[status] || { text: status, color: 'text-gray-600' }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loading message="Verifying payment..." />
        {redirectStatus === 'succeeded' && (
          <p className="text-sm text-green-600 mt-4">✅ Payment successful! Confirming your order...</p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <ErrorMessage message={error} />
        <Link 
          to="/" 
          className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Return to Home
        </Link>
      </div>
    )
  }

  const paymentStatus = getPaymentStatusDisplay(order?.paymentStatus)
  const orderStatus = getOrderStatusDisplay(order?.orderStatus)
  const isPaymentConfirmed = order?.paymentStatus === 'captured'

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">
          {isPaymentConfirmed ? '✅' : order?.paymentStatus === 'created' ? '⏳' : '❌'}
        </div>
        <h1 className={`text-3xl font-bold mb-2 ${isPaymentConfirmed ? 'text-green-600' : 'text-blue-600'}`}>
          {isPaymentConfirmed ? 'Payment Successful!' : 'Payment Processing'}
        </h1>
        <p className="text-gray-600 mb-2">
          {isPaymentConfirmed 
            ? 'Thank you for your purchase. Your order is being processed.' 
            : 'Please wait while we confirm your payment with our payment processor.'}
        </p>
        {order?.paymentStatus === 'created' && (
          <p className="text-sm text-gray-500 italic">
            Waiting for webhook confirmation... (This usually takes a few seconds)
          </p>
        )}
      </div>

      {order && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-sm">{order._id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`font-semibold ${paymentStatus.color}`}>
                {paymentStatus.text}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Order Status:</span>
              <span className={`font-semibold ${orderStatus.color}`}>
                {orderStatus.text}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{order.customerEmail}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">{formatAmount(order.totalAmount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold mb-3">Items:</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatAmount(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-x-4">
        <Link 
          to="/transactions" 
          className="inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          View All Orders
        </Link>
        <Link 
          to="/" 
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Continue Shopping
        </Link>
      </div>

      {order?.paymentStatus === 'created' && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Tip: Order status updates automatically via Stripe webhooks</p>
        </div>
      )}
    </div>
  )
}

export default Success
