import express from 'express';
import {
    createOrder,
    verifyPayment,
    getOrder,
    getCustomerOrders,
    getAllOrders
} from '../controllers/order.controller.js';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Webhook route - must use raw body for signature verification
// Note: This route should be registered before express.json() middleware
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

router.post('/create', createOrder);
router.post('/verify', verifyPayment);
router.get('/:orderId', getOrder);
router.get('/customer/orders', getCustomerOrders);
router.get('/', getAllOrders);

export default router;