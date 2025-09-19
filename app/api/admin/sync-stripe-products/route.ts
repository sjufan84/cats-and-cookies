import { NextResponse } from 'next/server';
import { StripeProductManager } from '@/lib/stripe-products';

export async function POST() {
  try {
    console.log('Starting product sync with Stripe...');
    
    // Sync all available products with Stripe
    const syncResults = await StripeProductManager.syncAllProducts({
      forceUpdate: false, // Don't force update existing products
      skipExisting: false // Sync all products, even existing ones
    });

    // Process results
    const results = syncResults.map(result => ({
      productId: result.productId,
      stripeProductId: result.stripeProductId,
      stripePriceId: result.stripePriceId,
      action: result.action,
      status: 'success'
    }));

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.length - successCount;

    console.log(`Product sync completed: ${successCount} successful, ${failedCount} failed`);

    return NextResponse.json({
      message: 'Product sync completed successfully',
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failedCount,
        actions: {
          created: results.filter(r => r.action === 'created').length,
          updated: results.filter(r => r.action === 'updated').length,
          skipped: results.filter(r => r.action === 'skipped').length
        }
      }
    });

  } catch (error) {
    console.error('Error syncing products with Stripe:', error);
    return NextResponse.json({ 
      error: 'Failed to sync products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Add GET method for checking sync status
export async function GET() {
  try {
    // Get sync status without actually syncing
    const unsyncedResults = await StripeProductManager.syncUnsyncedProducts();
    
    return NextResponse.json({
      message: 'Sync status check completed',
      unsyncedCount: unsyncedResults.length,
      unsyncedProducts: unsyncedResults.map(result => ({
        productId: result.productId,
        action: result.action
      }))
    });

  } catch (error) {
    console.error('Error checking sync status:', error);
    return NextResponse.json({ 
      error: 'Failed to check sync status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}