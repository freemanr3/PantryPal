import { RecipeDetail } from './recipeService';

declare module './recipeService' {
  interface RecipeDetail {
    analyzedInstructions?: any[];
  }
  
  interface ExtendedIngredient {
    notes?: string;
  }
} 