import orderService from '../services/order.service.js';
import stripeService from '../services/stripe.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
import { STATUS } from '../constants/statusCodes.js';

/**
 * Create Stripe payment intent
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

        // Create Stripe payment intent
        const paymentIntent = await stripeService.createPaymentIntent({
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
            stripePaymentIntentId: paymentIntent.paymentIntentId,
        });

        sendResponse(res, STATUS.CREATED, 'Order created successfully', {
            orderId: order._id,
            clientSecret: paymentIntent.clientSecret,
            paymentIntentId: paymentIntent.paymentIntentId,
            amount: totalAmount,
            currency: paymentIntent.currency,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
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
        const { payment_intent_id } = req.body;

        if (!payment_intent_id) {
            throw new AppError('Missing payment intent ID', STATUS.BAD_REQUEST);
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripeService.getPaymentIntent(payment_intent_id);

        if (paymentIntent.status !== 'succeeded') {
            throw new AppError('Payment not successful', STATUS.BAD_REQUEST);
        }

        // Update order with payment details
        const order = await orderService.updateOrderByStripePaymentIntentId(payment_intent_id, {
            paymentStatus: 'captured',
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


