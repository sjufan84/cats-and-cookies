import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, products, customers } from '@/db/schema';
import { desc, sql, count, sum } from 'drizzle-orm';

export async function GET() {
  try {
    // Get total revenue
    const revenueResult = await db
      .select({ total: sum(orders.totalPrice) })
      .from(orders)
      .where(sql`${orders.status} = 'completed'`);

    const totalRevenue = parseFloat(revenueResult[0]?.total || '0');

    // Get total orders
    const ordersResult = await db
      .select({ count: count() })
      .from(orders);

    const totalOrders = ordersResult[0]?.count || 0;

    // Get total customers
    const customersResult = await db
      .select({ count: count() })
      .from(customers);

    const totalCustomers = customersResult[0]?.count || 0;

    // Get total products
    const productsResult = await db
      .select({ count: count() })
      .from(products);

    const totalProducts = productsResult[0]?.count || 0;

    // Get featured products count
    const featuredResult = await db
      .select({ count: count() })
      .from(products)
      .where(sql`${products.isFeatured} = true`);

    const featuredProducts = featuredResult[0]?.count || 0;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        customerName: orders.customerName,
        totalPrice: orders.totalPrice,
        createdAt: orders.createdAt,
        status: orders.status
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Get top products by sales (this would need orderItems table for accurate data)
    // For now, we'll return a placeholder structure
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        totalSold: sql<number>`0`, // Placeholder - would need orderItems join
        revenue: sql<number>`0` // Placeholder - would need orderItems join
      })
      .from(products)
      .where(sql`${products.isFeatured} = true`)
      .limit(5);

    const stats = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue,
      featuredProducts,
      recentOrders,
      topProducts
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
