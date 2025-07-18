import React from 'react';
import { Button } from './ui/button';
import { Crown, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';

export default function Header() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = () => {
    logout();
    setLocation('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLocation('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MealMatcher</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Premium Badge */}
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  <Crown className="w-4 h-4" />
                  <span>Premium</span>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation('/discover')}
                  >
                    Discover
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation('/swipe')}
                  >
                    Swipe
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation('/dashboard')}
                  >
                    <User className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/pricing')}
                >
                  Pricing
                </Button>
                <Button
                  onClick={() => setLocation('/auth')}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 