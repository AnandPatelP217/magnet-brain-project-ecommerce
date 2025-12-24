import { Link } from 'react-router-dom'

function Success() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
      <Link 
        to="/" 
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Continue Shopping
      </Link>
    </div>
  )
}

export default Success
