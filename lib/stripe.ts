import Stripe from 'stripe';

// Load environment variables
// Note: The team will need to create a .env file with the STRIPE_SECRET_KEY
// For example: STRIPE_SECRET_KEY="sk_test_..."

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil', // Use the latest API version
  typescript: true,
});
