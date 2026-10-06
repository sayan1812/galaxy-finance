import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { themes, ThemeColors } from '../theme';
import { getStoredTheme, saveStoredTheme } from '../services/storage';

interface ThemeContextType {
  themeMode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  reduceMotion: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setReduceMotion: (reduce: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  colors: themes.light,
  isDark: false,
  reduceMotion: false,
  setThemeMode: async () => {},
  setReduceMotion: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getStoredTheme();
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'galaxy')) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch {
        // Fallback default light
      }
    })();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    const effective = mode === 'system' ? 'light' : mode;
    setThemeModeState(effective);
    try {
      await saveStoredTheme(effective);
    } catch {
      // Fallback
    }
  };

  const activeTheme = themeMode === 'system' ? 'light' : themeMode;
  const colors = themes[activeTheme] || themes.light;
  const isDark = activeTheme === 'dark' || activeTheme === 'galaxy';

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        colors,
        isDark,
        reduceMotion,
        setThemeMode,
        setReduceMotion
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
