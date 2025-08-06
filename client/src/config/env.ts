/**
 * Centralized environment configuration
 * 
 * This file provides a single source of truth for all environment variables
 * used throughout the application. It also includes validation to ensure
 * required variables are present.
 */

// Define the environment variables interface
interface EnvConfig {
  SPOONACULAR_API_KEY: string;
  API_URL: string;
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  COGNITO_USER_POOL_ID: string;
  COGNITO_CLIENT_ID: string;
  AWS_REGION: string;
}

// Create the environment configuration object
export const ENV: EnvConfig = {
  SPOONACULAR_API_KEY: import.meta.env.VITE_SPOONACULAR_API_KEY || '',
  API_URL: import.meta.env.VITE_API_URL || (
    import.meta.env.DEV 
      ? 'http://localhost:5000' 
      : window.location.origin
  ),
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-2_YWfa08XCX',
  COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID || '4sj8htmmqst54qdg7joa8guams',
  AWS_REGION: import.meta.env.VITE_AWS_REGION || 'us-east-2',
};

// List of required environment variables for production
const requiredEnvVars = ENV.IS_PRODUCTION ? ['VITE_SPOONACULAR_API_KEY'] : [];

// Validate required environment variables
export function validateEnv(): void {
  const missingVars = requiredEnvVars.filter(
    (envVar) => !import.meta.env[envVar]
  );

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
    
    // In development, show a more detailed error
    if (ENV.IS_DEVELOPMENT) {
      console.error(
        'Please add these variables to your .env file or environment configuration.'
      );
    }
  }
}

// Run validation immediately
validateEnv(); 