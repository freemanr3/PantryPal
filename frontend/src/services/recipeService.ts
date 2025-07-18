import type { Recipe, RecipeDetail } from '../lib/types';

const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || 'test-key';
const BASE_URL = 'https://api.spoonacular.com/recipes';

class RecipeService {
  async searchRecipes(query: string, number: number = 10): Promise<Recipe[]> {
    try {
      // Mock data for now since we're in production mode
      return this.generateMockRecipes(number);
    } catch (error) {
      console.error('Error searching recipes:', error);
      return this.generateMockRecipes(number);
    }
  }

  async getRecipesByIngredients(ingredients: string[], number: number = 10): Promise<Recipe[]> {
    try {
      return this.generateMockRecipes(number);
    } catch (error) {
      console.error('Error finding recipes by ingredients:', error);
      return this.generateMockRecipes(number);
    }
  }

  async getRecipeDetails(id: number): Promise<RecipeDetail | null> {
    try {
      return this.generateMockRecipeDetail(id);
    } catch (error) {
      console.error('Error getting recipe details:', error);
      return null;
    }
  }

  async getRandomRecipes(number: number = 10): Promise<Recipe[]> {
    try {
      return this.generateMockRecipes(number);
    } catch (error) {
      console.error('Error getting random recipes:', error);
      return this.generateMockRecipes(number);
    }
  }

  private generateMockRecipes(count: number): Recipe[] {
    const recipes: Recipe[] = [];
    const dishTypes = ['main course', 'side dish', 'dessert', 'appetizer', 'salad', 'bread', 'breakfast', 'soup', 'beverage', 'sauce'];
    const dietaryTags = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto', 'paleo'];
    
    for (let i = 1; i <= count; i++) {
      recipes.push({
        id: Math.floor(Math.random() * 100000) + i,
        title: `Mock Recipe ${i}`,
        image: `https://spoonacular.com/recipeImages/${Math.floor(Math.random() * 100000)}-556x370.jpg`,
        readyInMinutes: Math.floor(Math.random() * 60) + 15,
        servings: Math.floor(Math.random() * 6) + 2,
        summary: `This is a mock recipe ${i} with delicious ingredients and easy preparation.`,
        dishTypes: [dishTypes[Math.floor(Math.random() * dishTypes.length)]],
        dietaryTags: Math.random() > 0.5 ? [dietaryTags[Math.floor(Math.random() * dietaryTags.length)]] : [],
        estimatedCost: Math.floor(Math.random() * 2000) + 500 // cents
      });
    }
    
    return recipes;
  }

  private generateMockRecipeDetail(id: number): RecipeDetail {
    const baseRecipe = this.generateMockRecipes(1)[0];
    baseRecipe.id = id;
    
    return {
      ...baseRecipe,
      extendedIngredients: [
        {
          id: 1,
          name: 'Mock Ingredient 1',
          original: '2 cups mock ingredient 1',
          amount: 2,
          unit: 'cups',
          image: 'ingredient1.jpg'
        },
        {
          id: 2,
          name: 'Mock Ingredient 2',
          original: '1 tablespoon mock ingredient 2',
          amount: 1,
          unit: 'tablespoon',
          image: 'ingredient2.jpg'
        }
      ],
      analyzedInstructions: [
        {
          name: '',
          steps: [
            {
              number: 1,
              step: 'Prepare all ingredients according to the recipe.',
              ingredients: [],
              equipment: []
            },
            {
              number: 2,
              step: 'Cook according to instructions and enjoy!',
              ingredients: [],
              equipment: []
            }
          ]
        }
      ],
      instructions: 'Step 1: Prepare ingredients. Step 2: Cook and enjoy!',
      nutrition: {
        calories: Math.floor(Math.random() * 500) + 200,
        protein: `${Math.floor(Math.random() * 30) + 10}g`,
        carbohydrates: `${Math.floor(Math.random() * 50) + 20}g`,
        fat: `${Math.floor(Math.random() * 20) + 5}g`
      }
    };
  }
}

// Create and export a singleton instance
export const recipeService = new RecipeService();

// Export types
export type { Recipe, RecipeDetail };

// Default export
export default recipeService; 