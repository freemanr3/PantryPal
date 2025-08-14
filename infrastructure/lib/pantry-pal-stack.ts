import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
// import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';
import { Construct } from 'constructs';

export class PantryPalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // No VPC/NAT: Lambdas access AWS services over public endpoints to avoid NAT costs

    // (ElastiCache subnet group, security group, and cluster removed)

    // S3 Buckets with optimized settings
    const staticAssetsBucket = new s3.Bucket(this, 'StaticAssets', {
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*']
        }
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30)
            }
          ]
        }
      ]
    });

    const recipeImagesBucket = new s3.Bucket(this, 'RecipeImages', {
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*']
        }
      ],
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30)
            }
          ]
        }
      ]
    });

    const userDataBucket = new s3.Bucket(this, 'UserData', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*']
        }
      ]
    });

    // CloudFront Distribution with optimized settings
    const logBucket = new s3.Bucket(this, 'CDNLogs', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(30)
        }
      ],
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const distribution = new cloudfront.Distribution(this, 'PantryPalCDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(staticAssetsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true
      },
      additionalBehaviors: {
        '/images/*': {
          origin: new origins.S3Origin(recipeImagesBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true
        }
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enableLogging: true,
      logBucket: logBucket,
      logFilePrefix: 'cdn-logs/'
    });

    // DynamoDB Tables with optimized settings
    const usersTable = new dynamodb.Table(this, 'Users', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'ttl',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true
    });

    const recipesTable = new dynamodb.Table(this, 'Recipes', {
      partitionKey: { name: 'recipeId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true
    });

    // Add GSI with optimized settings
    recipesTable.addGlobalSecondaryIndex({
      indexName: 'ingredients-index',
      partitionKey: { name: 'ingredientsKey', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ['title', 'ingredients', 'thumbnail']
    });

    // Cognito
    const userPool = new cognito.UserPool(this, 'PantryPalUsers', {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      }
    });

    const userPoolClient = userPool.addClient('PantryPalWeb', {
      oAuth: {
        flows: {
          implicitCodeGrant: true
        },
        callbackUrls: ['http://localhost:5173', 'https://pantrypal.com']
      }
    });

    const identityPool = new cognito.CfnIdentityPool(this, 'PantryPalIdentity', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName
        }
      ]
    });

    // Secrets with real API keys
    const apiKeys = new secretsmanager.Secret(this, "ExternalApiKeys", {
      secretName: "pantry-pal/api-keys",
      secretValue: secretsmanager.SecretValue.unsafePlainText(JSON.stringify({
        SPOONACULAR_API_KEY: "e551a15401d14103b79ca1d865daa038",
        EDAMAM_APP_ID: "893b140e",
        EDAMAM_APP_KEY: "8edfacd2f98015dd77e9dc3220a31fe3",
        STRIPE_SECRET_KEY: "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",
        STRIPE_WEBHOOK_SECRET: "whsec_UxzRlAVuhWH7OxWVOs244Q1GslWyWwec",
        STRIPE_PREMIUM_PRICE_ID: "price_1RNusNGUd62jKHFhVMp4rWhc",
        STRIPE_CHEF_PRICE_ID: "price_1RTYqOGUd62jKHFhMOvZX7gH"
      }))
    });

    // Lambda Layer for shared code
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/layers/shared')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Common utilities and API clients'
    });

    // Lambda functions with optimized settings
    // Rely on default execution roles; avoid VPC access policy to reduce cost/complexity

    // No security group needed without VPC attachment

    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 1024,
      // no VPC attachment to avoid NAT charges
      logRetention: 7,
      environment: {
        NODE_OPTIONS: '--enable-source-maps'
      },
      bundling: {
        sourceMap: true,
        minify: true
      }
    };

    const recipeSearchLambda = new lambda.Function(this, 'RecipeSearch', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/functions/recipe-search')),
      handler: 'index.handler',
      layers: [sharedLayer],
      environment: {
        RECIPES_TABLE: recipesTable.tableName,
        API_KEYS_SECRET: apiKeys.secretName
      },
      timeout: cdk.Duration.seconds(30)
    });

    const recipeDetailsLambda = new lambda.Function(this, 'RecipeDetails', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/functions/recipe-details')),
      handler: 'index.handler',
      layers: [sharedLayer],
      environment: {
        RECIPES_TABLE: recipesTable.tableName,
        API_KEYS_SECRET: apiKeys.secretName
      },
      timeout: cdk.Duration.seconds(30)
    });

    const userPreferencesLambda = new lambda.Function(this, 'UserPreferences', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/functions/user-preferences')),
      handler: 'index.handler',
      layers: [sharedLayer],
      environment: {
        USERS_TABLE: usersTable.tableName,
        USER_DATA_BUCKET: userDataBucket.bucketName
      }
    });

    const imageProcessingLambda = new lambda.Function(this, 'ImageProcessing', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/functions/image-processing')),
      handler: 'index.handler',
      layers: [sharedLayer],
      environment: {
        RECIPE_IMAGES_BUCKET: recipeImagesBucket.bucketName
      },
      timeout: cdk.Duration.seconds(60)
    });

    // Stripe Webhooks Lambda
    const stripeWebhooksLambda = new lambda.Function(this, 'StripeWebhooks', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/functions/stripe-webhooks')),
      environment: {
        USERS_TABLE: usersTable.tableName,
        STRIPE_SECRET_KEY: "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",
        STRIPE_WEBHOOK_SECRET: "whsec_UxzRlAVuhWH7OxWVOs244Q1GslWyWwec",
        STRIPE_PREMIUM_PRICE_ID: "price_1RNusNGUd62jKHFhVMp4rWhc",
        STRIPE_CHEF_PRICE_ID: "price_1RTYqOGUd62jKHFhMOvZX7gH"
      },
    // Swipe Tracker Lambda
    const swipeTrackerLambda = new lambda.Function(this, 'SwipeTracker', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/functions/swipe-tracker')),
      handler: 'index.handler',
      memorySize: 256,
      environment: {
        USERS_TABLE: usersTable.tableName
      },
      timeout: cdk.Duration.seconds(10)
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'PantryPalApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const recipesResource = api.root.addResource('recipes');
    const recipeResource = recipesResource.addResource('{id}');
    const usersResource = api.root.addResource('users');
    const userResource = usersResource.addResource('{userId}');
    const webhooksResource = api.root.addResource('webhooks');
    const stripeWebhookResource = webhooksResource.addResource('stripe');
    const swipeResource = api.root.addResource('swipe');

    recipesResource.addMethod('GET', new apigateway.LambdaIntegration(recipeSearchLambda));
    recipeResource.addMethod('GET', new apigateway.LambdaIntegration(recipeDetailsLambda));
    userResource.addMethod('GET', new apigateway.LambdaIntegration(userPreferencesLambda));
    userResource.addMethod('PUT', new apigateway.LambdaIntegration(userPreferencesLambda));
    
    // Stripe webhook endpoint (no CORS needed for webhooks)
    stripeWebhookResource.addMethod('POST', new apigateway.LambdaIntegration(stripeWebhooksLambda), {
      requestParameters: {
        'method.request.header.stripe-signature': true
      }
    });
    
    // Swipe tracking endpoint
    swipeResource.addMethod('POST', new apigateway.LambdaIntegration(swipeTrackerLambda));

    // Grant permissions
    apiKeys.grantRead(recipeSearchLambda);
    apiKeys.grantRead(recipeDetailsLambda);
    apiKeys.grantRead(stripeWebhooksLambda);
    recipesTable.grantReadWriteData(recipeSearchLambda);
    recipesTable.grantReadWriteData(recipeDetailsLambda);
    usersTable.grantReadWriteData(userPreferencesLambda);
    usersTable.grantReadWriteData(stripeWebhooksLambda);
    usersTable.grantReadWriteData(swipeTrackerLambda);
    recipeImagesBucket.grantReadWrite(imageProcessingLambda);
    userDataBucket.grantReadWrite(userPreferencesLambda);

    // Add stack outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url || '',
      description: 'API Gateway endpoint URL'
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution domain name'
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID'
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID'
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
      description: 'Cognito Identity Pool ID'
    });

    new cdk.CfnOutput(this, 'StaticAssetsBucketName', {
      value: staticAssetsBucket.bucketName,
      description: 'S3 bucket for static assets'
    });

    new cdk.CfnOutput(this, 'RecipeImagesBucketName', {
      value: recipeImagesBucket.bucketName,
      description: 'S3 bucket for recipe images'
    });
  }
} 