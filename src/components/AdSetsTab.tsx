
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Pause, Play, MoreHorizontal, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMetaData } from '@/hooks/useMetaData';
import { useAdSetInsights } from '@/hooks/useInsights';
import { useMetricsConfig } from '@/hooks/useMetricsConfig';
import { formatMetricValue, getMetricDisplayName } from '@/lib/metaInsights';
import { toast } from 'sonner';
import { updateAdSetWithRateLimit } from '@/lib/metaApiWithRateLimit';
import { CreateAdSetModal } from '@/components/CreateAdSetModal';
import { EditAdSetModal } from '@/components/EditAdSetModal';
import { MetricsCustomization } from '@/components/MetricsCustomization';
import { DynamicFilters } from '@/components/DynamicFilters';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { SelectedAccountDisplay } from '@/components/SelectedAccountDisplay';
import { useDateRange } from '@/hooks/useDateRange';
import type { AdSet } from '@/lib/metaApi';

export function AdSetsTab() {
  const { adSets, loading, credentials, campaigns, refetch, selectedAdAccount } = useMetaData();
  const { config, getVisibleMetrics } = useMetricsConfig();
  const { dateRange, setDateRange, getApiDateRange } = useDateRange();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdSet, setEditingAdSet] = useState<AdSet | null>(null);
  const [showMetricsConfig, setShowMetricsConfig] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Hook para insights de adsets com range de data
  const { data: adSetInsights = [], isLoading: insightsLoading } = useAdSetInsights(getApiDateRange());

  const filteredAdSets = useMemo(() => {
    let filtered = adSets || [];

    // Filtrar por conta selecionada
    if (selectedAdAccount) {
      filtered = filtered.filter(adset => adset.account_id === selectedAdAccount);
    }

    if (filters.campaign && filters.campaign !== 'all') {
      filtered = filtered.filter(adset => adset.campaign_id === filters.campaign);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(adset => adset.status === filters.status);
    }

    return filtered;
  }, [adSets, filters, selectedAdAccount]);

  const sortedAdSets = useMemo(() => {
    if (!sortConfig) return filteredAdSets;

    return [...filteredAdSets].sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      const key = sortConfig.key;

      // Handle metric sorting
      if (getVisibleMetrics('adsets').includes(key)) {
        const dataA = adSetInsights.find(item => item?.id === a.id);
        const dataB = adSetInsights.find(item => item?.id === b.id);
        
        const valueA = dataA?.[key] || 0;
        const valueB = dataB?.[key] || 0;
        
        return (Number(valueA) - Number(valueB)) * direction;
      }

      // Handle adset property sorting
      const valueA = (a as any)[key];
      const valueB = (b as any)[key];

      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  }, [filteredAdSets, sortConfig, adSetInsights, getVisibleMetrics]);

  const handleStatusUpdate = async (adSetId: string, newStatus: string) => {
    if (!credentials?.access_token) {
      toast.error('Credenciais da Meta não encontradas.');
      return;
    }

    try {
      await updateAdSetWithRateLimit(credentials.access_token, adSetId, { status: newStatus });
      toast.success('Status do conjunto de anúncios atualizado com sucesso!');
      if (refetch && typeof refetch.adSets === 'function') {
        refetch.adSets();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar status do conjunto de anúncios:', error);
      toast.error(`Erro ao atualizar status: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(currentConfig => {
      if (currentConfig?.key === key) {
        return {
          key,
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Conjuntos de Anúncios</h1>
          <p className="text-slate-600 text-xs">Gerencie seus conjuntos de anúncios do Facebook Ads</p>
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
            Novo Conjunto
          </Button>
        </div>
      </div>

      <SelectedAccountDisplay />

      <DynamicFilters
        type="adsets"
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
              <TableHead className="text-xs h-7">Campanha</TableHead>
              {getVisibleMetrics('adsets').map(metric => (
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
              <TableHead className="text-right text-xs h-7">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insightsLoading ? (
              <TableRow>
                <TableCell colSpan={getVisibleMetrics('adsets').length + 4} className="text-center text-xs py-4">
                  Carregando métricas...
                </TableCell>
              </TableRow>
            ) : (
              sortedAdSets.map(adSet => {
                const adSetData = adSetInsights.find(insight => insight.id === adSet.id);

                return (
                  <TableRow key={adSet.id} className="text-xs h-8">
                    <TableCell className="font-medium text-xs p-1">{adSet.name}</TableCell>
                    <TableCell className="p-1">
                      <Badge className={getStatusColor(adSet.status) + " text-xs px-1 py-0"}>
                        {adSet.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs p-1">
                      {(() => {
                        const campaign = campaigns?.find(c => c.id === adSet.campaign_id);
                        return campaign?.name || '-';
                      })()}
                    </TableCell>
                    {getVisibleMetrics('adsets').map(metric => (
                      <TableCell key={metric} className="text-xs p-1">
                        {formatMetricValue(adSetData, metric)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right p-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingAdSet(adSet)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {adSet.status === 'ACTIVE' ? (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(adSet.id, 'PAUSED')}>
                              <Pause className="h-3 w-3 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(adSet.id, 'ACTIVE')}>
                              <Play className="h-3 w-3 mr-2" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            if (window.confirm(`Deseja realmente arquivar o conjunto de anúncios "${adSet.name}"?`)) {
                              handleStatusUpdate(adSet.id, 'ARCHIVED');
                            }
                          }}>
                            <Eye className="h-3 w-3 mr-2" />
                            Arquivar
                          </DropdownMenuItem>
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

      <CreateAdSetModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => setShowCreateModal(false)}
      />

      {editingAdSet && (
        <EditAdSetModal
          adSet={editingAdSet}
          isOpen={!!editingAdSet}
          onClose={() => setEditingAdSet(null)}
          onSuccess={() => {
            setEditingAdSet(null);
            if (refetch && typeof refetch.adSets === 'function') {
              refetch.adSets();
            }
          }}
        />
      )}
    </div>
  );
}
