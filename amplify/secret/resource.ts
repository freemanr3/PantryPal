import { defineSecret } from '@aws-amplify/backend';

export const secret = defineSecret({
  name: 'PantryPalSecrets',
  policy: {
    statements: [
      {
        actions: ['secretsmanager:GetSecretValue'],
        resources: ['*']
      }
    ]
  }
}); 