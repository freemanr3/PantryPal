import { defineSecret } from '@aws-amplify/backend';

export const secret = defineSecret({
  name: 'MealMatcherSecrets',
  policy: {
    statements: [
      {
        actions: ['secretsmanager:GetSecretValue'],
        resources: ['*']
      }
    ]
  }
}); 