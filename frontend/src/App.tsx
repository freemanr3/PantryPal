import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { StripeProvider } from './lib/stripe';

// Pages
import LandingPage from './pages/landing';
import AuthPage from './pages/auth';
import DashboardPage from './pages/dashboard';
import MealSwiper from './pages/meal-swiper';
import PricingPage from './pages/pricing';
import CheckoutPage from './pages/checkout';
import SubscriptionSuccessPage from './pages/subscription-success';

// Layout components
import Header from './components/header';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-16">
              <Switch>
                <Route path="/" component={LandingPage} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/pricing" component={PricingPage} />
                <Route path="/checkout">
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/subscription-success">
                  <ProtectedRoute>
                    <SubscriptionSuccessPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/dashboard">
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/meal-swiper">
                  <ProtectedRoute>
                    <MealSwiper />
                  </ProtectedRoute>
                </Route>
                <Route>
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600">Page not found</p>
                    </div>
                  </div>
                </Route>
              </Switch>
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </StripeProvider>
    </QueryClientProvider>
  );
}

export default App;
