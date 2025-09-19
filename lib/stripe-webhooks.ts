/* eslint-disable @typescript-eslint/no-explicit-any */
import { stripe } from './stripe';
import { db } from './db';
import { orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { StripeCustomerManager } from './stripe-customers';

export interface StripeEvent {
  type: string;
  data: {
    object: any;
  };
}

export async function handleWebhookEvent(event: StripeEvent) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    throw error;
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    // Check if order already exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, session.payment_intent))
      .limit(1);

    if (existingOrder.length > 0) {
      console.log('Order already exists for payment intent:', session.payment_intent);
      return;
    }

    // Create new order
    const [newOrder] = await db.insert(orders).values({
      customerName: session.metadata?.customerName || session.customer_details?.name || '',
      customerEmail: session.customer_email || session.customer_details?.email || '',
      totalPrice: (session.amount_total / 100).toString(), // Convert to string for decimal field
      stripePaymentIntentId: session.payment_intent,
      stripeCustomerId: session.customer,
      status: 'paid',
    }).returning();

    // Parse items from metadata or line items
    let items = [];
    if (session.metadata?.items) {
      items = JSON.parse(session.metadata.items);
    } else {
      // Fetch line items from Stripe
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      items = lineItems.data.map((item: any) => ({
        id: parseInt(item.price?.metadata?.productId || '0'),
        name: item.description || 'Unknown Product',
        price: (item.amount_total / item.quantity / 100).toString(),
        quantity: item.quantity,
      }));
    }

    // Create order items
    for (const item of items) {
      if (item.id > 0) { // Only create items with valid product IDs
        await db.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.id,
          quantity: item.quantity,
        });
      }
    }

    // Update customer statistics
    if (session.customer) {
      await StripeCustomerManager.updateCustomerStats(session.customer, session.amount_total / 100);
    }

    console.log('Order created successfully:', newOrder.id);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    await db
      .update(orders)
      .set({
        status: 'paid',
        updatedAt: new Date()
      })
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id));

    console.log('Payment intent succeeded:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    await db
      .update(orders)
      .set({
        status: 'canceled',
        updatedAt: new Date()
      })
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id));

    console.log('Payment intent failed:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleChargeRefunded(charge: any) {
  try {
    // Find order by payment intent
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, charge.payment_intent))
      .limit(1);

    if (order.length > 0) {
      await db
        .update(orders)
        .set({
          status: 'refunded',
          updatedAt: new Date()
        })
        .where(eq(orders.id, order[0].id));

      console.log('Order marked as refunded:', order[0].id);
    }
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}

async function handleDisputeCreated(dispute: any) {
  try {
    // Find order by charge
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, dispute.payment_intent))
      .limit(1);

    if (order.length > 0) {
      await db
        .update(orders)
        .set({
          status: 'disputed',
          updatedAt: new Date()
        })
        .where(eq(orders.id, order[0].id));

      console.log('Order marked as disputed:', order[0].id);
    }
  } catch (error) {
    console.error('Error handling dispute created:', error);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('Subscription created:', subscription.id);
    // Handle subscription logic for cookie subscriptions
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Subscription updated:', subscription.id);
    // Handle subscription updates
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log('Subscription deleted:', subscription.id);
    // Handle subscription cancellation
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    console.log('Invoice payment succeeded:', invoice.id);
    // Handle recurring invoice payments
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    console.log('Invoice payment failed:', invoice.id);
    // Handle failed recurring payments
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}