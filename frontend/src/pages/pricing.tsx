import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Check, Crown, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';

export default function PricingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    if (!user) {
      setLocation('/auth');
      return;
    }
    setLocation('/checkout');
  };

  const freeFeatures = [
    '10 recipe swipes per day',
    'Basic recipe search',
    'Save favorite recipes',
    'Simple meal planning',
    'Community recipes'
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-pink-600">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Start free and upgrade anytime for unlimited access to premium features.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Free</CardTitle>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-gray-600">Perfect for trying out Pantry Pal</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-6"
                onClick={() => !user && setLocation('/auth')}
                disabled={!!user}
              >
                {user ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-orange-500 shadow-xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            <CardHeader className="text-center pt-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-2xl">Premium</CardTitle>
              </div>
              <div className="text-4xl font-bold">$7<span className="text-lg text-gray-600">/month</span></div>
              <p className="text-gray-600">Everything you need for amazing meals</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                onClick={handleUpgrade}
              >
                <Zap className="w-4 h-4 mr-2" />
                Start 7-Day Free Trial
              </Button>
              <p className="text-xs text-center text-gray-500">
                Cancel anytime. No questions asked.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Upgrade to Premium?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unlimited Swipes</h3>
              <p className="text-gray-600">
                Never run out of recipe inspiration with unlimited daily swipes.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Recipes</h3>
              <p className="text-gray-600">
                Access chef-curated premium recipes not available to free users.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Features</h3>
              <p className="text-gray-600">
                Smart meal planning, grocery lists, and nutritional insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">How does the free trial work?</h3>
            <p className="text-gray-600">
              Start with a 7-day free trial of Premium. You can cancel anytime during the trial period 
              and won't be charged. After the trial, you'll be billed $7/month unless you cancel.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Can I cancel my subscription?</h3>
            <p className="text-gray-600">
              Yes! You can cancel your subscription at any time. You'll continue to have access to 
              Premium features until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards including Visa, Mastercard, American Express, and Discover. 
              All payments are processed securely through Stripe.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">What happens to my data if I cancel?</h3>
            <p className="text-gray-600">
              Your saved recipes and preferences are kept in your account. You can still access them 
              with a free account, but you'll be limited to 10 swipes per day.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Discover Amazing Recipes?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of home cooks who've upgraded their cooking game.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={handleUpgrade}
            className="bg-white text-orange-600 hover:bg-gray-100"
          >
            <Crown className="w-5 h-5 mr-2" />
            Start Your Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
} 