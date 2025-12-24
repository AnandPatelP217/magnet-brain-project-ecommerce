import { createContext, useState, useContext } from 'react'

const OrderContext = createContext()

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const value = {
    orders,
    setOrders,
    currentOrder,
    setCurrentOrder,
    loading,
    setLoading,
    error,
    setError
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}
