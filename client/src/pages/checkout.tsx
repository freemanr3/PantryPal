import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useElements, useStripe, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useAuth } from '@/hooks/useAuth';
import { createSubscription } from '@/services/stripe';
import { useStripe as useStripeContext } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

type PlanType = 'premium';

const PLAN_DETAILS = {
  premium: {
    title: 'Premium Plan',
    description: 'Everything you need for amazing meals',
    price: '$7/month',
    features: [
      'Unlimited recipe saves',
      'Advanced recipe search',
      'Multi-week, advanced meal planning',
      'Smart, organized shopping lists',
      'Exclusive chef-curated recipes',
      'Scale recipes for any occasion',
      'Personalized wine pairings',
      'Early access to features',
      'VIP support'
    ]
  },
};

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { setClientSecret } = useStripeContext();
  
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubscriptionCreated, setIsSubscriptionCreated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('premium');

  // Get plan from query string (defaults to premium since it's the only option)
  const planFromQuery = React.useMemo(() => {
    const match = location.match(/plan=(premium)/);
    return match ? (match[1] as PlanType) : 'premium';
  }, [location]);

  // Redirect if no user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Create subscription when component mounts or plan changes
  useEffect(() => {
    const initializeSubscription = async () => {
      if (!user || isSubscriptionCreated) return;
      
      setIsLoading(true);
      setErrorMessage(null);
      
      try {
        const { clientSecret } = await createSubscription({
          email: user.email,
          userId: user.id,
          name: user.name,
          plan: selectedPlan,
        });
        
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
  }, [user, setClientSecret, isSubscriptionCreated, selectedPlan]);

  // When planFromQuery changes, update selectedPlan
  React.useEffect(() => {
    setSelectedPlan(planFromQuery);
  }, [planFromQuery]);

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

  const handlePlanChange = (plan: PlanType) => {
    setSelectedPlan(plan);
    setIsSubscriptionCreated(false);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Subscription</CardTitle>
          <CardDescription>
            Start your 7-day free trial. You won't be charged until the trial ends.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Single Premium Plan Display */}
            <div className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50">
              <div className="flex flex-col">
                <span className="font-medium text-lg">{PLAN_DETAILS.premium.title}</span>
                <span className="text-sm text-muted-foreground">{PLAN_DETAILS.premium.description}</span>
                <span className="text-lg font-semibold text-orange-600 mt-1">{PLAN_DETAILS.premium.price}</span>
                <ul className="mt-3 space-y-1">
                  {PLAN_DETAILS.premium.features.map((feature, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-center">
                      <Check className="h-3 w-3 text-orange-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errorMessage}
              </div>
            )}
            
            {isSubscriptionCreated && stripe && elements ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <PaymentElement />
                  <AddressElement options={{ mode: 'billing' }} />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700" 
                  disabled={isLoading || !stripe || !elements}
                >
                  {isLoading ? 'Processing...' : 'Start 7-Day Free Trial'}
                </Button>
              </form>
            ) : (
              <div className="flex justify-center py-6">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                ) : (
                  <p>Loading payment form...</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <p>Your subscription will start with a 7-day free trial.</p>
          <p>You can cancel anytime before the trial ends to avoid being charged.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckoutPage; 