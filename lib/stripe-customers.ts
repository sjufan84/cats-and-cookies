import { db } from './db';
import { orders, customers } from '@/db/schema';
import { eq, and, desc, like, sql } from 'drizzle-orm';
import { stripe } from './stripe';

export interface CustomerData {
  email: string;
  name?: string;
  phone?: string;
  preferences?: Record<string, unknown>;
}

export interface CustomerSearchOptions {
  email?: string;
  name?: string;
  phone?: string;
  limit?: number;
  offset?: number;
}

export class StripeCustomerManager {
  /**
   * Create or retrieve Stripe customer with local caching
   */
  static async createOrGetCustomer(email: string, name?: string): Promise<string> {
    try {
      // First, check our local database
      const [localCustomer] = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      if (localCustomer) {
        return localCustomer.stripeCustomerId;
      }

      // If not in local DB, check Stripe
      const stripeCustomers = await stripe.customers.list({ email, limit: 1 });

      let stripeCustomerId: string;

      if (stripeCustomers.data.length > 0) {
        // Customer exists in Stripe, add to local DB
        stripeCustomerId = stripeCustomers.data[0].id;
        const stripeCustomer = stripeCustomers.data[0];

        await db.insert(customers).values({
          stripeCustomerId,
          email: stripeCustomer.email || email,
          name: stripeCustomer.name || name,
          phone: stripeCustomer.phone || undefined,
          preferences: stripeCustomer.metadata ? JSON.stringify(stripeCustomer.metadata) : undefined,
        });

        return stripeCustomerId;
      }

      // Create new customer in Stripe
      const newStripeCustomer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
          source: 'cats-and-cookies',
          created_via: 'checkout'
        }
      });

      // Add to local database
      await db.insert(customers).values({
        stripeCustomerId: newStripeCustomer.id,
        email: newStripeCustomer.email || email,
        name: newStripeCustomer.name || name,
        phone: newStripeCustomer.phone || undefined,
      });

      return newStripeCustomer.id;

    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      throw error;
    }
  }

  /**
   * Get customer by email (from local database)
   */
  static async getCustomerByEmail(email: string) {
    try {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      return customer || null;
    } catch (error) {
      console.error('Error getting customer by email:', error);
      throw error;
    }
  }

  /**
   * Get customer by Stripe ID (from local database)
   */
  static async getCustomerByStripeId(stripeCustomerId: string) {
    try {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.stripeCustomerId, stripeCustomerId))
        .limit(1);

      return customer || null;
    } catch (error) {
      console.error('Error getting customer by Stripe ID:', error);
      throw error;
    }
  }

  /**
   * Search customers with various filters
   */
  static async searchCustomers(options: CustomerSearchOptions = {}) {
    try {
      const { email, name, phone, limit = 20, offset = 0 } = options;

      const whereConditions = [];

      if (email) {
        whereConditions.push(like(customers.email, `%${email}%`));
      }
      if (name) {
        whereConditions.push(like(customers.name, `%${name}%`));
      }
      if (phone) {
        whereConditions.push(like(customers.phone, `%${phone}%`));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const results = await db
        .select()
        .from(customers)
        .where(whereClause)
        .orderBy(desc(customers.lastOrderDate))
        .limit(limit)
        .offset(offset);

      return results;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  /**
   * Get customer order history (optimized with local data)
   */
  static async getCustomerOrderHistory(customerId: string) {
    try {
      // Get orders from our database (faster than Stripe API)
      const customerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.stripeCustomerId, customerId))
        .orderBy(desc(orders.createdAt));

      // Get customer info from local database
      const customer = await this.getCustomerByStripeId(customerId);

      return {
        customer,
        orders: customerOrders,
        totalOrders: customerOrders.length,
        totalSpent: customerOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
      };

    } catch (error) {
      console.error('Error getting customer order history:', error);
      throw error;
    }
  }

  /**
   * Update customer information
   */
  static async updateCustomer(stripeCustomerId: string, customerData: Partial<CustomerData>) {
    try {
      // Update in Stripe
      const stripeUpdateData: {
        name?: string;
        phone?: string;
        metadata?: Record<string, string>;
      } = {};
      if (customerData.name) stripeUpdateData.name = customerData.name;
      if (customerData.phone) stripeUpdateData.phone = customerData.phone;
      if (customerData.preferences) {
        // Convert preferences to string values for Stripe metadata
        const metadata: Record<string, string> = {};
        Object.entries(customerData.preferences).forEach(([key, value]) => {
          metadata[key] = String(value);
        });
        stripeUpdateData.metadata = metadata;
      }

      if (Object.keys(stripeUpdateData).length > 0) {
        await stripe.customers.update(stripeCustomerId, stripeUpdateData);
      }

      // Update in local database
      const localUpdateData: {
        name?: string;
        phone?: string;
        preferences?: string;
        updatedAt: Date;
      } = {
        updatedAt: new Date()
      };
      if (customerData.name) localUpdateData.name = customerData.name;
      if (customerData.phone) localUpdateData.phone = customerData.phone;
      if (customerData.preferences) localUpdateData.preferences = JSON.stringify(customerData.preferences);

      if (Object.keys(localUpdateData).length > 1) { // More than just updatedAt
        await db
          .update(customers)
          .set(localUpdateData)
          .where(eq(customers.stripeCustomerId, stripeCustomerId));
      }

      return await this.getCustomerByStripeId(stripeCustomerId);

    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Update customer statistics after an order
   */
  static async updateCustomerStats(stripeCustomerId: string, orderTotal: number) {
    try {
      await db
        .update(customers)
        .set({
          totalOrders: sql`${customers.totalOrders} + 1`,
          totalSpent: sql`${customers.totalSpent} + ${orderTotal}`,
          lastOrderDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(customers.stripeCustomerId, stripeCustomerId));

    } catch (error) {
      console.error('Error updating customer stats:', error);
      throw error;
    }
  }

  /**
   * Create subscription for cookie subscription service
   */
  static async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: metadata || {}
      });

      return subscription;

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      const result = await stripe.subscriptions.cancel(subscriptionId);
      return result;

    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Get customer subscriptions
   */
  static async getCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 10
      });

      return subscriptions.data;

    } catch (error) {
      console.error('Error getting customer subscriptions:', error);
      throw error;
    }
  }

  /**
   * Process refund for a customer with local tracking
   */
  static async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ) {
    try {
      const refundParams: {
        payment_intent: string;
        amount?: number;
        reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
      } = {
        payment_intent: paymentIntentId
      };
      
      if (amount) {
        refundParams.amount = amount;
      }
      
      if (reason && ['duplicate', 'fraudulent', 'requested_by_customer'].includes(reason)) {
        refundParams.reason = reason as 'duplicate' | 'fraudulent' | 'requested_by_customer';
      }
      
      const refund = await stripe.refunds.create(refundParams);

      // Update customer stats if we have the order
      try {
        const [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.stripePaymentIntentId, paymentIntentId))
          .limit(1);

        if (order && order.stripeCustomerId) {
          // Update customer total spent (subtract refund amount)
          const refundAmount = amount ? amount / 100 : parseFloat(order.totalPrice);
          await db
            .update(customers)
            .set({
              totalSpent: sql`${customers.totalSpent} - ${refundAmount}`,
              updatedAt: new Date()
            })
            .where(eq(customers.stripeCustomerId, order.stripeCustomerId));
        }
      } catch (statsError) {
        console.warn('Could not update customer stats after refund:', statsError);
      }

      return refund;

    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Get customer analytics and insights
   */
  static async getCustomerAnalytics(stripeCustomerId: string) {
    try {
      const customer = await this.getCustomerByStripeId(stripeCustomerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const customerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.stripeCustomerId, stripeCustomerId))
        .orderBy(desc(orders.createdAt));

      const analytics = {
        customer,
        totalOrders: customerOrders.length,
        totalSpent: parseFloat(customer.totalSpent),
        averageOrderValue: customerOrders.length > 0 ? parseFloat(customer.totalSpent) / customerOrders.length : 0,
        firstOrderDate: customerOrders.length > 0 ? customerOrders[customerOrders.length - 1].createdAt : null,
        lastOrderDate: customerOrders.length > 0 ? customerOrders[0].createdAt : null,
        orderFrequency: this.calculateOrderFrequency(customerOrders),
        recentOrders: customerOrders.slice(0, 5)
      };

      return analytics;

    } catch (error) {
      console.error('Error getting customer analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate order frequency in days
   */
  private static calculateOrderFrequency(orders: Array<{ createdAt: Date }>): number | null {
    if (orders.length < 2) return null;

    const firstOrder = new Date(orders[orders.length - 1].createdAt);
    const lastOrder = new Date(orders[0].createdAt);
    const daysDiff = (lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24);
    
    return Math.round(daysDiff / (orders.length - 1));
  }

  /**
   * Get top customers by spending
   */
  static async getTopCustomers(limit: number = 10) {
    try {
      const topCustomers = await db
        .select()
        .from(customers)
        .orderBy(desc(customers.totalSpent))
        .limit(limit);

      return topCustomers;
    } catch (error) {
      console.error('Error getting top customers:', error);
      throw error;
    }
  }

  /**
   * Get customer invoices
   */
  static async getCustomerInvoices(customerId: string) {
    try {
      const invoices = await stripe.invoices.list({ customer: customerId, limit: 10 });
      return invoices.data;

    } catch (error) {
      console.error('Error getting customer invoices:', error);
      throw error;
    }
  }
}