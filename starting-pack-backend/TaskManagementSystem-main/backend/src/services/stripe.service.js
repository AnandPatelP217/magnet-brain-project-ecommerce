import Stripe from 'stripe';
import AppError from '../utils/AppError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
    /**
     * Create a Stripe Checkout Session
     */
    async createCheckoutSession({ items, customerEmail, orderId, successUrl, cancelUrl }) {
        try {
            // Format line items for Stripe
            const lineItems = items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.description || `Product ID: ${item.productId}`,
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            }));

            // Create checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                customer_email: customerEmail,
                client_reference_id: orderId,
                success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
                metadata: {
                    orderId: orderId,
                },
            });

            return {
                sessionId: session.id,
                sessionUrl: session.url,
                paymentIntentId: session.payment_intent,
            };
        } catch (error) {
            console.error('Stripe checkout session error:', error);
            throw new AppError(`Failed to create checkout session: ${error.message}`, 500);
        }
    }

    /**
     * Create a Payment Intent directly
     */
    async createPaymentIntent({ amount, currency = 'usd', customerEmail, orderId }) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                receipt_email: customerEmail,
                metadata: {
                    orderId,
                    customerEmail,
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
            };
        } catch (error) {
            console.error('Stripe payment intent error:', error);
            throw new AppError(`Failed to create payment intent: ${error.message}`, 500);
        }
    }

    /**
     * Retrieve Payment Intent
     */
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Error retrieving payment intent:', error);
            throw new AppError(`Failed to retrieve payment intent: ${error.message}`, 500);
        }
    }

    /**
     * Retrieve Checkout Session
     */
    async getCheckoutSession(sessionId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent', 'customer'],
            });
            return session;
        } catch (error) {
            console.error('Error retrieving checkout session:', error);
            throw new AppError(`Failed to retrieve checkout session: ${error.message}`, 500);
        }
    }

    /**
     * Construct webhook event
     */
    constructWebhookEvent(payload, signature) {
        try {
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            
            if (!webhookSecret) {
                throw new Error('Stripe webhook secret not configured');
            }

            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret
            );

            return event;
        } catch (error) {
            console.error('Webhook signature verification failed:', error);
            throw new AppError(`Webhook signature verification failed: ${error.message}`, 400);
        }
    }

    /**
     * Cancel a payment intent
     */
    async cancelPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Error cancelling payment intent:', error);
            throw new AppError(`Failed to cancel payment intent: ${error.message}`, 500);
        }
    }

    /**
     * Create a refund
     */
    async createRefund(paymentIntentId, amount) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
            });
            return refund;
        } catch (error) {
            console.error('Error creating refund:', error);
            throw new AppError(`Failed to create refund: ${error.message}`, 500);
        }
    }
}

export default new StripeService();