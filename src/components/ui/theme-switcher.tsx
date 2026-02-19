import React from 'react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme, ThemeId, ThemeMode } from '@/themes';

export function ThemeSwitcher() {
  const { config, setTheme, setMode, toggleMode, availableThemes } = useTheme();

  const getThemeIcon = (themeId: ThemeId) => {
    switch (themeId) {
      case 'original':
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
      case 'grape':
        return <div className="w-3 h-3 rounded-full bg-purple-500" />;
      case 'ocean':
        return <div className="w-3 h-3 rounded-full bg-blue-500" />;
      case 'forest':
        return <div className="w-3 h-3 rounded-full bg-green-500" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  const handleThemeChange = (themeId: ThemeId) => {
    setTheme(themeId);
  };

  const handleModeChange = (mode: ThemeMode) => {
    setMode(mode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium">Theme</div>
        {availableThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => handleThemeChange(theme.id as ThemeId)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {getThemeIcon(theme.id as ThemeId)}
            <span className="flex-1">{theme.displayName}</span>
            {config.currentTheme === theme.id && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-medium">Mode</div>
        <DropdownMenuItem onClick={() => handleModeChange('light')} className="flex items-center cursor-pointer">
          <Sun className="mr-2 h-4 w-4" />
          <span className="flex-1">Light</span>
          {config.mode === 'light' && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleModeChange('dark')} className="flex items-center cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          <span className="flex-1">Dark</span>
          {config.mode === 'dark' && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleModeChange(config.systemPreference)} className="flex items-center cursor-pointer">
          <Palette className="mr-2 h-4 w-4" />
          <span className="flex-1">System</span>
          {config.mode === config.systemPreference && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
