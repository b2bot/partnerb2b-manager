import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/dashboard_ui/tabs';
import { Badge } from '@/components/dashboard_ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/dashboard_ui/select';
import { useFilters } from '@/hooks/dashboard_hooks/useFilters';
import { usePlatformNavigation, TabSection } from '@/hooks/dashboard_hooks/usePlatformNavigation';
import { BarChart3, Users, Target, Download } from 'lucide-react';
import DateRangePicker from '@/components/dashboard_filters/DateRangePicker';
import { Button } from '@/components/dashboard_ui/button';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';

interface SectionTabsProps {
  accounts: string[];
  data: SheetRow[];
}

const SectionTabs = ({ accounts, data }: SectionTabsProps) => {
  const { section, setSection, platform } = usePlatformNavigation();
  const { filters, updateFilters } = useFilters();

  const handleExport = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>

        headers.map(header => `"${row[header]}"`).join(',')

      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sections = React.useMemo(() => {
    if (platform === 'relatorios') {
      return [
        { id: 'campanhas' as TabSection, label: 'Relatórios', icon: BarChart3 },
        { id: 'grupos' as TabSection, label: 'Observações', icon: Users },
        {
          id: 'anuncios' as TabSection,
          label: 'Outros Relatórios',
          icon: Target,
        },
      ];
    }
    return [
      { id: 'campanhas' as TabSection, label: 'Campanhas', icon: BarChart3 },
      { id: 'grupos' as TabSection, label: 'Grupos de Anúncio', icon: Users },
      { id: 'anuncios' as TabSection, label: 'Anúncios', icon: Target },
    ];
  }, [platform]);

  const gridColsClass = `grid-cols-${sections.length}`;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 gap-3">

          <Tabs value={section} onValueChange={(value) => setSection(value as TabSection)}>
            <TabsList
              className={`grid ${gridColsClass} bg-gray-50 dark:bg-gray-800 p-1 rounded-lg transition-all duration-300 h-9 w-full sm:w-auto`}
            >
              {sections.map((sectionItem) => {
                const Icon = sectionItem.icon;
                return (
                  <TabsTrigger
                    key={sectionItem.id}
                    value={sectionItem.id}
                    className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all duration-200 hover:scale-[1.02] group text-xs px-2"
                  >
                    <Icon className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                    <span className="hidden sm:inline text-xs">{sectionItem.label}</span>
                    <span className="sm:hidden text-xs">{sectionItem.label.split(' ')[0]}</span>
                    <Badge variant="outline" className="ml-1 text-xs bg-gray-100 dark:bg-gray-600 group-hover:scale-105 transition-transform duration-200 px-1">
                      {Math.floor(Math.random() * 50) + 10}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Filtros à direita */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">

            <div className="w-full sm:w-[260px]">
              <DateRangePicker
                dateRange={filters.dateRange}
                onDateRangeChange={(dateRange) => updateFilters({ dateRange })}
              />
            </div>

            {/* Select agora após o DateRangePicker */}
            <Select
              value={filters.selectedAccount}
              onValueChange={(value) => updateFilters({ selectedAccount: value })}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-9">
                <SelectValue placeholder="Todas as contas" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">Todas as contas</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Botão de Exportar agora à direita */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900 h-9 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionTabs;
