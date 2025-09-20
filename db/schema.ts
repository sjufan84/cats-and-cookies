import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * USERS
 * This table is for admin users (Sage) to manage the store.
 * For simplicity, we are not implementing customer accounts for now.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * PRODUCTS
 * This table stores all the delicious cookies and baked goods.
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(), // Price per individual unit
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  // Additional product fields
  category: varchar("category", { length: 100 }).default("cookies").notNull(),
  ingredients: text("ingredients"),
  allergens: text("allergens"),
  // Unit system fields
  unitType: varchar("unit_type", { length: 50 }).default("individual").notNull(), // individual, dozen, half_dozen, etc.
  minQuantity: integer("min_quantity").default(1).notNull(),
  maxQuantity: integer("max_quantity").default(100).notNull(),
  // Stripe integration fields
  stripeProductId: text("stripe_product_id").unique(),
  stripePriceId: text("stripe_price_id").unique(),
  stripeLastSynced: timestamp("stripe_last_synced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * PRODUCT UNITS
 * This table stores different unit options for products (individual, half dozen, dozen, etc.)
 */
export const productUnits = pgTable("product_units", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(), // "Individual", "Half Dozen", "Dozen", etc.
  quantity: integer("quantity").notNull(), // 1, 6, 12, etc.
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Price for this unit
  isDefault: boolean("is_default").default(false).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * CUSTOMERS
 * This table stores customer information for better integration with Stripe.
 */
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").unique().notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  // Customer preferences and metadata
  preferences: text("preferences"), // JSON string for storing preferences
  totalOrders: integer("total_orders").default(0).notNull(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0").notNull(),
  lastOrderDate: timestamp("last_order_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * ORDERS
 * This table contains information about customer orders.
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  status: varchar("status", {
    length: 50,
    enum: ["pending", "paid", "shipped", "delivered", "canceled", "refunded", "disputed"],
  })
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * ORDER_ITEMS
 * This is a join table between orders and products, representing a line item in an order.
 */
export const orderItems = pgTable(
  "order_items",
  {
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.orderId, table.productId] }),
    };
  }
);

// RELATIONS
// Defining relations for easier querying of related data.

export const customerRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const productRelations = relations(products, ({ many }) => ({
  units: many(productUnits),
  orderItems: many(orderItems),
}));

export const productUnitRelations = relations(productUnits, ({ one }) => ({
  product: one(products, {
    fields: [productUnits.productId],
    references: [products.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.stripeCustomerId],
    references: [customers.stripeCustomerId],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
