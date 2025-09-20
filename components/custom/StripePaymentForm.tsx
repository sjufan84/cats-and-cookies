"use client";

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/price-utils';

interface StripePaymentFormProps {
  customerInfo: {
    name: string;
    email: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({ customerInfo, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { state } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-transparent">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isProcessing ? 'Processing...' : `Pay ${formatPrice(state.total)}`}
      </button>
    </form>
  );
}
