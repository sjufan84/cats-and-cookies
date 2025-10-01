import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { 
  ExtractedRecipeSchema
} from '@/schemas/recipeSchemas';

// Initialize Google AI with Gemini
const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];
    const productName = formData.get('productName') as string;
    const productDescription = formData.get('productDescription') as string;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // Convert images to base64 for Gemini
    const imagePromises = images.map(async (image) => {
      const arrayBuffer = await image.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return {
        type: 'image',
        data: base64,
        mimeType: image.type,
      };
    });

    const imageData = await Promise.all(imagePromises);

    // Create the prompt for baker-friendly recipe extraction
    let prompt = `
      You are an expert baker and recipe analyst specializing in professional baking. 
      Analyze the provided recipe images and extract comprehensive baker-friendly recipe information.

      Focus on accuracy and professional baking standards. 
      If information is not clearly visible, 
      make educated assumptions based on the recipe type and standard baking practices.
    `;

    if (productDescription) {
      prompt += `
        The product description is: ${productDescription}
      `;
    }
    if (productName) {
      prompt += `
        The product name is: ${productName}
      `;
    }

    // Generate structured recipe data using Gemini
    const result = await generateObject({
      model: gemini('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageData.map(img => ({
              type: 'image' as const,
              image: `data:${img.mimeType};base64,${img.data}`,
            })),
          ],
        },
      ],
      schema: ExtractedRecipeSchema,
      temperature: 0.1, // Low temperature for more consistent results
    });

    // Validate the response
    const validatedData = ExtractedRecipeSchema.parse(result.object);

    // Enhance the recipe data with additional metadata
    const enhancedRecipe = {
      ...validatedData,
      author: "Cats & Cookies Kitchen",
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    return NextResponse.json(enhancedRecipe);

  } catch (error) {
    console.error('Recipe extraction error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Recipe data validation failed', 
          details: error.issues 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to extract recipe data' }, 
      { status: 500 }
    );
  }
}
