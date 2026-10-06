import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './store/ThemeContext';
import { AuthProvider } from './store/AuthContext';
import { FinanceProvider } from './store/FinanceContext';
import { RootStackNavigator } from './navigation/RootStackNavigator';

const MainApp: React.FC = () => {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar style={colors.statusBar} />
      <RootStackNavigator />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <FinanceProvider>
            <MainApp />
          </FinanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
