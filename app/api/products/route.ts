import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allProducts = await db.select().from(products).where(eq(products.isAvailable, true));
    return NextResponse.json(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, isFeatured } = body;

    if (!name || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = await db.insert(products).values({
      name,
      description,
      price: price.toString(),
      imageUrl,
      isFeatured: isFeatured || false,
      isAvailable: true,
    }).returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}