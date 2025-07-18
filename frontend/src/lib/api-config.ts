/// <reference types="../vite-env.d.ts" />
import { ENV } from '@/config/env';

// Use the centralized environment configuration
export const API_URL = `${ENV.API_URL}/api`;

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': ENV.SPOONACULAR_API_KEY,
  },
  credentials: 'include' as RequestCredentials,
};
