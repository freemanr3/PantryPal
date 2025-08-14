import { config } from 'dotenv';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  config();
}

export const CONFIG = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL,
  
  // AWS Configuration (for Amplify)
  AWS_REGION: process.env.AWS_REGION || 'us-east-2',
  
  // API Configuration
  API_URL: process.env.NODE_ENV === 'production' 
    ? process.env.API_URL 
    : `http://localhost:${process.env.PORT || 5000}`,
};
