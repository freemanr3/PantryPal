import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  isNewUser?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by looking for user data in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement actual login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // TODO: Implement actual signup API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const userData = await response.json();
      
      // Mark user as new for the checkout flow
      const userWithNewFlag = {
        ...userData,
        isNewUser: true
      };
      
      localStorage.setItem('user', JSON.stringify(userWithNewFlag));
      setUser(userWithNewFlag);
      return userWithNewFlag;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const markUserAsExisting = () => {
    if (user) {
      const updatedUser = { ...user, isNewUser: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    signup,
    markUserAsExisting,
  };
} 