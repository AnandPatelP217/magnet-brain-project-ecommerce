import orderService from '../services/order.service.js';
import stripeService from '../services/stripe.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import AppError from '../utils/AppError.js';
import { StatusCodes } from '../constants/statusCodes.js';

/**
 * Create checkout session
 */
export const createCheckoutSession = async (req, res, next) => {
    try {
        const { items, customerEmail, successUrl, cancelUrl } = req.body;

        // Validate input
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError('Items array is required and must not be empty', StatusCodes.BAD_REQUEST);
        }

        if (!customerEmail) {
            throw new AppError('Customer email is required', StatusCodes.BAD_REQUEST);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            throw new AppError('Invalid email format', StatusCodes.BAD_REQUEST);
        }

        // Validate items
        for (const item of items) {
            if (!item.productId || !item.name || !item.price || !item.quantity) {
                throw new AppError('Each item must have productId, name, price, and quantity', StatusCodes.BAD_REQUEST);
            }
            if (item.price <= 0 || item.quantity <= 0) {
                throw new AppError('Price and quantity must be positive numbers', StatusCodes.BAD_REQUEST);
            }
        }

        // Calculate total
        const totalAmount = orderService.calculateTotal(items);

        // Create payment intent first to get the payment intent ID
        const paymentIntent = await stripeService.createPaymentIntent({
            amount: totalAmount,
            customerEmail,
            orderId: 'pending'
        });

        // Create order in database with pending status
        const order = await orderService.createOrder({
            items,
            customerEmail,
            totalAmount,
            paymentStatus: 'pending',
            stripePaymentIntentId: paymentIntent.paymentIntentId,
        });

        // Create checkout session
        const session = await stripeService.createCheckoutSession({
            items,
            customerEmail,
            orderId: order._id.toString(),
            successUrl,
            cancelUrl
        });

        // Update order with session ID
        await orderService.updateOrderByPaymentIntent(paymentIntent.paymentIntentId, {
            stripeSessionId: session.sessionId
        });

        sendResponse(res, StatusCodes.CREATED, 'Checkout session created successfully', {
            sessionId: session.sessionId,
            sessionUrl: session.sessionUrl,
            orderId: order._id,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create payment intent (for custom checkout)
 */
export const createPaymentIntent = async (req, res, next) => {
    try {
        const { items, customerEmail } = req.body;

        // Validate input
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError('Items array is required and must not be empty', StatusCodes.BAD_REQUEST);
        }

        if (!customerEmail) {
            throw new AppError('Customer email is required', StatusCodes.BAD_REQUEST);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            throw new AppError('Invalid email format', StatusCodes.BAD_REQUEST);
        }

        // Calculate total
        const totalAmount = orderService.calculateTotal(items);

        // Create order in database with pending status
        const order = await orderService.createOrder({
            items,
            customerEmail,
            totalAmount,
            paymentStatus: 'pending',
            stripePaymentIntentId: 'pending', // Temporary, will be updated
        });

        // Create payment intent
        const paymentIntent = await stripeService.createPaymentIntent({
            amount: totalAmount,
            customerEmail,
            orderId: order._id.toString()
        });

        // Update order with payment intent ID
        order.stripePaymentIntentId = paymentIntent.paymentIntentId;
        await order.save();

        sendResponse(res, StatusCodes.CREATED, 'Payment intent created successfully', {
            clientSecret: paymentIntent.clientSecret,
            paymentIntentId: paymentIntent.paymentIntentId,
            orderId: order._id,
            totalAmount
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify payment status
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const { sessionId } = req.query;

        if (!sessionId) {
            throw new AppError('Session ID is required', StatusCodes.BAD_REQUEST);
        }

        // Get session from Stripe
        const session = await stripeService.getCheckoutSession(sessionId);

        // Get order from database
        const order = await orderService.getOrderBySessionId(sessionId);

        sendResponse(res, StatusCodes.OK, 'Payment verified successfully', {
            order,
            paymentStatus: session.payment_status,
            sessionStatus: session.status
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

        sendResponse(res, StatusCodes.OK, 'Order retrieved successfully', { order });
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
            throw new AppError('Email is required', StatusCodes.BAD_REQUEST);
        }

        const orders = await orderService.getOrdersByEmail(email);

        sendResponse(res, StatusCodes.OK, 'Orders retrieved successfully', {
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

        sendResponse(res, StatusCodes.OK, 'Orders retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Webhook handler for Stripe events
 */
export const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['stripe-signature'];

        if (!signature) {
            throw new AppError('Missing stripe signature', StatusCodes.BAD_REQUEST);
        }

        // Construct event from webhook
        const event = stripeService.constructWebhookEvent(req.body, signature);

        console.log(`Received webhook event: ${event.type}`);

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;

            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;

            case 'payment_intent.canceled':
                await handlePaymentCanceled(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return success response to Stripe
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        next(error);
    }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
    try {
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        await orderService.updateOrderByPaymentIntent(paymentIntent.id, {
            paymentStatus: 'succeeded',
            orderStatus: 'processing',
            metadata: {
                paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
                receiptEmail: paymentIntent.receipt_email
            }
        });

        console.log(`Order updated for payment intent: ${paymentIntent.id}`);
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
    try {
        console.log(`Payment failed: ${paymentIntent.id}`);

        await orderService.updateOrderByPaymentIntent(paymentIntent.id, {
            paymentStatus: 'failed',
            metadata: {
                failureCode: paymentIntent.last_payment_error?.code,
                failureMessage: paymentIntent.last_payment_error?.message
            }
        });

        console.log(`Order updated for failed payment: ${paymentIntent.id}`);
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session) {
    try {
        console.log(`Checkout session completed: ${session.id}`);

        const updateData = {
            paymentStatus: session.payment_status === 'paid' ? 'succeeded' : 'pending',
            orderStatus: session.payment_status === 'paid' ? 'processing' : 'created'
        };

        // Add shipping address if available
        if (session.shipping_details) {
            updateData.shippingAddress = session.shipping_details.address;
        }

        await orderService.updateOrderBySessionId(session.id, updateData);

        console.log(`Order updated for session: ${session.id}`);
    } catch (error) {
        console.error('Error handling checkout session completion:', error);
    }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent) {
    try {
        console.log(`Payment canceled: ${paymentIntent.id}`);

        await orderService.updateOrderByPaymentIntent(paymentIntent.id, {
            paymentStatus: 'cancelled',
            orderStatus: 'cancelled'
        });

        console.log(`Order updated for canceled payment: ${paymentIntent.id}`);
    } catch (error) {
        console.error('Error handling payment cancellation:', error);
    }
}