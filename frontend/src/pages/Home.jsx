import { products } from '../data/products'
import { ProductGrid } from '../components'

function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <ProductGrid products={products} />
    </div>
  )
}

export default Home
