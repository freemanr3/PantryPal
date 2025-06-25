import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    phone: true,
    username: false
  },
  mfa: {
    required: false,
    optional: true
  },
  passwordPolicy: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialCharacters: true,
    requireUppercase: true,
    requireLowercase: true
  },
  userAttributes: {
    profilePicture: {
      mutable: true,
      required: false
    },
    dietaryPreferences: {
      mutable: true,
      required: false
    },
    budget: {
      mutable: true,
      required: false
    }
  }
});
