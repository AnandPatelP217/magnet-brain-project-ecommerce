import { useCart } from '../../contexts'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="bg-white p-4 rounded shadow">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-40 object-contain mb-3"
      />
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-gray-600 mb-3">${product.price}</p>
      <button
        onClick={() => addToCart(product)}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>
    </div>
  )
}

export default ProductCard
