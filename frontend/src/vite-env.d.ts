/// <reference types="vite/client" />

/**
 * Type declarations for Vite environment variables
 * 
 * This file provides type safety for environment variables used in the application.
 * It extends the ImportMetaEnv interface to include our custom environment variables.
 */
interface ImportMetaEnv {
  readonly VITE_SPOONACULAR_API_KEY: string;
  readonly VITE_API_URL?: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 