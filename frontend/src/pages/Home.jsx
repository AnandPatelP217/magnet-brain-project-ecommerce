import { products } from '../data/products'

function Home({ addToCart }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Produc</h1>
      
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 rounded shadow">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-40 object-cover mb-3"
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
        ))}
      </div>
    </div>
  )
}

export default Home
