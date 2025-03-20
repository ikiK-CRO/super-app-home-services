import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../services/api';

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

// Define context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = '@SuperApp:token';
const USER_KEY = '@SuperApp:user';

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on app start
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        
        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading stored authentication', err);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const storeAuthData = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      setAuthToken(token);
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Error storing authentication data', err);
      setError('Failed to save authentication data');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // For MVP demonstration, we'll simulate a successful login
      // In a real app, this would be an API call
      
      // const response = await api.post('/auth/login', { email, password });
      // const { token, user: userData } = response.data;
      
      // Mock successful response
      const token = 'mock-jwt-token';
      const userData: User = {
        id: '1',
        email: email,
        name: 'Demo User',
        phone: '+385 91 111 1111',
        address: 'Zagreb, Croatia'
      };
      
      return await storeAuthData(token, userData);
    } catch (err: any) {
      console.error('Login error', err);
      setError(err?.response?.data?.message || 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // For MVP demonstration, we'll simulate a successful registration
      // In a real app, this would be an API call
      
      // const response = await api.post('/auth/register', { name, email, password });
      // const { token, user: userData } = response.data;
      
      // Mock successful response
      const token = 'mock-jwt-token';
      const userData: User = {
        id: '1',
        email: email,
        name: name,
      };
      
      return await storeAuthData(token, userData);
    } catch (err: any) {
      console.error('Registration error', err);
      setError(err?.response?.data?.message || 'Failed to register');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setAuthToken(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 