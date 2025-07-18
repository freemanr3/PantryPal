import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

/**
 * This component handles the OAuth callback from Cognito
 * It processes the authorization code and exchanges it for tokens
 */

// Define props type
type CognitoOAuthHandlerProps = {
  params?: {
    [key: string]: string | undefined;
  };
};

const CognitoOAuthHandler: React.FC<CognitoOAuthHandlerProps> = ({ params }) => {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    // Process the OAuth callback
    const handleOAuthCallback = async () => {
      try {
        setProcessing(true);
        
        // Get the current URL
        const currentUrl = window.location.href;
        
        // Check if the URL contains a code parameter (authorization code)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log('Authorization code found, processing...');
          
          // With Amplify v6, the token exchange is handled automatically
          // We just need to listen for auth events
          const handleAuthEvents = (data) => {
            switch (data.payload.event) {
              case 'signedIn':
                // Redirect to discover page after successful authentication
                setLocation('/discover');
                break;
              case 'signInFailure':
                console.error('Sign in failure:', data.payload.data);
                setError('Authentication failed. Please try again.');
                setProcessing(false);
                break;
            }
          };
          
          // Subscribe to auth events
          const unsubscribe = Hub.listen('auth', handleAuthEvents);
          
          // Check if user is authenticated
          try {
            await getCurrentUser();
            // User is authenticated, redirect to discover page
            setLocation('/discover');
          } catch (err) {
            // User is not authenticated, wait for auth events
            console.log('Waiting for authentication to complete...');
          }
          
          return () => {
            // Clean up listener when component unmounts
            unsubscribe();
          };
        } else {
          setError('No authorization code found in the URL');
          setProcessing(false);
        }
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        setError('Failed to process authentication. Please try again.');
        setProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error}
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setLocation('/auth')}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <h2 className="mt-6 text-center text-xl font-medium text-gray-900">
          Processing your authentication...
        </h2>
      </div>
    </div>
  );
};

export default CognitoOAuthHandler; 