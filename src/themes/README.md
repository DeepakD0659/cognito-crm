# Multi-Color Theme System

A comprehensive, scalable theme system for the CRM application supporting multiple color variants with real-time switching capabilities.

## Architecture Overview

### Three-Tier Token Hierarchy

1. **Primitive Tokens** (`src/themes/tokens/primitives.ts`)
   - Raw color values (50-950 scales)
   - Base color palettes for each theme
   - Status colors (success, warning, error, info)

2. **Semantic Tokens** (`src/themes/tokens/semantic.ts`)
   - Contextual usage mappings
   - Light/dark mode variants
   - Component-specific color assignments

3. **Theme Variants** (`src/themes/tokens/themes.ts`)
   - Complete theme definitions
   - Original, Grape, Ocean, and Forest themes
   - Exported as theme registry

## Available Themes

### 🔴 Original Theme
- **Primary**: Red (#ef4444)
- **Secondary**: Pink (#ec4899)
- **Accent**: Yellow (#eab308)

### 🍇 Grape Theme
- **Primary**: Purple (#a855f7)
- **Secondary**: Teal (#14b8a6)
- **Accent**: Lime (#84cc16)

### 🌊 Ocean Theme
- **Primary**: Blue (#3b82f6)
- **Secondary**: Indigo (#6366f1)
- **Accent**: Coral (#f43f5e)

### 🌲 Forest Theme
- **Primary**: Green (#22c55e)
- **Secondary**: Amber (#f59e0b)
- **Accent**: Rose (#ec4899)

## Features

- ✅ **Real-time Theme Switching**: No page reloads required
- ✅ **Light/Dark Mode**: Automatic system preference detection
- ✅ **Persistent Storage**: User preferences saved to localStorage
- ✅ **Accessibility Compliant**: WCAG AA contrast ratios
- ✅ **TypeScript Support**: Full type safety
- ✅ **CSS Custom Properties**: Efficient runtime performance
- ✅ **Tailwind Integration**: Seamless component styling

## Usage

### Theme Provider

Wrap your application with the `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/themes';

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### Theme Switcher Component

Use the built-in theme switcher:

```tsx
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

function Header() {
  return <ThemeSwitcher />;
}
```

### Custom Hook Access

Access theme state and controls:

```tsx
import { useTheme } from '@/themes';

function MyComponent() {
  const { config, setTheme, setMode, toggleMode } = useTheme();
  
  const switchToGrape = () => setTheme('grape');
  const enableDarkMode = () => setMode('dark');
  
  return (
    <div>
      <p>Current theme: {config.currentTheme}</p>
      <p>Current mode: {config.mode}</p>
    </div>
  );
}
```

### Styling with Tailwind

Use semantic color classes in your components:

```tsx
// Primary button with hover/active states
<button className="bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground">
  Click me
</button>

// Card with proper contrast
<div className="bg-card text-card-foreground border-border">
  <h2 className="text-foreground">Card Title</h2>
  <p className="text-muted-foreground">Card content</p>
</div>

// Status indicators
<div className="bg-success text-success-foreground">Success</div>
<div className="bg-warning text-warning-foreground">Warning</div>
<div className="bg-destructive text-destructive-foreground">Error</div>
```

## File Structure

```
src/themes/
├── types.ts                 # TypeScript interfaces
├── provider.tsx            # React context provider
├── index.ts               # Public exports
├── README.md              # This documentation
└── tokens/
    ├── primitives.ts      # Base color palettes
    ├── semantic.ts        # Semantic mappings
    └── themes.ts          # Complete theme definitions
```

## Adding New Themes

1. **Define Primitive Colors** in `primitives.ts`:
```tsx
export const newThemePrimary: ColorScale = {
  50: '#f0f9ff',
  // ... complete 50-950 scale
  950: '#172554'
};
```

2. **Create Theme Variant** in `themes.ts`:
```tsx
export const newTheme: ThemeVariant = {
  id: 'newTheme',
  name: 'New Theme',
  displayName: 'New Theme',
  primitives: newThemePrimitives,
  ...createSemanticTokens(newThemePrimitives)
};
```

3. **Update Theme Registry**:
```tsx
export const themes = {
  original: originalTheme,
  grape: grapeTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  newTheme: newTheme, // Add new theme
} as const;
```

4. **Update TypeScript Types** in `types.ts`:
```tsx
export type ThemeId = 'original' | 'grape' | 'ocean' | 'forest' | 'newTheme';
```

## Accessibility

All themes are designed to meet WCAG AA contrast ratios:
- **Normal Text**: 4.5:1 minimum contrast
- **Large Text**: 3:1 minimum contrast
- **Interactive Elements**: Enhanced contrast for focus states

## Performance

- **CSS Custom Properties**: Efficient runtime updates
- **Minimal JavaScript**: Theme switching is CSS-driven
- **Lazy Loading**: Themes load on-demand
- **Optimized Bundle**: Tree-shaking for unused themes

## Browser Support

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 16+

## Troubleshooting

### Theme Not Applying
- Ensure `ThemeProvider` wraps your application
- Check CSS variables are being set in browser dev tools
- Verify theme switcher component is properly imported

### Contrast Issues
- Use browser dev tools to check contrast ratios
- Ensure semantic tokens reference primitive colors correctly
- Test with different color blindness simulators

### Performance Issues
- Check for excessive re-renders in theme provider
- Verify CSS custom properties are not being overridden
- Monitor bundle size for unused theme variants
