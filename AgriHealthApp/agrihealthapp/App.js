import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// App Screens & Navigation
import MainTabNavigator from './src/navigation/MainTabNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { AuthProvider } from './src/context/AuthContext';
import { theme } from './src/config/theme';

// Services
import NotificationService from './src/services/NotificationService';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigationRef = useRef();

  useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    // Register for push notifications
    const registerForNotifications = async () => {
      await NotificationService.registerForPushNotifications();
    };

    // Set up notification handling
    const handleNotification = (notification) => {
      setNotification(notification);
    };

    const handleNotificationResponse = (response) => {
      const data = response.notification.request.content.data;

      // Navigation based on notification type
      if (data && data.screen && navigationRef.current) {
        // Ensure the app is loaded and ready before navigating
        setTimeout(() => {
          // Navigate based on the notification data
          if (data.screen === 'DiagnosisResult' && data.params) {
            navigationRef.current.navigate('DiagnosisStack', {
              screen: 'DiagnosisResult',
              params: data.params
            });
          } else if (data.screen === 'Weather') {
            navigationRef.current.navigate('WeatherScreen');
          }
        }, 1000);
      }
    };

    // Register for notifications and set up handlers
    registerForNotifications();

    // Configure notification handling and store cleanup function
    const cleanup = NotificationService.configureNotificationHandling(
      handleNotification,
      handleNotificationResponse
    );

    // Clean up notification listeners on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Send a test notification when app is first loaded (for development/testing)
  useEffect(() => {
    if (!isLoading && userToken) {
      const sendTestNotification = async () => {
        // Example weather alert notification (for testing)
        await NotificationService.sendWeatherAlert({
          condition: 'Clear Sky',
          temperature: 22,
          forecast: 'Good weather for crop spraying in the next 24 hours.',
          location: 'Your Area'
        });
      };

      // Uncomment to enable test notification (for development only)
      // sendTestNotification();
    }
  }, [isLoading, userToken]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <StatusBar style="auto" />
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!userToken ? (
                // Auth Screens
                <Stack.Group>
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Group>
              ) : (
                // Main App
                <Stack.Screen name="Main" component={MainTabNavigator} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
