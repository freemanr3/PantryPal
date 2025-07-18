import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Check, Heart, Crown } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../context/AuthContext';
import { useSwipeLimit } from '../hooks/useSwipeLimit';
import { SwipeLimitDisplay } from '../components/SwipeLimitDisplay';
import { config } from '../config';

const SWIPE_THRESHOLD = 100;

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  cuisines: string[];
  diets: string[];
  estimatedCost: number;
}

const springConfig = {
  type: "spring",
  damping: 18,
  stiffness: 180,
  mass: 1.2
};

export default function MealSwiper() {
  const { user } = useAuth();
  const { trackSwipe, canSwipe, swipeStatus, isLoading: swipeLoading } = useSwipeLimit();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"right" | "left" | null>(null);
  const [isAnimatingExit, setIsAnimatingExit] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Motion values for swipe animations
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-150, 0], [1, 0]);

  // Fetch recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${config.apiEndpoint}/recipes?limit=50`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.results || []);
      } else {
        throw new Error('Failed to fetch recipes');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthToken = async (): Promise<string> => {
    try {
      const { getCurrentUser } = await import('aws-amplify/auth');
      const currentUser = await getCurrentUser();
      return currentUser.signInDetails?.authFlowType || '';
    } catch (error) {
      return '';
    }
  };

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipe = info.offset.x;
    
    if (Math.abs(swipe) > SWIPE_THRESHOLD) {
      if (swipe > 0) {
        setDirection("right");
        triggerHapticFeedback();
        handleLike();
      } else {
        setDirection("left");
        triggerHapticFeedback();
        handleDislike();
      }
      setIsAnimatingExit(true);
    }
  };

  const handleLike = useCallback(async () => {
    if (!canSwipe) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily swipe limit. Upgrade to Premium for unlimited swipes!",
        variant: "destructive"
      });
      return;
    }

    const currentRecipe = recipes[currentIndex];
    if (!currentRecipe) return;

    try {
      const success = await trackSwipe(currentRecipe.id.toString(), 'like');
      if (success) {
        toast({
          title: "Recipe Saved!",
          description: `${currentRecipe.title} has been added to your favorites.`,
        });
        
        setTimeout(() => {
          advanceToNextRecipe();
        }, 300);
      }
    } catch (error) {
      console.error('Error tracking like:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive"
      });
    }
  }, [canSwipe, currentIndex, recipes, trackSwipe, toast]);

  const handleDislike = useCallback(async () => {
    if (!canSwipe) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily swipe limit. Upgrade to Premium for unlimited swipes!",
        variant: "destructive"
      });
      return;
    }

    const currentRecipe = recipes[currentIndex];
    if (!currentRecipe) return;

    try {
      const success = await trackSwipe(currentRecipe.id.toString(), 'skip');
      if (success) {
        setTimeout(() => {
          advanceToNextRecipe();
        }, 300);
      }
    } catch (error) {
      console.error('Error tracking skip:', error);
      // Continue anyway for better UX
      setTimeout(() => {
        advanceToNextRecipe();
      }, 300);
    }
  }, [canSwipe, currentIndex, recipes, trackSwipe]);

  const advanceToNextRecipe = () => {
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      setIsAnimatingExit(false);
    } else {
      toast({
        title: "No More Recipes",
        description: "You've seen all available recipes. Check your favorites!",
      });
      setDirection(null);
      setIsAnimatingExit(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <Button onClick={() => setLocation('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentRecipe = recipes[currentIndex];

  if (!currentRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Recipes Available</h2>
          <Button onClick={fetchRecipes}>Reload Recipes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="container mx-auto max-w-md">
        {/* Swipe Status Display */}
        <SwipeLimitDisplay
          remainingSwipes={swipeStatus.remainingSwipes}
          dailyLimit={swipeStatus.dailyLimit}
          countdown={swipeStatus.countdown}
          isPremium={swipeStatus.isPremium}
          isLimitReached={swipeStatus.isLimitReached}
          className="mb-6"
        />

        {/* Recipe Card Stack */}
        <div className="relative h-[600px] mb-6">
          <AnimatePresence>
            {!isAnimatingExit && (
              <motion.div
                key={currentRecipe.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{
                  x: direction === "right" ? 300 : -300,
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.3 }
                }}
                style={{ x, rotate }}
                transition={springConfig}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                <Card className="h-full overflow-hidden shadow-xl">
                  <div className="relative h-2/3">
                    <img
                      src={currentRecipe.image}
                      alt={currentRecipe.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Swipe Overlays */}
                    <motion.div
                      style={{ opacity: likeOpacity }}
                      className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                    >
                      <div className="bg-green-500 rounded-full p-4">
                        <Heart className="w-8 h-8 text-white fill-current" />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      style={{ opacity: dislikeOpacity }}
                      className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
                    >
                      <div className="bg-red-500 rounded-full p-4">
                        <X className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                  </div>
                  
                  <CardContent className="h-1/3 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {currentRecipe.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>⏱️ {currentRecipe.readyInMinutes} min</span>
                        <span>👥 {currentRecipe.servings} servings</span>
                        <span>💰 ${currentRecipe.estimatedCost?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {currentRecipe.summary?.replace(/<[^>]*>/g, '') || 'No description available.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full p-6 hover:bg-red-50 transition-colors shadow-sm hover:shadow"
              onClick={handleDislike}
              disabled={swipeLoading || !canSwipe}
            >
              <X className="w-8 h-8 text-red-500" />
            </Button>
          </motion.div>
          
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full p-6 hover:bg-green-50 transition-colors shadow-sm hover:shadow"
              onClick={handleLike}
              disabled={swipeLoading || !canSwipe}
            >
              <Check className="w-8 h-8 text-green-500" />
            </Button>
          </motion.div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Swipe right to save, swipe left to skip</p>
          <p className="mt-1 text-xs">Recipe: {currentIndex + 1} of {recipes.length}</p>
        </div>

        {/* Upgrade Prompt for Limited Users */}
        {!swipeStatus.isPremium && swipeStatus.isLimitReached && (
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg text-white text-center">
            <Crown className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold mb-2">Upgrade to Premium</h3>
            <p className="text-sm mb-3">Get unlimited swipes and exclusive features!</p>
            <Button
              variant="secondary"
              onClick={() => setLocation('/pricing')}
              className="bg-white text-orange-600 hover:bg-gray-100"
            >
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
