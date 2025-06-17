
import { useMemo } from 'react';
import { SheetRow } from './useSheetData';

export interface CampaignGroup {
  campaignName: string;
  adSets: AdSetGroup[];
  totalImpressions: number;
  totalClicks: number;
  totalSpent: number;
  totalConversions: number;
  totalActionLinkClicks: number;
  totalFrequency: number;
}

export interface AdSetGroup {
  adSetName: string;
  campaignName: string;
  ads: AdGroup[];
  totalImpressions: number;
  totalClicks: number;
  totalSpent: number;
  totalConversions: number;
  totalActionLinkClicks: number;
  totalFrequency: number;
}

export interface AdGroup {
  id: string;
  name: string;
  adSetName: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spent: number;
  conversions: number;
  actionLinkClicks: number;
  frequency: number;
}

export const useHierarchicalData = (data: SheetRow[]) => {
  const campaignGroups = useMemo(() => {
    const groups: Record<string, CampaignGroup> = {};

    data.forEach(row => {
      if (!row.campaignName) return;
      
      if (!groups[row.campaignName]) {
        groups[row.campaignName] = {
          campaignName: row.campaignName,
          adSets: [],
          totalImpressions: 0,
          totalClicks: 0,
          totalSpent: 0,
          totalConversions: 0,
          totalActionLinkClicks: 0,
          totalFrequency: 0,
        };
      }

      const campaign = groups[row.campaignName];
      campaign.totalImpressions += row.impressions || 0;
      campaign.totalClicks += row.clicks || 0;
      campaign.totalSpent += row.amountSpent || 0;
      campaign.totalConversions += row.actionMessagingConversationsStarted || 0;
      campaign.totalActionLinkClicks += row.actionLinkClicks || 0;
      campaign.totalFrequency += row.frequency || 0;

      // Find or create ad set
      let adSet = campaign.adSets.find(as => as.adSetName === row.adSetName);
      if (!adSet && row.adSetName) {
        adSet = {
          adSetName: row.adSetName,
          campaignName: row.campaignName,
          ads: [],
          totalImpressions: 0,
          totalClicks: 0,
          totalSpent: 0,
          totalConversions: 0,
          totalActionLinkClicks: 0,
          totalFrequency: 0,
        };
        campaign.adSets.push(adSet);
      }

      if (adSet) {
        adSet.totalImpressions += row.impressions || 0;
        adSet.totalClicks += row.clicks || 0;
        adSet.totalSpent += row.amountSpent || 0;
        adSet.totalConversions += row.actionMessagingConversationsStarted || 0;
        adSet.totalActionLinkClicks += row.actionLinkClicks || 0;
        adSet.totalFrequency += row.frequency || 0;

        // Create ad entry if adName exists
        if (row.adName) {
          const existingAd = adSet.ads.find(ad => ad.name === row.adName);
          if (!existingAd) {
            adSet.ads.push({
              id: `${row.adSetName}-${row.adName}`,
              name: row.adName,
              adSetName: row.adSetName,
              campaignName: row.campaignName,
              impressions: row.impressions || 0,
              clicks: row.clicks || 0,
              spent: row.amountSpent || 0,
              conversions: row.actionMessagingConversationsStarted || 0,
              actionLinkClicks: row.actionLinkClicks || 0,
              frequency: row.frequency || 0,
            });
          }
        }
      }
    });

    return Object.values(groups);
  }, [data]);

  return { campaignGroups };
};
