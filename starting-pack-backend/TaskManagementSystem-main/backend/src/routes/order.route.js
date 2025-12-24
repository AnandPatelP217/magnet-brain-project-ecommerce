import express from 'express';
import {
    createCheckoutSession,
    createPaymentIntent,
    verifyPayment,
    getOrder,
    getCustomerOrders,
    getAllOrders,
    handleWebhook
} from '../controllers/order.controller.js';

const router = express.Router();

/**
 * Public routes
 */

// Create checkout session
router.post('/checkout/session', createCheckoutSession);

// Create payment intent (for custom checkout)
router.post('/checkout/payment-intent', createPaymentIntent);

// Verify payment status
router.get('/verify-payment', verifyPayment);

// Get single order by ID
router.get('/:orderId', getOrder);

// Get orders by customer email
router.get('/customer/orders', getCustomerOrders);

// Get all orders (with pagination and filters)
router.get('/', getAllOrders);

/**
 * Webhook route - must use raw body
 * This route should be registered before express.json() middleware
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;