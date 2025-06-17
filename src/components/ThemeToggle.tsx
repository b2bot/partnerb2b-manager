
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference or stored preference
    const stored = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && systemPrefersDark);
    
    setIsDarkMode(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size={collapsed ? "sm" : "default"}
      onClick={toggleTheme}
      className={`w-full ${collapsed ? 'justify-center px-2' : 'justify-start'} text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`}
    >
      {isDarkMode ? (
        <Sun className={`h-4 w-4 ${!collapsed ? 'mr-2' : ''}`} />
      ) : (
        <Moon className={`h-4 w-4 ${!collapsed ? 'mr-2' : ''}`} />
      )}
      {!collapsed && (
        <span className="text-sm">
          {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        </span>
      )}
    </Button>
  );
}
