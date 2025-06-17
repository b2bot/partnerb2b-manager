import { supabase } from '@/integrations/supabase/client';

const META_API_BASE = 'https://graph.facebook.com/v18.0';

export interface MetricInsights {
  id: string;
  name: string;
  impressions?: number;
  reach?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  spend?: number;
  conversions?: number;
  purchases?: number;
  frequency?: number;
  actions?: any[];
  cost_per_action_type?: any[];
  video_views?: number;
  video_view_rate?: number;
  cost_per_video_view?: number;
  unique_clicks?: number;
  unique_ctr?: number;
  cost_per_unique_click?: number;
  website_clicks?: number;
  link_clicks?: number;
  post_engagement?: number;
  page_engagement?: number;
  post_reactions?: number;
  comment?: number;
  share?: number;
  like?: number;
  photo_view?: number;
  video_play?: number;
  canvas_avg_view_time?: number;
  canvas_avg_view_percent?: number;
  unique_inline_link_clicks?: number;
  inline_link_clicks?: number;
  inline_post_engagement?: number;
  cost_per_inline_link_click?: number;
  cost_per_inline_post_engagement?: number;
  outbound_clicks?: number;
  cost_per_outbound_click?: number;
  unique_outbound_clicks?: number;
  cost_per_unique_outbound_click?: number;
}

// Todas as métricas disponíveis da Meta API organizadas por categoria
export const AVAILABLE_METRICS = {
  basic: [
    'impressions',
    'reach', 
    'clicks',
    'unique_clicks',
    'spend',
    'ctr',
    'unique_ctr',
    'cpc',
    'cost_per_unique_click',
    'cpm',
    'frequency'
  ],
  engagement: [
    'post_engagement',
    'page_engagement', 
    'post_reactions',
    'comment',
    'share',
    'like',
    'photo_view'
  ],
  video: [
    'video_views',
    'video_view_rate',
    'cost_per_video_view',
    'video_play',
    'canvas_avg_view_time',
    'canvas_avg_view_percent'
  ],
  conversions: [
    'conversions',
    'purchases',
    'actions',
    'cost_per_action_type'
  ],
  traffic: [
    'website_clicks',
    'link_clicks',
    'unique_inline_link_clicks',
    'inline_link_clicks',
    'inline_post_engagement',
    'cost_per_inline_link_click',
    'cost_per_inline_post_engagement',
    'outbound_clicks',
    'cost_per_outbound_click',
    'unique_outbound_clicks',
    'cost_per_unique_outbound_click'
  ]
};

// Função para obter todas as métricas disponíveis
export const getAllAvailableMetrics = () => {
  return Object.values(AVAILABLE_METRICS).flat();
};

// Função para buscar insights de campanhas
export async function getCampaignInsights(
  accessToken: string,
  campaignIds: string[],
  dateRange: { since: string; until: string },
  fields: string[] = []
): Promise<MetricInsights[]> {
  try {
    const metricsFields = fields.length > 0 ? fields : getAllAvailableMetrics();
    const fieldsString = metricsFields.join(',');
    
    const insights = await Promise.all(
      campaignIds.map(async (campaignId) => {
        const response = await fetch(
          `${META_API_BASE}/${campaignId}/insights?fields=${fieldsString}&time_range=${JSON.stringify(dateRange)}&access_token=${accessToken}`
        );
        const data = await response.json();
        
        if (data.error) {
          console.error(`Error fetching insights for campaign ${campaignId}:`, data.error);
          return null;
        }
        
        if (data.data && data.data.length > 0) {
          return {
            id: campaignId,
            ...data.data[0]
          };
        }
        return null;
      })
    );
    
    return insights.filter(insight => insight !== null) as MetricInsights[];
  } catch (error) {
    console.error('Error fetching campaign insights:', error);
    throw error;
  }
}

// Função para buscar insights de adsets
export async function getAdSetInsights(
  accessToken: string,
  adSetIds: string[],
  dateRange: { since: string; until: string },
  fields: string[] = []
): Promise<MetricInsights[]> {
  try {
    const metricsFields = fields.length > 0 ? fields : getAllAvailableMetrics();
    const fieldsString = metricsFields.join(',');
    
    const insights = await Promise.all(
      adSetIds.map(async (adSetId) => {
        const response = await fetch(
          `${META_API_BASE}/${adSetId}/insights?fields=${fieldsString}&time_range=${JSON.stringify(dateRange)}&access_token=${accessToken}`
        );
        const data = await response.json();
        
        if (data.error) {
          console.error(`Error fetching insights for adset ${adSetId}:`, data.error);
          return null;
        }
        
        if (data.data && data.data.length > 0) {
          return {
            id: adSetId,
            ...data.data[0]
          };
        }
        return null;
      })
    );
    
    return insights.filter(insight => insight !== null) as MetricInsights[];
  } catch (error) {
    console.error('Error fetching adset insights:', error);
    throw error;
  }
}

