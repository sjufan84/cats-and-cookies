'use client';

import { useState } from 'react';
import Image from 'next/image';
import { RecipeData } from '@/lib/recipe-schema';
import {
  Clock,
  Users,
  ChefHat,
  Star,
  Scale,
  AlertTriangle,
  Leaf,
  ShoppingCart,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Droplet,
  Wheat
} from 'lucide-react';

interface RecipeDisplayProps {
  recipe: RecipeData;
  className?: string;
  showInstacartButton?: boolean;
  compact?: boolean;
}

export default function RecipeDisplay({
  recipe,
  className = '',
  showInstacartButton = true,
  compact = false
}: RecipeDisplayProps) {
  const [showFullInstructions, setShowFullInstructions] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  const formatTime = (time: string) => {
    if (!time) return '--';
    return time.replace('PT', '').replace('H', 'h ').replace('M', 'min').toLowerCase();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hard': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDietaryRestrictionColor = (restriction: string) => {
    const colors: Record<string, string> = {
      'vegetarian': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'vegan': 'bg-green-50 text-green-700 border-green-200',
      'gluten-free': 'bg-blue-50 text-blue-700 border-blue-200',
      'dairy-free': 'bg-purple-50 text-purple-700 border-purple-200',
      'nut-free': 'bg-orange-50 text-orange-700 border-orange-200',
      'keto': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'paleo': 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return colors[restriction] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (compact) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            {recipe.image && recipe.image.length > 0 && (
              <Image
                src={recipe.image[0]}
                alt={recipe.name}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{recipe.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{recipe.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(recipe.prepTime as string)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{recipe.recipeYield}</span>
                </div>
                {recipe.difficulty && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header with image overlay */}
      <div className="relative">
        {recipe.image && recipe.image.length > 0 && (
          <div className="relative h-64 overflow-hidden">
            <Image
              src={recipe.image[0]}
              alt={recipe.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{recipe.name}</h2>
              <p className="text-white/90 text-sm line-clamp-2">{recipe.description}</p>
            </div>
          </div>
        )}

        {/* Recipe Stats Bar */}
        <div className="flex items-center justify-between bg-gray-50 border-y border-gray-200 px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Prep: {formatTime(recipe.prepTime as string)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">Cook: {formatTime(recipe.cookTime as string)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Yield: {recipe.recipeYield}</span>
            </div>
          </div>
          {recipe.difficulty && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Ingredients Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-600" />
            Ingredients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0 mt-2"></div>
                <span className="text-gray-800 text-sm leading-relaxed">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-amber-600" />
              Instructions
            </h3>
            {recipe.instructions.length > 3 && (
              <button
                onClick={() => setShowFullInstructions(!showFullInstructions)}
                className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                {showFullInstructions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showFullInstructions ? 'Show Less' : 'Show All Steps'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {recipe.instructions
              .slice(0, showFullInstructions ? recipe.instructions.length : 3)
              .map((instruction, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed">{instruction.text}</p>
                    {instruction.name && (
                      <p className="text-sm font-medium text-gray-600 mt-2 italic">{instruction.name}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Professional Baker's Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allergens */}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
              <h4 className="text-lg font-semibold text-rose-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Allergens
              </h4>
              <div className="flex flex-wrap gap-2">
                {recipe.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white text-rose-800 rounded-lg text-sm font-medium border border-rose-300"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Restrictions */}
          {recipe.dietaryRestrictions && recipe.dietaryRestrictions.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h4 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Dietary Information
              </h4>
              <div className="flex flex-wrap gap-2">
                {recipe.dietaryRestrictions.map((restriction, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border ${getDietaryRestrictionColor(restriction)}`}
                  >
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nutrition Information */}
        {recipe.nutrition && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <Wheat className="h-5 w-5" />
                Nutrition Information
              </h4>
              <button
                onClick={() => setShowNutrition(!showNutrition)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showNutrition ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showNutrition ? 'Hide' : 'Show'}
              </button>
            </div>

            {showNutrition && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(recipe.nutrition)
                  .filter(([key, value]) => key !== '@type' && value)
                  .map(([key, value]) => (
                    <div key={key} className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-lg font-bold text-blue-900">{value}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {recipe.rating && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < recipe.rating!.ratingValue ? 'text-amber-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-700 font-medium">
                {recipe.rating.ratingValue}/5 ({recipe.rating.reviewCount} reviews)
              </span>
            </div>
          </div>
        )}

        {/* Shopping Integration */}
        {showInstacartButton && (
          <div className="pt-6 border-t border-gray-200">
            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg">
              <ShoppingCart className="h-5 w-5" />
              Generate Shopping List
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
