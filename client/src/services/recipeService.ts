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
  analyzedInstructions?: AnalyzedInstruction[];
}

class RecipeService {
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

  // Alias methods for backward compatibility
  async getRecipesByIngredients(ingredients: string[], options: RecipeSearchOptions = {}): Promise<Recipe[]> {
    return this.searchByIngredients(ingredients, options);
  }

  async getRandomRecipes(number: number = 10, mealType?: string): Promise<RecipeDetail[]> {
    // For now, return empty array - implement with backend API if needed
    return [];
  }

  async getRecipesBulk(ids: number[]): Promise<RecipeDetail[]> {
    // For now, return empty array - implement with backend API if needed  
    return [];
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

  async getAnalyzedInstructions(id: number): Promise<AnalyzedInstruction[]> {
    // For now, return empty array - implement with backend API if needed
    return [];
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