import { RecipeData, InstacartIngredient, InstacartOrder, COMMON_ALLERGENS, DIETARY_RESTRICTIONS } from './recipe-schema';

/**
 * Utility functions for recipe processing and Instacart integration
 */

export function extractIngredientsFromRecipe(recipe: RecipeData): InstacartIngredient[] {
  return recipe.ingredients.map(ingredient => {
    // Parse ingredient string to extract quantity, unit, and name
    const parsed = parseIngredientString(ingredient);
    
    return {
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      category: categorizeIngredient(parsed.name),
      brand: undefined,
      notes: parsed.notes,
    };
  });
}

export function parseIngredientString(ingredient: string): {
  quantity: string;
  unit?: string;
  name: string;
  notes?: string;
} {
  // Common patterns for ingredient parsing
  const patterns = [
    // "2 cups flour" or "1/2 cup sugar"
    /^(\d+(?:\/\d+)?)\s+(cups?|tablespoons?|teaspoons?|pounds?|ounces?|grams?|kilograms?|ml|liters?|pints?|quarts?|gallons?)\s+(.+)/i,
    // "2 large eggs" or "3 medium potatoes"
    /^(\d+(?:\/\d+)?)\s+(small|medium|large|extra-large|jumbo)\s+(.+)/i,
    // "1 package (8 oz) cream cheese"
    /^(\d+(?:\/\d+)?)\s+package\s*\(([^)]+)\)\s+(.+)/i,
    // "Salt to taste" or "Pinch of salt"
    /^(salt|pepper|sugar)\s+to\s+taste|pinch\s+of\s+(.+)/i,
    // Just a name without quantity
    /^(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = ingredient.match(pattern);
    if (match) {
      if (pattern.source.includes('to taste') || pattern.source.includes('pinch')) {
        return {
          quantity: 'to taste',
          name: match[1] || match[2],
        };
      }
      
      if (pattern.source.includes('package')) {
        return {
          quantity: match[1],
          unit: match[2],
          name: match[3],
        };
      }
      
      if (match[3]) {
        return {
          quantity: match[1],
          unit: match[2],
          name: match[3],
        };
      }
      
      return {
        quantity: match[1] || '1',
        name: match[2] || match[1],
      };
    }
  }

  // Fallback: treat entire string as name
  return {
    quantity: '1',
    name: ingredient,
  };
}

export function categorizeIngredient(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  // Protein categories
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || 
      name.includes('fish') || name.includes('salmon') || name.includes('tuna') ||
      name.includes('turkey') || name.includes('lamb')) {
    return 'Meat & Seafood';
  }
  
  if (name.includes('egg') || name.includes('milk') || name.includes('cheese') || 
      name.includes('yogurt') || name.includes('butter') || name.includes('cream')) {
    return 'Dairy & Eggs';
  }
  
  // Produce categories
  if (name.includes('onion') || name.includes('garlic') || name.includes('carrot') || 
      name.includes('celery') || name.includes('pepper') || name.includes('tomato') ||
      name.includes('lettuce') || name.includes('spinach') || name.includes('broccoli')) {
    return 'Fresh Produce';
  }
  
  if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
      name.includes('berry') || name.includes('lemon') || name.includes('lime')) {
    return 'Fresh Produce';
  }
  
  // Pantry categories
  if (name.includes('flour') || name.includes('sugar') || name.includes('salt') || 
      name.includes('baking') || name.includes('yeast') || name.includes('cornstarch')) {
    return 'Baking & Pantry';
  }
  
  if (name.includes('oil') || name.includes('vinegar') || name.includes('soy sauce') || 
      name.includes('ketchup') || name.includes('mustard') || name.includes('mayo')) {
    return 'Condiments & Oils';
  }
  
  if (name.includes('pasta') || name.includes('rice') || name.includes('bread') || 
      name.includes('cracker') || name.includes('cereal')) {
    return 'Grains & Bread';
  }
  
  if (name.includes('nut') || name.includes('seed') || name.includes('almond') || 
      name.includes('walnut') || name.includes('pecan')) {
    return 'Nuts & Seeds';
  }
  
  if (name.includes('spice') || name.includes('herb') || name.includes('pepper') || 
      name.includes('cinnamon') || name.includes('vanilla') || name.includes('oregano')) {
    return 'Spices & Herbs';
  }
  
  return 'Other';
}