// Função para buscar insights de ads
export async function getAdInsights(
  accessToken: string,
  adIds: string[],
  dateRange: { since: string; until: string },
  fields: string[] = []
): Promise<MetricInsights[]> {
  try {
    const metricsFields = fields.length > 0 ? fields : getAllAvailableMetrics();
    const fieldsString = metricsFields.join(',');
    
    const insights = await Promise.all(
      adIds.map(async (adId) => {
        const response = await fetch(
          `${META_API_BASE}/${adId}/insights?fields=${fieldsString}&time_range=${JSON.stringify(dateRange)}&access_token=${accessToken}`
        );
        const data = await response.json();
        
        if (data.error) {
          console.error(`Error fetching insights for ad ${adId}:`, data.error);
          return null;
        }
        
        if (data.data && data.data.length > 0) {
          return {
            id: adId,
            ...data.data[0]
          };
        }
        return null;
      })
    );
    
    return insights.filter(insight => insight !== null) as MetricInsights[];
  } catch (error) {
    console.error('Error fetching ad insights:', error);
    throw error;
  }
}

// Função para buscar criativo de um anúncio
export async function getAdCreativeImage(
  accessToken: string,
  adId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${META_API_BASE}/${adId}?fields=creative{image_url,image_hash,object_story_spec}&access_token=${accessToken}`
    );
    const data = await response.json();
    
    if (data.error) {
      console.error(`Error fetching creative for ad ${adId}:`, data.error);
      return null;
    }
    
    if (data.creative) {
      // Tentar extrair URL da imagem de diferentes formas
      if (data.creative.image_url) {
        return data.creative.image_url;
      }
      
      if (data.creative.object_story_spec?.link_data?.image_hash) {
        return `https://graph.facebook.com/v18.0/${data.creative.object_story_spec.link_data.image_hash}?access_token=${accessToken}`;
      }
      
      if (data.creative.image_hash) {
        return `https://graph.facebook.com/v18.0/${data.creative.image_hash}?access_token=${accessToken}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching ad creative image:', error);
    return null;
  }
}

// Função para formatar valores de métricas - VERSÃO EXPANDIDA
export const formatMetricValue = (data: any, key: string): string => {
  if (!data || data[key] === null || data[key] === undefined) return '-';
  
  const value = data[key];
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '-';
  
  switch (key) {
    // Valores monetários
    case 'spend':
    case 'cpc':
    case 'cost_per_unique_click':
    case 'cpm':
    case 'cost_per_video_view':
    case 'cost_per_result':
    case 'cost_per_conversion':
    case 'cost_per_purchase':
    case 'cost_per_inline_link_click':
    case 'cost_per_inline_post_engagement':
    case 'cost_per_outbound_click':
    case 'cost_per_unique_outbound_click':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numValue);
    
    // Percentuais
    case 'ctr':
    case 'unique_ctr':
    case 'video_view_rate':
    case 'conversion_rate':
    case 'canvas_avg_view_percent':
      return `${numValue.toFixed(2)}%`;
    
    // Números decimais
    case 'frequency':
    case 'canvas_avg_view_time':
      return numValue.toFixed(2);
    
    // Números inteiros grandes (com separadores)
    case 'impressions':
    case 'reach':
    case 'clicks':
    case 'unique_clicks':
    case 'conversions':
    case 'results':
    case 'purchases':
    case 'leads':
    case 'post_engagement':
    case 'page_engagement':
    case 'post_reactions':
    case 'comment':
    case 'share':
    case 'like':
    case 'photo_view':
    case 'video_views':
    case 'video_play_actions':
    case 'link_clicks':
    case 'outbound_clicks':
    case 'unique_outbound_clicks':
    case 'website_clicks':
    case 'unique_inline_link_clicks':
    case 'inline_link_clicks':
    case 'inline_post_engagement':
      return new Intl.NumberFormat('pt-BR').format(Math.round(numValue));
    
    default:
      return new Intl.NumberFormat('pt-BR').format(Math.round(numValue));
  }
};

// Função para obter nome amigável da métrica - VERSÃO EXPANDIDA
export const getMetricDisplayName = (key: string): string => {
  const displayNames: { [key: string]: string } = {
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
    post_reactions: 'Reações da Publicação',
    comment: 'Comentários',
    share: 'Compartilhamentos',
    like: 'Curtidas',
    photo_view: 'Visualizações de Foto',
    video_views: 'Visualizações de Vídeo',
    video_view_rate: 'Taxa de Visualização de Vídeo',
    cost_per_video_view: 'Custo por Visualização de Vídeo',
    video_play_actions: 'Reproduções de Vídeo',
    canvas_avg_view_time: 'Tempo Médio de Visualização',
    canvas_avg_view_percent: 'Porcentagem Média de Visualização',
    website_clicks: 'Cliques no Site',
    link_clicks: 'Cliques no Link',
    unique_inline_link_clicks: 'Cliques Únicos em Link Inline',
    inline_link_clicks: 'Cliques em Link Inline',
    inline_post_engagement: 'Engajamento Inline da Publicação',
    cost_per_inline_link_click: 'Custo por Clique em Link Inline',
    cost_per_inline_post_engagement: 'Custo por Engajamento Inline',
    outbound_clicks: 'Cliques Externos',
    cost_per_outbound_click: 'Custo por Clique Externo',
    unique_outbound_clicks: 'Cliques Externos Únicos',
    cost_per_unique_outbound_click: 'Custo por Clique Externo Único'
  };
  
  return displayNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
};
