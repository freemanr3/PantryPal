import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useElements, useStripe, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { useStripe as useStripeContext } from '../lib/stripe';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Check, Crown } from 'lucide-react';
import { config } from '../config';

export default function CheckoutPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { setClientSecret } = useStripeContext();
  
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubscriptionCreated, setIsSubscriptionCreated] = useState(false);

  // Redirect if no user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Create subscription when component mounts
  useEffect(() => {
    const initializeSubscription = async () => {
      if (!user || isSubscriptionCreated) return;
      
      setIsLoading(true);
      setErrorMessage(null);
      
      try {
        const response = await fetch(`${config.apiEndpoint}/subscription/create-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            userId: user.id,
            name: user.name,
            plan: 'premium',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create subscription');
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
        setIsSubscriptionCreated(true);
      } catch (error) {
        console.error('Failed to create subscription:', error);
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'Failed to set up payment. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeSubscription();
  }, [user, setClientSecret, isSubscriptionCreated]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An unexpected error occurred.');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred during payment processing.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const premiumFeatures = [
    'Unlimited recipe swipes',
    'Advanced recipe filters',
    'Premium chef recipes',
    'Smart meal planning',
    'Grocery list generation',
    'Nutritional information',
    'Wine pairing suggestions',
    'Recipe scaling',
    'Priority customer support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-8 h-8 text-orange-500" />
              <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
            </div>
            <CardDescription className="text-center">
              Start your 7-day free trial. You won't be charged until the trial ends.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* Plan Details */}
              <div className="border-2 border-orange-500 rounded-lg p-6 bg-orange-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-orange-800">Premium Plan</h3>
                    <p className="text-sm text-orange-600">Everything you need for amazing meals</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-800">$7</div>
                    <div className="text-sm text-orange-600">per month</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span className="text-sm text-orange-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errorMessage}
                </div>
              )}
              
              {isSubscriptionCreated && stripe && elements ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Payment Information</h4>
                    <PaymentElement />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Billing Address</h4>
                    <AddressElement options={{ mode: 'billing' }} />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" 
                    disabled={isLoading || !stripe || !elements}
                    size="lg"
                  >
                    {isLoading ? 'Processing...' : 'Start 7-Day Free Trial'}
                  </Button>
                </form>
              ) : (
                <div className="flex justify-center py-8">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  ) : (
                    <p>Loading payment form...</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2 text-sm text-gray-600 text-center">
            <p>🔒 Your payment information is secure and encrypted</p>
            <p>Your subscription will start with a 7-day free trial.</p>
            <p>You can cancel anytime before the trial ends to avoid being charged.</p>
            <p>All payments are processed securely by Stripe.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 