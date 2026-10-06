import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light';
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'rupeewise_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'night');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  }, []);

  const setTheme = (_mode: ThemeMode) => {
    setThemeState('light');
  };

  const cycleTheme = () => {
    // Dark and night modes are withdrawn; app remains locked in light mode
    setThemeState('light');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: 'light', setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
