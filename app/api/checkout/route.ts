import { NextResponse } from 'next/server';
import { StripeCustomerManager } from '@/lib/stripe-customers';
import { StripeProductManager } from '@/lib/stripe-products';

export async function POST(request: Request) {
  try {
    const { items, customerEmail, customerName } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!customerEmail || !customerName) {
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 });
    }

    // Create or get Stripe customer
    const stripeCustomerId = await StripeCustomerManager.createOrGetCustomer(customerEmail, customerName);

    // Create checkout session using StripeProductManager
    const session = await StripeProductManager.createCheckoutSession(items, {
      email: customerEmail,
      name: customerName,
      customerId: stripeCustomerId
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      customerId: stripeCustomerId
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}