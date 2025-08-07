import { API_ENDPOINTS, API_BASE_URLS, getHeaders, getFullUrl } from '@/config/api';
import type { AnalyzedInstruction, ExtendedIngredient, Ingredient } from '@/shared/client-schema';
import type { Recipe, SpoonacularRecipe } from '@/lib/types';

// Re-export Recipe type for components to use
export type { Recipe };

export interface RecipeSearchOptions {
  number?: number;
  ranking?: number;
  maxMissingIngredients?: number;
  ignorePantry?: boolean;
  dishType?: string;
}

// RecipeDetail extends Recipe with additional fields
export interface RecipeDetail extends Recipe {
  servings: number;
  readyInMinutes: number;
  instructions: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  extendedIngredients: ExtendedIngredient[];
}

// Enhanced caching system
class ApiCache {
  private static CACHE_VERSION = '1.0';
  private static CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours for persistent cache
  
  private static getCacheKey(type: string, params: any): string {
    return `api_cache_${type}_${JSON.stringify(params)}_v${this.CACHE_VERSION}`;
  }
  
  // Check if cache entry is still valid
  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_EXPIRY;
  }
  
  // Get from persistent cache (localStorage)
  static getFromCache<T>(type: string, params: any): T | null {
    try {
      const key = this.getCacheKey(type, params);
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (this.isCacheValid(timestamp)) {
        console.log(`✅ Cache HIT for ${type}:`, params);
        return data;
      } else {
        // Remove expired cache
        localStorage.removeItem(key);
        return null;
      }
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }
  
  // Save to persistent cache
  static saveToCache<T>(type: string, params: any, data: T): void {
    try {
      const key = this.getCacheKey(type, params);
      const cacheEntry = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheEntry));
      console.log(`💾 Cached ${type}:`, params);
    } catch (error) {
      console.error('Cache write error:', error);
      // If localStorage is full, clear old cache entries
      this.clearExpiredCache();
    }
  }
  
  // Clear expired cache entries
  static clearExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('api_cache_')) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const { timestamp } = JSON.parse(cached);
              if (!this.isCacheValid(timestamp)) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted cache entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

// Request deduplication and rate limiting
class RequestManager {
  private static pendingRequests = new Map<string, Promise<any>>();
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 100; // 100ms minimum between requests
  
  // Deduplicate identical requests
  static async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Deduplicated request for: ${key}`);
      return this.pendingRequests.get(key)!;
    }
    
    const promise = this.executeWithRateLimit(requestFn);
    this.pendingRequests.set(key, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }
  
  // Rate limit requests
  private static async executeWithRateLimit<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    return requestFn();
  }
}

// Transform Spoonacular API response to our Recipe type
const transformSpoonacularRecipe = (data: SpoonacularRecipe): Recipe => {
  return {
    id: data.id,
    title: data.title,
    description: data.summary || '',
    image: data.image,
    imageType: data.imageType,
    usedIngredientCount: data.usedIngredientCount,
    missedIngredientCount: data.missedIngredientCount,
    missedIngredients: data.missedIngredients || [],
    usedIngredients: data.usedIngredients || [],
    unusedIngredients: data.unusedIngredients || [],
    likes: data.likes || 0,
    servings: data.servings || 4,
    readyInMinutes: data.readyInMinutes || 0,
    preparationMinutes: data.preparationMinutes ?? undefined,
    cookingMinutes: data.cookingMinutes ?? undefined,
    instructions: data.instructions || '',
    summary: data.summary || '',
    cuisines: data.cuisines || [],
    dishTypes: data.dishTypes || [],
    diets: data.diets || [],
    extendedIngredients: data.extendedIngredients || [],
    // Derived or default values
    estimatedCost: data.pricePerServing ? data.pricePerServing / 100 * (data.servings || 4) : 10.99,
    cookingTime: data.cookingMinutes ?? data.readyInMinutes ?? 0,
    dietaryTags: [
      ...(data.diets || []),
      ...(data.dairyFree ? ['dairy-free'] : []),
      ...(data.glutenFree ? ['gluten-free'] : []),
      ...(data.vegan ? ['vegan'] : []),
      ...(data.vegetarian ? ['vegetarian'] : []),
      ...(data.lowFodmap ? ['low-fodmap'] : [])
    ]
  };
};

class RecipeService {
  constructor() {
    // Clean expired cache on initialization
    ApiCache.clearExpiredCache();
  }

  async searchByIngredients(ingredients: string[], options: RecipeSearchOptions = {}): Promise<Recipe[]> {
    // Use backend API Gateway endpoint
    const params = new URLSearchParams({
      options: encodeURIComponent(JSON.stringify({
        ingredients,
        ...options,
      })),
    });
    const url = `${API_BASE_URLS.BACKEND}/recipes?${params}`;
    const response = await fetch(url, {
      headers: getHeaders('default'),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    const data = await response.json();
    return data.results || [];
  }

  async getRecipeDetails(id: number): Promise<RecipeDetail> {
    // Use backend API Gateway endpoint
    const url = `${API_BASE_URLS.BACKEND}/recipes/${id}`;
    const response = await fetch(url, {
      headers: getHeaders('default'),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recipe details');
    }
    const data = await response.json();
    return data.recipe;
  }

  async saveRecipe(userId: string, recipeId: number): Promise<{ message: string; upgrade?: boolean }> {
    // Use backend API Gateway endpoint for saving recipe with daily limit enforcement
    const url = `${API_BASE_URLS.BACKEND}/users/${userId}/saved-recipes`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders('default'),
      credentials: 'include',
      body: JSON.stringify({ recipeId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save recipe');
    }
    return response.json();
  }

  async deleteRecipe(id: number): Promise<void> {
    const url = getFullUrl(API_ENDPOINTS.RECIPES.BACKEND.DELETE(id));

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders('default'),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete recipe');
    }
  }

  // Utility methods for cache management
  static clearCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('api_cache_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ API cache cleared');
  }

  static getCacheStats(): { totalEntries: number; totalSize: string } {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('api_cache_'));
    
    let totalSize = 0;
    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) totalSize += item.length;
    });
    
    return {
      totalEntries: cacheKeys.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`
    };
  }
}

export const recipeService = new RecipeService(); 