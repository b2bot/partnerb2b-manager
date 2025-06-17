
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard_ui/select';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';
import { Calendar, Filter } from 'lucide-react';

interface DashboardFiltersProps {
  data: SheetRow[];
  selectedCampaign: string;
  selectedPlatform: string;
  selectedPeriod: string;
  onCampaignChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}

const DashboardFilters = ({
  data,
  selectedCampaign,
  selectedPlatform,
  selectedPeriod,
  onCampaignChange,
  onPlatformChange,
  onPeriodChange,
}: DashboardFiltersProps) => {
  const uniqueCampaigns = [...new Set(data.map(row => row.campaignName))].filter(Boolean);
  const uniquePlatforms: string[] = [];
  const uniqueDays = [...new Set(data.map(row => row.day))].filter(Boolean).sort();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Período
          </label>
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os períodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              {uniqueDays.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campanha
          </label>
          <Select value={selectedCampaign} onValueChange={onCampaignChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as campanhas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as campanhas</SelectItem>
              {uniqueCampaigns.map((campaign) => (
                <SelectItem key={campaign} value={campaign}>
                  {campaign}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plataforma filter removed due to missing platform data */}
      </div>
    </div>
  );
};

export default DashboardFilters;
