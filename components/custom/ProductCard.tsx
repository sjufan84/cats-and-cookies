"use client";

import { useState, useCallback } from "react";
import OptimizedImage from "./OptimizedImage";
import Link from "next/link";
import { Plus, Minus, ShoppingCart, Eye, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import UnitSelector from "./UnitSelector";

interface ProductCardProps {
  id: number;
  name: string;
  basePrice: string;
  imageUrl: string;
  isFeatured?: boolean;
}

interface Unit {
  id: number;
  name: string;
  quantity: number;
  price: string;
  isDefault: boolean;
}

export default function ProductCard({ id, name, basePrice, imageUrl, isFeatured }: ProductCardProps) {
  const { addItem, state } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuantityControls, setShowQuantityControls] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);


  const cartItem = state.items.find(item => item.id === id);
  const isInCart = !!cartItem;
  const isWishlisted = isInWishlist(id);

  const handleAddToCart = async () => {
    if (!selectedUnit) return;
    
    setIsAdding(true);

    // Add multiple items if quantity > 1
    for (let i = 0; i < quantity; i++) {
      addItem({ 
        id, 
        name: `${name} (${selectedUnit.name})`, 
        price: selectedUnit.price, 
        imageUrl 
      });
    }

    // Reset quantity and show feedback
    setTimeout(() => {
      setQuantity(1);
      setIsAdding(false);
      setShowQuantityControls(false);
    }, 500);
  };

  const handleQuickAdd = () => {
    if (!selectedUnit) return;
    addItem({ 
      id, 
      name: `${name} (${selectedUnit.name})`, 
      price: selectedUnit.price, 
      imageUrl 
    });
  };

  const handleUnitChange = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
  }, []);

  return (
    <div className="group border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative">
        <Link
          href={`/products/${id}`}
          aria-label={`View details for ${name}`}
          className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
        >
          <div className="relative h-64 w-full overflow-hidden">
            {imageUrl && imageUrl.trim() ? (
              <OptimizedImage
              src={imageUrl}
              alt={name}
              fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={isFeatured}
                placeholder="empty"
            />
          ) : (
            <div className="bg-gray-200 h-full w-full flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}

            {isFeatured && (
              <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                ⭐ Featured
              </div>
            )}

            {/* Quick View Overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-900 shadow">
                <Eye className="h-4 w-4" aria-hidden="true" />
                Quick view
              </span>
            </div>
        </div>
      </Link>

        {/* Wishlist Button (outside the link for accessibility) */}
        <button
          onClick={() => toggleItem({ 
            id, 
            name: selectedUnit ? `${name} (${selectedUnit.name})` : name, 
            price: selectedUnit?.price || basePrice, 
            imageUrl 
          })}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${isWishlisted
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>
      </div>
      {/* Product Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
          {name}
        </h3>
        
        {/* Unit Selector */}
        <div className="mt-2">
          <UnitSelector
            basePrice={basePrice}
            onUnitChange={handleUnitChange}
            className="w-full"
          />
        </div>

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
