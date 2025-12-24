/**
 * Mock Product Data for Testing E-Commerce Checkout
 * Use this data for frontend development and testing
 */

export const mockProducts = [
  {
    productId: 'prod_001',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    inStock: true,
    rating: 4.5
  },
  {
    productId: 'prod_002',
    name: 'Smart Fitness Watch',
    description: 'Track your fitness goals with this advanced smartwatch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Wearables',
    inStock: true,
    rating: 4.7
  },
  {
    productId: 'prod_003',
    name: 'Portable USB-C Charger',
    description: '20000mAh power bank with fast charging capability',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
    category: 'Accessories',
    inStock: true,
    rating: 4.3
  },
  {
    productId: 'prod_004',
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with customizable keys',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    category: 'Gaming',
    inStock: true,
    rating: 4.8
  },
  {
    productId: 'prod_005',
    name: 'HD Webcam with Microphone',
    description: '1080p webcam perfect for video calls and streaming',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
    category: 'Electronics',
    inStock: true,
    rating: 4.4
  },
  {
    productId: 'prod_006',
    name: 'Ergonomic Wireless Mouse',
    description: 'Comfortable wireless mouse with precision tracking',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    category: 'Accessories',
    inStock: true,
    rating: 4.6
  },
  {
    productId: 'prod_007',
    name: 'USB Desk Microphone',
    description: 'Professional-grade USB microphone for podcasts and streaming',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500',
    category: 'Audio',
    inStock: true,
    rating: 4.7
  },
  {
    productId: 'prod_008',
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand for better ergonomics',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    category: 'Accessories',
    inStock: true,
    rating: 4.5
  },
  {
    productId: 'prod_009',
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with USB charging port',
    price: 54.99,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500',
    category: 'Home',
    inStock: true,
    rating: 4.2
  },
  {
    productId: 'prod_010',
    name: 'Phone Holder Stand',
    description: 'Universal adjustable phone holder for desk',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500',
    category: 'Accessories',
    inStock: true,
    rating: 4.1
  },
  {
    productId: 'prod_011',
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with charging case',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
    category: 'Audio',
    inStock: true,
    rating: 4.6
  },
  {
    productId: 'prod_012',
    name: 'External SSD 1TB',
    description: 'Portable solid-state drive with ultra-fast transfer speeds',
    price: 159.99,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    category: 'Storage',
    inStock: true,
    rating: 4.8
  }
];

/**
 * Sample cart items for testing checkout
 */
export const sampleCart = [
  {
    productId: 'prod_001',
    name: 'Wireless Bluetooth Headphones',
    price: 89.99,
    quantity: 1,
    description: 'Premium noise-cancelling wireless headphones'
  },
  {
    productId: 'prod_003',
    name: 'Portable USB-C Charger',
    price: 45.99,
    quantity: 2,
    description: '20000mAh power bank with fast charging'
  }
];

/**
 * Sample customer data for testing
 */
export const sampleCustomer = {
  email: 'customer@example.com',
  name: 'John Doe'
};
