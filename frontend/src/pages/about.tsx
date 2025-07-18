import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Heart, Leaf, Sparkles } from 'lucide-react';

const values = [
  {
    icon: ChefHat,
    title: 'Culinary Excellence',
    description: 'We believe everyone deserves access to great recipes and cooking guidance, regardless of their skill level.'
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'We promote healthy eating habits and make it easy to find nutritious, balanced meals.'
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'We help reduce food waste by suggesting recipes based on ingredients you already have.'
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description: 'We leverage AI to provide personalized cooking experiences and smart meal suggestions.'
  }
];

const AboutPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-orange-50 to-background">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About PantryPal
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            We're on a mission to make cooking easier, more enjoyable, and more accessible for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
          <div className="prose prose-lg mx-auto">
            <p className="text-muted-foreground mb-6">
              PantryPal was born from a simple idea: cooking should be fun, not frustrating. We believe that everyone deserves to enjoy great food, whether you're a seasoned chef or just starting your culinary journey.
            </p>
            <p className="text-muted-foreground mb-6">
              Our AI-powered platform helps you discover recipes based on what you have, plan your meals efficiently, and learn new cooking techniques along the way. We're here to make your time in the kitchen more enjoyable and less stressful.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Icon className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your journey to better cooking today. Join thousands of home cooks who are already using PantryPal.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth?mode=signup')}
              className="text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="text-lg px-8 py-6"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 