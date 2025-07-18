import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import Stripe from 'stripe';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing signature or webhook secret' })
      };
    }

    let stripeEvent: Stripe.Event;

    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body!, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    console.log('Processing webhook event:', stripeEvent.type);

    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const isPremium = subscription.status === 'active' || subscription.status === 'trialing';
  const subscriptionEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  await docClient.send(new UpdateCommand({
    TableName: process.env.USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET isPremium = :premium, subscriptionStatus = :status, subscriptionEnd = :end, stripeCustomerId = :customerId, stripeSubscriptionId = :subscriptionId',
    ExpressionAttributeValues: {
      ':premium': isPremium,
      ':status': subscription.status,
      ':end': subscriptionEnd,
      ':customerId': subscription.customer,
      ':subscriptionId': subscription.id
    }
  }));

  console.log(`Updated user ${userId} premium status to ${isPremium}`);
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  await docClient.send(new UpdateCommand({
    TableName: process.env.USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET isPremium = :premium, subscriptionStatus = :status',
    ExpressionAttributeValues: {
      ':premium': false,
      ':status': 'canceled'
    }
  }));

  console.log(`Canceled subscription for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  // Reset daily usage counters on successful payment
  await docClient.send(new UpdateCommand({
    TableName: process.env.USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET isPremium = :premium, lastPaymentDate = :paymentDate, dailySwipeCount = :zero, dailySwipeResetDate = :today',
    ExpressionAttributeValues: {
      ':premium': true,
      ':paymentDate': new Date().toISOString(),
      ':zero': 0,
      ':today': new Date().toISOString().split('T')[0]
    }
  }));

  console.log(`Payment succeeded for user ${userId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  // For failed payments, we might want to send notification but keep premium active
  // until the subscription is actually canceled by Stripe
  console.log(`Payment failed for user ${userId}`);
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  // Update trial ending date for potential notifications
  await docClient.send(new UpdateCommand({
    TableName: process.env.USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET trialEndingDate = :date',
    ExpressionAttributeValues: {
      ':date': new Date().toISOString()
    }
  }));

  console.log(`Trial will end soon for user ${userId}`);
} 