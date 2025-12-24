import { Link } from 'react-router-dom'
import { useCart } from '../../contexts'

function Header() {
  const { getCartCount } = useCart()
  const cartCount = getCartCount()

  return (
    <header className="bg-white shadow p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          E-commerce-Magnet-brains
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/transactions" className="text-gray-700 hover:text-blue-600 font-medium">
            Transactions
          </Link>
          <Link to="/cart" className="relative">
            <span className="text-2xl">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
