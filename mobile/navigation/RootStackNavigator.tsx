import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';

import { BottomTabNavigator } from './BottomTabNavigator';
import { AuthScreen } from '../screens/AuthScreen';
import { AddTransactionModal } from '../screens/AddTransactionModal';
import { AddBankModal } from '../screens/AddBankModal';
import { BankDetailModal } from '../screens/BankDetailModal';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { BudgetsScreen } from '../screens/BudgetsScreen';
import { GalaxyAiScreen } from '../screens/GalaxyAiScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['galaxyfinance://', 'https://galaxyfinance.app'],
  config: {
    screens: {
      Auth: 'auth',
      MainTabs: {
        screens: {
          Home: 'home',
          Calendar: 'calendar',
          Banks: 'banks',
          Reports: 'reports'
        }
      },
      AddModal: 'add',
      AddBankModal: 'add-bank',
      BankDetail: 'bank/:id',
      Transactions: 'transactions',
      Budgets: 'budgets',
      GalaxyAi: 'ai',
      Settings: 'settings',
      Notifications: 'notifications'
    }
  }
};

export const RootStackNavigator: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isAuthenticated = Boolean(user && token);

  return (
    <NavigationContainer linking={linking as any}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right'
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen
              name="AddModal"
              component={AddTransactionModal}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen
              name="AddBankModal"
              component={AddBankModal}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen name="BankDetail" component={BankDetailModal} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />
            <Stack.Screen name="Budgets" component={BudgetsScreen} />
            <Stack.Screen name="GalaxyAi" component={GalaxyAiScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
