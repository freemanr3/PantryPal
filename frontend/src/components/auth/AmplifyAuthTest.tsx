import React, { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

/**
 * Simple test component for AWS Amplify authentication
 * This component isolates the Authenticator to test if it works properly
 */
export const AmplifyAuthTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-12">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-2xl font-bold mb-4">AWS Amplify Authentication Test</h1>
          <p className="text-gray-600 mb-4">
            This is an isolated test of the AWS Amplify Authenticator component.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md">
          <Authenticator>
            {({ signOut, user }) => (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Authentication Successful!</h2>
                <p className="mb-4">
                  You are signed in as: <span className="font-medium">{user?.username}</span>
                </p>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            )}
          </Authenticator>
        </div>
      </div>
    </div>
  );
};

export default AmplifyAuthTest; 