import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart3, 
  Settings, 
  MessageSquare,
  Target,
  Palette,
  Users,
  FileText,
  Activity,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Permission } from '@/types/auth';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { hasPermission, isRootAdmin, isCliente, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setIsDarkMode(theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const isItemActive = (itemTab: string) => location.pathname.includes(itemTab);

  const mainMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      permission: 'access_dashboard' as Permission
    },
  ];

  const whatsappItems = [
    { 
      id: 'whatsapp-reports', 
      label: 'Relatórios WhatsApp', 
      icon: MessageSquare,
      permission: 'access_whatsapp' as Permission
    },
  ];

  const mediaItems = [
    { 
      id: 'campaigns', 
      label: 'Campanhas', 
      icon: Target,
      permission: 'access_paid_media' as Permission
    },
    { 
      id: 'adsets', 
      label: 'Conjuntos de Anúncios', 
      icon: Target,
      permission: 'access_paid_media' as Permission
    },
    { 
      id: 'ads', 
      label: 'Anúncios', 
      icon: Target,
      permission: 'access_paid_media' as Permission
    },
    {
      id: 'resultados',
      label: 'Resultados',
      icon: BarChart3,
      permission: 'access_paid_media' as Permission
    },
  ];

  const managementItems = [
    { 
      id: 'tickets', 
      label: hasPermission('access_tasks') ? 'Gerenciar Chamados' : 'Meus Chamados', 
      icon: FileText,
      permission: 'access_calls' as Permission
    },
    { 
      id: 'creatives', 
      label: hasPermission('access_creatives') ? 'Gerenciar Criativos' : 'Meus Criativos', 
      icon: Palette,
      permission: 'access_creatives' as Permission
    },
    { 
      id: 'metrics-objectives', 
      label: 'Métricas e Objetivos', 
      icon: Target,
      permission: 'view_metrics' as Permission
    },
  ];

  const systemItems = [
    { 
      id: 'activity-log', 
      label: 'Log de Atividades', 
      icon: Activity,
      permission: 'view_system_logs' as Permission
    },
    { 
      id: 'settings', 
      label: 'Configurações', 
      icon: Settings,
      permission: null
    },
  ];

  const canAccessSettings = hasPermission('manage_api_settings') || 
                           hasPermission('manage_user_settings') || 
                           hasPermission('manage_collaborators') || 
                           isRootAdmin;

  const renderMenuItems = (items: any[], showBadge = false) => {
    return items
      .filter(item => {
        if (item.id === 'settings') {
          return canAccessSettings;
        }
        return item.permission ? hasPermission(item.permission) : true;
      })
      .map((item) => (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
              isItemActive(item.id) 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {showBadge && item.id === 'tickets' && (
              <Badge variant="secondary" className="text-xs">
                {Math.floor(Math.random() * 5) + 1}
              </Badge>
            )}
          </button>
        </div>
      ));
  };

  return (
    <div className="w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Partner Manager</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isCliente ? 'Área do Cliente' : 'Área Administrativa'}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Principal
          </h3>
          {renderMenuItems(mainMenuItems)}
        </div>

        {whatsappItems.some(item => hasPermission(item.permission)) && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
              WhatsApp
            </h3>
            {renderMenuItems(whatsappItems)}
          </div>
        )}

        {mediaItems.some(item => hasPermission(item.permission)) && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Mídia Paga
            </h3>
            {renderMenuItems(mediaItems)}
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Gestão
          </h3>
          {renderMenuItems(managementItems, true)}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Sistema
          </h3>
          {renderMenuItems(systemItems)}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start text-xs"
        >
          {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        </Button>
        
        {profile && (
          <div className="p-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {profile.nome}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {profile.email}
              </p>
              <Badge variant="outline" className="text-xs">
                {isRootAdmin ? 'Root Admin' : profile.role === 'admin' ? 'Admin' : 'Cliente'}
              </Badge>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}
