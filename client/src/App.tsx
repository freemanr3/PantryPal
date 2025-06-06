import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DiscoverPage from "@/pages/discover";
import MealPlanner from "@/pages/meal-planner";
import { IngredientsPage } from '@/pages/preferences';
import { Header } from '@/components/header';
import HomePage from '@/pages/home';
import PricingPage from '@/pages/pricing';
import RecipeDetail from '@/pages/recipe-detail';
import LandingPage from '@/pages/landing';
import AboutPage from '@/pages/about';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';
import CognitoOAuthHandler from '@/components/auth/CognitoOAuthHandler';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiMonitor } from '@/components/ApiMonitor';

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
    <div className="container mx-auto p-4 pt-20">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  </div>
);

// Error fallback for route-level errors
const RouteErrorFallback = ({ error }: { error?: Error }) => (
  <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Page Error</h2>
      <p className="text-muted-foreground mb-4">
        This page encountered an error and couldn't load properly.
      </p>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="text-left bg-gray-100 p-4 rounded text-sm">
          <summary>Error Details</summary>
          <pre>{error.message}</pre>
        </details>
      )}
    </div>
  </div>
);

// Define proper types for route components and props
type RouteComponentProps = {
  params?: {
    id?: string;
    [key: string]: string | undefined;
  };
};

type ProtectedRouteProps = {
  component: React.ComponentType<RouteComponentProps>;
  params?: RouteComponentProps['params'];
};

function ProtectedRoute({ component: Component, params }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading while auth is being determined
  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!user) {
    setLocation('/auth');
    return null;
  }

  return (
    <ErrorBoundary fallback={<RouteErrorFallback />}>
      <Suspense fallback={<PageLoadingFallback />}>
        <Component params={params} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Router() {
  // Get user authentication state
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading while auth is being determined
  if (loading) {
    return <PageLoadingFallback />;
  }
  
  return (
    <Switch>
      <Route path="/auth">
        {(params) => {
          // If user is already logged in, redirect to discover page
          if (user) {
            setLocation('/discover');
            return null;
          }
          return (
            <ErrorBoundary fallback={<RouteErrorFallback />}>
              <Suspense fallback={<PageLoadingFallback />}>
                <AuthPage params={params} />
              </Suspense>
            </ErrorBoundary>
          );
        }}
      </Route>
      <Route path="/oauth/callback">
        {(params) => (
          <ErrorBoundary fallback={<RouteErrorFallback />}>
            <Suspense fallback={<PageLoadingFallback />}>
              <CognitoOAuthHandler params={params} />
            </Suspense>
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/pricing">
        {(params) => (
          <ErrorBoundary fallback={<RouteErrorFallback />}>
            <Suspense fallback={<PageLoadingFallback />}>
              <PricingPage params={params} />
            </Suspense>
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/about">
        {(params) => (
          <ErrorBoundary fallback={<RouteErrorFallback />}>
            <Suspense fallback={<PageLoadingFallback />}>
              <AboutPage />
            </Suspense>
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/landing">
        {(params) => (
          <ErrorBoundary fallback={<RouteErrorFallback />}>
            <Suspense fallback={<PageLoadingFallback />}>
              <LandingPage />
            </Suspense>
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/">
        {(params) => {
          // Redirect root path to landing page for non-authenticated users
          if (!user) {
            setLocation('/landing');
            return null;
          }
          // Redirect to discover for authenticated users
          setLocation('/discover');
          return null;
        }}
      </Route>
      <Route path="/discover">
        {(params) => <ProtectedRoute component={DiscoverPage} params={params} />}
      </Route>
      <Route path="/ingredients">
        {(params) => <ProtectedRoute component={IngredientsPage} params={params} />}
      </Route>
      <Route path="/preferences">
        {(params) => <ProtectedRoute component={IngredientsPage} params={params} />}
      </Route>
      <Route path="/meal-planner">
        {(params) => <ProtectedRoute component={MealPlanner} params={params} />}
      </Route>
      <Route path="/recipe/:id">
        {(params) => <ProtectedRoute component={RecipeDetail} params={params} />}
      </Route>
      <Route>
        {(params) => (
          <ErrorBoundary fallback={<RouteErrorFallback />}>
            <Suspense fallback={<PageLoadingFallback />}>
              <NotFound params={params} />
            </Suspense>
          </ErrorBoundary>
        )}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to AWS CloudWatch or your preferred service
        console.error('App-level error:', error, errorInfo);
      }}
    >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <div className="min-h-screen bg-background">
            <ErrorBoundary fallback={<div>Header failed to load</div>}>
        <Header />
            </ErrorBoundary>
        <Router />
      </div>
      <Toaster />
          <ApiMonitor />
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
