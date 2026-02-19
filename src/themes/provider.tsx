import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeContextValue, ThemeConfig, ThemeId, ThemeMode, defaultConfig } from './types';
import { themes } from './tokens/themes';

const STORAGE_KEY = 'theme-config';

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // Convert to percentages
  const hPercent = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${hPercent} ${sPercent}% ${lPercent}%`;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);

  // Load saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedConfig = JSON.parse(saved) as Partial<ThemeConfig>;
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      }
    } catch (error) {
      console.warn('Failed to load theme config from localStorage:', error);
    }
  }, []);

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemPreference: ThemeMode = mediaQuery.matches ? 'dark' : 'light';
    
    setConfig(prev => ({ ...prev, systemPreference }));

    const handleChange = (e: MediaQueryListEvent) => {
      const newPreference: ThemeMode = e.matches ? 'dark' : 'light';
      setConfig(prev => ({ ...prev, systemPreference: newPreference }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[config.currentTheme];
    
    if (!theme) {
      console.error('Theme not found:', config.currentTheme);
      return;
    }
    
    const tokens = config.mode === 'dark' ? theme.dark : theme.light;

    // Remove all theme classes
    root.classList.remove('light', 'dark');
    root.classList.add(config.mode);

    // Apply CSS variables - convert hex to HSL format for Tailwind
    Object.entries(tokens).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      // Convert hex to HSL format for Tailwind (without hsl() wrapper)
      const hslValue = hexToHsl(value);
      root.style.setProperty(cssVar, hslValue);
    });

    // Apply primitive colors for reference
    Object.entries(theme.primitives).forEach(([colorName, colorScale]) => {
      Object.entries(colorScale).forEach(([shade, value]) => {
        const cssVar = `--color-${colorName}-${shade}`;
        const hslValue = hexToHsl(value as string);
        root.style.setProperty(cssVar, hslValue);
      });
    });
  }, [config]);

  // Save config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save theme config to localStorage:', error);
    }
  }, [config]);

  const setTheme = (themeId: ThemeId) => {
    setConfig(prev => ({ ...prev, currentTheme: themeId }));
  };

  const setMode = (mode: ThemeMode) => {
    setConfig(prev => ({ ...prev, mode }));
  };

  const toggleMode = () => {
    setConfig(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  };

  const value: ThemeContextValue = {
    config,
    setTheme,
    setMode,
    toggleMode,
    availableThemes: Object.values(themes)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
