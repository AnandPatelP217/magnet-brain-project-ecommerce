function OrderTable({ orders, formatDate, formatAmount, getStatusColor }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
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
                {formatAmount(order.totalAmount || order.amount || 0)}
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
              <td className="px-4 py-3 font-mono text-xs">
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
                {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrderTable
