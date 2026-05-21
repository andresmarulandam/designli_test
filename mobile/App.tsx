import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerForPushNotifications, setupNotificationListeners } from './src/services/fcm';
import { colors } from './src/theme/colors';

export default function App() {
  const { isAuthenticated, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
      setupNotificationListeners();
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <LoginScreen />}
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
