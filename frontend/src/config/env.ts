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
};

// List of required environment variables
const requiredEnvVars = ['VITE_SPOONACULAR_API_KEY'];

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