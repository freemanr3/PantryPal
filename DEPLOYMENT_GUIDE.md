# 🚀 MealMatcher Production Deployment Guide

## Overview
This guide will help you deploy MealMatcher to AWS Amplify with all features working: authentication, Stripe payments, swipe limits, and webhooks.

## Prerequisites
1. AWS Account with appropriate permissions
2. Stripe Account (for payments)
3. Spoonacular API Key
4. Edamam API Credentials

## 📋 Step 1: Infrastructure Deployment

### Deploy AWS CDK Stack
```bash
cd infrastructure
npm install
npx cdk bootstrap
npx cdk deploy
```

**Important**: Save the outputs from CDK deployment:
- API Gateway URL
- User Pool ID
- User Pool Client ID
- Identity Pool ID
- S3 Bucket Names

## 📋 Step 2: Amplify Environment Variables

In AWS Amplify Console, configure these environment variables:

### Required Stripe Variables
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxx
STRIPE_CHEF_PRICE_ID=price_xxxxx
```

### Required API Keys
```
SPOONACULAR_API_KEY=your_key_here
EDAMAM_APP_ID=your_app_id_here
EDAMAM_APP_KEY=your_app_key_here
```

### AWS Configuration
```
AWS_REGION=us-east-2
```

## 📋 Step 3: Stripe Webhook Configuration

1. **Create Webhook Endpoint in Stripe Dashboard**
   - URL: `https://your-api-gateway-url.amazonaws.com/prod/webhooks/stripe`
   - Events to send:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.trial_will_end`

2. **Copy Webhook Secret**
   - Add to Amplify environment variables as `STRIPE_WEBHOOK_SECRET`

## 📋 Step 4: Stripe Product & Price Setup

1. **Create Products in Stripe Dashboard**
   - Premium Plan: $7/month
   - Chef Plan: $15/month (optional)

2. **Copy Price IDs**
   - Add to Amplify environment variables

## 📋 Step 5: Frontend Configuration

Update `frontend/src/config.ts` with your deployed values:

```typescript
export const config = {
  apiEndpoint: 'https://your-api-gateway-url.amazonaws.com/prod',
  cdnEndpoint: 'https://your-cloudfront-url.cloudfront.net',
  
  cognito: {
    userPoolId: 'us-east-2_xxxxxxxxx',
    userPoolWebClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    identityPoolId: 'us-east-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    region: 'us-east-2'
  },

  storage: {
    region: 'us-east-2',
    recipeImagesBucket: 'your-recipe-images-bucket',
    staticAssetsBucket: 'your-static-assets-bucket'
  },

  features: {
    enablePremiumFeatures: true,
    enableImageUpload: true,
    enableSocialSharing: true
  }
};
```

## 📋 Step 6: Amplify App Configuration

1. **Connect Repository**
   - Choose GitHub/GitLab repository
   - Select `main` branch

2. **Build Settings**
   - Frontend framework: React
   - Build command: `npm run build`
   - Output directory: `frontend/dist`

3. **Environment Variables**
   - Add all variables from Step 2

## 📋 Step 7: Domain & SSL

1. **Custom Domain** (Optional)
   - Add your domain in Amplify Console
   - Configure DNS records

2. **SSL Certificate**
   - Automatically provided by Amplify

## 📋 Step 8: Testing Checklist

### ✅ Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are properly handled

### ✅ Stripe Integration
- [ ] Subscription creation works
- [ ] Payment processing works
- [ ] Webhooks are receiving events
- [ ] User premium status updates correctly

### ✅ Swipe Limits
- [ ] Free users are limited to 10 swipes/day
- [ ] Countdown timer shows correctly
- [ ] Premium users have unlimited swipes
- [ ] Upgrade prompts appear when limit reached

### ✅ Core Features
- [ ] Recipe search works
- [ ] Recipe details load
- [ ] Meal planning works
- [ ] Images load from CloudFront

## 📋 Step 9: Monitoring & Logging

### CloudWatch Logs
- Lambda function logs
- API Gateway logs
- Error tracking

### Stripe Dashboard
- Payment events
- Webhook delivery status
- Customer management

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check API Gateway CORS configuration
   - Verify allowed origins include your domain

2. **Stripe Webhooks Failing**
   - Check webhook secret matches
   - Verify endpoint URL is correct
   - Check Lambda function logs

3. **Authentication Issues**
   - Verify Cognito configuration
   - Check redirect URLs
   - Validate JWT tokens

4. **Swipe Limits Not Working**
   - Check DynamoDB table permissions
   - Verify user premium status
   - Check Lambda function logs

### Performance Optimization

1. **CDK Optimizations Applied**
   - ARM-based Lambda functions (cost efficient)
   - S3 intelligent tiering
   - CloudFront caching
   - DynamoDB on-demand pricing

2. **Frontend Optimizations**
   - Code splitting
   - Image optimization
   - CDN usage for static assets

## 💰 Cost Estimates (Monthly)

### AWS Services
- **Lambda**: $5-15 (based on usage)
- **DynamoDB**: $2-10 (pay per request)
- **S3**: $1-5 (intelligent tiering)
- **CloudFront**: $1-10 (based on data transfer)
- **Cognito**: $0-5 (first 50k users free)
- **API Gateway**: $1-5 (based on requests)
- **ElastiCache**: $15-30 (t4g.micro)

**Total AWS**: ~$25-80/month

### Third-Party Services
- **Stripe**: 2.9% + 30¢ per transaction
- **Spoonacular**: $0-150/month (based on plan)
- **Edamam**: $0-100/month (based on plan)

## 🔒 Security Best Practices Applied

1. **JWT Authentication** with Cognito
2. **HTTPS Everywhere** via CloudFront
3. **Webhook Signature Verification** for Stripe
4. **IAM Least Privilege** for Lambda functions
5. **VPC Configuration** for Lambda functions
6. **Encryption at Rest** for DynamoDB and S3

## 📈 Business Features Implemented

### Freemium Model
- ✅ 10 swipes per 24 hours for free users
- ✅ Countdown timer until reset
- ✅ Upgrade prompts when limit reached
- ✅ Premium users get unlimited swipes

### Subscription Management
- ✅ 7-day free trial
- ✅ Automatic billing
- ✅ Webhook-based status updates
- ✅ Cancellation handling

### User Experience
- ✅ Tinder-like swiping interface
- ✅ Real-time swipe limit tracking
- ✅ Smooth animations and feedback
- ✅ Mobile-optimized design

## 🎯 Go-Live Checklist

- [ ] All environment variables configured
- [ ] Stripe webhooks tested
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Payment flow tested end-to-end
- [ ] Free trial period tested
- [ ] Swipe limits tested
- [ ] Mobile responsiveness verified
- [ ] Error handling tested
- [ ] Monitoring setup complete

## 📞 Support & Maintenance

### Regular Tasks
1. Monitor Stripe webhook delivery
2. Check CloudWatch logs for errors
3. Monitor API usage and costs
4. Update API keys as needed
5. Review user feedback and metrics

### Scaling Considerations
- Lambda functions auto-scale
- DynamoDB auto-scales with on-demand pricing
- CloudFront handles global distribution
- Consider Redis cluster scaling for high traffic

---

**🎉 Congratulations!** 

Your MealMatcher application is now production-ready with:
- ✅ Secure authentication
- ✅ Working payment system
- ✅ Freemium model with swipe limits
- ✅ Real-time countdown timers
- ✅ Premium subscription management
- ✅ Cost-optimized infrastructure

The app is ready to onboard users and start generating revenue! 