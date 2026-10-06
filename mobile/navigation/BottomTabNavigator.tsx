import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { BanksScreen } from '../screens/BanksScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { useTheme } from '../store/ThemeContext';
import { radius, typography } from '../theme';

const Tab = createBottomTabNavigator();

// Empty component for the center Add tab, handled via listeners
const EmptyScreen = () => <View />;

export const BottomTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.borderSubtle,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          borderTopWidth: 1,
          elevation: 10
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet-outline" size={size || 22} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size || 22} color={color} />
          )
        }}
      />

      {/* Prominent Center Add Button */}
      <Tab.Screen
        name="Add"
        component={EmptyScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              style={styles.floatingAddContainer}
              activeOpacity={0.8}
            >
              <View style={[styles.floatingAddBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                <Ionicons name="add" size={28} color="#ffffff" />
              </View>
            </TouchableOpacity>
          )
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            navigation.navigate('AddModal');
          }
        })}
      />

      <Tab.Screen
        name="Banks"
        component={BanksScreen}
        options={{
          tabBarLabel: 'Banks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size || 22} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size || 22} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  floatingAddContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  floatingAddBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8
  }
});
