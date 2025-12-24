import { useCart } from '../../contexts'

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-gray-600">${item.price}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          -
        </button>
        <span className="font-medium">{item.quantity}</span>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          +
        </button>
        <button 
          onClick={() => removeFromCart(item.id)}
          className="text-red-500 ml-4 hover:text-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

export default CartItem
