import React from 'react';
import { Card, CardContent } from '@/components/dashboard_ui/card';
import { Input } from '@/components/dashboard_ui/input';
import { Button } from '@/components/dashboard_ui/button';
import { Search, Download } from 'lucide-react';
import { useFilters } from '@/hooks/dashboard_hooks/useFilters';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';
import DateRangePicker from './DateRangePicker';

interface AdvancedFiltersProps {
  data: SheetRow[];
  platformName?: string;
}

const AdvancedFilters = ({ data, platformName }: AdvancedFiltersProps) => {
  const { filters, updateFilters } = useFilters();

  const handleExport = () => {
    const filteredData = data.filter(row => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = `${row.campaignName} ${row.adSetName} ${row.adName} ${row.accountName}`.toLowerCase();
        if (!searchableText.includes(searchLower)) return false;
      }
      return true;
    });

    if (filteredData.length === 0) return;

    const headers = Object.keys(filteredData[0]);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row =>
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

  return (
    <Card className="border-0 shadow-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      <CardContent className="py-4 px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">

          {/* Título fixo à esquerda */}
          {platformName && (
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              {platformName} Analytics
            </h2>
          )}

          {/* Filtros e Export */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">

            <div className="w-full sm:max-w-full sm:flex-1">
              <DateRangePicker
                dateRange={filters.dateRange}
                onDateRangeChange={(dateRange) =>
                  updateFilters({ dateRange })
                }
              />
            </div>


            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="w-full sm:flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900 h-9 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
            </Button>

          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
