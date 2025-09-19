/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";

function CheckoutSuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Verify the session with Stripe
      verifySession(sessionId);
    } else {
      // No session ID, just clear cart and show success
      clearCart();
      setIsVerified(true);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, clearCart]);

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
        // Clear the cart when checkout is successful
        clearCart();
        setIsVerified(true);
      } else {
        console.error('Failed to verify session');
        setIsVerified(false);
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying your payment...</p>
        </div>
      </main>
    );
  }

  if (!isVerified) {
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
            Payment Verification Failed
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We couldn&apos;t verify your payment. Please contact support if you believe this is an error.
          </p>
          <Link
            href="/"
            className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 font-medium"
          >
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Thank You for Your Order!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Your payment was successful and we&apos;ve received your order. Sage is already
          preparing your delicious cookies with love! 🍪
        </p>

        {sessionData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{sessionData.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${(sessionData.amount_total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="text-green-600 font-semibold">Paid</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold mb-4">What&apos;s Next?</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>You&apos;ll receive a confirmation email shortly</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>We&apos;ll prepare your order fresh to order</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>You&apos;ll receive shipping updates via email</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Teddy & Millie are supervising the quality control 🐱</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 font-medium"
          >
            Shop More Cookies
          </Link>
          <Link
            href="/about"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            Our Story
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Processing your order...</h1>
          <p className="text-gray-600">Please wait while we verify your payment.</p>
        </div>
      </main>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}