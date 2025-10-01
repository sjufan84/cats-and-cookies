import { z } from 'zod';

/**
 * Baker-Friendly Recipe Schemas
 * Designed for professional bakers with SEO optimization and structured data
 */

// Base measurement and ingredient schemas
export const IngredientSchema = z.object({
  name: z.string().describe("The name of the ingredient"),
  amount: z.string().describe("The amount of the ingredient"), // e.g., "2 cups", "1/2 tsp", "250g"
  unit: z.string().optional(), // "cup", "tsp", "g", "ml", etc.
  notes: z.string().optional(), // e.g., "room temperature", "sifted", "melted"
  category: z.enum([
    "flour", "sugar", "fat", "liquid", "leavening", 
    "flavoring", "binding", "decoration", "other"
  ]).optional(),
});

export const EquipmentSchema = z.object({
  name: z.string().describe("The name of the equipment"),
  type: z.enum([
    "baking_dish", "mixing_bowl", "whisk", "spatula", "measuring_cup",
    "oven", "mixer", "sifter", "thermometer", "timer", "other"
  ]),
  size: z.string().optional(), // e.g., "9x13 inch", "large", "medium"
  material: z.string().optional(), // e.g., "glass", "metal", "silicone"
});

export const NutritionInfoSchema = z.object({
  calories: z.number().optional().describe("The number of calories in the recipe in kcal"),
  protein: z.number().optional().describe("The number of protein in the recipe in grams"), // grams
  carbohydrates: z.number().optional().describe("The number of carbohydrates in the recipe"), // grams
  fat: z.number().optional().describe("The number of fat in the recipe in grams"), // grams
  saturatedFat: z.number().optional().describe("The number of saturated fat in the recipe in grams"), // grams
  fiber: z.number().optional().describe("The number of fiber in the recipe in grams"), // grams
  sugar: z.number().optional().describe("The number of sugar in the recipe in grams"), // grams
  sodium: z.number().optional().describe("The number of sodium in the recipe in milligrams"), // milligrams
  cholesterol: z.number().optional().describe("The number of cholesterol in milligrams in the recipe"), // milligrams
  servingSize: z.string().optional().describe("The serving size of the recipe"), // e.g., "1 cookie", "1 slice"
});

export const InstructionStepSchema = z.object({
  stepNumber: z.number().describe("The step number of the instruction"),
  instruction: z.string().describe("The instruction text"),
  duration: z.string().optional(), // e.g., "2-3 minutes", "until golden brown"
  temperature: z.string().optional(), // e.g., "350°F", "medium heat"
  technique: z.string().optional(), // e.g., "fold gently", "beat until fluffy"
  visualCue: z.string().optional(), // e.g., "until light and fluffy", "until doubled in size"
  tips: z.string().optional(), // Baker's tips and tricks
});

export const StorageInfoSchema = z.object({
  roomTemperature: z.string().optional().describe("The storage instructions for the recipe at room temperature"), // e.g., "3-5 days in airtight container"
  refrigerator: z.string().optional().describe("The storage instructions for the recipe in the refrigerator"), // e.g., "up to 1 week"
  freezer: z.string().optional().describe("The storage instructions for the recipe in the freezer"), // e.g., "up to 3 months"
  reheatInstructions: z.string().optional().describe("The reheat instructions for the recipe"),
  storageTips: z.string().optional(),
});

