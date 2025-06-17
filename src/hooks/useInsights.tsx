
import { useQuery } from '@tanstack/react-query';
import { 
  getCampaignInsightsWithRateLimit, 
  getAdSetInsightsWithRateLimit, 
  getAdInsightsWithRateLimit 
} from '@/lib/metaApiWithRateLimit';
import { useMetaData } from './useMetaData';
import { useMetricsConfig, MetricsConfig } from './useMetricsConfig';

export function useCampaignInsights(dateRange?: { since: string; until: string }) {
  const { credentials, campaigns } = useMetaData();
  const { config } = useMetricsConfig();

  const defaultDateRange = {
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    until: new Date().toISOString().split('T')[0]
  };

  return useQuery({
    queryKey: ['campaign-insights', campaigns.map(c => c.id), dateRange || defaultDateRange, config],
    queryFn: async () => {
      if (!credentials?.access_token || !campaigns || campaigns.length === 0) {
        return [];
      }

      try {
        const insights = await Promise.all(
          campaigns.map(campaign => 
            getCampaignInsightsWithRateLimit(
              credentials.access_token,
              campaign.id,
              dateRange || defaultDateRange
            ).catch(error => {
              console.error(`Erro ao buscar insights da campanha ${campaign.id}:`, error);
              return null;
            })
          )
        );
        
        return insights.filter(insight => insight !== null);
      } catch (error) {
        console.error('Error fetching campaign insights:', error);
        return [];
      }
    },
    enabled: !!credentials?.access_token && Array.isArray(campaigns) && campaigns.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Rate limit') || error?.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useAdSetInsights(dateRange?: { since: string; until: string }) {
  const { credentials, adSets } = useMetaData();
  const { config } = useMetricsConfig();

  const defaultDateRange = {
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    until: new Date().toISOString().split('T')[0]
  };

  return useQuery({
    queryKey: ['adset-insights', adSets.map(a => a.id), dateRange || defaultDateRange, config],
    queryFn: async () => {
      if (!credentials?.access_token || !adSets || adSets.length === 0) {
        return [];
      }

      try {
        const insights = await Promise.all(
          adSets.map(adSet =>
            getAdSetInsightsWithRateLimit(
              credentials.access_token,
              adSet.id,
              dateRange || defaultDateRange
            ).catch(error => {
              console.error(`Erro ao buscar insights do adset ${adSet.id}:`, error);
              return null;
            })
          )
        );

        return insights.filter(insight => insight !== null);
      } catch (error) {
        console.error('Error fetching adset insights:', error);
        return [];
      }
    },
    enabled: !!credentials?.access_token && Array.isArray(adSets) && adSets.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Rate limit') || error?.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useAdInsights(dateRange?: { since: string; until: string }) {
  const { credentials, ads } = useMetaData();
  const { config } = useMetricsConfig();

  const defaultDateRange = {
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    until: new Date().toISOString().split('T')[0]
  };

  return useQuery({
    queryKey: ['ad-insights', ads.map(a => a.id), dateRange || defaultDateRange, config],
    queryFn: async () => {
      if (!credentials?.access_token || !ads || ads.length === 0) {
        return [];
      }

      try {
        const insights = await Promise.all(
          ads.map(ad =>
            getAdInsightsWithRateLimit(
              credentials.access_token,
              ad.id,
              dateRange || defaultDateRange
            ).catch(error => {
              console.error(`Erro ao buscar insights do ad ${ad.id}:`, error);
              return null;
            })
          )
        );

        return insights.filter(insight => insight !== null);
      } catch (error) {
        console.error('Error fetching ad insights:', error);
        return [];
      }
    },
    enabled: !!credentials?.access_token && Array.isArray(ads) && ads.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Rate limit') || error?.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
