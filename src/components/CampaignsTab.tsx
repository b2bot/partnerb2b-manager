
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Pause, Play, MoreHorizontal, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMetaData } from '@/hooks/useMetaData';
import { useCampaignInsights } from '@/hooks/useInsights';
import { useMetricsConfig } from '@/hooks/useMetricsConfig';
import { formatMetricValue, getMetricDisplayName } from '@/lib/metaInsights';
import { toast } from 'sonner';
import { updateCampaignWithRateLimit } from '@/lib/metaApiWithRateLimit';
import { CreateCampaignModal } from '@/components/CreateCampaignModal';
import { EditCampaignModal } from '@/components/EditCampaignModal';
import { MetricsCustomization } from '@/components/MetricsCustomization';
import { DynamicFilters } from '@/components/DynamicFilters';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { SelectedAccountDisplay } from '@/components/SelectedAccountDisplay';
import { useDateRange } from '@/hooks/useDateRange';
import type { Campaign } from '@/lib/metaApi';

export function CampaignsTab() {
  const { campaigns, loading, credentials, refetch, selectedAdAccount } = useMetaData();
  const { config, getVisibleMetrics } = useMetricsConfig();
  const { dateRange, setDateRange, getApiDateRange } = useDateRange();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showMetricsConfig, setShowMetricsConfig] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Hook para insights de campanhas com range de data
  const { data: campaignInsights = [], isLoading: insightsLoading } = useCampaignInsights(getApiDateRange());

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns || [];

    // Filtrar por conta selecionada
    if (selectedAdAccount) {
      filtered = filtered.filter(campaign => campaign.account_id === selectedAdAccount);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === filters.status);
    }

    return filtered;
  }, [campaigns, filters, selectedAdAccount]);

  const sortedCampaigns = useMemo(() => {
    if (!sortConfig) return filteredCampaigns;

    return [...filteredCampaigns].sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      const key = sortConfig.key;

      // Handle metric sorting
      if (getVisibleMetrics('campaigns').includes(key)) {
        const dataA = campaignInsights.find(item => item?.id === a.id);
        const dataB = campaignInsights.find(item => item?.id === b.id);
        
        const valueA = dataA?.[key] || 0;
        const valueB = dataB?.[key] || 0;
        
        return (Number(valueA) - Number(valueB)) * direction;
      }

      // Handle campaign property sorting
      const valueA = (a as any)[key];
      const valueB = (b as any)[key];

      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  }, [filteredCampaigns, sortConfig, campaignInsights, getVisibleMetrics]);

  const handleStatusUpdate = async (campaignId: string, newStatus: string) => {
    if (!credentials?.access_token) {
      toast.error('Credenciais da Meta não encontradas.');
      return;
    }

    try {
      await updateCampaignWithRateLimit(credentials.access_token, campaignId, { status: newStatus });
      toast.success(`Campanha ${campaignId} ${newStatus === 'PAUSED' ? 'pausada' : 'ativada'} com sucesso!`);
      refetch.campaigns();
    } catch (error: any) {
      console.error('Erro ao atualizar status da campanha:', error);
      toast.error(`Erro ao atualizar status da campanha ${campaignId}: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Campanhas</h1>
          <p className="text-slate-600 text-xs">Gerencie suas campanhas do Facebook Ads</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter onDateChange={setDateRange} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetricsConfig(!showMetricsConfig)}
            className="text-xs h-7"
          >
            <Filter className="h-3 w-3 mr-1" />
            Métricas
          </Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm" className="text-xs h-7">
            <Plus className="h-3 w-3 mr-1" />
            Nova Campanha
          </Button>
        </div>
      </div>

      <SelectedAccountDisplay />

      <DynamicFilters
        type="campaigns"
        onFiltersChange={setFilters}
      />

      {showMetricsConfig && (
        <MetricsCustomization
          onClose={() => setShowMetricsConfig(false)}
        />
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead 
                onClick={() => handleSort('name')} 
                className="cursor-pointer text-xs h-7 hover:bg-slate-50"
              >
                <div className="flex items-center gap-1">
                  Nome
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-xs h-7">Status</TableHead>
              <TableHead className="text-xs h-7">Objetivo</TableHead>
              {getVisibleMetrics('campaigns').map(metric => (
                <TableHead 
                  key={metric} 
                  onClick={() => handleSort(metric)}
                  className="cursor-pointer text-xs h-7 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-1">
                    {getMetricDisplayName(metric)}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-xs h-7">Criada em</TableHead>
              <TableHead className="text-right text-xs h-7">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insightsLoading ? (
              <TableRow>
                <TableCell colSpan={getVisibleMetrics('campaigns').length + 5} className="text-center text-xs py-4">
                  Carregando métricas...
                </TableCell>
              </TableRow>
            ) : (
              sortedCampaigns.map(campaign => {
                const campaignData = campaignInsights.find(item => item?.id === campaign.id);
                
                return (
                  <TableRow key={campaign.id} className="text-xs h-8">
                    <TableCell className="font-medium text-xs p-1">{campaign.name}</TableCell>
                    <TableCell className="p-1">
                      <Badge variant={campaign.status === 'ACTIVE' ? 'outline' : 'secondary'} className="text-xs px-1 py-0">
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs p-1">{campaign.objective}</TableCell>
                    {getVisibleMetrics('campaigns').map(metric => (
                      <TableCell key={metric} className="text-xs p-1">
                        {formatMetricValue(campaignData, metric)}
                      </TableCell>
                    ))}
                    <TableCell className="text-xs p-1">{new Date(campaign.created_time).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right p-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCampaign(campaign)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {campaign.status === 'ACTIVE' ? (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(campaign.id, 'PAUSED')}>
                              <Pause className="h-3 w-3 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(campaign.id, 'ACTIVE')}>
                              <Play className="h-3 w-3 mr-2" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => setShowCreateModal(false)}
      />

      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          isOpen={!!editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSuccess={() => {
            setEditingCampaign(null);
            refetch.campaigns();
          }}
        />
      )}
    </div>
  );
}
