import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

// Define props type
type NotFoundProps = {
  params?: {
    [key: string]: string | undefined;
  };
};

export default function NotFound({ params }: NotFoundProps) {
  const [, setLocation] = useLocation();
  
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Button onClick={() => setLocation('/')}>
        Go Home
      </Button>
    </div>
  );
}
