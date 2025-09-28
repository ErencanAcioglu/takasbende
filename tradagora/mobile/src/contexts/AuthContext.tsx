import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ user: User; verificationCode: string }>;
  verifyCode: (code: string) => Promise<{ user: User; token: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults and restore user session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setToken(token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        await AsyncStorage.multiRemove(['token', 'user']);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Axios interceptor to ensure token is always sent
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        console.log('🔑 Token from AsyncStorage:', token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Token added to request:', config.headers.Authorization);
        } else {
          console.log('❌ No token found in AsyncStorage');
        }
        return config;
      },
      (error) => {
        console.log('❌ Axios interceptor error:', error);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
        email,
        password,
        fullName,
        phone,
      });

      const { user, token, verificationCode } = response.data;
      
      // Kayıt başarılı - gerçek kullanıcı ile direkt giriş yap
      const realUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone
      };
      
      const realToken = token; // Backend'den gelen gerçek token
      
      setUser(realUser);
      setToken(realToken);
      await AsyncStorage.setItem('token', realToken);
      await AsyncStorage.setItem('user', JSON.stringify(realUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${realToken}`;
      
      console.log('✅ User registered and logged in:', realUser);
      console.log('✅ Token saved:', realToken);
      
      return { user: realUser, token: realToken };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  };

  const verifyCode = async (code: string) => {
    try {
      // Demo için sabit kod kontrolü
      if (code !== '111111') {
        throw new Error('Geçersiz doğrulama kodu');
      }

      // Doğrulama başarılı - demo kullanıcı ile giriş yap
      const demoUser = {
        id: 'demo-user-id',
        email: 'demo@example.com',
        fullName: 'Demo Kullanıcı',
        phone: '+90 5XX XXX XX XX'
      };
      
      const demoToken = 'demo-token-123';
      
      setUser(demoUser);
      setToken(demoToken);
      await AsyncStorage.setItem('token', demoToken);
      await AsyncStorage.setItem('user', JSON.stringify(demoUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
      
      return { user: demoUser, token: demoToken };
    } catch (error: any) {
      throw new Error(error.message || 'Verification failed');
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['token', 'user']);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    verifyCode,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
