import React, { createContext, useContext, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Use the provided Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RNuiNGUd62jKHFhJ07p6LUolG4xoiRcCyFpaxsdlbCVbKloUILOH33m75fNtl3eiLbh8Qc0I8g3eYxxmSrm349Z00KqiL6pnO';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Create context for Stripe-related data
interface StripeContextValue {
  isLoading: boolean;
  clientSecret: string | null;
  setClientSecret: (secret: string) => void;
}

const StripeContext = createContext<StripeContextValue | undefined>(undefined);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const value = {
    isLoading,
    clientSecret,
    setClientSecret,
  };

  return (
    <StripeContext.Provider value={value}>
      {clientSecret ? (
        <Elements 
          stripe={stripePromise} 
          options={{ clientSecret }}
        >
          {children}
        </Elements>
      ) : (
        children
      )}
    </StripeContext.Provider>
  );
}; 