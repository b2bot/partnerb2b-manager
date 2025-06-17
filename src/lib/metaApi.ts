import { supabase } from '@/integrations/supabase/client';

export interface MetaCredentials {
  app_id: string;
  app_secret: string;
  access_token: string;
}

export interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  timezone_name: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time: string;
  updated_time: string;
  account_id: string;
}

export interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  targeting: any;
  created_time: string;
  updated_time: string;
  account_id: string;
}

export interface Ad {
  id: string;
  name: string;
  adset_id: string;
  status: string;
  creative: any;
  created_time: string;
  updated_time: string;
  account_id: string;
}

export interface CampaignInsights {
  campaign_id: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpm: number;
  cpc: number;
  ctr: number;
  reach: number;
  frequency: number;
  actions?: any[];
  cost_per_action_type?: any[];
}

export interface AdCreative {
  id: string;
  name: string;
  object_story_spec: any;
  image_hash?: string;
  video_id?: string;
}

const META_API_BASE = 'https://graph.facebook.com/v18.0';

export async function saveMetaCredentials(appId: string, appSecret: string, accessToken: string) {
  const { data, error } = await supabase
    .from('meta_api_credentials')
    .upsert([{ 
      app_id: appId, 
      app_secret: appSecret, 
      access_token: accessToken 
    }], { 
      onConflict: 'id' 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMetaCredentials(): Promise<MetaCredentials | null> {
  const { data, error } = await supabase
    .from('meta_api_credentials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function testMetaConnection(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${META_API_BASE}/me?access_token=${accessToken}`);
    const data = await response.json();
    return !data.error;
  } catch (error) {
    console.error('Error testing Meta connection:', error);
    return false;
  }
}

export async function getAdAccounts(accessToken: string): Promise<AdAccount[]> {
  try {
    const fields = 'id,name,account_id,account_status,currency,timezone_name';
    const response = await fetch(`${META_API_BASE}/me/adaccounts?fields=${fields}&access_token=${accessToken}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching ad accounts:', error);
    throw error;
  }
}

export async function getCampaigns(accessToken: string, adAccountId: string): Promise<Campaign[]> {
  try {
    const fields = 'id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time';
    const response = await fetch(
      `${META_API_BASE}/${adAccountId}/campaigns?fields=${fields}&access_token=${accessToken}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return (data.data || []).map((campaign: any) => ({
      ...campaign,
      account_id: adAccountId
    }));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
}

export async function getAdSets(accessToken: string, adAccountId: string): Promise<AdSet[]> {
  try {
    const fields = 'id,name,campaign_id,status,daily_budget,lifetime_budget,targeting,created_time,updated_time';
    const response = await fetch(
      `${META_API_BASE}/${adAccountId}/adsets?fields=${fields}&access_token=${accessToken}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return (data.data || []).map((adSet: any) => ({
      ...adSet,
      account_id: adAccountId
    }));
  } catch (error) {
    console.error('Error fetching ad sets:', error);
    throw error;
  }
}

export async function getAds(accessToken: string, adAccountId: string): Promise<Ad[]> {
  try {
    const fields = 'id,name,adset_id,status,creative,created_time,updated_time';
    const response = await fetch(
      `${META_API_BASE}/${adAccountId}/ads?fields=${fields}&access_token=${accessToken}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return (data.data || []).map((ad: any) => ({
      ...ad,
      account_id: adAccountId
    }));
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
}

export async function getCampaignInsights(
  accessToken: string, 
  campaignId: string, 
  dateRange: { since: string; until: string }
): Promise<CampaignInsights | null> {
  try {
    const fields = 'impressions,clicks,spend,cpm,cpc,ctr,reach,frequency,actions,cost_per_action_type';
    const response = await fetch(
      `${META_API_BASE}/${campaignId}/insights?fields=${fields}&time_range=${JSON.stringify(dateRange)}&access_token=${accessToken}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    if (data.data && data.data.length > 0) {
      return {
        campaign_id: campaignId,
        ...data.data[0]
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching campaign insights:', error);
    throw error;
  }
}

export async function getAdSetInsights(
  accessToken: string, 
  adSetId: string, 
  dateRange: { since: string; until: string }
): Promise<any | null> {
  try {
    const fields = 'impressions,clicks,spend,cpm,cpc,ctr,reach,frequency,actions,cost_per_action_type';
    const response = await fetch(
      `${META_API_BASE}/${adSetId}/insights?fields=${fields}&time_range=${JSON.stringify(dateRange)}&access_token=${accessToken}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    if (data.data && data.data.length > 0) {
      return {
        id: adSetId,
        ...data.data[0]
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching ad set insights:', error);
    throw error;
  }
}

export async function getAdInsights(
  accessToken: string, 
  adId: string, 
  dateRange: { since: string; until: string }
): Promise<any | null> {
  try {
    const fields = 'impressions,clicks,spend,cpm,cpc,ctr,reach,frequency,actions,cost_per_action_type';
    const response = await fetch(
      `${META_API_BASE}/${adId}/insights?fields=${fields}&time_range=${JSON.stringify(dateRange)}&access_token=${accessToken}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    if (data.data && data.data.length > 0) {
      return {
        id: adId,
        ...data.data[0]
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching ad insights:', error);
    throw error;
  }
}

export async function getAdAccountInsights(
  accessToken: string, 
  adAccountId: string, 
  dateRange: { since: string; until: string }
) {
  try {
    const fields = 'impressions,clicks,spend,cpm,cpc,ctr,reach,frequency,actions,cost_per_action_type';
    const response = await fetch(
      `${META_API_BASE}/${adAccountId}/insights?fields=${fields}&time_range=${JSON.stringify(dateRange)}&access_token=${accessToken}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching ad account insights:', error);
    throw error;
  }
}

export async function uploadImage(accessToken: string, adAccountId: string, imageFile: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('source', imageFile);
    formData.append('access_token', accessToken);

    const response = await fetch(`${META_API_BASE}/${adAccountId}/adimages`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    const imageHash = Object.keys(data.images)[0];
    return imageHash;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function createAdCreative(
  accessToken: string,
  adAccountId: string,
  creativeData: {
    name: string;
    object_story_spec: any;
  }
): Promise<AdCreative> {
  try {
    const formData = new FormData();
    formData.append('name', creativeData.name);
    formData.append('object_story_spec', JSON.stringify(creativeData.object_story_spec));
    formData.append('access_token', accessToken);

    const response = await fetch(`${META_API_BASE}/${adAccountId}/adcreatives`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error creating ad creative:', error);
    throw error;
  }
}

export async function updateCampaign(
  accessToken: string,
  campaignId: string,
  updates: Partial<Pick<Campaign, 'name' | 'status' | 'daily_budget' | 'lifetime_budget'>>
) {
  try {
    const formData = new FormData();
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    formData.append('access_token', accessToken);

    const response = await fetch(`${META_API_BASE}/${campaignId}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
}

export async function updateAdSet(
  accessToken: string,
  adSetId: string,
  updates: Partial<Pick<AdSet, 'name' | 'status' | 'daily_budget' | 'lifetime_budget'>>
) {
  try {
    const formData = new FormData();
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    formData.append('access_token', accessToken);

    const response = await fetch(`${META_API_BASE}/${adSetId}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error updating ad set:', error);
    throw error;
  }
}

export async function updateAd(
  accessToken: string,
  adId: string,
  updates: Partial<Pick<Ad, 'name' | 'status'>>
) {
  try {
    const formData = new FormData();
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    formData.append('access_token', accessToken);

    const response = await fetch(`${META_API_BASE}/${adId}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error updating ad:', error);
    throw error;
  }
}

export async function createCampaign(
  accessToken: string,
  adAccountId: string,
  campaignData: {
    name: string;
    objective: string;
    status: string;
    special_ad_categories: string[];
    daily_budget?: string;
    lifetime_budget?: string;
  }
) {
  try {
    const formData = new FormData();
    Object.entries(campaignData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'special_ad_categories') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    formData.append('access_token', accessToken);

    const response = await fetch(`${META_API_BASE}/${adAccountId}/campaigns`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

export async function createAdSet(
  accessToken: string,
  adAccountId: string,
  adSetData: {
    name: string;
    campaign_id: string;
    status: string;
    daily_budget?: string;
    lifetime_budget?: string;
    targeting: any;
    billing_event: string;
    optimization_goal: string;
  }
) {
  try {
    const formData = new FormData();
    Object.entries(adSetData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'targeting') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    formData.append('access_token', accessToken);

    const response = await fetch(`${META_API_BASE}/${adAccountId}/adsets`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error creating ad set:', error);
    throw error;
  }
}

export async function createAd(
  accessToken: string,
  adAccountId: string,
  adData: {
    name: string;
    adset_id: string;
    creative: { creative_id: string };
    status: string;
  }
) {
  try {
    const formData = new FormData();
    Object.entries(adData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'creative') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    formData.append('access_token', accessToken);

    const response = await fetch(`${META_API_BASE}/${adAccountId}/ads`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
}
