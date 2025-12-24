import Stripe from 'stripe';
import { AppError } from '../utils/AppError.js';

let stripe = null;

const getStripeInstance = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

class StripeService {
    /**
     * Create a Stripe Payment Intent
     */
    async createPaymentIntent({ amount, currency = 'usd', customerEmail, orderId }) {
        try {
            const paymentIntent = await getStripeInstance().paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                receipt_email: customerEmail,
                metadata: {
                    orderId: orderId || `order_${Date.now()}`,
                    customerEmail
                },
                automatic_payment_methods: {
                    enabled: true,
                }
            });

            return {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status
            };
        } catch (error) {
            console.error('Stripe payment intent creation error:', error);
            throw new AppError(`Failed to create Stripe payment intent: ${error.message}`, 500);
        }
    }

    /**
     * Retrieve Payment Intent
     */
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await getStripeInstance().paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Error fetching payment intent:', error);
            throw new AppError(`Failed to fetch payment intent: ${error.message}`, 500);
        }
    }

    /**
     * Confirm Payment Intent
     */
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const paymentIntent = await getStripeInstance().paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId
            });
            return paymentIntent;
        } catch (error) {
            console.error('Error confirming payment intent:', error);
            throw new AppError(`Failed to confirm payment intent: ${error.message}`, 500);
        }
    }

    /**
     * Create Refund
     */
    async createRefund(paymentIntentId, amount) {
        try {
            const refund = await getStripeInstance().refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined,
            });
            return refund;
        } catch (error) {
            console.error('Error creating refund:', error);
            throw new AppError(`Failed to create refund: ${error.message}`, 500);
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature, secret) {
        try {
            const event = getStripeInstance().webhooks.constructEvent(
                payload,
                signature,
                secret
            );
            return event;
        } catch (error) {
            console.error('Webhook signature verification error:', error);
            throw new AppError(`Webhook signature verification failed: ${error.message}`, 400);
        }
    }
}

export default new StripeService();