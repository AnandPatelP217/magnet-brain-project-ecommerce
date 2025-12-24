import express from 'express';
import {
    createOrder,
    verifyPayment,
    getOrder,
    getCustomerOrders,
    getAllOrders
} from '../controllers/order.controller.js';

const router = express.Router();

/**
 * Public routes
 */

// Create Razorpay order
router.post('/create', createOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Get single order by ID
router.get('/:orderId', getOrder);

// Get orders by customer email
router.get('/customer/orders', getCustomerOrders);

// Get all orders (with pagination and filters)
router.get('/', getAllOrders);

export default router;