// Main Baker Recipe Schema
export const BakerRecipeSchema = z.object({
  // Basic Information
  name: z.string().describe("The name of the recipe"),
  description: z.string().describe("The description of the recipe"),
  summary: z.string().optional(), // Brief 1-2 sentence summary for SEO
  
  // Timing Information
  prepTime: z.string().describe("The prep time for the recipe"), // e.g., "15 minutes", "30 mins"
  cookTime: z.string().describe("The cook time for the recipe"), // e.g., "12-15 minutes"
  totalTime: z.string().describe("The total time for the recipe"), // e.g., "45 minutes"
  coolingTime: z.string().optional().describe("The cooling time for the recipe"), // e.g., "10 minutes"
  
  // Yield Information
  yield: z.object({
    amount: z.number().describe("The yield amount for the recipe"),
    unit: z.string().describe("The yield unit for the recipe"), // e.g., "cookies", "loaves", "dozen"
    description: z.string().optional(), // e.g., "about 24 medium cookies"
  }),
  
  // Difficulty and Skill Level
  difficulty: z.enum(["beginner", "intermediate", "advanced", "professional"]),
  skillLevel: z.object({
    mixing: z.enum(["basic", "intermediate", "advanced"]),
    shaping: z.enum(["basic", "intermediate", "advanced"]),
    decorating: z.enum(["basic", "intermediate", "advanced"]),
    timing: z.enum(["basic", "intermediate", "advanced"]),
  }).optional(),
  
  // Ingredients and Equipment
  ingredients: z.array(IngredientSchema).describe("The ingredients for the recipe"),
  equipment: z.array(EquipmentSchema).optional(),
  
  // Instructions
  instructions: z.array(InstructionStepSchema).describe("The instructions for the recipe"),
  
  // Allergens and Dietary Information
  allergens: z.array(z.enum([
    "milk", "eggs", "fish", "shellfish", "tree_nuts", "peanuts", 
    "wheat", "soybeans", "sesame", "mustard", "celery", "lupin", "sulfites"
  ])).default([]),
  
  dietaryTags: z.array(z.enum([
    "vegetarian", "vegan", "gluten_free", "dairy_free", "nut_free", 
    "soy_free", "egg_free", "keto", "paleo", "low_carb", 
    "low_sodium", "sugar_free", "kosher", "halal"
  ])).default([]),
  
  // Category and Classification
  category: z.enum([
    "cookies", "cakes", "breads", "pastries", "pies", "tarts", 
    "muffins", "scones", "biscuits", "crackers", "bars", "other"
  ]),
  
  subcategory: z.string().optional(), // e.g., "chocolate chip", "sourdough", "french"
  
  // Temperature and Environment
  ovenTemperature: z.object({
    fahrenheit: z.number().optional(),
    celsius: z.number().optional(),
    setting: z.string().optional(), // e.g., "convection", "bake", "broil"
  }).optional(),
  
  // Storage and Shelf Life
  storage: StorageInfoSchema.optional(),
  
  // Nutrition Information
  nutrition: NutritionInfoSchema.optional(),
  
  // SEO and Marketing
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  servingSuggestions: z.string().optional(),
  
  // Professional Notes
  bakerNotes: z.string().optional(), // Professional tips and variations
  variations: z.array(z.object({
    name: z.string(),
    description: z.string(),
    modifications: z.string(),
  })).optional(),
  
  // Quality Control
  donenessTests: z.array(z.string()).optional(), // e.g., "toothpick comes out clean", "golden brown"
  troubleshooting: z.array(z.object({
    problem: z.string(),
    solution: z.string(),
  })).optional(),
});

// Schema for recipe upload/processing
export const RecipeUploadSchema = z.object({
  images: z.array(z.instanceof(File)).min(1, "At least one recipe image is required"),
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().optional(),
  existingData: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    ingredients: z.string().optional(),
    allergens: z.string().optional(),
  }).optional(),
});

export const ExtractedRecipeSchema = z.object({
  recipe: BakerRecipeSchema,
  productName: z.string().describe("The name of the product"),
  productDescription: z.string().describe("Brief description of the product"),
  keywords: z.array(z.string().describe("The keywords / tags for the recipe")),
});

// Type exports
export type Ingredient = z.infer<typeof IngredientSchema>;
export type Equipment = z.infer<typeof EquipmentSchema>;
export type NutritionInfo = z.infer<typeof NutritionInfoSchema>;
export type InstructionStep = z.infer<typeof InstructionStepSchema>;
export type StorageInfo = z.infer<typeof StorageInfoSchema>;
export type BakerRecipe = z.infer<typeof BakerRecipeSchema>;
export type RecipeUpload = z.infer<typeof RecipeUploadSchema>;
export type ExtractedRecipe = z.infer<typeof ExtractedRecipeSchema>;


// Common baking constants
export const BAKING_CATEGORIES = [
  "cookies", "cakes", "breads", "pastries", "pies", "tarts", 
  "muffins", "scones", "biscuits", "crackers", "bars", "other"
] as const;

export const DIFFICULTY_LEVELS = [
  "beginner", "intermediate", "advanced", "professional"
] as const;

export const COMMON_BAKING_EQUIPMENT = [
  "mixing_bowl", "whisk", "spatula", "measuring_cup", "measuring_spoons",
  "baking_sheet", "parchment_paper", "oven", "mixer", "sifter",
  "rolling_pin", "cookie_cutter", "piping_bag", "thermometer"
] as const;

export const INGREDIENT_CATEGORIES = [
  "flour", "sugar", "fat", "liquid", "leavening", 
  "flavoring", "binding", "decoration", "other"
] as const;