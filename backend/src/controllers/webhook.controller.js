import stripeService from '../services/stripe.service.js';
import orderService from '../services/order.service.js';
import { AppError } from '../utils/AppError.js';
import { STATUS } from '../constants/statusCodes.js';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_EPZ9KYH9GMjkwPdSEpLX4maOITkUHo8Z';

/**
 * Handle Stripe webhook events
 */
export const handleStripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    try {
        // Verify webhook signature
        const event = stripeService.verifyWebhookSignature(
            req.body,
            sig,
            STRIPE_WEBHOOK_SECRET
        );

        console.log(`Received webhook event: ${event.type}`);

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.created':
                await handlePaymentIntentCreated(event.data.object);
                break;

            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;

            case 'payment_intent.canceled':
                await handlePaymentIntentCanceled(event.data.object);
                break;

            case 'payment_intent.processing':
                await handlePaymentIntentProcessing(event.data.object);
                break;

            case 'charge.succeeded':
                await handleChargeSucceeded(event.data.object);
                break;

            case 'charge.failed':
                await handleChargeFailed(event.data.object);
                break;

            case 'charge.refunded':
                await handleChargeRefunded(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        
        if (error.message.includes('Webhook signature verification failed')) {
            return res.status(400).json({ 
                error: 'Webhook signature verification failed' 
            });
        }
        
        return res.status(500).json({ 
            error: 'Webhook handler failed',
            message: error.message 
        });
    }
};

/**
 * Handle payment_intent.created event
 */
const handlePaymentIntentCreated = async (paymentIntent) => {
    try {
        console.log(`Payment Intent Created: ${paymentIntent.id}`);
        
        // Update order status to 'created' if not already
        const order = await orderService.getOrderByStripePaymentIntentId(paymentIntent.id);
        
        if (order && order.paymentStatus === 'pending') {
            await orderService.updateOrderByStripePaymentIntentId(paymentIntent.id, {
                paymentStatus: 'created'
            });
            console.log(`Order ${order._id} status updated to 'created'`);
        }
    } catch (error) {
        console.error('Error handling payment_intent.created:', error);
    }
};

/**
 * Handle payment_intent.succeeded event
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
    try {
        console.log(`Payment Intent Succeeded: ${paymentIntent.id}`);
        
        // Update order to captured/processing
        const order = await orderService.updateOrderByStripePaymentIntentId(paymentIntent.id, {
            paymentStatus: 'captured',
            orderStatus: 'processing',
            stripePaymentMethodId: paymentIntent.payment_method
        });
        
        console.log(`Order ${order._id} payment captured and moved to processing`);
    } catch (error) {
        console.error('Error handling payment_intent.succeeded:', error);
    }
};

/**
 * Handle payment_intent.payment_failed event
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
    try {
        console.log(`Payment Intent Failed: ${paymentIntent.id}`);
        
        // Update order to failed
        const order = await orderService.updateOrderByStripePaymentIntentId(paymentIntent.id, {
            paymentStatus: 'failed',
            orderStatus: 'cancelled'
        });
        
        console.log(`Order ${order._id} payment failed`);
    } catch (error) {
        console.error('Error handling payment_intent.payment_failed:', error);
    }
};

/**
 * Handle payment_intent.canceled event
 */
const handlePaymentIntentCanceled = async (paymentIntent) => {
    try {
        console.log(`Payment Intent Canceled: ${paymentIntent.id}`);
        
        // Update order to cancelled
        const order = await orderService.updateOrderByStripePaymentIntentId(paymentIntent.id, {
            paymentStatus: 'cancelled',
            orderStatus: 'cancelled'
        });
        
        console.log(`Order ${order._id} payment cancelled`);
    } catch (error) {
        console.error('Error handling payment_intent.canceled:', error);
    }
};

/**
 * Handle payment_intent.processing event
 */
const handlePaymentIntentProcessing = async (paymentIntent) => {
    try {
        console.log(`Payment Intent Processing: ${paymentIntent.id}`);
        
        // Update order to authorized (payment is being processed)
        const order = await orderService.updateOrderByStripePaymentIntentId(paymentIntent.id, {
            paymentStatus: 'authorized'
        });
        
        console.log(`Order ${order._id} payment is being processed`);
    } catch (error) {
        console.error('Error handling payment_intent.processing:', error);
    }
};

/**
 * Handle charge.succeeded event
 */
const handleChargeSucceeded = async (charge) => {
    try {
        console.log(`Charge Succeeded: ${charge.id}, Payment Intent: ${charge.payment_intent}`);
        
        if (charge.payment_intent) {
            const order = await orderService.updateOrderByStripePaymentIntentId(charge.payment_intent, {
                paymentStatus: 'captured',
                orderStatus: 'processing'
            });
            
            console.log(`Order ${order._id} charge succeeded`);
        }
    } catch (error) {
        console.error('Error handling charge.succeeded:', error);
    }
};

/**
 * Handle charge.failed event
 */
const handleChargeFailed = async (charge) => {
    try {
        console.log(`Charge Failed: ${charge.id}, Payment Intent: ${charge.payment_intent}`);
        
        if (charge.payment_intent) {
            const order = await orderService.updateOrderByStripePaymentIntentId(charge.payment_intent, {
                paymentStatus: 'failed',
                orderStatus: 'cancelled'
            });
            
            console.log(`Order ${order._id} charge failed`);
        }
    } catch (error) {
        console.error('Error handling charge.failed:', error);
    }
};

/**
 * Handle charge.refunded event
 */
const handleChargeRefunded = async (charge) => {
    try {
        console.log(`Charge Refunded: ${charge.id}, Payment Intent: ${charge.payment_intent}`);
        
        if (charge.payment_intent) {
            const order = await orderService.updateOrderByStripePaymentIntentId(charge.payment_intent, {
                paymentStatus: 'cancelled',
                orderStatus: 'cancelled'
            });
            
            console.log(`Order ${order._id} charge refunded`);
        }
    } catch (error) {
        console.error('Error handling charge.refunded:', error);
    }
};
