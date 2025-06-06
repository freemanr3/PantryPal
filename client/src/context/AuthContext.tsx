import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchUserAttributes, resetPassword, confirmResetPassword } from 'aws-amplify/auth';

// Define the User interface to match existing app expectations
interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

// Auth context type definition
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (username: string, email: string, password: string) => Promise<{ userConfirmed: boolean; userSub: string; username: string }>;
  confirmAccount: (username: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Cache for user session to avoid repeated API calls
let cachedUser: User | null = null;
let isCheckingAuth = false;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  // Memoized authentication status
  const isAuthenticated = useMemo(() => !!user, [user]);

  // Optimized auth status check with caching
  const checkAuthStatus = useCallback(async () => {
    if (isCheckingAuth) return;
    
    isCheckingAuth = true;
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      const userData: User = {
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || '',
        username: currentUser.username
      };

      setUser(userData);
      cachedUser = userData;
    } catch (error) {
      // No user is signed in
      if (process.env.NODE_ENV === 'development') {
        console.log('No authenticated user');
      }
      setUser(null);
      cachedUser = null;
    } finally {
      setLoading(false);
      isCheckingAuth = false;
    }
  }, []);

  // Effect to check authentication status on mount
  useEffect(() => {
    if (!cachedUser) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [checkAuthStatus]);

  // Optimized login function with error handling
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      await signIn({ username: email, password });
      
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      const userData: User = {
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || '',
        username: currentUser.username
      };

      setUser(userData);
      cachedUser = userData;
      return userData;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      throw error;
    }
  }, []);

  // Optimized signup function
  const signup = useCallback(async (username: string, email: string, password: string) => {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            name: username
          },
        },
      });

      return { 
        userConfirmed: isSignUpComplete, 
        userSub: userId,
        username
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Signup error:', error);
      }
      throw error;
    }
  }, []);

  // Optimized confirm account function
  const confirmAccount = useCallback(async (username: string, code: string): Promise<void> => {
    try {
      await confirmSignUp({
        username,
        confirmationCode: code
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Confirmation error:', error);
      }
      throw error;
    }
  }, []);

  // Optimized logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut();
      setUser(null);
      cachedUser = null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
      throw error;
    }
  }, []);

  // Optimized forgot password function
  const forgotPassword = useCallback(async (email: string) => {
    try {
      await resetPassword({ username: email });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Forgot password error:', error);
      }
      throw error;
    }
  }, []);

  // Optimized reset password function
  const resetPasswordWithCode = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Reset password error:', error);
      }
      throw error;
    }
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    loading,
    login,
    signup,
    confirmAccount,
    logout,
    forgotPassword,
    resetPassword: resetPasswordWithCode,
    isAuthenticated,
  }), [user, loading, login, signup, confirmAccount, logout, forgotPassword, resetPasswordWithCode, isAuthenticated]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 