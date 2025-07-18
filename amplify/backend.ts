import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { secret } from './secret/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  secret
});

// Define secrets for API keys
backend.createSecret('SPOONACULAR_API_KEY', {
  description: 'Spoonacular API Key'
});

backend.createSecret('EDAMAM_APP_ID', {
  description: 'Edamam Application ID'
});

backend.createSecret('EDAMAM_APP_KEY', {
  description: 'Edamam Application Key'
});
