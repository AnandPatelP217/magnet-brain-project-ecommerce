import { useState, useEffect } from 'react'
import axios from 'axios'

function Transactions() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    paymentStatus: '',
    orderStatus: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [page, filters])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters.orderStatus) params.append('orderStatus', filters.orderStatus)

      const response = await axios.get(`http://localhost:5000/api/orders?${params}`)
      
      if (response.data.data) {
        setOrders(response.data.data.orders)
        setTotalPages(response.data.data.pagination.pages)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amount) => {
    return `$${amount.toFixed(2)}`
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      created: 'text-blue-600 bg-blue-100',
      captured: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100',
      processing: 'text-blue-600 bg-blue-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transaction Dashboard</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => {
                setFilters({ ...filters, paymentStatus: e.target.value })
                setPage(1)
              }}
              className="w-full border p-2 rounded"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="created">Created</option>
              <option value="captured">Captured</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order Status</label>
            <select
              value={filters.orderStatus}
              onChange={(e) => {
                setFilters({ ...filters, orderStatus: e.target.value })
                setPage(1)
              }}
              className="w-full border p-2 rounded"
            >
              <option value="">All</option>
              <option value="created">Created</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ paymentStatus: '', orderStatus: '' })
                setPage(1)
              }}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No transactions found</p>
        </div>
      ) : (
        <>
          {/* Transactions Table */}
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Payment Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Order Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Stripe Payment ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.customerEmail}</td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {formatAmount(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">
                      {order.stripePaymentIntentId ? (
                        <a 
                          href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentIntentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {order.stripePaymentIntentId.slice(0, 20)}...
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

      
        </>
      )}
    </div>
  )
}

export default Transactions
