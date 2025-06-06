import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if the required environment variables are set
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID;
const STRIPE_CHEF_PRICE_ID = process.env.STRIPE_CHEF_PRICE_ID;

if (!STRIPE_SECRET_KEY) {
  console.error('Missing required environment variable: STRIPE_SECRET_KEY');
  process.exit(1);
}

if (!STRIPE_PREMIUM_PRICE_ID || !STRIPE_CHEF_PRICE_ID) {
  console.error('Missing required environment variables: STRIPE_PREMIUM_PRICE_ID and STRIPE_CHEF_PRICE_ID are required');
  process.exit(1);
}

// Initialize Stripe with the secret key
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export { stripe, STRIPE_PREMIUM_PRICE_ID, STRIPE_CHEF_PRICE_ID }; 