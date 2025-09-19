"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
export default function CheckoutPage() {
  const { state } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'redirect' | 'embedded'>('redirect');
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
  });

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

  const handleEmbeddedCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // For embedded checkout, we'll use the same API but handle it differently
      const response = await fetch("/api/create-checkout-session", {
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

      const { clientSecret } = await response.json();

      if (clientSecret) {
        // For now, we'll redirect to the embedded checkout
        // In a full implementation, you'd use Stripe Elements here
        alert('Embedded checkout would open here. For now, using redirect method.');
        // You could implement a modal or embedded form here
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error('Embedded checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          
          {/* Checkout Type Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Choose Checkout Method</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="checkoutType"
                  value="redirect"
                  checked={checkoutType === 'redirect'}
                  onChange={(e) => setCheckoutType(e.target.value as 'redirect' | 'embedded')}
                  className="mr-2"
                />
                <span>Redirect to Stripe (Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="checkoutType"
                  value="embedded"
                  checked={checkoutType === 'embedded'}
                  onChange={(e) => setCheckoutType(e.target.value as 'redirect' | 'embedded')}
                  className="mr-2"
                />
                <span>Embedded Checkout</span>
              </label>
            </div>
          </div>

          <form onSubmit={checkoutType === 'redirect' ? handleRedirectCheckout : (e) => { e.preventDefault(); handleEmbeddedCheckout(); }} className="space-y-6">
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !customerInfo.name || !customerInfo.email}
                className="w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "Processing..." : `Pay $${state.total.toFixed(2)} ${checkoutType === 'redirect' ? '(Redirect)' : '(Embedded)'}`}
              </button>
            </div>
          </form>
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
                      ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-pink-500">${state.total.toFixed(2)}</span>
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
