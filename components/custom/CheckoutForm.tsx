'use client';

import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

export default function CheckoutForm() {
  const { state } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    if (state.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create checkout session
      const response = await fetch('/api/checkout', {
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

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-lg text-gray-600">Your cart is empty.</p>
        <p className="text-sm text-gray-500 mt-2">Add some delicious cookies to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Checkout with Stripe</h2>
      
      {/* Customer Information */}
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

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold mb-3">Order Summary</h3>
        <div className="space-y-2">
          {state.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 mt-3 flex justify-between font-bold">
          <span>Total:</span>
          <span className="text-pink-500">${state.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={!customerInfo.name || !customerInfo.email || isLoading}
        className="w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Processing...' : `Pay $${state.total.toFixed(2)} with Stripe`}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>🍪 All items are freshly baked with love by Sage</p>
        <p>🐱 Supervised by Teddy & Millie</p>
      </div>
    </div>
  );
}
