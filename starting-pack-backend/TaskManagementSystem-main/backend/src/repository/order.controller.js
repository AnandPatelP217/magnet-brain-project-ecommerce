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
   * Find order by Razorpay Order ID
   */
  async findByRazorpayOrderId(razorpayOrderId) {
    return await Order.findOne({ razorpayOrderId });
  }

  /**
   * Find order by Razorpay Payment ID
   */
  async findByRazorpayPaymentId(razorpayPaymentId) {
    return await Order.findOne({ razorpayPaymentId });
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
   * Update order by Razorpay Order ID
   */
  async updateByRazorpayOrderId(razorpayOrderId, updateData) {
    return await Order.findOneAndUpdate(
      { razorpayOrderId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  /**
   * Update order by Razorpay Payment ID
   */
  async updateByRazorpayPaymentId(razorpayPaymentId, updateData) {
    return await Order.findOneAndUpdate(
      { razorpayPaymentId },
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
   * Check if order exists by Razorpay order ID
   */
  async existsByRazorpayOrderId(razorpayOrderId) {
    const order = await Order.findOne({ razorpayOrderId });
    return !!order;
  }
}
