import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { StockDetailScreen } from '../screens/StockDetailScreen';
import { AlertsListScreen } from '../screens/AlertsListScreen';
import { CreateAlertScreen } from '../screens/CreateAlertScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const DashboardStack = createStackNavigator();
const AlertsStack = createStackNavigator();

const DashboardNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="DashboardList" component={DashboardScreen} />
    <DashboardStack.Screen name="StockDetail" component={StockDetailScreen} />
  </DashboardStack.Navigator>
);

const AlertsNavigator = () => (
  <AlertsStack.Navigator screenOptions={{ headerShown: false }}>
    <AlertsStack.Screen name="AlertsList" component={AlertsListScreen} />
    <AlertsStack.Screen name="CreateAlert" component={CreateAlertScreen} />
  </AlertsStack.Navigator>
);

export const AppNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        borderTopWidth: 1,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardNavigator}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="grid-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Alerts"
      component={AlertsNavigator}
      options={{
        tabBarLabel: 'Alerts',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="notifications-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="settings-outline" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);
