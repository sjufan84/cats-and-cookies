import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const featuredProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.isAvailable, true), eq(products.isFeatured, true)));

    return NextResponse.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
  }
}