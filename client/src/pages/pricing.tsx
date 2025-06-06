import React, { useState, memo, Suspense, lazy } from 'react';
import { Link } from 'wouter';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge, WinePairingsPill } from '@/components/ui/badge';
import { Sparkles, ChefHat, Clock, Zap, Heart, Star, Gift } from 'lucide-react';

// Lazy load the RecipeCard component
const RecipeCard = lazy(() => import('@/components/recipe-card').then(mod => ({ default: mod.RecipeCard })));

// Define props type
type PricingPageProps = {
  params?: {
    [key: string]: string | undefined;
  };
};

const sampleRecipes: import('@/lib/types').Recipe[] = [
  {
    id: 1,
    title: 'Grilled Salmon with Asparagus',
    description: 'Fresh salmon fillet with grilled asparagus and lemon butter sauce.',
    image: 'https://images.unsplash.com/photo-1543992321-cefacfc2322e',
    imageType: 'jpg',
    usedIngredientCount: 5,
    missedIngredientCount: 0,
    missedIngredients: [],
    usedIngredients: ['salmon', 'asparagus', 'lemon', 'butter', 'garlic'],
    unusedIngredients: [],
    likes: 0,
    servings: 2,
    readyInMinutes: 25,
    preparationMinutes: 10,
    cookingMinutes: 15,
    instructions: '1. Preheat grill. 2. Season salmon. 3. Grill salmon and asparagus. 4. Make lemon butter sauce.',
    summary: 'A healthy and delicious grilled salmon dish with fresh asparagus.',
    cuisines: ['Mediterranean'],
    dishTypes: ['main course'],
    diets: ['gluten-free', 'low-carb'],
    extendedIngredients: [],
    estimatedCost: 15.99,
    cookingTime: 25,
    dietaryTags: ['gluten-free', 'low-carb'],
  },
  {
    id: 2,
    title: 'Vegetarian Buddha Bowl',
    description: 'Quinoa bowl with roasted vegetables and tahini dressing.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
    imageType: 'jpg',
    usedIngredientCount: 5,
    missedIngredientCount: 0,
    missedIngredients: [],
    usedIngredients: ['quinoa', 'sweet potato', 'chickpeas', 'kale', 'tahini'],
    unusedIngredients: [],
    likes: 0,
    servings: 2,
    readyInMinutes: 35,
    preparationMinutes: 15,
    cookingMinutes: 20,
    instructions: '1. Cook quinoa. 2. Roast vegetables. 3. Prepare tahini dressing. 4. Assemble bowl.',
    summary: 'A nutritious and colorful vegetarian buddha bowl.',
    cuisines: ['Fusion'],
    dishTypes: ['main course'],
    diets: ['vegetarian', 'vegan', 'gluten-free'],
    extendedIngredients: [],
    estimatedCost: 12.99,
    cookingTime: 35,
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
  },
  {
    id: 3,
    title: 'Classic Spaghetti Carbonara',
    description: 'Creamy pasta with pancetta, parmesan, and black pepper.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    imageType: 'jpg',
    usedIngredientCount: 4,
    missedIngredientCount: 0,
    missedIngredients: [],
    usedIngredients: ['spaghetti', 'pancetta', 'parmesan', 'egg'],
    unusedIngredients: [],
    likes: 0,
    servings: 4,
    readyInMinutes: 20,
    preparationMinutes: 5,
    cookingMinutes: 15,
    instructions: '1. Cook pasta. 2. Fry pancetta. 3. Mix eggs and cheese. 4. Combine all.',
    summary: 'A classic Italian pasta dish with a creamy, savory sauce.',
    cuisines: ['Italian'],
    dishTypes: ['main course'],
    diets: [],
    extendedIngredients: [],
    estimatedCost: 9.99,
    cookingTime: 20,
    dietaryTags: [],
  },
  {
    id: 4,
    title: 'Chicken Tikka Masala',
    description: 'Tender chicken in a spiced tomato cream sauce.',
    image: 'https://images.unsplash.com/photo-1512058564366-c9e3e0465e86',
    imageType: 'jpg',
    usedIngredientCount: 6,
    missedIngredientCount: 0,
    missedIngredients: [],
    usedIngredients: ['chicken', 'yogurt', 'tomato', 'cream', 'spices', 'rice'],
    unusedIngredients: [],
    likes: 0,
    servings: 4,
    readyInMinutes: 40,
    preparationMinutes: 20,
    cookingMinutes: 20,
    instructions: '1. Marinate chicken. 2. Cook sauce. 3. Combine and simmer. 4. Serve with rice.',
    summary: 'A flavorful Indian dish with tender chicken in a creamy, spiced sauce.',
    cuisines: ['Indian'],
    dishTypes: ['main course'],
    diets: ['gluten-free'],
    extendedIngredients: [],
    estimatedCost: 13.99,
    cookingTime: 40,
    dietaryTags: ['gluten-free'],
  },
  {
    id: 5,
    title: 'Avocado Toast with Poached Egg',
    description: 'Whole grain toast topped with smashed avocado and a perfectly poached egg.',
    image: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
    imageType: 'jpg',
    usedIngredientCount: 3,
    missedIngredientCount: 0,
    missedIngredients: [],
    usedIngredients: ['bread', 'avocado', 'egg'],
    unusedIngredients: [],
    likes: 0,
    servings: 1,
    readyInMinutes: 10,
    preparationMinutes: 5,
    cookingMinutes: 5,
    instructions: '1. Toast bread. 2. Smash avocado. 3. Poach egg. 4. Assemble toast.',
    summary: 'A quick and healthy breakfast or snack with creamy avocado and a runny poached egg.',
    cuisines: ['American'],
    dishTypes: ['breakfast'],
    diets: ['vegetarian'],
    extendedIngredients: [],
    estimatedCost: 4.99,
    cookingTime: 10,
    dietaryTags: ['vegetarian'],
  },
];

