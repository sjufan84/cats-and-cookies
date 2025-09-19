-- Add Stripe integration fields to products table
ALTER TABLE "products" ADD COLUMN "stripe_product_id" text;
ALTER TABLE "products" ADD COLUMN "stripe_price_id" text;
ALTER TABLE "products" ADD COLUMN "stripe_last_synced" timestamp;

-- Add unique constraints for Stripe IDs
ALTER TABLE "products" ADD CONSTRAINT "products_stripe_product_id_unique" UNIQUE("stripe_product_id");
ALTER TABLE "products" ADD CONSTRAINT "products_stripe_price_id_unique" UNIQUE("stripe_price_id");
