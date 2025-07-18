import React, { createContext, useContext, ReactNode } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { signOut } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

console.log('AuthenticatorWrapper module loading');

// Create a context for authentication
interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthenticatorWrapper');
  }
  return context;
};

interface AuthenticatorWrapperProps {
  children: ReactNode;
}

export const AuthenticatorWrapper: React.FC<AuthenticatorWrapperProps> = ({ children }) => {
  // Use Amplify's useAuthenticator hook to get auth state
  const { user, authStatus } = useAuthenticator((context) => [
    context.user,
    context.authStatus
  ]);

  // Handle sign out
  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Provide auth context
  const authContextValue: AuthContextType = {
    isAuthenticated: authStatus === 'authenticated',
    user,
    signOut: handleSignOut
  };

  // Custom form fields for the authenticator
  const formFields = {
    signIn: {
      username: {
        label: 'Email',
        placeholder: 'Enter your email',
      },
      password: {
        label: 'Password',
        placeholder: 'Enter your password',
      },
    },
    signUp: {
      email: {
        label: 'Email',
        placeholder: 'Enter your email',
        required: true,
      },
      name: {
        label: 'Name',
        placeholder: 'Enter your full name',
        required: true,
      },
      password: {
        label: 'Password',
        placeholder: 'Create a password',
        required: true,
      },
      confirm_password: {
        label: 'Confirm Password',
        placeholder: 'Confirm your password',
      },
    },
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <Authenticator 
        signUpAttributes={['email', 'name']}
        formFields={formFields}
        loginMechanisms={['email']}
        components={{
          Header: () => (
            <div className="flex justify-center py-5">
              <h1 className="text-2xl font-bold">PantryPal</h1>
            </div>
          ),
        }}
      >
        {children}
      </Authenticator>
    </AuthContext.Provider>
  );
};

export default AuthenticatorWrapper; 