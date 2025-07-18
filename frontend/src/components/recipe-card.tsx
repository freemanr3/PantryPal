import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Clock, Users, Heart, Eye } from 'lucide-react';
import type { Recipe } from '@/lib/types';

interface RecipeCardProps {
  recipe: Recipe;
  isLiked?: boolean;
  onLike?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function RecipeCard({ 
  recipe, 
  isLiked = false, 
  onLike, 
  onViewDetails,
  className = '' 
}: RecipeCardProps) {
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/api/placeholder/400/300';
          }}
        />
        {onLike && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            size="sm"
            variant={isLiked ? "default" : "outline"}
            className="absolute top-2 right-2"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.readyInMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.dietaryTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {onViewDetails && (
          <Button 
            onClick={onViewDetails}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 