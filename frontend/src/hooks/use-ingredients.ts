import { useState, useEffect } from 'react';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<string[]>([]);

  useEffect(() => {
    const savedIngredients = localStorage.getItem('availableIngredients');
    if (savedIngredients) {
      setIngredients(JSON.parse(savedIngredients));
    }
  }, []);

  const updateIngredients = (newIngredients: string[]) => {
    setIngredients(newIngredients);
    localStorage.setItem('availableIngredients', JSON.stringify(newIngredients));
  };

  return {
    ingredients,
    updateIngredients,
    hasIngredients: ingredients.length > 0,
  };
} 