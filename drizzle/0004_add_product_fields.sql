-- Add new fields to products table
ALTER TABLE "products" ADD COLUMN "category" varchar(100) DEFAULT 'cookies' NOT NULL;
ALTER TABLE "products" ADD COLUMN "ingredients" text;
ALTER TABLE "products" ADD COLUMN "allergens" text;
