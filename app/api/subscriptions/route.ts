import { NextResponse } from 'next/server';
import { StripeCustomerManager } from '@/lib/stripe-customers';

export async function POST(request: Request) {
  try {
    const { customerEmail, customerName, plan, items } = await request.json();

    if (!customerEmail || !customerName || !plan || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create or get Stripe customer
    const customerId = await StripeCustomerManager.createOrGetCustomer(customerEmail, customerName);

    // Define subscription plans
    const subscriptionPlans = {
      weekly: {
        name: 'Weekly Cookie Box',
        priceId: 'price_weekly_cookies', // This would be created in Stripe dashboard
        interval: 'week',
        description: 'Fresh cookies delivered every week'
      },
      biweekly: {
        name: 'Bi-Weekly Cookie Box',
        priceId: 'price_biweekly_cookies', // This would be created in Stripe dashboard
        interval: '2 weeks',
        description: 'Fresh cookies delivered every two weeks'
      },
      monthly: {
        name: 'Monthly Cookie Box',
        priceId: 'price_monthly_cookies', // This would be created in Stripe dashboard
        interval: 'month',
        description: 'Fresh cookies delivered every month'
      }
    };

    const selectedPlan = subscriptionPlans[plan as keyof typeof subscriptionPlans];
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }

    // Create subscription
    const subscription = await StripeCustomerManager.createSubscription(
      customerId,
      selectedPlan.priceId,
      {
        items: JSON.stringify(items),
        plan: plan,
        customerName
      }
    );

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId,
      plan: selectedPlan,
      status: subscription.status,
      current_period_start: subscription.start_date,
      current_period_end: subscription.ended_at
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const subscriptions = await StripeCustomerManager.getCustomerSubscriptions(customerId);

    return NextResponse.json({ subscriptions });

  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return NextResponse.json({ error: 'Failed to get subscriptions' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    const result = await StripeCustomerManager.cancelSubscription(subscriptionId);

    return NextResponse.json({
      message: 'Subscription canceled successfully',
      subscription: result
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}