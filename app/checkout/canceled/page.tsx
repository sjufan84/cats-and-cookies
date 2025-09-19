"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutCanceledContent() {
  const searchParams = useSearchParams();
  const [checkoutType, setCheckoutType] = useState<string>('');

  useEffect(() => {
    // Check if this was from an embedded checkout or redirect
    const sessionId = searchParams.get('session_id');
    const embedded = searchParams.get('embedded');
    
    if (embedded === 'true') {
      setCheckoutType('embedded');
    } else if (sessionId) {
      setCheckoutType('redirect');
    } else {
      setCheckoutType('unknown');
    }
  }, [searchParams]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Payment Canceled
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          No worries! Your payment was canceled and no charges were made. Your
          cart is still waiting for you when you&apos;re ready.
        </p>

        {checkoutType && (
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              {checkoutType === 'embedded' && 'You canceled the embedded checkout.'}
              {checkoutType === 'redirect' && 'You canceled the redirect checkout.'}
              {checkoutType === 'unknown' && 'Your checkout was canceled.'}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-blue-500 mr-3">💳</span>
              <span>Check your payment information and try again</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-3">🛒</span>
              <span>Your cart has been saved and is ready for checkout</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 mr-3">📧</span>
              <span>Having trouble? Contact us for assistance</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/checkout"
            className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 font-medium"
          >
            Try Checkout Again
          </Link>
          <Link
            href="/cart"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            View Cart
          </Link>
          <Link
            href="/"
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutCanceledPage() {
  return (
    <Suspense fallback={
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Processing...</h1>
          <p className="text-gray-600">Please wait while we load your checkout status.</p>
        </div>
      </main>
    }>
      <CheckoutCanceledContent />
    </Suspense>
  );
}