import { z } from 'zod';

/**
 * Google Recipe Schema (schema.org) Zod schemas
 * Used for structured recipe data that can be easily parsed and used for Instacart integration
 */

// Base schemas
export const RecipeAuthorSchema = z.object({
  "@type": z.literal("Person"),
  name: z.string().min(1, "Author name is required"),
});

export const RecipeNutritionSchema = z.object({
  "@type": z.literal("NutritionInformation"),
  calories: z.string().optional(),
  proteinContent: z.string().optional(),
  fatContent: z.string().optional(),
  carbohydrateContent: z.string().optional(),
  fiberContent: z.string().optional(),
  sugarContent: z.string().optional(),
  sodiumContent: z.string().optional(),
  cholesterolContent: z.string().optional(),
  saturatedFatContent: z.string().optional(),
  transFatContent: z.string().optional(),
  unsaturatedFatContent: z.string().optional(),
});

export const RecipeInstructionSchema = z.object({
  "@type": z.literal("HowToStep"),
  text: z.string().min(1, "Instruction text is required"),
  name: z.string().optional(),
  image: z.string().url().optional(),
  url: z.string().url().optional(),
});

export const RecipeRatingSchema = z.object({
  "@type": z.literal("AggregateRating"),
  ratingValue: z.number().min(1).max(5),
  reviewCount: z.number().min(0),
});

// Main recipe schema
export const RecipeDataSchema = z.object({
  "@context": z.literal("https://schema.org"),
  "@type": z.literal("Recipe"),
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().min(1, "Recipe description is required"),
  image: z.array(z.string().url()).min(1, "At least one image is required"),
  author: RecipeAuthorSchema,
  datePublished: z.string().datetime(),
  dateModified: z.string().datetime().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
  recipeYield: z.string().min(1, "Recipe yield is required"),
  recipeCategory: z.string().min(1, "Recipe category is required"),
  recipeCuisine: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ingredients: z.array(z.string().min(1)).min(1, "At least one ingredient is required"),
  instructions: z.array(RecipeInstructionSchema).min(1, "At least one instruction is required"),
  nutrition: RecipeNutritionSchema.optional(),
  allergens: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(z.string()).default([]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  rating: RecipeRatingSchema.optional(),
});

// Extracted recipe data schema
export const ExtractedRecipeDataSchema = z.object({
  recipe: RecipeDataSchema,
  confidence: z.number().min(0).max(1),
  extractedIngredients: z.array(z.string()),
  extractedAllergens: z.array(z.string()),
  suggestedCategory: z.string(),
  suggestedKeywords: z.array(z.string()),
});

// Upload data schema
export const RecipeUploadDataSchema = z.object({
  images: z.array(z.instanceof(File)).min(1, "At least one image is required"),
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().optional(),
});

// Instacart integration schemas
export const InstacartIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().optional(),
  category: z.string().min(1),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

export const InstacartOrderSchema = z.object({
  ingredients: z.array(InstacartIngredientSchema),
  totalEstimatedCost: z.number().min(0),
  storeSuggestions: z.array(z.string()),
  orderUrl: z.string().url().optional(),
});

// Common allergens and dietary restrictions
export const COMMON_ALLERGENS = [
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'tree nuts',
  'peanuts',
  'wheat',
  'soybeans',
  'sesame',
  'mustard',
  'celery',
  'lupin',
  'sulfites'
] as const;

export const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'soy-free',
  'egg-free',
  'keto',
  'paleo',
  'low-carb',
  'low-sodium',
  'sugar-free'
] as const;

// Type exports
export type RecipeAuthor = z.infer<typeof RecipeAuthorSchema>;
export type RecipeNutrition = z.infer<typeof RecipeNutritionSchema>;
export type RecipeInstruction = z.infer<typeof RecipeInstructionSchema>;
export type RecipeData = z.infer<typeof RecipeDataSchema>;
export type ExtractedRecipeData = z.infer<typeof ExtractedRecipeDataSchema>;
export type RecipeUploadData = z.infer<typeof RecipeUploadDataSchema>;
export type InstacartIngredient = z.infer<typeof InstacartIngredientSchema>;
export type InstacartOrder = z.infer<typeof InstacartOrderSchema>;
export type CommonAllergen = typeof COMMON_ALLERGENS[number];
export type DietaryRestriction = typeof DIETARY_RESTRICTIONS[number];

// Validation helpers
export const validateRecipeData = (data: unknown): RecipeData => {
  return RecipeDataSchema.parse(data);
};

export const validateExtractedRecipeData = (data: unknown): ExtractedRecipeData => {
  return ExtractedRecipeDataSchema.parse(data);
};

export const validateRecipeUploadData = (data: unknown): RecipeUploadData => {
  return RecipeUploadDataSchema.parse(data);
};
