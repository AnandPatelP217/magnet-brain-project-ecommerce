import { Link } from 'react-router-dom'
import { useCart } from '../contexts'
import { CartItem, CartSummary } from '../components'

function Cart() {
  const { cart, getCartTotal, getCartCount } = useCart()

  if (cart.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Right now your cart is empty</h1>
        <Link to="/" className="text-blue-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="bg-white rounded shadow">
        {cart.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
        <CartSummary total={getCartTotal()} itemCount={getCartCount()} />
      </div>
    </div>
  )
}

export default Cart
