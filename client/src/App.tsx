import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DiscoverPage from "@/pages/discover";
import MealPlanner from "@/pages/meal-planner";
import { IngredientsPage } from '@/pages/preferences';
import { Header } from '@/components/header';
import HomePage from '@/pages/home';
import PricingPage from '@/pages/pricing';
import { useAuth } from '@/hooks/useAuth';

function ProtectedRoute({ component: Component, ...rest }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/auth');
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/" component={(props) => <ProtectedRoute component={HomePage} {...props} />} />
      <Route path="/discover" component={(props) => <ProtectedRoute component={DiscoverPage} {...props} />} />
      <Route path="/ingredients" component={(props) => <ProtectedRoute component={IngredientsPage} {...props} />} />
      <Route path="/meal-planner" component={(props) => <ProtectedRoute component={MealPlanner} {...props} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Header />
        <Router />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
