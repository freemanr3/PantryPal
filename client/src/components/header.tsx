import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Search, Home, Info, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BudgetTracker } from '@/components/budget-tracker';
import { useAuth } from '@/context/AuthContext';
import { useMealPlan } from '@/hooks/use-meal-plan';

const authenticatedLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/meal-planner', label: 'Meal Plan', icon: ShoppingCart },
  { href: '/preferences', label: 'My Pantry', icon: Search },
];

const publicLinks = [
  { href: '/landing', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/pricing', label: 'Pricing', icon: ShoppingCart },
];

export function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { mealPlan } = useMealPlan();
  
  const handleLogout = async () => {
    await logout();
  };

  const links = user ? authenticatedLinks : publicLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href={user ? "/" : "/landing"} className="flex items-center space-x-2">
            <img 
              src="/images/pantry-logo.svg" 
              alt="PantryPal Logo" 
              className="w-8 h-10"
            />
            <motion.span 
              className="hidden font-semibold sm:inline-block text-xl tracking-wide"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Pantry Pal
            </motion.span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    {link.href === '/meal-planner' && mealPlan?.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary w-5 h-5 flex items-center justify-center text-xs text-primary-foreground">
                        {mealPlan.length}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Budget Tracker - Visible only on desktop and when authenticated */}
        {user && (
        <div className="hidden xl:flex items-center gap-4">
          <BudgetTracker variant="compact" />
        </div>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth?mode=login">Log in</Link>
              </Button>
            <Button asChild variant="default" size="sm">
                <Link href="/auth?mode=signup">Sign up</Link>
            </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-6 px-2">
                <Link href={user ? "/" : "/landing"} className="flex items-center py-2 space-x-2">
                  <img 
                    src="/images/pantry-logo.svg" 
                    alt="PantryPal Logo" 
                    className="w-8 h-10"
                  />
                  <span className="font-semibold text-xl tracking-wide">Pantry Pal</span>
                </Link>
                
                {/* Mobile Budget Tracker - Only show when authenticated */}
                {user && <BudgetTracker variant="default" className="mb-2" />}
                
                <nav className="flex flex-col gap-3">
                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location === link.href;
                    
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                        {link.href === '/meal-planner' && mealPlan?.length > 0 && (
                          <span className="ml-auto rounded-full bg-primary w-5 h-5 flex items-center justify-center text-xs text-primary-foreground">
                            {mealPlan.length}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 