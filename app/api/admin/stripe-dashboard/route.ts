import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { StripeCustomerManager } from '@/lib/stripe-customers';
import { StripeProductManager } from '@/lib/stripe-products';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'balance':
        const balance = await stripe.balance.retrieve();
        return NextResponse.json({ balance });

      case 'customers':
        const customers = await stripe.customers.list({ limit: 10 });
        return NextResponse.json({ customers: customers.data });

      case 'products':
        const products = await stripe.products.list({ limit: 10 });
        return NextResponse.json({ products: products.data });

      case 'subscriptions':
        const subscriptions = await stripe.subscriptions.list({ limit: 10 });
        return NextResponse.json({ subscriptions: subscriptions.data });

      case 'payment-intents':
        const paymentIntents = await stripe.paymentIntents.list({ limit: 10 });
        return NextResponse.json({ paymentIntents: paymentIntents.data });

      case 'disputes':
        const disputes = await stripe.disputes.list({ limit: 10 });
        return NextResponse.json({ disputes: disputes.data });

      case 'refunds':
        const refunds = await stripe.refunds.list({ limit: 10 });
        return NextResponse.json({ refunds: refunds.data });

      case 'invoices':
        const invoices = await stripe.invoices.list({ limit: 10 });
        return NextResponse.json({ invoices: invoices.data });

      case 'coupons':
        const coupons = await stripe.coupons.list({ limit: 10 });
        return NextResponse.json({ coupons: coupons.data });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error fetching Stripe dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'sync-products':
        const syncResult = await StripeProductManager.syncAllProducts();
        return NextResponse.json({ syncResult });

      case 'create-coupon':
        const couponParams: {
          name: string;
          duration: 'forever' | 'once' | 'repeating';
          percent_off?: number;
          amount_off?: number;
          currency?: string;
          duration_in_months?: number;
        } = {
          name: data.name,
          duration: (data.duration as 'forever' | 'once' | 'repeating') || 'once'
        };
        
        if (data.percent_off) {
          couponParams.percent_off = data.percent_off;
        } else if (data.amount_off) {
          couponParams.amount_off = data.amount_off;
          couponParams.currency = data.currency || 'usd';
        }
        
        if (data.duration === 'repeating' && data.duration_in_months) {
          couponParams.duration_in_months = data.duration_in_months;
        }
        
        const coupon = await stripe.coupons.create(couponParams);
        return NextResponse.json({ coupon });

      case 'create-invoice':
        const invoice = await stripe.invoices.create({
          customer: data.customerId,
          days_until_due: data.days_until_due || 30
        });
        return NextResponse.json({ invoice });

      case 'process-refund':
        const refund = await StripeCustomerManager.processRefund(
          data.paymentIntentId,
          data.amount,
          data.reason
        );
        return NextResponse.json({ refund });

      case 'update-dispute':
        const disputeParams: {
          dispute: string;
          evidence?: Record<string, string>;
          submit?: boolean;
        } = {
          dispute: data.disputeId
        };
        
        if (data.evidence) {
          disputeParams.evidence = data.evidence;
        }
        
        if (data.submit !== undefined) {
          disputeParams.submit = data.submit;
        }
        
        const updatedDispute = await stripe.disputes.update(data.disputeId, disputeParams);
        return NextResponse.json({ dispute: updatedDispute });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing Stripe dashboard action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}