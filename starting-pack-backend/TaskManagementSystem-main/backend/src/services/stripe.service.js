import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AppError } from '../utils/AppError.js';

let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

class RazorpayService {
    /**
     * Create a Razorpay Order
     */
    async createOrder({ amount, currency = 'INR', customerEmail, orderId }) {
        try {
            const options = {
                amount: Math.round(amount * 100), // Convert to paise
                currency,
                receipt: orderId || `order_${Date.now()}`,
                notes: {
                    customerEmail,
                    orderId
                }
            };

            const order = await getRazorpayInstance().orders.create(options);

            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                status: order.status
            };
        } catch (error) {
            console.error('Razorpay order creation error:', error);
            throw new AppError(`Failed to create Razorpay order: ${error.message}`, 500);
        }
    }

    /**
     * Verify Payment Signature
     */
    verifyPaymentSignature({ orderId, paymentId, signature }) {
        try {
            const secret = process.env.RAZORPAY_KEY_SECRET;
            
            if (!secret) {
                throw new Error('Razorpay key secret not configured');
            }

            const body = orderId + '|' + paymentId;
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body.toString())
                .digest('hex');

            return expectedSignature === signature;
        } catch (error) {
            console.error('Signature verification error:', error);
            throw new AppError(`Signature verification failed: ${error.message}`, 400);
        }
    }

    /**
     * Fetch Payment Details
     */
    async getPayment(paymentId) {
        try {
            const payment = await getRazorpayInstance().payments.fetch(paymentId);
            return payment;
        } catch (error) {
            console.error('Error fetching payment:', error);
            throw new AppError(`Failed to fetch payment: ${error.message}`, 500);
        }
    }

    /**
     * Fetch Order Details
     */
    async getOrder(orderId) {
        try {
            const order = await getRazorpayInstance().orders.fetch(orderId);
            return order;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw new AppError(`Failed to fetch order: ${error.message}`, 500);
        }
    }

    /**
     * Create Refund
     */
    async createRefund(paymentId, amount) {
        try {
            const refund = await getRazorpayInstance().payments.refund(paymentId, {
                amount: amount ? Math.round(amount * 100) : undefined,
            });
            return refund;
        } catch (error) {
            console.error('Error creating refund:', error);
            throw new AppError(`Failed to create refund: ${error.message}`, 500);
        }
    }
}

export default new RazorpayService();