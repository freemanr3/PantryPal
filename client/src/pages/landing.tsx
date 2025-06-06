import React, { memo, Suspense, lazy } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Search, Calendar, ShoppingCart, Activity, Wine } from 'lucide-react';
import { Badge, WinePairingsPill } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

// Lazy load the RecipeCard component for better performance
const RecipeCard = lazy(() => 
  import('@/components/recipe-card').then(mod => ({ default: mod.RecipeCard }))
);

// Optimized feature icons - memoized to prevent re-renders
const FeatureIcons = {
  Search: memo(() => <Search className="w-6 h-6" />),
  Calendar: memo(() => <Calendar className="w-6 h-6" />),
  ShoppingCart: memo(() => <ShoppingCart className="w-6 h-6" />),
  Activity: memo(() => <Activity className="w-6 h-6" />),
  Wine: memo(() => <Wine className="w-4 h-4 text-purple-600 mr-1" />),
};

const features = [
  {
    title: 'Smart Recipe Discovery',
    description: 'Find recipes based on ingredients you have and dietary preferences',
    icon: <FeatureIcons.Search />
  },
  {
    title: 'AI-Powered Meal Planning',
    description: 'Get personalized meal plans that match your preferences and dietary needs',
    icon: <FeatureIcons.Calendar />
  },
  {
    title: 'Smart Shopping Lists',
    description: 'Automatically generate organized shopping lists from your meal plans',
    icon: <FeatureIcons.ShoppingCart />
  },
  {
    title: 'Nutritional Insights',
    description: 'Track your nutrition and get detailed information for all recipes',
    icon: <FeatureIcons.Activity />
  }
];

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

// Optimized image URLs with proper sizing and format
const optimizedImages = {
  free: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=160&h=160&q=80&fm=webp',
  premium: 'https://images.unsplash.com/photo-1543992321-cefacfc2322e?auto=format&fit=crop&w=160&h=160&q=80&fm=webp',
  sampleRecipes: [
    'https://images.unsplash.com/photo-1543992321-cefacfc2322e?auto=format&fit=crop&w=400&h=300&q=80&fm=webp',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&h=300&q=80&fm=webp',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&h=300&q=80&fm=webp',
    'https://images.unsplash.com/photo-1512058564366-c9e3e0465e86?auto=format&fit=crop&w=400&h=300&q=80&fm=webp',
    'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&h=300&q=80&fm=webp',
  ]
};

