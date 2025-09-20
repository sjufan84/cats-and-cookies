CREATE TABLE "product_units" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "price" TO "base_price";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "unit_type" varchar(50) DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "min_quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "max_quantity" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;