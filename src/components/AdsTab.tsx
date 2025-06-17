
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Eye, Pause, Play, MoreHorizontal, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMetaData } from '@/hooks/useMetaData';
import { useAdInsights } from '@/hooks/useInsights';
import { useMetricsConfig } from '@/hooks/useMetricsConfig';
import { formatMetricValue, getMetricDisplayName } from '@/lib/metaInsights';
import { toast } from 'sonner';
import { updateAdWithRateLimit } from '@/lib/metaApiWithRateLimit';
import { CreateAdModal } from '@/components/CreateAdModal';
import { EditAdModal } from '@/components/EditAdModal';
import { MetricsCustomization } from '@/components/MetricsCustomization';
import { DynamicFilters } from '@/components/DynamicFilters';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { SelectedAccountDisplay } from '@/components/SelectedAccountDisplay';
import { useDateRange } from '@/hooks/useDateRange';
import type { Ad } from '@/lib/metaApi';

export function AdsTab() {
  const { ads, loading, credentials, campaigns, adSets, refetch, selectedAdAccount } = useMetaData();
  const { config, getVisibleMetrics } = useMetricsConfig();
  const { dateRange, setDateRange, getApiDateRange } = useDateRange();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [showMetricsConfig, setShowMetricsConfig] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedCreativeImage, setSelectedCreativeImage] = useState<string | null>(null);

  // Hook para insights de ads com range de data
  const { data: adInsights = [], isLoading: insightsLoading } = useAdInsights(getApiDateRange());

  const filteredAds = useMemo(() => {
    let filtered = ads || [];

    // Filtrar por conta selecionada
    if (selectedAdAccount) {
      filtered = filtered.filter(ad => ad.account_id === selectedAdAccount);
    }

    if (filters.campaign && filters.campaign !== 'all') {
      const filteredAdSets = adSets?.filter(adset => adset.campaign_id === filters.campaign);
      const adSetIds = filteredAdSets?.map(adset => adset.id) || [];
      filtered = filtered.filter(ad => adSetIds.includes(ad.adset_id));
    }

    if (filters.adset && filters.adset !== 'all') {
      filtered = filtered.filter(ad => ad.adset_id === filters.adset);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(ad => ad.status === filters.status);
    }

    return filtered;
  }, [ads, filters, adSets, selectedAdAccount]);

  const sortedAds = useMemo(() => {
    if (!sortConfig) return filteredAds;

    return [...filteredAds].sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      const key = sortConfig.key;

      // Handle metric sorting
      if (getVisibleMetrics('ads').includes(key)) {
        const dataA = adInsights.find(item => item?.id === a.id);
        const dataB = adInsights.find(item => item?.id === b.id);
        
        const valueA = dataA?.[key] || 0;
        const valueB = dataB?.[key] || 0;
        
        return (Number(valueA) - Number(valueB)) * direction;
      }

      // Handle ad property sorting
      const valueA = (a as any)[key];
      const valueB = (b as any)[key];

      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  }, [filteredAds, sortConfig, adInsights, getVisibleMetrics]);

  const handleStatusUpdate = async (ad: Ad, newStatus: string) => {
    if (!credentials?.access_token) {
      toast.error('Credenciais da Meta não encontradas.');
      return;
    }

    try {
      await updateAdWithRateLimit(credentials.access_token, ad.id, { status: newStatus });
      toast.success(`Anúncio "${ad.name}" ${newStatus === 'PAUSED' ? 'pausado' : 'ativado'} com sucesso.`);
      refetch.ads();
    } catch (error: any) {
      console.error('Erro ao atualizar status do anúncio:', error);
      toast.error(`Erro ao atualizar o anúncio "${ad.name}": ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(currentConfig => {
      if (currentConfig?.key === key) {
        return { key, direction: currentConfig.direction === 'asc' ? 'desc' : 'asc' };
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

  // Mock function to simulate creative image URL - replace with real implementation
  const getCreativeImageUrl = (adId: string) => {
    return `https://via.placeholder.com/400x300/e2e8f0/64748b?text=Criativo+${adId.slice(-4)}`;
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Anúncios</h1>
          <p className="text-slate-600 text-xs">Gerencie seus anúncios do Facebook Ads</p>
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
            Novo Anúncio
          </Button>
        </div>
      </div>

      <SelectedAccountDisplay />

      <DynamicFilters
        type="ads"
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
              <TableHead className="text-xs h-7 w-12">Criativo</TableHead>
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
              <TableHead className="text-xs h-7">Conjunto</TableHead>
              <TableHead className="text-xs h-7">Campanha</TableHead>
              {getVisibleMetrics('ads').map(metric => (
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
                <TableCell colSpan={getVisibleMetrics('ads').length + 6} className="text-center text-xs py-4">
                  Carregando métricas...
                </TableCell>
              </TableRow>
            ) : (
              sortedAds.map((ad) => {
                const adInsightsData = adInsights.find(insight => insight.id === ad.id);
                const adSet = adSets?.find(adset => adset.id === ad.adset_id);
                const campaign = campaigns?.find(camp => camp.id === adSet?.campaign_id);
                const creativeImageUrl = getCreativeImageUrl(ad.id);

                return (
                  <TableRow key={ad.id} className="text-xs h-8">
                    <TableCell className="p-1">
                      <img 
                        src={creativeImageUrl}
                        alt="Criativo"
                        className="w-8 h-6 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedCreativeImage(creativeImageUrl)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-xs p-1">{ad.name}</TableCell>
                    <TableCell className="p-1">
                      <Badge className={getStatusColor(ad.status) + " text-xs px-1 py-0"}>
                        {ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs p-1">{adSet?.name || '-'}</TableCell>
                    <TableCell className="text-xs p-1">{campaign?.name || '-'}</TableCell>
                    {getVisibleMetrics('ads').map((metric) => (
                      <TableCell key={metric} className="text-xs p-1">
                        {formatMetricValue(adInsightsData, metric)}
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
                          <DropdownMenuItem onClick={() => setEditingAd(ad)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {ad.status === 'ACTIVE' ? (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(ad, 'PAUSED')}>
                              <Pause className="h-3 w-3 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(ad, 'ACTIVE')}>
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

      {/* Modal para exibir imagem do criativo */}
      <Dialog open={!!selectedCreativeImage} onOpenChange={() => setSelectedCreativeImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Visualização do Criativo</DialogTitle>
          </DialogHeader>
          {selectedCreativeImage && (
            <div className="flex justify-center">
              <img 
                src={selectedCreativeImage} 
                alt="Criativo ampliado"
                className="max-w-full max-h-96 object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreateAdModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => setShowCreateModal(false)}
      />

      {editingAd && (
        <EditAdModal 
          ad={editingAd} 
          isOpen={!!editingAd}
          onClose={() => setEditingAd(null)} 
          onSuccess={() => {
            setEditingAd(null);
            refetch.ads();
          }}
        />
      )}
    </div>
  );
}
