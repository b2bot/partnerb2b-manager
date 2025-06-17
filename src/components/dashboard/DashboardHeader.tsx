
import React from 'react';
import { Button } from '@/components/dashboard_ui/button';
import { Badge } from '@/components/dashboard_ui/badge';
import { Calendar, Filter, Download, RefreshCw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">MD</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Media Dashboard
              </h1>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 shadow-sm">
              Live Data
            </Badge>
          </div>

          {/* Controles de navegação e filtros */}
          <div className="flex items-center space-x-3">
            {/* Espaço reservado para filtros futuros */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Últimos 30 dias</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg shadow-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Todos os canais</span>
            </div>

            {/* Botões de ação */}
            <Button variant="outline" size="sm" className="hidden sm:flex hover:bg-blue-50 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            
            <Button variant="outline" size="sm" className="hidden sm:flex hover:bg-purple-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Link to="/admin">
              <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
