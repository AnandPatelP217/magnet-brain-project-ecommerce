import Order from "../models/order.model.js";

export class OrderRepository {
  /**
   * Create a new order
   */
  async create(orderData) {
    return await Order.create(orderData);
  }

  /**
   * Find order by ID
   */
  async findById(orderId) {
    return await Order.findById(orderId);
  }

  /**
   * Find order by Stripe Payment Intent ID
   */
  async findByPaymentIntentId(paymentIntentId) {
    return await Order.findOne({ stripePaymentIntentId: paymentIntentId });
  }

  /**
   * Find order by Stripe Session ID
   */
  async findBySessionId(sessionId) {
    return await Order.findOne({ stripeSessionId: sessionId });
  }

  /**
   * Find all orders by customer email
   */
  async findByEmail(email) {
    return await Order.find({ customerEmail: email }).sort({ createdAt: -1 });
  }

  /**
   * Find all orders with pagination and filters
   */
  async findAll(query = {}, skip = 0, limit = 10) {
    return await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  /**
   * Count documents with query
   */
  async countDocuments(query = {}) {
    return await Order.countDocuments(query);
  }

  /**
   * Update order by ID
   */
  async updateById(orderId, updateData) {
    return await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Update order by Payment Intent ID
   */
  async updateByPaymentIntentId(paymentIntentId, updateData) {
    return await Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  /**
   * Update order by Session ID
   */
  async updateBySessionId(sessionId, updateData) {
    return await Order.findOneAndUpdate(
      { stripeSessionId: sessionId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  /**
   * Delete order by ID
   */
  async deleteById(orderId) {
    return await Order.findByIdAndDelete(orderId);
  }

  /**
   * Check if order exists by payment intent ID
   */
  async existsByPaymentIntentId(paymentIntentId) {
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    return !!order;
  }
}
