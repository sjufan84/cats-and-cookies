-- Create customers table for better Stripe integration
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"phone" varchar(50),
	"preferences" text,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(10,2) DEFAULT '0' NOT NULL,
	"last_order_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
