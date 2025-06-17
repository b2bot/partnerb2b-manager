import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/dashboard_ui/theme-toggle';
import { usePlatformNavigation, Platform, platformConfig } from '@/hooks/dashboard_hooks/usePlatformNavigation';
//import { Button } from '@/components/dashboard_ui/button';//
import { cn } from '@/lib/dashboard_lib/utils';
import { Menu} from 'lucide-react';


const PlatformNavigation = () => {
  const { platform, setPlatform } = usePlatformNavigation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  // Ordem exata conforme solicitado (removido Instagram e RD)
  const platforms: Platform[] = ['meta', 'google', 'youtube', 'linkedin', 'tiktok', 'analytics', 'b2bot', 'relatorios'];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-3 mr-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">PD</span>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Partner Dashboard
              </h1>
            </div>

        {/* Botões de Plataforma */}
            <nav className="hidden sm:flex space-x-1 overflow-x-auto scrollbar-hide">
              {platforms.map((platformKey) => {
                const config = platformConfig[platformKey];
                const isActive = platform === platformKey;

                return (
                  <Button
                    key={platformKey}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setPlatform(platformKey);
                      setMobileOpen(false);
                    }}
                    className={`
                      relative transition-all duration-200 hover:scale-105 whitespace-nowrap min-w-fit px-3 py-1.5 text-sm
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${config.color}`}
                      style={{ backgroundColor: isActive ? 'white' : undefined }}
                    />
                    {config.name}
                    {isActive && (
                      <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-xs px-1 py-0">
                        Live
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {mobileOpen && (
            <div className="sm:hidden absolute left-0 top-full w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
              <nav className="flex flex-col p-2">
                {platforms.map((platformKey) => {
                  const config = platformConfig[platformKey];
                  const isActive = platform === platformKey;
                  return (
                    <Button
                      key={platformKey}
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setPlatform(platformKey);
                        setMobileOpen(false);
                      }}
                      className={`mb-1 justify-start ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${config.color}`}
                        style={{ backgroundColor: isActive ? 'white' : undefined }}
                      />
                      {config.name}
                    </Button>
                  );
                })}
              </nav>
            </div>
          )}

          <div className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformNavigation;