const sampleRecipes = [
  {
    id: 1,
    title: 'Grilled Salmon with Asparagus',
    description: 'Fresh salmon fillet with grilled asparagus and lemon butter sauce.',
    image: optimizedImages.sampleRecipes[0],
    imageType: 'webp',
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
    image: optimizedImages.sampleRecipes[1],
    imageType: 'webp',
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
    image: optimizedImages.sampleRecipes[2],
    imageType: 'webp',
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
    image: optimizedImages.sampleRecipes[3],
    imageType: 'webp',
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
    image: optimizedImages.sampleRecipes[4],
    imageType: 'webp',
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

// Memoize the FeatureCard component to prevent unnecessary re-renders
const FeatureCard = memo(({ feature }: { feature: typeof features[0] }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="text-orange-500 mb-4">{feature.icon}</div>
    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
    <p className="text-muted-foreground">{feature.description}</p>
  </Card>
));

// Memoize loading fallback
const RecipeLoadingFallback = memo(() => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>
));

const LandingPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'weekly'>('weekly');
  const { user } = useAuth();

  // Memoized navigation handlers
  const handleAuthNavigation = React.useCallback((plan?: string) => {
    if (plan) {
      navigate(`/auth?plan=${plan}`);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handlePremiumCheckout = React.useCallback(() => {
    navigate('/checkout?plan=premium');
  }, [navigate]);

  const handlePricingNavigation = React.useCallback(() => {
    navigate('/pricing');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400">
            Transform Your Cooking Experience
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who are saving time, money, and reducing food waste with PantryPal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => handleAuthNavigation()}
              className="text-lg px-8 py-6 bg-orange-500 hover:bg-orange-600"
            >
              Start 7-Day Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handlePricingNavigation}
              className="text-lg px-8 py-6"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PantryPal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Sample Recipes Carousel */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Find Your Next Meal</h2>
          <Carousel className="max-w-2xl mx-auto">
            <CarouselContent>
              <Suspense fallback={<RecipeLoadingFallback />}>
                {sampleRecipes.map((recipe) => (
                  <CarouselItem key={recipe.id} className="flex justify-center">
                    <RecipeCard recipe={recipe} />
                  </CarouselItem>
                ))}
              </Suspense>
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-4">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Start with a 7-day free trial. No credit card required.</p>
          </div>
          {/* Billing Toggle */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gray-100 rounded-full p-1 flex gap-2">
              <button type="button" className={`px-4 py-1 rounded-full transition font-bold ${billingPeriod === 'weekly' ? 'bg-white text-indigo-600' : 'opacity-60 text-gray-700'}`} onClick={() => setBillingPeriod('weekly')}>Weekly</button>
              <button type="button" className={`px-4 py-1 rounded-full transition font-bold ${billingPeriod === 'monthly' ? 'bg-white text-indigo-600' : 'opacity-60 text-gray-700'}`} onClick={() => setBillingPeriod('monthly')}>Monthly</button>
            </div>
            <a href="#plan-comparison" className="mt-3 text-sm text-gray-600">Compare plans &rarr;</a>
          </div>
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12 justify-center">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center border-2 border-gray-200 relative">
              <img 
                src={optimizedImages.free} 
                alt="Free plan" 
                className="w-20 h-20 rounded-full mb-4 object-cover"
                loading="lazy"
                width="80"
                height="80"
              />
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-2xl font-semibold text-gray-600 mb-2">$0</div>
              <div className="text-gray-500 mb-4">Get started with the basics</div>
              <ul className="mb-6 space-y-2 text-left w-full">
                {planBenefits.free.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700"><span className="text-lg">{b.icon}</span>{b.label}</li>
                ))}
              </ul>
              <button
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition mb-2"
                onClick={() => handleAuthNavigation()}
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
              <img 
                src={optimizedImages.premium} 
                alt="Premium plan" 
                className="w-20 h-20 rounded-full mb-4 object-cover"
                loading="lazy"
                width="80"
                height="80"
              />
              <h3 className="text-xl font-bold mb-2">Premium</h3>
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
                    handleAuthNavigation('premium');
                  } else {
                    handlePremiumCheckout();
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-10 mb-4">
            <div className="flex items-center gap-2 text-xl font-semibold text-yellow-600">
              <span role="img" aria-label="star">⭐</span> Over 10,000 meals planned
            </div>
            <div className="flex items-center gap-2 text-xl font-semibold text-green-700">
              <span role="img" aria-label="check">✅</span> Secure payments powered by Stripe
            </div>
          </div>
          {/* Comparison Table */}
          <div id="plan-comparison" className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left font-bold">Feature</th>
                  <th className="py-3 px-4 text-center font-bold">Free</th>
                  <th className="py-3 px-4 text-center font-bold">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4">Recipe Saves</td>
                  <td className="py-2 px-4 text-center">Up to 10</td>
                  <td className="py-2 px-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Recipe Search</td>
                  <td className="py-2 px-4 text-center">Basic</td>
                  <td className="py-2 px-4 text-center">Advanced</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Meal Planning</td>
                  <td className="py-2 px-4 text-center">Simple</td>
                  <td className="py-2 px-4 text-center">Multi-week, Advanced</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Shopping Lists</td>
                  <td className="py-2 px-4 text-center">Basic</td>
                  <td className="py-2 px-4 text-center">Smart, Organized</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Support</td>
                  <td className="py-2 px-4 text-center">Community</td>
                  <td className="py-2 px-4 text-center">VIP</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Exclusive Chef Recipes</td>
                  <td className="py-2 px-4 text-center">-</td>
                  <td className="py-2 px-4 text-center">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Recipe Scaling</td>
                  <td className="py-2 px-4 text-center">-</td>
                  <td className="py-2 px-4 text-center">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Early Access to Features</td>
                  <td className="py-2 px-4 text-center">-</td>
                  <td className="py-2 px-4 text-center">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Personalized Wine Pairings</td>
                  <td className="py-2 px-4 text-center">-</td>
                  <td className="py-2 px-4 text-center flex items-center justify-center">
                    <FeatureIcons.Wine /> Yes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-orange-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Cooking?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who are saving time and money with PantryPal.
          </p>
          <Button 
            size="lg" 
            onClick={() => handleAuthNavigation()}
            className="text-lg px-8 py-6 bg-orange-500 hover:bg-orange-600"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

export default memo(LandingPage); 