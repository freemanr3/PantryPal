// Recipe types
export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary?: string;
  dishTypes: string[];
  dietaryTags: string[];
  estimatedCost?: number;
}

export interface RecipeDetail extends Recipe {
  extendedIngredients: ExtendedIngredient[];
  analyzedInstructions: Instruction[];
  instructions?: string;
  nutrition?: Nutrition;
}

export interface ExtendedIngredient {
  id: number;
  name: string;
  original: string;
  amount: number;
  unit: string;
  image?: string;
  notes?: string;
}

export interface Instruction {
  name: string;
  steps: Step[];
}

export interface Step {
  number: number;
  step: string;
  ingredients?: any[];
  equipment?: any[];
}

export interface Nutrition {
  calories: number;
  protein: string;
  carbohydrates: string;
  fat: string;
}

// Meal plan types
export interface MealPlanItem {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  ingredients: string[];
} 