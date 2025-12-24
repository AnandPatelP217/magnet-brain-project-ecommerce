import { OrderRepository } from '../repository/order.controller.js';
import { AppError } from '../utils/AppError.js';

const orderRepository = new OrderRepository();

class OrderService {
    /**
     * Create a new order
     */
    async createOrder(orderData) {
        try {
            const order = await orderRepository.create(orderData);
            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw new AppError(`Failed to create order: ${error.message}`, 500);
        }
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId) {
        try {
            const order = await orderRepository.findById(orderId);
            
            if (!order) {
                throw new AppError('Order not found', 404);
            }
            
            return order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error fetching order:', error);
            throw new AppError(`Failed to fetch order: ${error.message}`, 500);
        }
    }

    /**
     * Get order by Stripe Payment Intent ID
     */
    async getOrderByStripePaymentIntentId(stripePaymentIntentId) {
        try {
            const order = await orderRepository.findByStripePaymentIntentId(stripePaymentIntentId);
            
            if (!order) {
                throw new AppError('Order not found for this Stripe payment intent', 404);
            }
            
            return order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error fetching order by Stripe payment intent ID:', error);
            throw new AppError(`Failed to fetch order: ${error.message}`, 500);
        }
    }

    /**
     * Get order by Stripe Payment Method ID
     */
    async getOrderByStripePaymentMethodId(stripePaymentMethodId) {
        try {
            const order = await orderRepository.findByStripePaymentMethodId(stripePaymentMethodId);
            
            if (!order) {
                throw new AppError('Order not found for this Stripe payment method', 404);
            }
            
            return order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error fetching order by Stripe payment method ID:', error);
            throw new AppError(`Failed to fetch order: ${error.message}`, 500);
        }
    }

    /**
     * Get all orders for a customer
     */
    async getOrdersByEmail(email) {
        try {
            const orders = await orderRepository.findByEmail(email);
            
            return orders;
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            throw new AppError(`Failed to fetch orders: ${error.message}`, 500);
        }
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status) {
        try {
            const order = await orderRepository.updateById(
                orderId,
                { paymentStatus: status }
            );
            
            if (!order) {
                throw new AppError('Order not found', 404);
            }
            
            return order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error updating order status:', error);
            throw new AppError(`Failed to update order status: ${error.message}`, 500);
        }
    }

    /**
     * Update order by Stripe payment intent ID
     */
    async updateOrderByStripePaymentIntentId(stripePaymentIntentId, updateData) {
        try {
            const order = await orderRepository.updateByStripePaymentIntentId(
                stripePaymentIntentId,
                updateData
            );
            
            if (!order) {
                throw new AppError('Order not found for this Stripe payment intent', 404);
            }
            
            return order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error updating order:', error);
            throw new AppError(`Failed to update order: ${error.message}`, 500);
        }
    }

    /**
     * Update order by Stripe payment method ID
     */
    async updateOrderByStripePaymentMethodId(stripePaymentMethodId, updateData) {
        try {
            const order = await orderRepository.updateByStripePaymentMethodId(
                stripePaymentMethodId,
                updateData
            );
            
            if (!order) {
                throw new AppError('Order not found for this Stripe payment method', 404);
            }
            
            return order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error updating order:', error);
            throw new AppError(`Failed to update order: ${error.message}`, 500);
        }
    }

    /**
     * Get all orders with pagination
     */
    async getAllOrders(page = 1, limit = 10, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            
            const query = {};
            if (filters.paymentStatus) {
                query.paymentStatus = filters.paymentStatus;
            }
            if (filters.orderStatus) {
                query.orderStatus = filters.orderStatus;
            }
            
            const [orders, total] = await Promise.all([
                orderRepository.findAll(query, skip, limit),
                orderRepository.countDocuments(query)
            ]);
            
            return {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw new AppError(`Failed to fetch orders: ${error.message}`, 500);
        }
    }

    /**
     * Calculate total amount from items
     */
    calculateTotal(items) {
        return items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Delete order (admin only)
     */
    async deleteOrder(orderId) {
        try {
            const order = await orderRepository.deleteById(orderId);
            
            if (!order) {
                throw new AppError('Order not found', 404);
            }
            
            return order;
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('Error deleting order:', error);
            throw new AppError(`Failed to delete order: ${error.message}`, 500);
        }
    }
}

export default new OrderService();