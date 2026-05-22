import React, { useEffect, useState } from 'react';
import { LogBox, ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerForPushNotifications, setupNotificationListeners } from './src/services/fcm';
import { initApi } from './src/services/api';
import { colors } from './src/theme/colors';

LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
  'Non-serializable values were found in the navigation state',
  'Each child in a list should have a unique "key" prop',
]);

export default function App() {
  const { isAuthenticated, loadStoredAuth } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initApi();
      await loadStoredAuth();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
      setupNotificationListeners();
    }
  }, [isAuthenticated]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <LoginScreen />}
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