export function generateInstacartOrder(recipe: RecipeData): InstacartOrder {
  const ingredients = extractIngredientsFromRecipe(recipe);
  
  // Estimate total cost (rough approximation)
  const estimatedCost = ingredients.reduce((total, ingredient) => {
    const baseCost = getEstimatedIngredientCost(ingredient);
    return total + baseCost;
  }, 0);
  
  // Suggest stores based on ingredient types
  const storeSuggestions = getStoreSuggestions(ingredients);
  
  return {
    ingredients,
    totalEstimatedCost: Math.round(estimatedCost * 100) / 100,
    storeSuggestions,
  };
}

function getEstimatedIngredientCost(ingredient: InstacartIngredient): number {
  // Rough cost estimates per unit (in USD)
  const costMap: Record<string, number> = {
    'Meat & Seafood': 8.00,
    'Dairy & Eggs': 4.00,
    'Fresh Produce': 2.50,
    'Baking & Pantry': 3.00,
    'Condiments & Oils': 2.00,
    'Grains & Bread': 2.50,
    'Nuts & Seeds': 6.00,
    'Spices & Herbs': 1.50,
    'Other': 3.00,
  };
  
  return costMap[ingredient.category] || 3.00;
}

function getStoreSuggestions(ingredients: InstacartIngredient[]): string[] {
  const categories = new Set(ingredients.map(ing => ing.category));
  
  const suggestions = [];
  
  if (categories.has('Meat & Seafood') || categories.has('Dairy & Eggs')) {
    suggestions.push('Whole Foods Market');
  }
  
  if (categories.has('Fresh Produce') || categories.has('Baking & Pantry')) {
    suggestions.push('Kroger');
  }
  
  if (categories.has('Spices & Herbs') || categories.has('Nuts & Seeds')) {
    suggestions.push('Sprouts Farmers Market');
  }
  
  // Always include these as fallbacks
  suggestions.push('Instacart Express', 'Local Grocery Store');
  
  return suggestions;
}

export function formatRecipeForDisplay(recipe: RecipeData): {
  summary: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  difficulty: string;
} {
  return {
    summary: recipe.description,
    prepTime: recipe.prepTime || 'Not specified',
    cookTime: recipe.cookTime || 'Not specified',
    totalTime: recipe.totalTime || 'Not specified',
    servings: recipe.recipeYield,
    difficulty: recipe.difficulty || 'Not specified',
  };
}

export function extractAllergensFromIngredients(ingredients: string[]): string[] {
  const allergens: string[] = [];
  const ingredientText = ingredients.join(' ').toLowerCase();
  
  COMMON_ALLERGENS.forEach(allergen => {
    if (ingredientText.includes(allergen.toLowerCase())) {
      allergens.push(allergen);
    }
  });
  
  return allergens;
}

export function extractDietaryRestrictions(recipe: RecipeData): string[] {
  const restrictions: string[] = [];
  const ingredientText = recipe.ingredients.join(' ').toLowerCase();
  
  // Check for vegetarian/vegan
  const hasMeat = /chicken|beef|pork|fish|turkey|lamb|bacon|ham/.test(ingredientText);
  const hasDairy = /milk|cheese|butter|cream|yogurt/.test(ingredientText);
  const hasEggs = /egg/.test(ingredientText);
  
  if (!hasMeat) {
    restrictions.push('vegetarian');
    if (!hasDairy && !hasEggs) {
      restrictions.push('vegan');
    }
  }
  
  // Check for gluten-free
  const hasGluten = /flour|wheat|barley|rye|bread|pasta/.test(ingredientText);
  if (!hasGluten) {
    restrictions.push('gluten-free');
  }
  
  // Check for other restrictions
  DIETARY_RESTRICTIONS.forEach(restriction => {
    if (restriction === 'vegetarian' || restriction === 'vegan' || restriction === 'gluten-free') {
      return; // Already handled above
    }
    
    const hasRestriction = ingredientText.includes(restriction.replace('-', ' '));
    if (hasRestriction) {
      restrictions.push(restriction);
    }
  });
  
  return restrictions;
}
