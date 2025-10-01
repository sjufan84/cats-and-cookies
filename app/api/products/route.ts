import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productUnits } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { StripeProductManager } from '@/lib/stripe-products';

export async function GET() {
  try {
    const allProducts = await db.select().from(products).where(eq(products.isAvailable, true));
    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const basePrice = formData.get('basePrice') as string;
    const isFeatured = formData.get('isFeatured') === 'true';
    const isAvailable = formData.get('isAvailable') === 'true';
    const category = formData.get('category') as string;
    const ingredients = formData.get('ingredients') as string;
    const allergens = formData.get('allergens') as string;
    const unitType = formData.get('unitType') as string;
    const minQuantity = parseInt(formData.get('minQuantity') as string);
    const maxQuantity = parseInt(formData.get('maxQuantity') as string);
    const unitsJson = formData.get('units') as string;
    const recipeDataJson = formData.get('recipeData') as string;
    const imageFiles = formData.getAll('images') as File[];

    // Validate required fields
    if (!name || !description || !basePrice || !unitType || isNaN(minQuantity) || isNaN(maxQuantity)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    // Upload images to Google Cloud Storage
    const uploadFormData = new FormData();
    imageFiles.forEach(file => {
      uploadFormData.append('files', file);
    });

    const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/upload`, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.json();
      return NextResponse.json({ error: `Failed to upload images: ${uploadError.error}` }, { status: 500 });
    }

    const { urls } = await uploadResponse.json();
    const primaryImageUrl = urls[0]; // Use first image as primary

    // Parse units and recipe data
    const units = unitsJson ? JSON.parse(unitsJson) : [];
    const recipeData = recipeDataJson ? JSON.parse(recipeDataJson) : null;

    // Create product in database
    const newProduct = await db.insert(products).values({
      name,
      description,
      basePrice: basePrice.toString(),
      imageUrl: primaryImageUrl,
      isFeatured: isFeatured || false,
      isAvailable: isAvailable !== false,
      category: category || 'cookies',
      ingredients: ingredients || '',
      allergens: allergens || '',
      unitType: unitType,
      minQuantity: minQuantity,
      maxQuantity: maxQuantity,
      recipeData: recipeData ? JSON.stringify(recipeData) : null,
    }).returning();

    // Insert product units
    if (newProduct.length > 0 && units.length > 0) {
      const productId = newProduct[0].id;
      const unitValues = units.map(unit => ({
        productId,
        name: unit.name,
        quantity: unit.quantity,
        price: unit.price.toString(),
        isDefault: unit.isDefault,
        isAvailable: true,
        sortOrder: 0,
      }));
      await db.insert(productUnits).values(unitValues);
    }

    // Sync with Stripe
    try {
      await StripeProductManager.syncProduct(newProduct[0].id, {
        forceUpdate: true
      });
    } catch (stripeError) {
      console.error('Failed to sync with Stripe:', stripeError);
      // Don't fail the entire operation if Stripe sync fails
      // The product is still created in the database
    }

    return NextResponse.json({
      ...newProduct[0],
      uploadedImages: urls,
      message: 'Product created successfully and synced with Stripe'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}