"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice, calculateItemTotal } from "@/lib/price-utils";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/custom/StripePaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { state } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleRedirectCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: state.items,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
        }),
      });

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // Redirect to success page after a short delay
    setTimeout(() => {
      window.location.href = '/checkout/success';
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  if (state.items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <div className="mt-8 text-center">
          <div className="bg-gray-100 rounded-lg p-8">
            <p className="text-lg text-gray-600">Your cart is empty.</p>
            <Link
              href="/"
              className="mt-4 inline-block bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
          
          {paymentSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 text-4xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
              <p className="text-green-600">Redirecting to confirmation page...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Details */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Method</h3>
                
                {/* Stripe Elements */}
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    customerInfo={customerInfo}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>

                {/* Alternative: Redirect to Stripe Checkout */}
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">or</div>
                  <button
                    onClick={handleRedirectCheckout}
                    disabled={isLoading || !customerInfo.name || !customerInfo.email}
                    className="w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    {isLoading ? "Processing..." : "Pay with Stripe Checkout (Redirect)"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="bg-gray-200 w-full h-full rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(calculateItemTotal(item.price, item.quantity))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-pink-500">{formatPrice(state.total)}</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>🍪 All items are freshly baked with love by Sage</p>
              <p>🐱 Supervised by Teddy & Millie</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
