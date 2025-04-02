import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, WEB_API_URL } from '../config/api';
import { Platform } from 'react-native';

// Use WEB_API_URL when on web platform, otherwise use API_URL
const BASE_URL = Platform.OS === 'web' ? WEB_API_URL : API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Set up axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (userToken) {
          config.headers.Authorization = `Bearer ${userToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          // Handle token expiration
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [userToken]);

  // Register a new user
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, userData);
      const { token, user } = response.data;
      setUserToken(token);
      setUser(user);

      // Store token and user info
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      setUserToken(token);
      setUser(user);

      // Store token and user info
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setIsLoading(true);
    try {
      setUserToken(null);
      setUser(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/auth/profile`);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${BASE_URL}/auth/profile`, userData);
      setUser(response.data.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const authContextValue = {
    isLoading,
    userToken,
    user,
    error,
    register,
    login,
    logout,
    getUserProfile,
    updateProfile
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
