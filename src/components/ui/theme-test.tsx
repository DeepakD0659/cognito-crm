import React from 'react';
import { useTheme } from '@/themes';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export function ThemeTest() {
  const { config, setTheme, setMode, availableThemes } = useTheme();

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Theme Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Theme: {config.currentTheme}</p>
          <p className="text-sm text-muted-foreground">Current Mode: {config.mode}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTheme('original')}
            className={config.currentTheme === 'original' ? 'ring-2 ring-primary' : ''}
          >
            Original
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTheme('grape')}
            className={config.currentTheme === 'grape' ? 'ring-2 ring-primary' : ''}
          >
            Grape
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTheme('ocean')}
            className={config.currentTheme === 'ocean' ? 'ring-2 ring-primary' : ''}
          >
            Ocean
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTheme('forest')}
            className={config.currentTheme === 'forest' ? 'ring-2 ring-primary' : ''}
          >
            Forest
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="default"
            size="sm"
            onClick={() => setMode('light')}
          >
            Light
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => setMode('dark')}
          >
            Dark
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded text-xs text-center">Primary</div>
          <div className="bg-secondary text-secondary-foreground p-2 rounded text-xs text-center">Secondary</div>
          <div className="bg-accent text-accent-foreground p-2 rounded text-xs text-center">Accent</div>
          <div className="bg-success text-success-foreground p-2 rounded text-xs text-center">Success</div>
          <div className="bg-warning text-warning-foreground p-2 rounded text-xs text-center">Warning</div>
          <div className="bg-destructive text-destructive-foreground p-2 rounded text-xs text-center">Error</div>
        </div>
      </CardContent>
    </Card>
  );
}
