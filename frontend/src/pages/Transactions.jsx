import { useOrders } from '../hooks'
import { OrderFilters, OrderTable, Pagination, Loading, ErrorMessage } from '../components'
import { formatDate, formatAmount } from '../utils'
import { STATUS_COLORS } from '../constants'

function Transactions() {
  const { orders, loading, error, page, setPage, totalPages, filters, updateFilters, refetch } = useOrders(1, {
    paymentStatus: '',
    orderStatus: ''
  })

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'text-gray-600 bg-gray-100'
  }

  const handleClearFilters = () => {
    updateFilters({ paymentStatus: '', orderStatus: '' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transaction Dashboard</h1>

      <OrderFilters filters={filters} onFilterChange={updateFilters} />

      <div className="mb-4">
        <button
          onClick={handleClearFilters}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {loading ? (
        <Loading message="Loading transactions..." />
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded shadow overflow-x-auto">
            <OrderTable
              orders={orders}
              formatDate={formatDate}
              formatAmount={formatAmount}
              getStatusColor={getStatusColor}
            />
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}

export default Transactions
