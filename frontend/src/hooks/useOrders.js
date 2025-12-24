import { useState, useEffect } from 'react'
import { getOrders } from '../services/orderService'
import { useOrder } from '../contexts'

export const useOrders = (initialPage = 1, initialFilters = {}) => {
  const { orders, setOrders, loading, setLoading, error, setError } = useOrder()
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    fetchOrders()
  }, [page, filters])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrders({ page, ...filters })
      setOrders(data.orders)
      setTotalPages(data.pagination.pages)
    } catch (err) {
      setError(err.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  return {
    orders,
    loading,
    error,
    page,
    setPage,
    totalPages,
    filters,
    updateFilters,
    refetch: fetchOrders
  }
}
