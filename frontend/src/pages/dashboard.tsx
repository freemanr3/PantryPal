import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSwipeLimit } from '../hooks/useSwipeLimit';
import { SwipeLimitDisplay } from '../components/SwipeLimitDisplay';

export default function DashboardPage() {
  const { user } = useAuth();
  const { swipeStatus } = useSwipeLimit();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600">
            Ready to discover your next favorite meal?
          </p>
        </div>

        <SwipeLimitDisplay
          remainingSwipes={swipeStatus.remainingSwipes}
          dailyLimit={swipeStatus.dailyLimit}
          countdown={swipeStatus.countdown}
          isPremium={swipeStatus.isPremium}
          isLimitReached={swipeStatus.isLimitReached}
        />
      </div>
    </div>
  );
} 