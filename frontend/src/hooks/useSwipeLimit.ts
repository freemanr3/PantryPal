import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { config } from '../config';

interface SwipeStatus {
  remainingSwipes: number | 'unlimited';
  dailyLimit: number | null;
  swipeCount: number;
  hoursUntilReset: number | null;
  isPremium: boolean;
  isLimitReached: boolean;
  countdown: string;
}

interface SwipeResponse {
  success: boolean;
  swipeCount: number;
  remainingSwipes: number | 'unlimited';
  hoursUntilReset: number | null;
  isPremium: boolean;
  dailyLimit: number | null;
  message: string;
}

export function useSwipeLimit() {
  const { user } = useAuth();
  const [swipeStatus, setSwipeStatus] = useState<SwipeStatus>({
    remainingSwipes: 10,
    dailyLimit: 10,
    swipeCount: 0,
    hoursUntilReset: null,
    isPremium: false,
    isLimitReached: false,
    countdown: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update countdown timer
  const updateCountdown = useCallback((hoursUntilReset: number | null) => {
    if (!hoursUntilReset || swipeStatus.isPremium) {
      setSwipeStatus(prev => ({ ...prev, countdown: '' }));
      return;
    }

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeLeft = midnight.getTime() - now.getTime();
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const countdown = `${hours}h ${minutes}m ${seconds}s`;
    setSwipeStatus(prev => ({ ...prev, countdown }));
  }, [swipeStatus.isPremium]);

  // Set up countdown interval
  useEffect(() => {
    if (!swipeStatus.isPremium && swipeStatus.hoursUntilReset) {
      const interval = setInterval(() => {
        updateCountdown(swipeStatus.hoursUntilReset);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [swipeStatus.hoursUntilReset, swipeStatus.isPremium, updateCountdown]);

  // Track a swipe action
  const trackSwipe = useCallback(async (recipeId: string, action: 'like' | 'skip'): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated to track swipes');
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${config.apiEndpoint}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          userId: user.id,
          recipeId,
          action
        })
      });

      if (response.status === 429) {
        // Daily limit reached
        const errorData = await response.json();
        setSwipeStatus(prev => ({
          ...prev,
          isLimitReached: true,
          remainingSwipes: 0,
          hoursUntilReset: errorData.hoursUntilReset,
          countdown: ''
        }));
        updateCountdown(errorData.hoursUntilReset);
        return false;
      }

      if (!response.ok) {
        throw new Error('Failed to track swipe');
      }

      const data: SwipeResponse = await response.json();
      
      setSwipeStatus({
        remainingSwipes: data.remainingSwipes,
        dailyLimit: data.dailyLimit,
        swipeCount: data.swipeCount,
        hoursUntilReset: data.hoursUntilReset,
        isPremium: data.isPremium,
        isLimitReached: data.remainingSwipes === 0,
        countdown: ''
      });

      updateCountdown(data.hoursUntilReset);
      return true;

    } catch (error) {
      console.error('Error tracking swipe:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateCountdown]);

  // Get authentication token
  const getAuthToken = async (): Promise<string> => {
    try {
      const { getCurrentUser } = await import('aws-amplify/auth');
      const currentUser = await getCurrentUser();
      return currentUser.signInDetails?.authFlowType || '';
    } catch (error) {
      console.warn('Could not get auth token:', error);
      return '';
    }
  };

  // Check current swipe status from backend
  const checkSwipeStatus = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`${config.apiEndpoint}/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setSwipeStatus(prev => ({
          ...prev,
          isPremium: userData.isPremium || false,
          remainingSwipes: userData.isPremium ? 'unlimited' : Math.max(0, 10 - (userData.dailySwipeCount || 0)),
          dailyLimit: userData.isPremium ? null : 10,
          swipeCount: userData.dailySwipeCount || 0,
          isLimitReached: !userData.isPremium && (userData.dailySwipeCount || 0) >= 10
        }));
      }
    } catch (error) {
      console.error('Error checking swipe status:', error);
    }
  }, [user]);

  // Load initial status when user changes
  useEffect(() => {
    if (user) {
      checkSwipeStatus();
    }
  }, [user, checkSwipeStatus]);

  // Reset limit check (useful for premium upgrades)
  const resetLimitCheck = useCallback(() => {
    checkSwipeStatus();
  }, [checkSwipeStatus]);

  return {
    swipeStatus,
    trackSwipe,
    isLoading,
    resetLimitCheck,
    // Convenience getters
    canSwipe: !swipeStatus.isLimitReached || swipeStatus.isPremium,
    remainingSwipes: swipeStatus.remainingSwipes,
    countdown: swipeStatus.countdown,
    isPremium: swipeStatus.isPremium,
    isLimitReached: swipeStatus.isLimitReached
  };
} 