import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'MealMatcherStorage',
  permissions: {
    authenticated: {
      actions: ['create', 'read', 'update', 'delete'],
      paths: ['public/*', 'private/${cognito-identity.amazonaws.com:sub}/*']
    },
    public: {
      actions: ['read'],
      paths: ['public/*']
    }
  }
}); 