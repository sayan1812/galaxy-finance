import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { TYPOGRAPHY } from '../../constants/layout';

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primaryAccent,
        tabBarInactiveTintColor: COLORS.secondaryText,
        tabBarStyle: {
          backgroundColor: COLORS.cardSurface,
          borderTopColor: COLORS.borderSand,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 64 + insets.bottom : 68,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Command',
          tabBarIcon: ({ color, size, focused }: { color: any; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'planet' : 'planet-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="banks"
        options={{
          title: 'Vaults',
          tabBarIcon: ({ color, size, focused }: { color: any; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'shield' : 'shield-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Ledger',
          tabBarIcon: ({ color, size, focused }: { color: any; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Galaxy AI',
          tabBarIcon: ({ color, size, focused }: { color: any; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'System',
          tabBarIcon: ({ color, size, focused }: { color: any; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
