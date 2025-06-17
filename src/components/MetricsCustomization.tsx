
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useMetricsConfig, AVAILABLE_METRICS } from '@/hooks/useMetricsConfig';
import { X } from 'lucide-react';

interface MetricsCustomizationProps {
  onClose: () => void;
}

// Organização das métricas em categorias com nomes em português
const metricsCategories = {
  performance: {
    label: 'Performance',
    metrics: ['impressions', 'reach', 'clicks', 'unique_clicks', 'spend', 'frequency']
  },
  conversion: {
    label: 'Conversões',
    metrics: ['conversions', 'results', 'cost_per_result', 'purchases', 'leads']
  },
  rates: {
    label: 'Taxas',
    metrics: ['ctr', 'unique_ctr', 'conversion_rate']
  },
  costs: {
    label: 'Custos',
    metrics: ['cpc', 'cost_per_unique_click', 'cpm', 'cost_per_conversion', 'cost_per_purchase']
  },
  engagement: {
    label: 'Engajamento',
    metrics: ['post_engagement', 'page_engagement', 'post_reactions', 'comment', 'share', 'like']
  },
  video: {
    label: 'Vídeo',
    metrics: ['video_views', 'video_view_rate', 'cost_per_video_view', 'video_play_actions']
  },
  traffic: {
    label: 'Tráfego',
    metrics: ['link_clicks', 'outbound_clicks', 'cost_per_outbound_click']
  }
};

// Nomes em português para as métricas
const metricLabels: { [key: string]: string } = {
  impressions: 'Impressões',
  reach: 'Alcance',
  clicks: 'Cliques',
  unique_clicks: 'Cliques Únicos',
  spend: 'Valor Gasto',
  frequency: 'Frequência',
  conversions: 'Conversões',
  results: 'Resultados',
  cost_per_result: 'Custo por Resultado',
  purchases: 'Compras',
  leads: 'Leads',
  ctr: 'CTR',
  unique_ctr: 'CTR Único',
  conversion_rate: 'Taxa de Conversão',
  cpc: 'CPC',
  cost_per_unique_click: 'Custo por Clique Único',
  cpm: 'CPM',
  cost_per_conversion: 'Custo por Conversão',
  cost_per_purchase: 'Custo por Compra',
  post_engagement: 'Engajamento da Publicação',
  page_engagement: 'Engajamento da Página',
  post_reactions: 'Reações',
  comment: 'Comentários',
  share: 'Compartilhamentos',
  like: 'Curtidas',
  video_views: 'Visualizações de Vídeo',
  video_view_rate: 'Taxa de Visualização',
  cost_per_video_view: 'Custo por Visualização',
  video_play_actions: 'Reproduções de Vídeo',
  link_clicks: 'Cliques em Links',
  outbound_clicks: 'Cliques Externos',
  cost_per_outbound_click: 'Custo por Clique Externo'
};

const pageLabels = {
  dashboard: 'Dashboard',
  campaigns: 'Campanhas',
  adsets: 'Conjuntos',
  ads: 'Anúncios'
};

export function MetricsCustomization({ onClose }: MetricsCustomizationProps) {
  const { config, updateConfig, isLoading } = useMetricsConfig();
  const [localConfig, setLocalConfig] = useState(config || {
    dashboard: ['impressions', 'clicks', 'spend', 'ctr', 'cpc'],
    campaigns: ['impressions', 'clicks', 'spend', 'ctr', 'cpc', 'reach'],
    adsets: ['impressions', 'clicks', 'spend', 'ctr', 'cpc'],
    ads: ['impressions', 'clicks', 'spend', 'ctr', 'cpc']
  });

  const handleMetricToggle = (page: keyof typeof localConfig, metric: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [page]: prev[page].includes(metric)
        ? prev[page].filter(m => m !== metric)
        : [...prev[page], metric]
    }));
  };

  const handleSave = () => {
    updateConfig(localConfig);
    onClose();
  };

  const getAllMetrics = () => {
    return Object.values(metricsCategories).flatMap(category => category.metrics);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Personalizar Métricas</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(pageLabels).map(([page, label]) => (
            <div key={page} className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-2">{label}</h4>
              
              {Object.entries(metricsCategories).map(([categoryKey, category]) => (
                <div key={categoryKey} className="space-y-2">
                  <h5 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    {category.label}
                  </h5>
                  <div className="space-y-1">
                    {category.metrics.map(metric => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${page}-${metric}`}
                          checked={localConfig[page as keyof typeof localConfig]?.includes(metric)}
                          onCheckedChange={() => handleMetricToggle(page as keyof typeof localConfig, metric)}
                          className="h-3 w-3"
                        />
                        <label htmlFor={`${page}-${metric}`} className="text-xs leading-none">
                          {metricLabels[metric] || metric}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading} size="sm">
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
