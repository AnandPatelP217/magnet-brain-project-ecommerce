import { Link } from 'react-router-dom'

function Failed() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">❌</div>
      <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>
      <p className="text-gray-600 mb-6">Something went wrong with your payment.</p>
      <Link 
        to="/cart" 
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Try Again
      </Link>
    </div>
  )
}

export default Failed