type BillingPeriod = 'weekly' | 'monthly' | 'yearly';

const pricing = {
  monthly: {
    premium: 7,
    premiumDisplay: '$7/mo',
  },
  weekly: {
    premium: 2,
    premiumDisplay: '$2/wk',
  },
};
const planBenefits = {
  free: [
    { icon: '🍽️', label: 'Save up to 10 recipes' },
    { icon: '🔍', label: 'Basic recipe search' },
    { icon: '🧠', label: 'Simple meal planning' },
    { icon: '🛒', label: 'Basic shopping lists' },
    { icon: '💬', label: 'Community support' },
  ],
  premium: [
    { icon: '🍽️', label: 'Unlimited recipe saves' },
    { icon: '🔍', label: 'Advanced recipe search' },
    { icon: '🧠', label: 'Multi-week, advanced meal planning' },
    { icon: '🛒', label: 'Smart, organized shopping lists' },
    { icon: '👨‍🍳', label: 'Exclusive chef-curated recipes' },
    { icon: '🍽️', label: 'Scale recipes for any occasion' },
    { icon: '🍷', label: 'Personalized wine pairings' },
    { icon: '⚡', label: 'Early access to features' },
    { icon: '💬', label: 'VIP support' },
  ],
};

// Memoize the FAQ component
const FAQ = memo(() => (
  <div className="max-w-3xl mx-auto space-y-8">
    <div>
      <h3 className="text-xl font-semibold mb-2">What's included in the 7-day free trial?</h3>
      <p className="text-gray-600">You get full access to all Premium features for 7 days. No credit card required to start.</p>
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2">Can I switch plans later?</h3>
      <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.</p>
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
      <p className="text-gray-600">We accept all major credit cards and PayPal.</p>
    </div>
  </div>
));

