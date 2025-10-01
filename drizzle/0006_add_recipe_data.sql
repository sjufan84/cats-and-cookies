-- Drizzle migration file for adding recipe data field
ALTER TABLE products ADD COLUMN recipe_data TEXT;
