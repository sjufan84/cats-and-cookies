"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "./OptimizedImage";
import { formatPrice, calculateItemTotal } from "@/lib/price-utils";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Small delay for better UX
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 300);
  };


  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-pink-500" />
            <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
            {state.items.length > 0 && (
              <span className="bg-pink-100 text-pink-600 text-sm font-medium px-2 py-1 rounded-full">
                {state.items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some delicious cookies to get started!</p>
              <button
                onClick={onClose}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {item.imageUrl ? (
                          <OptimizedImage
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                            sizes="64px"
                            priority={true}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                        <p className="text-sm font-medium text-pink-600">
                          Total: ${calculateItemTotal(item.price, item.quantity)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-100 rounded-full transition-colors group"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Footer */}
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-pink-600">${state.total.toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                  </button>
                  
                  <div className="flex space-x-3">
                    <Link
                      href="/cart"
                      onClick={onClose}
                      className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                    >
                      View Cart
                    </Link>
                    <button
                      onClick={clearCart}
                      className="px-4 py-3 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
