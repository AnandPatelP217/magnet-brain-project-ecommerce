function OrderFilters({ filters, onFilterChange }) {
  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="font-semibold mb-3">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Payment Status</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => onFilterChange({ ...filters, paymentStatus: e.target.value })}
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
            onChange={(e) => onFilterChange({ ...filters, orderStatus: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default OrderFilters
