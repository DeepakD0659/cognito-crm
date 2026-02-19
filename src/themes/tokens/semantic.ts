import { SemanticTokens, PrimitiveColors } from '../types';

export function createSemanticTokens(primitives: PrimitiveColors): { light: SemanticTokens; dark: SemanticTokens } {
  const light: SemanticTokens = {
    // Background colors
    background: primitives.neutral[50],
    foreground: primitives.neutral[950],
    card: primitives.neutral[100],
    cardForeground: primitives.neutral[950],
    popover: primitives.neutral[100],
    popoverForeground: primitives.neutral[950],
    
    // Primary colors
    primary: primitives.primary[500],
    primaryForeground: primitives.neutral[50],
    primaryHover: primitives.primary[600],
    primaryActive: primitives.primary[700],
    
    // Secondary colors
    secondary: primitives.secondary[100],
    secondaryForeground: primitives.neutral[950],
    secondaryHover: primitives.secondary[200],
    secondaryActive: primitives.secondary[300],
    
    // Accent colors
    accent: primitives.accent[100],
    accentForeground: primitives.neutral[950],
    accentHover: primitives.accent[200],
    accentActive: primitives.accent[300],
    
    // Muted colors
    muted: primitives.neutral[100],
    mutedForeground: primitives.neutral[500],
    
    // Border colors
    border: primitives.neutral[200],
    input: primitives.neutral[200],
    ring: primitives.primary[500],
    
    // Status colors
    success: primitives.success[500],
    successForeground: primitives.neutral[50],
    warning: primitives.warning[500],
    warningForeground: primitives.neutral[50],
    destructive: primitives.error[500],
    destructiveForeground: primitives.neutral[50],
    info: primitives.info[500],
    infoForeground: primitives.neutral[50],
    
    // Sidebar colors
    sidebarBackground: primitives.neutral[100],
    sidebarForeground: primitives.neutral[800],
    sidebarPrimary: primitives.primary[500],
    sidebarPrimaryForeground: primitives.neutral[50],
    sidebarAccent: primitives.accent[100],
    sidebarAccentForeground: primitives.accent[700],
    sidebarBorder: primitives.neutral[200],
    sidebarRing: primitives.primary[500],
    
    // Chart colors
    chart1: primitives.primary[500],
    chart2: primitives.success[500],
    chart3: primitives.warning[500],
    chart4: primitives.info[500],
    chart5: primitives.accent[500],
  };

  const dark: SemanticTokens = {
    // Background colors
    background: primitives.neutral[950],
    foreground: primitives.neutral[50],
    card: primitives.neutral[900],
    cardForeground: primitives.neutral[50],
    popover: primitives.neutral[900],
    popoverForeground: primitives.neutral[50],
    
    // Primary colors
    primary: primitives.primary[500],
    primaryForeground: primitives.neutral[950],
    primaryHover: primitives.primary[400],
    primaryActive: primitives.primary[300],
    
    // Secondary colors
    secondary: primitives.neutral[800],
    secondaryForeground: primitives.neutral[50],
    secondaryHover: primitives.neutral[700],
    secondaryActive: primitives.neutral[600],
    
    // Accent colors
    accent: primitives.neutral[800],
    accentForeground: primitives.neutral[50],
    accentHover: primitives.neutral[700],
    accentActive: primitives.neutral[600],
    
    // Muted colors
    muted: primitives.neutral[800],
    mutedForeground: primitives.neutral[400],
    
    // Border colors
    border: primitives.neutral[800],
    input: primitives.neutral[800],
    ring: primitives.primary[400],
    
    // Status colors
    success: primitives.success[400],
    successForeground: primitives.neutral[950],
    warning: primitives.warning[400],
    warningForeground: primitives.neutral[950],
    destructive: primitives.error[400],
    destructiveForeground: primitives.neutral[950],
    info: primitives.info[400],
    infoForeground: primitives.neutral[950],
    
    // Sidebar colors
    sidebarBackground: primitives.neutral[900],
    sidebarForeground: primitives.neutral[200],
    sidebarPrimary: primitives.primary[500],
    sidebarPrimaryForeground: primitives.neutral[950],
    sidebarAccent: primitives.neutral[800],
    sidebarAccentForeground: primitives.neutral[200],
    sidebarBorder: primitives.neutral[800],
    sidebarRing: primitives.primary[400],
    
    // Chart colors
    chart1: primitives.primary[400],
    chart2: primitives.success[400],
    chart3: primitives.warning[400],
    chart4: primitives.info[400],
    chart5: primitives.accent[400],
  };

  return { light, dark };
}
