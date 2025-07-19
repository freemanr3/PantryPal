import React from 'react';
import { Button } from '../components/ui/button';
import { Crown, Zap, Shield, Heart } from 'lucide-react';
import { useLocation } from 'wouter';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-pink-600">
          Find Your Perfect Meal Match
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Swipe through delicious recipes based on your ingredients. 
          Discover, save, and cook amazing meals with Pantry Pal.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => setLocation('/auth')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            Start Swiping Free
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => setLocation('/pricing')}
          >
            View Pricing
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Pantry Pal?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <Heart className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tinder for Food</h3>
            <p className="text-gray-600">
              Swipe right on recipes you love, left on ones you don't. 
              It's that simple!
            </p>
          </div>
          <div className="text-center">
            <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Matches</h3>
            <p className="text-gray-600">
              Get recipe recommendations based on ingredients you already have at home.
            </p>
          </div>
          <div className="text-center">
            <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Premium Features</h3>
            <p className="text-gray-600">
              Unlimited swipes, advanced filtering, and exclusive chef recipes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Next Favorite Meal?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of food lovers discovering amazing recipes daily.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => setLocation('/auth')}
            className="bg-white text-orange-600 hover:bg-gray-100"
          >
            <Crown className="w-5 h-5 mr-2" />
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
} 