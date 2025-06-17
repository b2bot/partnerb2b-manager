
import { makeMetaApiCall } from './rateLimit';
import * as metaApi from './metaApi';

// Wrappers com rate limiting para todas as funções principais da Meta API
export async function getAdAccountsWithRateLimit(accessToken: string) {
  return makeMetaApiCall(
    () => metaApi.getAdAccounts(accessToken),
    `ad_accounts_${accessToken.slice(-8)}`
  );
}

export async function getCampaignsWithRateLimit(accessToken: string, adAccountId: string) {
  return makeMetaApiCall(
    () => metaApi.getCampaigns(accessToken, adAccountId),
    `campaigns_${adAccountId}`
  );
}

export async function getAdSetsWithRateLimit(accessToken: string, adAccountId: string) {
  return makeMetaApiCall(
    () => metaApi.getAdSets(accessToken, adAccountId),
    `adsets_${adAccountId}`
  );
}

export async function getAdsWithRateLimit(accessToken: string, adAccountId: string) {
  return makeMetaApiCall(
    () => metaApi.getAds(accessToken, adAccountId),
    `ads_${adAccountId}`
  );
}

export async function getCampaignInsightsWithRateLimit(
  accessToken: string,
  campaignId: string,
  dateRange: { since: string; until: string }
) {
  const cacheKey = `campaign_insights_${campaignId}_${dateRange.since}_${dateRange.until}`;
  return makeMetaApiCall(
    () => metaApi.getCampaignInsights(accessToken, campaignId, dateRange),
    cacheKey
  );
}

export async function getAdAccountInsightsWithRateLimit(
  accessToken: string,
  adAccountId: string,
  dateRange: { since: string; until: string }
) {
  const cacheKey = `account_insights_${adAccountId}_${dateRange.since}_${dateRange.until}`;
  return makeMetaApiCall(
    () => metaApi.getAdAccountInsights(accessToken, adAccountId, dateRange),
    cacheKey
  );
}

// Funções que estavam faltando para AdSets e Ads insights
export async function getAdSetInsightsWithRateLimit(
  accessToken: string,
  adSetId: string,
  dateRange: { since: string; until: string }
) {
  const cacheKey = `adset_insights_${adSetId}_${dateRange.since}_${dateRange.until}`;
  return makeMetaApiCall(
    () => metaApi.getAdSetInsights(accessToken, adSetId, dateRange),
    cacheKey
  );
}

export async function getAdInsightsWithRateLimit(
  accessToken: string,
  adId: string,
  dateRange: { since: string; until: string }
) {
  const cacheKey = `ad_insights_${adId}_${dateRange.since}_${dateRange.until}`;
  return makeMetaApiCall(
    () => metaApi.getAdInsights(accessToken, adId, dateRange),
    cacheKey
  );
}

// Funções de modificação (não precisam de cache, mas precisam de rate limiting)
export async function updateCampaignWithRateLimit(
  accessToken: string,
  campaignId: string,
  updates: any
) {
  return makeMetaApiCall(
    () => metaApi.updateCampaign(accessToken, campaignId, updates)
  );
}

export async function updateAdSetWithRateLimit(
  accessToken: string,
  adSetId: string,
  updates: any
) {
  return makeMetaApiCall(
    () => metaApi.updateAdSet(accessToken, adSetId, updates)
  );
}

export async function updateAdWithRateLimit(
  accessToken: string,
  adId: string,
  updates: any
) {
  return makeMetaApiCall(
    () => metaApi.updateAd(accessToken, adId, updates)
  );
}

// Re-export outras funções que não precisam de rate limiting
export * from './metaApi';
