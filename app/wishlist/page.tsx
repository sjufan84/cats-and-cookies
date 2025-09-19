"use client";

import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { Heart, ShoppingCart, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "@/components/custom/OptimizedImage";

export default function WishlistPage() {
  const { state, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl
    });
  };

  const handleAddAllToCart = () => {
    state.items.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl
      });
    });
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Your Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {state.items.length} {state.items.length === 1 ? 'cookie' : 'cookies'} saved for later
          </p>
        </div>
        
        {state.items.length > 0 && (
          <div className="flex space-x-3">
            <button
              onClick={handleAddAllToCart}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add All to Cart</span>
            </button>
            <button
              onClick={clearWishlist}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-5 w-5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {state.items.length === 0 ? (
        /* Empty Wishlist */
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start adding cookies you love to your wishlist! Click the heart icon on any product to save it for later.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Browse Cookies
            </Link>
            <Link
              href="/"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Items */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Product Image */}
              <Link href={`/products/${item.id}`}>
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {item.imageUrl ? (
                    <OptimizedImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Details */}
              <div className="p-4">
                <Link href={`/products/${item.id}`}>
                  <h3 className="font-semibold text-gray-800 hover:text-pink-600 transition-colors mb-2">
                    {item.name}
                  </h3>
                </Link>
                
                <p className="text-pink-500 font-bold text-lg mb-2">{formatPrice(item.price)}</p>
                
                <p className="text-xs text-gray-500 mb-4">
                  Added on {formatDate(item.addedAt)}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-current text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {state.items.length > 0 && (
        <div className="mt-12 bg-pink-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Ready to order your favorites?
          </h3>
          <p className="text-gray-600 mb-6">
            Add items to your cart and checkout to have these delicious cookies delivered fresh to your door!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAddAllToCart}
              className="bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add All to Cart & Checkout</span>
            </button>
            <Link
              href="/products"
              className="bg-white text-pink-500 border border-pink-500 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
