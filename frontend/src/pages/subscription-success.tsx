import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const SubscriptionSuccessPage: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if no user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleContinue = () => {
    navigate('/');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Activated!</CardTitle>
          <CardDescription>
            Your 14-day free trial has been successfully started.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <h3 className="text-lg font-medium">Thank you for subscribing!</h3>
            <p className="text-muted-foreground mt-2">
              You now have full access to all PantryPal features.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button onClick={handleContinue}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionSuccessPage; 