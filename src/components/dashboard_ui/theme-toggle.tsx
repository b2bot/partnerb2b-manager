
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/dashboard_ui/button';
import { useTheme } from '@/hooks/dashboard_hooks/useTheme';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 border-gray-200 dark:border-gray-700"
    >
      <div className="relative w-4 h-4">
        <Sun className={`absolute h-4 w-4 transition-all duration-300 ${theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
        <Moon className={`absolute h-4 w-4 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
      </div>
    </Button>
  );
};

export default ThemeToggle;
