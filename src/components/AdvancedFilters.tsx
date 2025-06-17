
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useMetaData } from '@/hooks/useMetaData';

interface AdvancedFiltersProps {
  type: 'campaigns' | 'adsets' | 'ads';
  onFiltersChange: (filters: any) => void;
  inheritedFilters?: {
    account?: string;
    campaign?: string;
    adset?: string;
  };
}

export function AdvancedFilters({ type, onFiltersChange, inheritedFilters = {} }: AdvancedFiltersProps) {
  const { campaigns, adSets, ads, adAccounts } = useMetaData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    account: inheritedFilters.account || '',
    campaign: inheritedFilters.campaign || '',
    adset: inheritedFilters.adset || '',
    status: '',
    dateRange: 'last_7_days',
  });

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      account: inheritedFilters.account || '',
      campaign: inheritedFilters.campaign || '',
      adset: inheritedFilters.adset || '',
      status: '',
      dateRange: 'last_7_days',
    });
  };

  const getFilteredCampaigns = () => {
    if (!filters.account) return campaigns;
    return campaigns.filter(campaign => campaign.account_id === filters.account);
  };

  const getFilteredAdSets = () => {
    let filtered = adSets;
    if (filters.account) {
      filtered = filtered.filter(adset => adset.account_id === filters.account);
    }
    if (filters.campaign) {
      filtered = filtered.filter(adset => adset.campaign_id === filters.campaign);
    }
    return filtered;
  };

  return (
    <Card className="mb-6 shadow-sm border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-600" />
            <Label className="text-sm font-medium text-slate-700">Filtros Avançados</Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-600 hover:text-slate-800"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Busca sempre visível */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Buscar ${type === 'campaigns' ? 'campanhas' : type === 'adsets' ? 'conjuntos' : 'anúncios'}...`}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 bg-white border-slate-200 focus:border-blue-500"
            />
          </div>

          {/* Filtros expandidos */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              {/* Filtro de Conta */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Conta</Label>
                <Select value={filters.account} onValueChange={(value) => handleFilterChange('account', value)}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as contas</SelectItem>
                    {adAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Campanha (para adsets e ads) */}
              {(type === 'adsets' || type === 'ads') && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Campanha</Label>
                  <Select value={filters.campaign} onValueChange={(value) => handleFilterChange('campaign', value)}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="Todas as campanhas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as campanhas</SelectItem>
                      {getFilteredCampaigns().map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtro de Conjunto (apenas para ads) */}
              {type === 'ads' && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Conjunto</Label>
                  <Select value={filters.adset} onValueChange={(value) => handleFilterChange('adset', value)}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="Todos os conjuntos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os conjuntos</SelectItem>
                      {getFilteredAdSets().map((adset) => (
                        <SelectItem key={adset.id} value={adset.id}>
                          {adset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtro de Status */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="PAUSED">Pausado</SelectItem>
                    <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Período */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Período</Label>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="yesterday">Ontem</SelectItem>
                    <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                    <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                    <SelectItem value="this_month">Este mês</SelectItem>
                    <SelectItem value="last_month">Mês passado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Botão limpar filtros */}
          {isExpanded && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-slate-600 hover:text-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
