import { Link } from 'react-router-dom'

function CartSummary({ total, itemCount }) {
  return (
    <div className="p-4 flex justify-between items-center">
      <span className="text-xl font-bold">Total: ${total.toFixed(2)}</span>
      <Link 
        to="/checkout" 
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        Proceed to Checkout ({itemCount} items)
      </Link>
    </div>
  )
}

export default CartSummary
