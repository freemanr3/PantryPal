/**
 * API Configuration
 * 
 * This file centralizes all API endpoint configurations and provides
 * environment-specific settings for both local development and production.
 */

import { ENV } from './env';

/**
 * API Base URLs
 * 
 * These URLs are used to determine where API requests should be directed
 * based on the current environment.
 */
export const API_BASE_URLS = {
  // Backend API URL (Express server)
  BACKEND: ENV.API_URL,
  
  // Third-party API URLs
  SPOONACULAR: 'https://api.spoonacular.com',
} as const;

/**
 * API Endpoints
 * 
 * Centralized configuration for all API endpoints used in the application.
 * Each endpoint is documented with its purpose and required parameters.
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
  },

  // Recipe endpoints
  RECIPES: {
    // Spoonacular API endpoints
    SPOONACULAR: {
      BASE: '/recipes',
      SEARCH_BY_INGREDIENTS: '/recipes/findByIngredients',
      RECIPE_DETAILS: (id: number) => `/recipes/${id}/information`,
      ANALYZED_INSTRUCTIONS: (id: number) => `/recipes/${id}/analyzedInstructions`,
      BULK_INFORMATION: '/recipes/informationBulk',
      RANDOM: '/recipes/random',
    },
    
    // Backend API endpoints
    BACKEND: {
      LIST: '/api/recipes',
      DETAILS: (id: number) => `/api/recipes/${id}`,
      SAVE: '/api/recipes/save',
      DELETE: (id: number) => `/api/recipes/${id}`,
    },
  },

  // Meal planning endpoints
  MEAL_PLANS: {
    LIST: '/api/mealplans',
    DETAILS: (id: number) => `/api/mealplans/${id}`,
    CREATE: '/api/mealplans',
    UPDATE: (id: number) => `/api/mealplans/${id}`,
    DELETE: (id: number) => `/api/mealplans/${id}`,
  },

  // User preferences endpoints
  PREFERENCES: {
    GET: '/api/preferences',
    UPDATE: '/api/preferences',
  },
} as const;

/**
 * API Headers
 * 
 * Common headers used across API requests
 */
export const API_HEADERS = {
  // Default headers for all requests
  DEFAULT: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Headers for Spoonacular API requests
  SPOONACULAR: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': ENV.SPOONACULAR_API_KEY,
  },
} as const;

/**
 * Helper function to get the full URL for an endpoint
 * 
 * @param endpoint - The endpoint path
 * @param baseUrl - Optional base URL override
 * @returns The complete URL for the endpoint
 */
export function getFullUrl(endpoint: string, baseUrl?: string): string {
  const base = baseUrl || API_BASE_URLS.BACKEND;
  return `${base}${endpoint}`;
}

/**
 * Helper function to get headers for a specific API
 * 
 * @param api - The API to get headers for ('default' | 'spoonacular')
 * @returns The headers for the specified API
 */
export function getHeaders(api: 'default' | 'spoonacular' = 'default') {
  return API_HEADERS[api.toUpperCase() as keyof typeof API_HEADERS];
}

/**
 * Environment-specific configuration
 * 
 * This object contains configuration that varies between environments
 */
export const API_CONFIG = {
  // Whether to include credentials in requests
  CREDENTIALS: 'include' as RequestCredentials,
  
  // Default timeout for requests (in milliseconds)
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // milliseconds
  },
} as const; 