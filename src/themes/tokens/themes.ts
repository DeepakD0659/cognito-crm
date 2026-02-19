import { ThemeVariant } from '../types';
import { originalPrimitives, grapePrimitives, oceanPrimitives, forestPrimitives } from './primitives';
import { createSemanticTokens } from './semantic';

export const originalTheme: ThemeVariant = {
  id: 'original',
  name: 'Original',
  displayName: 'Original Theme',
  primitives: originalPrimitives,
  ...createSemanticTokens(originalPrimitives)
};

export const grapeTheme: ThemeVariant = {
  id: 'grape',
  name: 'Grape',
  displayName: 'Grape Theme',
  primitives: grapePrimitives,
  ...createSemanticTokens(grapePrimitives)
};

export const oceanTheme: ThemeVariant = {
  id: 'ocean',
  name: 'Ocean',
  displayName: 'Ocean Theme',
  primitives: oceanPrimitives,
  ...createSemanticTokens(oceanPrimitives)
};

export const forestTheme: ThemeVariant = {
  id: 'forest',
  name: 'Forest',
  displayName: 'Forest Theme',
  primitives: forestPrimitives,
  ...createSemanticTokens(forestPrimitives)
};

export const themes = {
  original: originalTheme,
  grape: grapeTheme,
  ocean: oceanTheme,
  forest: forestTheme
} as const;

export const themeList = Object.values(themes);
