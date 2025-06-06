import express from 'express';
import { stripe, STRIPE_PREMIUM_PRICE_ID, STRIPE_CHEF_PRICE_ID } from '../config/stripe';
import asyncHandler from 'express-async-handler';

const router = express.Router();

/**
 * Creates a subscription with a trial period
 * POST /api/create-subscription
 * 
 * Request body:
 * {
 *   email: string,      // Customer's email
 *   userId: string,     // Cognito user ID for reference
 *   name?: string,      // Optional customer name
 *   plan: 'premium' | 'chef'  // Subscription plan type
 * }
 */
router.post('/create-subscription', asyncHandler(async (req, res) => {
  try {
    const { email, userId, name, plan } = req.body;

    if (!email || !userId || !plan) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, userId, and plan are required' 
      });
    }

    if (plan !== 'premium' && plan !== 'chef') {
      return res.status(400).json({
        error: 'Invalid plan type. Must be either "premium" or "chef"'
      });
    }

    // Select the appropriate price ID based on the plan
    const priceId = plan === 'premium' ? STRIPE_PREMIUM_PRICE_ID : STRIPE_CHEF_PRICE_ID;

    // Create or retrieve a customer
    let customer;
    const existingCustomers = await stripe.customers.list({ email });
    
    if (existingCustomers.data.length > 0) {
      // Use existing customer if found
      customer = existingCustomers.data[0];
      
      // Update customer with the latest userId for reference
      customer = await stripe.customers.update(customer.id, {
        metadata: { userId },
      });
    } else {
      // Create a new customer
      customer = await stripe.customers.create({
        email,
        name: name || email,
        metadata: {
          userId, // Store Cognito user ID for reference
        },
      });
    }

    // Create a subscription with a 5-day trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_period_days: 5,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        plan, // Store the plan type in subscription metadata
      },
    });

    // Return the client secret for the payment intent
    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as any;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      plan,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router; 