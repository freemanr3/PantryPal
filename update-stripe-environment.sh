#!/bin/bash
echo "🔧 Updating Stripe environment variables in Lambda function..."

# Update Stripe Webhooks Lambda environment - REPLACE around lines 340-350 in pantry-pal-stack.ts

cat << 'LAMBDA_ENV'
    // Stripe Webhooks Lambda
    const stripeWebhooksLambda = new lambda.Function(this, 'StripeWebhooks', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/functions/stripe-webhooks')),
      handler: 'index.handler',
      memorySize: 256,
      environment: {
        USERS_TABLE: usersTable.tableName,
        STRIPE_SECRET_KEY: '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',
        STRIPE_WEBHOOK_SECRET: 'whsec_UxzRlAVuhWH7OxWVOs244Q1GslWyWwec',
        STRIPE_PREMIUM_PRICE_ID: 'price_1RNusNGUd62jKHFhVMp4rWhc',
        STRIPE_CHEF_PRICE_ID: 'price_1RTYqOGUd62jKHFhMOvZX7gH'
      },
      timeout: cdk.Duration.seconds(30)
    });
LAMBDA_ENV

echo "✅ Environment variables ready for deployment"
