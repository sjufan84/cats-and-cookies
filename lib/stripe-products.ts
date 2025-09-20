/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from './db';
import { products } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { stripe } from './stripe';

export interface StripeProductSync {
  productId: number;
  stripeProductId: string;
  stripePriceId: string;
  action: 'created' | 'updated' | 'skipped';
}

export interface ProductSyncOptions {
  forceUpdate?: boolean;
  skipExisting?: boolean;
}

export class StripeProductManager {
  /**
   * Sync a single product with Stripe
   */
  static async syncProduct(productId: number, options: ProductSyncOptions = {}): Promise<StripeProductSync> {
    try {
      // Get product from database
      const [dbProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!dbProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Check if product already has Stripe IDs
      if (dbProduct.stripeProductId && dbProduct.stripePriceId && !options.forceUpdate) {
        if (options.skipExisting) {
          return {
            productId: dbProduct.id,
            stripeProductId: dbProduct.stripeProductId,
            stripePriceId: dbProduct.stripePriceId,
            action: 'skipped'
          };
        }

        // Verify the Stripe product still exists and update if needed
        try {
          await stripe.products.retrieve(dbProduct.stripeProductId);
          const existingStripePrice = await stripe.prices.retrieve(dbProduct.stripePriceId);

          // Check if price needs updating
          const currentPriceInCents = Math.round(parseFloat(dbProduct.basePrice) * 100);
          if (existingStripePrice.unit_amount !== currentPriceInCents) {
            // Create new price (Stripe prices are immutable)
            const newStripePrice = await stripe.prices.create({
              product: dbProduct.stripeProductId,
              unit_amount: currentPriceInCents,
              currency: 'usd'
            });

            // Update database with new price ID
            await db
              .update(products)
              .set({
                stripePriceId: newStripePrice.id,
                stripeLastSynced: new Date(),
                updatedAt: new Date()
              })
              .where(eq(products.id, productId));

            return {
              productId: dbProduct.id,
              stripeProductId: dbProduct.stripeProductId,
              stripePriceId: newStripePrice.id,
              action: 'updated'
            };
          }

          return {
            productId: dbProduct.id,
            stripeProductId: dbProduct.stripeProductId,
            stripePriceId: dbProduct.stripePriceId,
            action: 'skipped'
          };
        } catch (stripeError) {
          console.warn(`Error: ${stripeError} Stripe product ${dbProduct.stripeProductId} not found, creating new one`);
          // Fall through to create new product
        }
      }

      // Create new Stripe product
      const stripeProduct = await stripe.products.create({
        name: dbProduct.name,
        description: dbProduct.description || undefined,
        metadata: {
          productId: productId.toString(),
          source: 'cats-and-cookies'
        }
      });

      // Create price for the product
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(parseFloat(dbProduct.basePrice) * 100),
        currency: 'usd'
      });

      // Update database with Stripe IDs
      await db
        .update(products)
        .set({
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
          stripeLastSynced: new Date(),
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      return {
        productId: dbProduct.id,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        action: 'created'
      };

    } catch (error) {
      console.error(`Error syncing product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Sync all available products with Stripe
   */
  static async syncAllProducts(options: ProductSyncOptions = {}): Promise<StripeProductSync[]> {
    try {
      const dbProducts = await db
        .select()
        .from(products)
        .where(eq(products.isAvailable, true));

      const results: StripeProductSync[] = [];
      const batchSize = 5; // Process in batches to avoid rate limits

      for (let i = 0; i < dbProducts.length; i += batchSize) {
        const batch = dbProducts.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (product) => {
        try {
            return await this.syncProduct(product.id, options);
        } catch (error) {
          console.error(`Failed to sync product ${product.id}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(result => result !== null) as StripeProductSync[]);

        // Small delay between batches to respect rate limits
        if (i + batchSize < dbProducts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return results;

    } catch (error) {
      console.error('Error syncing all products:', error);
      throw error;
    }
  }

  /**
   * Sync only products that haven't been synced yet
   */
  static async syncUnsyncedProducts(): Promise<StripeProductSync[]> {
    try {
      const unsyncedProducts = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.isAvailable, true),
            isNull(products.stripeProductId)
          )
        );

      const results: StripeProductSync[] = [];

      for (const product of unsyncedProducts) {
        try {
          const syncResult = await this.syncProduct(product.id);
          results.push(syncResult);
        } catch (error) {
          console.error(`Failed to sync unsynced product ${product.id}:`, error);
        }
      }

      return results;

    } catch (error) {
      console.error('Error syncing unsynced products:', error);
      throw error;
    }
  }

  /**
   * Get or create Stripe price for a product
   */
  static async getOrCreateStripePrice(productId: number): Promise<string> {
    try {
      const [dbProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!dbProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // If we have a Stripe price ID, verify it's still valid
      if (dbProduct.stripePriceId) {
        try {
          await stripe.prices.retrieve(dbProduct.stripePriceId);
          return dbProduct.stripePriceId;
        } catch (error) {
          console.warn(`Error: ${error} Stripe price ${dbProduct.stripePriceId} not found, creating new one`);
        }
      }

      // Sync the product to get/create Stripe price
      const syncResult = await this.syncProduct(productId);
      return syncResult.stripePriceId;

    } catch (error) {
      console.error(`Error getting Stripe price for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Create Stripe checkout session with Stripe products
   */
  static async createCheckoutSession(
    items: any[], 
    customerInfo: { email: string; name: string; customerId?: string }
  ) {
    try {
      const lineItems = [];

      for (const item of items) {
        // Get or create Stripe price for the product
        const stripePriceId = await this.getOrCreateStripePrice(item.id);

        lineItems.push({
          price: stripePriceId,
          quantity: item.quantity
        });
      }

      // Create checkout session with customer info
      const sessionParams: any = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/canceled`,
        metadata: {
          customerName: customerInfo.name,
          customerId: customerInfo.customerId,
          items: JSON.stringify(items),
        },
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
        allow_promotion_codes: true,
        payment_intent_data: {
          setup_future_usage: 'off_session',
        },
      };

      // Add customer info - use customer ID if available, otherwise use email
      if (customerInfo.customerId) {
        sessionParams.customer = customerInfo.customerId;
      } else {
        sessionParams.customer_email = customerInfo.email;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return session;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Update product in Stripe when database product changes
   */
  static async updateProduct(productId: number) {
    try {
      const [dbProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!dbProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      if (!dbProduct.stripeProductId) {
        throw new Error(`Product ${productId} has not been synced to Stripe yet`);
      }

      // Update the Stripe product
      await stripe.products.update(dbProduct.stripeProductId, {
        name: dbProduct.name,
        description: dbProduct.description || undefined,
        active: dbProduct.isAvailable
      });

      // Check if price needs updating
      const currentPriceInCents = Math.round(parseFloat(dbProduct.basePrice) * 100);
      let newPriceId = dbProduct.stripePriceId;

      if (dbProduct.stripePriceId) {
        try {
          const existingPrice = await stripe.prices.retrieve(dbProduct.stripePriceId);
          if (existingPrice.unit_amount !== currentPriceInCents) {
            // Create new price (Stripe prices are immutable)
            const newPrice = await stripe.prices.create({
              product: dbProduct.stripeProductId,
              unit_amount: currentPriceInCents,
              currency: 'usd'
            });
            newPriceId = newPrice.id;
          }
        } catch (error) {
          console.warn(`Error: ${error} Could not retrieve existing price, creating new one`);
          const newPrice = await stripe.prices.create({
            product: dbProduct.stripeProductId,
            unit_amount: currentPriceInCents,
            currency: 'usd'
          });
          newPriceId = newPrice.id;
        }
      } else {
        // Create new price if none exists
        const newPrice = await stripe.prices.create({
          product: dbProduct.stripeProductId,
          unit_amount: currentPriceInCents,
          currency: 'usd'
        });
        newPriceId = newPrice.id;
      }

      // Update database with new price ID and sync timestamp
      await db
        .update(products)
        .set({
          stripePriceId: newPriceId,
          stripeLastSynced: new Date(),
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      return {
        productId: dbProduct.id,
        stripeProductId: dbProduct.stripeProductId,
        newPriceId: newPriceId
      };

    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Archive a product in Stripe (set to inactive)
   */
  static async archiveProduct(productId: number) {
    try {
      const [dbProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!dbProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      if (!dbProduct.stripeProductId) {
        console.log(`Product ${productId} not synced to Stripe, skipping archive`);
        return;
      }

      // Archive the product in Stripe
      await stripe.products.update(dbProduct.stripeProductId, {
        active: false
      });

      // Update database
      await db
        .update(products)
        .set({
          stripeLastSynced: new Date(),
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      console.log(`Product ${productId} archived in Stripe`);

    } catch (error) {
      console.error(`Error archiving product ${productId}:`, error);
      throw error;
    }
  }
}