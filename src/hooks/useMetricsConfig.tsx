
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSystemLog } from '@/hooks/useSystemLog';

export interface MetricsConfig {
  dashboard: string[];
  campaigns: string[];
  adsets: string[];
  ads: string[];
}

const defaultConfig: MetricsConfig = {
  dashboard: ['impressions', 'clicks', 'spend', 'ctr', 'cpc'],
  campaigns: ['impressions', 'clicks', 'spend', 'ctr', 'cpc', 'reach'],
  adsets: ['impressions', 'clicks', 'spend', 'ctr', 'cpc'],
  ads: ['impressions', 'clicks', 'spend', 'ctr', 'cpc']
};

// Métricas disponíveis expandidas
export const AVAILABLE_METRICS = {
  performance: [
    'impressions',
    'reach', 
    'clicks',
    'unique_clicks',
    'spend',
    'frequency'
  ],
  conversion: [
    'conversions',
    'results',
    'cost_per_result',
    'purchases',
    'leads'
  ],
  rates: [
    'ctr',
    'unique_ctr',
    'conversion_rate'
  ],
  costs: [
    'cpc',
    'cost_per_unique_click',
    'cpm',
    'cost_per_conversion',
    'cost_per_purchase'
  ],
  engagement: [
    'post_engagement',
    'page_engagement', 
    'post_reactions',
    'comment',
    'share',
    'like'
  ],
  video: [
    'video_views',
    'video_view_rate',
    'cost_per_video_view',
    'video_play_actions'
  ],
  traffic: [
    'link_clicks',
    'outbound_clicks',
    'cost_per_outbound_click'
  ]
};

export function useMetricsConfig() {
  const { logActivity } = useSystemLog();
  const queryClient = useQueryClient();

  const { data: configData, isLoading } = useQuery({
    queryKey: ['metrics-config'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('metrics_config')
          .select('config')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar config de métricas:', error);
          return defaultConfig;
        }

        // Garantir formato correto e parse seguro
        if (!data || typeof data.config !== 'object') {
          return defaultConfig;
        }
        // Garante que config tenha todas as chaves esperadas
        const parsedConfig = data.config as Partial<MetricsConfig>;
        return {
          dashboard: Array.isArray(parsedConfig.dashboard) ? parsedConfig.dashboard : defaultConfig.dashboard,
          campaigns: Array.isArray(parsedConfig.campaigns) ? parsedConfig.campaigns : defaultConfig.campaigns,
          adsets: Array.isArray(parsedConfig.adsets) ? parsedConfig.adsets : defaultConfig.adsets,
          ads: Array.isArray(parsedConfig.ads) ? parsedConfig.ads : defaultConfig.ads,
        } as MetricsConfig;
      } catch (err) {
        console.error('Erro inesperado ao buscar métricas:', err);
        return defaultConfig;
      }
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: MetricsConfig) => {
      try {
        // Serializa newConfig para JSON
        const { error } = await supabase
          .from('metrics_config')
          .upsert([{ config: JSON.parse(JSON.stringify(newConfig)) }], { onConflict: 'id' });

        if (error) throw error;

        await logActivity('metrics_config_updated', 'configuracoes', newConfig);
        return newConfig;
      } catch (err) {
        console.error('Erro ao atualizar config de métricas:', err);
        throw err;
      }
    },
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['metrics-config'], newConfig);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['adsets'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      toast.success('Configuração de métricas atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar configuração de métricas');
    },
  });

  const getVisibleMetrics = (page: keyof MetricsConfig): string[] => {
    if (!configData || typeof configData !== 'object') return defaultConfig[page];
    return (configData as MetricsConfig)[page] || defaultConfig[page];
  };

  const isMetricVisible = (page: keyof MetricsConfig, metric: string): boolean => {
    const visible = getVisibleMetrics(page);
    return Array.isArray(visible) && visible.includes(metric);
  };

  const updateConfig = (newConfig: MetricsConfig) => {
    updateConfigMutation.mutate(newConfig);
  };

  return {
    config: configData as MetricsConfig,
    isLoading,
    isUpdating: updateConfigMutation.isPending,
    updateConfig,
    getVisibleMetrics,
    isMetricVisible
  };
}
