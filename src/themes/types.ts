export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface PrimitiveColors {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

export interface SemanticTokens {
  // Background colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Primary colors
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryActive: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
  secondaryActive: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  accentHover: string;
  accentActive: string;
  
  // Muted colors
  muted: string;
  mutedForeground: string;
  
  // Border colors
  border: string;
  input: string;
  ring: string;
  
  // Status colors
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  destructive: string;
  destructiveForeground: string;
  info: string;
  infoForeground: string;
  
  // Sidebar colors
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface ThemeVariant {
  id: string;
  name: string;
  displayName: string;
  primitives: PrimitiveColors;
  light: SemanticTokens;
  dark: SemanticTokens;
}

export type ThemeMode = 'light' | 'dark';
export type ThemeId = 'original' | 'grape' | 'ocean' | 'forest';

export const defaultConfig: ThemeConfig = {
  currentTheme: 'original',
  mode: 'light',
  systemPreference: 'light'
};

export interface ThemeConfig {
  currentTheme: ThemeId;
  mode: ThemeMode;
  systemPreference: ThemeMode;
}

export interface ThemeContextValue {
  config: ThemeConfig;
  setTheme: (themeId: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  availableThemes: ThemeVariant[];
}
