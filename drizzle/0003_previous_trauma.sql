ALTER TABLE "products" ADD COLUMN "category" varchar(100) DEFAULT 'cookies' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "ingredients" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "allergens" text;