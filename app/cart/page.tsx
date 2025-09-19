"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  if (state.items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
        <div className="mt-8 text-center">
          <div className="bg-gray-100 rounded-lg p-8">
            <p className="text-lg text-gray-600">Your cart is currently empty.</p>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {state.items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
            {/* Product Image */}
            <div className="relative w-20 h-20 flex-shrink-0">
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

            {/* Product Details */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-pink-500 font-medium">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                +
              </button>
            </div>

            {/* Item Total and Remove */}
            <div className="text-right">
              <p className="text-lg font-semibold">
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 text-sm mt-1"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>Total:</span>
          <span className="text-pink-500">${state.total.toFixed(2)}</span>
        </div>

        <div className="mt-6 flex space-x-4">
          <Link
            href="/"
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 text-center font-medium"
          >
            Continue Shopping
          </Link>
          <Link
            href="/checkout"
            className="flex-1 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 text-center font-medium"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