const PricingPage: React.FC<PricingPageProps> = ({ params }) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const startStripeCheckout = (plan: 'premium') => {
    setLocation(`/checkout?plan=${plan}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="bg-gradient-to-b from-orange-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400">
            Transform Your Cooking Experience
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who are saving time, money, and reducing food waste with PantryPal.
          </p>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground">Unlock your kitchen's full potential. Flexible plans for every cook.</p>
          </div>
          {/* Pricing Toggle */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gray-100 rounded-full p-1 flex gap-2">
              <button type="button" className={`px-4 py-1 rounded-full transition font-bold ${billingPeriod === 'weekly' ? 'bg-white text-indigo-600' : 'opacity-60 text-gray-700'}`} onClick={() => setBillingPeriod('weekly')}>Weekly</button>
              <button type="button" className={`px-4 py-1 rounded-full transition font-bold ${billingPeriod === 'monthly' ? 'bg-white text-indigo-600' : 'opacity-60 text-gray-700'}`} onClick={() => setBillingPeriod('monthly')}>Monthly</button>
            </div>
            <a href="#plan-comparison" className="mt-3 text-sm text-blue-600 underline hover:text-blue-800 transition">Compare plans &rarr;</a>
          </div>
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12 justify-center">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center border-2 border-gray-200 relative">
              <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80" alt="Free plan" className="w-20 h-20 rounded-full mb-4 object-cover" />
              <h3 className="text-xl font-bold leading-tight mb-2">Free</h3>
              <div className="text-2xl font-semibold text-gray-600 mb-2">$0</div>
              <div className="text-gray-500 mb-4">Get started with the basics</div>
              <ul className="mb-6 space-y-2 text-left w-full">
                {planBenefits.free.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700"><span className="text-lg">{b.icon}</span>{b.label}</li>
                ))}
                </ul>
              <button
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition mb-2"
                onClick={() => {
                  setLocation('/auth');
                }}
              >
                Get Started Free
              </button>
              <div className="text-xs text-gray-500 text-center">Always free – No credit card required</div>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border-2 border-orange-500 relative">
              <div className="absolute top-2 left-4">
                <WinePairingsPill />
              </div>
              <img src="https://images.unsplash.com/photo-1543992321-cefacfc2322e?auto=format&fit=crop&w=400&q=80" alt="Premium plan" className="w-20 h-20 rounded-full mb-4 object-cover" />
              <h3 className="text-xl font-bold leading-tight mb-2">Premium</h3>
              <div className="text-2xl font-semibold text-orange-600 mb-2 transition-all duration-200 ease-in-out">{pricing[billingPeriod].premiumDisplay}</div>
              <div className="text-gray-500 mb-4">Everything you need for amazing meals</div>
              <ul className="mb-6 space-y-2 text-left w-full">
                {planBenefits.premium.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700"><span className="text-lg">{b.icon}</span>{b.label}</li>
                ))}
                </ul>
              <button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition mb-2"
                onClick={() => {
                  if (!user) {
                    setLocation('/auth?plan=premium');
                  } else {
                    startStripeCheckout('premium');
                  }
                }}
              >
                Start 7-Day Free Trial – Cancel Anytime
              </button>
              <div className="text-xs text-gray-500 text-center">Only $2/week after trial – Cancel anytime, no questions asked.</div>
              <Badge className="absolute top-4 right-4 bg-orange-500 text-white">Best Value</Badge>
            </div>
          </div>
          {/* Credibility/Trust Section */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-10 mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-yellow-600"><span>⭐</span> Trusted by 10,000+ home cooks</div>
            <div className="flex items-center gap-2 text-lg font-semibold text-green-700"><span>✅</span> Secure payments powered by Stripe</div>
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600"><span>📝</span> <span>"PantryPal changed my weeknight dinners!"</span></div>
          </div>
          {/* Comparison Table ... (reuse or update as needed) */}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <FAQ />
        </div>
      </section>
    </div>
  );
};

export default memo(PricingPage); 