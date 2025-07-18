export const config = {
  // API Configuration
  apiEndpoint: 'https://0uotlclkr0.execute-api.us-east-2.amazonaws.com/prod',
  cdnEndpoint: 'https://d1qfak5o9yswv0.cloudfront.net',
  
  // AWS Cognito Configuration
  cognito: {
    userPoolId: 'us-east-2_wJM8bf71Y',
    userPoolWebClientId: '639nqr8jo2b0k1hpdm762mtgaj',
    identityPoolId: 'us-east-2:893038d5-5f79-4c59-8cc3-ea85aa6fdc3d',
    region: 'us-east-2'
  },

  // S3 Configuration (for file uploads)
  storage: {
    region: 'us-east-2',
    recipeImagesBucket: 'pantrypalstack-recipeimagesdc582a3a-pqvy7jfu3ynr',
    staticAssetsBucket: 'pantrypalstack-staticassetsddee9873-bou5koqx5boe'
  },

  // Feature Flags
  features: {
    enablePremiumFeatures: true,
    enableImageUpload: true,
    enableSocialSharing: true
  }
}; 