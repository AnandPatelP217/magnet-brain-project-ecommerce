import express from 'express';
import {
    createOrder,
    verifyPayment,
    getOrder,
    getCustomerOrders,
    getAllOrders
} from '../controllers/order.controller.js';

const router = express.Router();


router.post('/create', createOrder);
router.post('/verify', verifyPayment);
router.get('/:orderId', getOrder);
router.get('/customer/orders', getCustomerOrders);
router.get('/', getAllOrders);

export default router;