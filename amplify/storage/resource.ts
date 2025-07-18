import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'MealMatcherStorage',
  permissions: {
    authenticated: {
      actions: ['create', 'read', 'update', 'delete'],
      paths: [
        'public/*',
        'private/${cognito-identity.amazonaws.com:sub}/*',
        'protected/recipes/*',
        'protected/ingredients/*',
        'cache/spoonacular/*',
        'cache/edamam/*'
      ]
    },
    public: {
      actions: ['read'],
      paths: [
        'public/*',
        'protected/recipes/*',
        'protected/ingredients/*',
        'cache/spoonacular/*',
        'cache/edamam/*'
      ]
    }
  },
  lifecycle: {
    rules: [
      {
        // Cache expiration for API images (7 days)
        prefix: 'cache/',
        expiration: 7
      }
    ]
  }
}); 