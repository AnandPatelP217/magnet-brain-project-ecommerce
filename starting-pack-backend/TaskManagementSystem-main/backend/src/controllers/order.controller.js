import orderService from '../services/order.service.js';
import razorpayService from '../services/stripe.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
import { STATUS } from '../constants/statusCodes.js';

/**
 * Create Razorpay order
 */
export const createOrder = async (req, res, next) => {
    try {
        const { items, customerEmail } = req.body;

        // Validate input
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError('Items array is required and must not be empty', STATUS.BAD_REQUEST);
        }

        if (!customerEmail) {
            throw new AppError('Customer email is required', STATUS.BAD_REQUEST);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            throw new AppError('Invalid email format', STATUS.BAD_REQUEST);
        }

        // Validate items
        for (const item of items) {
            if (!item.productId || !item.name || !item.price || !item.quantity) {
                throw new AppError('Each item must have productId, name, price, and quantity', STATUS.BAD_REQUEST);
            }
            if (item.price <= 0 || item.quantity <= 0) {
                throw new AppError('Price and quantity must be positive numbers', STATUS.BAD_REQUEST);
            }
        }

        // Calculate total
        const totalAmount = orderService.calculateTotal(items);

        // Create Razorpay order
        const razorpayOrder = await razorpayService.createOrder({
            amount: totalAmount,
            customerEmail,
            orderId: `order_${Date.now()}`
        });

        // Create order in database with pending status
        const order = await orderService.createOrder({
            items,
            customerEmail,
            totalAmount,
            paymentStatus: 'created',
            razorpayOrderId: razorpayOrder.orderId,
        });

        sendResponse(res, STATUS.CREATED, 'Order created successfully', {
            orderId: order._id,
            razorpayOrderId: razorpayOrder.orderId,
            amount: totalAmount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify payment
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw new AppError('Missing payment verification details', STATUS.BAD_REQUEST);
        }

        // Verify signature
        const isValid = razorpayService.verifyPaymentSignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature
        });

        if (!isValid) {
            throw new AppError('Invalid payment signature', STATUS.BAD_REQUEST);
        }

        // Update order with payment details
        const order = await orderService.updateOrderByRazorpayOrderId(razorpay_order_id, {
            paymentStatus: 'captured',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            orderStatus: 'processing'
        });

        sendResponse(res, STATUS.OK, 'Payment verified successfully', {
            order,
            verified: true
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get order by ID
 */
export const getOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await orderService.getOrderById(orderId);

        sendResponse(res, STATUS.OK, 'Order retrieved successfully', { order });
    } catch (error) {
        next(error);
    }
};

/**
 * Get orders by customer email
 */
export const getCustomerOrders = async (req, res, next) => {
    try {
        const { email } = req.query;

        if (!email) {
            throw new AppError('Email is required', STATUS.BAD_REQUEST);
        }

        const orders = await orderService.getOrdersByEmail(email);

        sendResponse(res, STATUS.OK, 'Orders retrieved successfully', {
            orders,
            count: orders.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all orders (with pagination)
 */
export const getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            paymentStatus: req.query.paymentStatus,
            orderStatus: req.query.orderStatus
        };

        const result = await orderService.getAllOrders(page, limit, filters);

        sendResponse(res, STATUS.OK, 'Orders retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};


