import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    items: [
        {
            productId: String,
            name: String,
            price: Number,
            quantity: Number,
        }
    ],
    customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'created', 'authorized', 'captured', 'failed', 'cancelled'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true
    },
    razorpaySignature: {
        type: String,
        sparse: true
    },
    paymentMethod: {
        type: String,
        default: 'razorpay'
    },
    currency: {
        type: String,
        default: 'INR'
    },
    shippingAddress: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String
    },
    billingAddress: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String
    },
    orderStatus: {
        type: String,
        enum: ['created', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'created'
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Index for faster queries
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ razorpayPaymentId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;