import { CartProvider, OrderProvider } from '../contexts'
import { Layout, Header } from '../components'
import Home from '../pages/Home'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Success from '../pages/Success'
import Failed from '../pages/Failed'
import Transactions from '../pages/Transactions'

export const Routes = [
  {
    path: '/',
    element: (
      <CartProvider>
        <OrderProvider>
          <Layout>
            <Header />
            <main className="max-w-4xl mx-auto p-4">
              <Home />
            </main>
          </Layout>
        </OrderProvider>
      </CartProvider>
    ),
  },
  {
    path: '/cart',
    element: (
      <CartProvider>
        <OrderProvider>
          <Layout>
            <Header />
            <main className="max-w-4xl mx-auto p-4">
              <Cart />
            </main>
          </Layout>
        </OrderProvider>
      </CartProvider>
    ),
  },
  {
    path: '/checkout',
    element: (
      <CartProvider>
        <OrderProvider>
          <Layout>
            <Header />
            <main className="max-w-4xl mx-auto p-4">
              <Checkout />
            </main>
          </Layout>
        </OrderProvider>
      </CartProvider>
    ),
  },
  {
    path: '/success',
    element: (
      <CartProvider>
        <OrderProvider>
          <Layout>
            <Header />
            <main className="max-w-4xl mx-auto p-4">
              <Success />
            </main>
          </Layout>
        </OrderProvider>
      </CartProvider>
    ),
  },
  {
    path: '/failed',
    element: (
      <CartProvider>
        <OrderProvider>
          <Layout>
            <Header />
            <main className="max-w-4xl mx-auto p-4">
              <Failed />
            </main>
          </Layout>
        </OrderProvider>
      </CartProvider>
    ),
  },
  {
    path: '/transactions',
    element: (
      <CartProvider>
        <OrderProvider>
          <Layout>
            <Header />
            <main className="max-w-4xl mx-auto p-4">
              <Transactions />
            </main>
          </Layout>
        </OrderProvider>
      </CartProvider>
    ),
  },
]