import React from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, Zap, Crown } from 'lucide-react';
import { useLocation } from 'wouter';

interface SwipeLimitDisplayProps {
  remainingSwipes: number | 'unlimited';
  dailyLimit: number | null;
  countdown: string;
  isPremium: boolean;
  isLimitReached: boolean;
  className?: string;
}

export function SwipeLimitDisplay({
  remainingSwipes,
  dailyLimit,
  countdown,
  isPremium,
  isLimitReached,
  className = ''
}: SwipeLimitDisplayProps) {
  const [, setLocation] = useLocation();

  if (isPremium) {
    return (
      <Card className={`bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Premium Member</span>
            <Zap className="w-4 h-4 ml-auto" />
          </div>
          <p className="text-sm text-amber-600 mt-1">
            Unlimited swipes available
          </p>
        </CardContent>
      </Card>
    );
  }

  const progress = dailyLimit 
    ? ((dailyLimit - (remainingSwipes as number)) / dailyLimit) * 100
    : 0;

  if (isLimitReached) {
    return (
      <Card className={`bg-gradient-to-r from-red-50 to-pink-50 border-red-200 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <Clock className="w-5 h-5" />
            Daily Limit Reached
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-red-600 mb-3">
            You've used all 10 free swipes today.
          </p>
          
          {countdown && (
            <div className="mb-4 p-3 bg-red-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">
                  Reset in:
                </span>
                <span className="text-lg font-mono font-bold text-red-800">
                  {countdown}
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Button 
              onClick={() => setLocation('/pricing')}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
            <p className="text-xs text-red-500 text-center">
              Get unlimited swipes for just $7/month
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-700">
            Daily Swipes
          </span>
          <span className="text-sm text-blue-600">
            {remainingSwipes} of {dailyLimit} left
          </span>
        </div>
        
        <Progress 
          value={progress} 
          className="mb-3 h-2"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-600">
            Resets at midnight
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/pricing')}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Zap className="w-3 h-3 mr-1" />
            Go Premium
          </Button>
        </div>
        
        {remainingSwipes as number <= 3 && (
          <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-700">
            <strong>Running low!</strong> Consider upgrading for unlimited swipes.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 