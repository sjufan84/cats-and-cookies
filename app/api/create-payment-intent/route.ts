import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { StripeProductManager } from '@/lib/stripe-products';
import { StripeCustomerManager } from '@/lib/stripe-customers';

export async function POST(request: NextRequest) {
  try {
    const { items, customerEmail, customerName } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Get or create customer
    const customerId = await StripeCustomerManager.createOrGetCustomer(customerEmail, customerName);

    // Create checkout session to get line items
    const session = await StripeProductManager.createCheckoutSession(
      items,
      {
        customerId,
        email: customerEmail,
        name: customerName,
      }
    );

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(session.amount_total || 0),
      currency: 'usd',
      customer: customerId,
      metadata: {
        sessionId: session.id,
        customerName,
        customerEmail,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
