import React from 'react';

export function Toaster() {
  return <div id="toaster-root"></div>;
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
      console.log(`Toast: ${title} - ${description} (${variant})`);
      // Simple fallback alert for production
      alert(`${title}: ${description || ''}`);
    }
  };
}
