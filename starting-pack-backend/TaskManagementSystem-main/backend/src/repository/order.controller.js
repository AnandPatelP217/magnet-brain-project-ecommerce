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
  async findByStripePaymentIntentId(stripePaymentIntentId) {
    return await Order.findOne({ stripePaymentIntentId });
  }

  /**
   * Find order by Stripe Payment Method ID
   */
  async findByStripePaymentMethodId(stripePaymentMethodId) {
    return await Order.findOne({ stripePaymentMethodId });
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
   * Update order by Stripe Payment Intent ID
   */
  async updateByStripePaymentIntentId(stripePaymentIntentId, updateData) {
    return await Order.findOneAndUpdate(
      { stripePaymentIntentId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  /**
   * Update order by Stripe Payment Method ID
   */
  async updateByStripePaymentMethodId(stripePaymentMethodId, updateData) {
    return await Order.findOneAndUpdate(
      { stripePaymentMethodId },
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
   * Check if order exists by Stripe payment intent ID
   */
  async existsByStripePaymentIntentId(stripePaymentIntentId) {
    const order = await Order.findOne({ stripePaymentIntentId });
    return !!order;
  }
}
