"use client";

import { useState } from "react";
import OptimizedImage from "./OptimizedImage";
import Link from "next/link";
import { Plus, Minus, ShoppingCart, Eye, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  isFeatured?: boolean;
}

export default function ProductCard({ id, name, price, imageUrl, isFeatured }: ProductCardProps) {
  const { addItem, state } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuantityControls, setShowQuantityControls] = useState(false);

  const cartItem = state.items.find(item => item.id === id);
  const isInCart = !!cartItem;
  const isWishlisted = isInWishlist(id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Add multiple items if quantity > 1
    for (let i = 0; i < quantity; i++) {
      addItem({ id, name, price, imageUrl });
    }
    
    // Reset quantity and show feedback
    setTimeout(() => {
      setQuantity(1);
      setIsAdding(false);
      setShowQuantityControls(false);
    }, 500);
  };

  const handleQuickAdd = () => {
    addItem({ id, name, price, imageUrl });
  };

  return (
    <div className="group border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="relative h-64 overflow-hidden">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              placeholder="blur"
            />
          ) : (
            <div className="bg-gray-200 h-full w-full flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          
          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
              ⭐ Featured
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem({ id, name, price, imageUrl });
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
              isWishlisted
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
          {name}
        </h3>
        <p className="mt-2 text-pink-500 font-semibold text-xl">{price}</p>
        
        {/* Cart Status */}
        {isInCart && (
          <p className="mt-1 text-sm text-green-600 font-medium">
            In cart ({cartItem.quantity})
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          {/* Quantity Controls */}
          {showQuantityControls ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{isAdding ? 'Adding...' : `Add ${quantity} to Cart`}</span>
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQuantityControls(true)}
                className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleQuickAdd}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Quick add 1"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* View Details Button */}
          <Link 
            href={`/products/${id}`} 
            className="block w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 text-center transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
