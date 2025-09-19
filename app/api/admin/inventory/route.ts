import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, orders, orderItems } from '@/db/schema';
import { eq, and, sum, gte } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'low-stock':
        // Get products that might need restocking based on recent orders
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const productSales = await db
          .select({
            productId: orderItems.productId,
            totalSold: sum(orderItems.quantity).as('total_sold')
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(and(
            gte(orders.createdAt, thirtyDaysAgo),
            eq(orders.status, 'paid')
          ))
          .groupBy(orderItems.productId);

        return NextResponse.json({ productSales });

      /* case 'revenue-report':
        // Get revenue by product
        const revenueByProduct = await db
          .select({
            productId: orderItems.productId,
            productName: products.name,
            totalRevenue: sum(products.price * orderItems.quantity).as('total_revenue'),
            totalOrders: sum(1).as('total_orders')
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(eq(orders.status, 'paid'))
          .groupBy(orderItems.productId, products.name);

        return NextResponse.json({ revenueByProduct });
*/
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'update-inventory':
        // Update product inventory status
        const [updatedProduct] = await db
          .update(products)
          .set({
            isAvailable: data.isAvailable,
            updatedAt: new Date()
          })
          .where(eq(products.id, data.productId))
          .returning();

        // Sync with Stripe if product is available
        if (data.isAvailable) {
          try {
            const { StripeProductManager } = await import('@/lib/stripe-products');
            await StripeProductManager.syncProduct(data.productId);
          } catch (syncError) {
            console.error('Failed to sync product with Stripe:', syncError);
          }
        }

        return NextResponse.json({
          message: 'Product inventory updated',
          product: updatedProduct
        });

      case 'bulk-update':
        // Update multiple products at once
        const updatePromises = data.productIds.map((productId: number) =>
          db
            .update(products)
            .set({
              isAvailable: data.isAvailable,
              updatedAt: new Date()
            })
            .where(eq(products.id, productId))
        );

        await Promise.all(updatePromises);

        return NextResponse.json({
          message: `${data.productIds.length} products updated`,
          productIds: data.productIds
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}