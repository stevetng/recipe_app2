export interface IngredientItem {
  ingredientId: string;
  amount: string;
  unit: string;
}

export interface NutritionTotal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: Difficulty;
  tags: string[];
  ingredients: IngredientItem[];
  instructions: string[];
  nutritionTotal?: NutritionTotal;
  imageUrl?: string;
}

export interface ListRecipesResponse {
  total: number;
  items: Recipe[];
} 