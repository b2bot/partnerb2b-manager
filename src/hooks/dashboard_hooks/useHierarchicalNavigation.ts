
import { useState } from 'react';
import { CampaignGroup, AdSetGroup } from './useHierarchicalData';

export type ViewLevel = 'campaigns' | 'adsets' | 'ads';

export const useHierarchicalNavigation = () => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignGroup | null>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<AdSetGroup | null>(null);

  const handleCampaignClick = (campaign: CampaignGroup) => {
    setSelectedCampaign(campaign);
    setViewLevel('adsets');
  };

  const handleAdSetClick = (adSet: AdSetGroup) => {
    setSelectedAdSet(adSet);
    setViewLevel('ads');
  };

  const handleBackToCampaigns = () => {
    setViewLevel('campaigns');
    setSelectedCampaign(null);
    setSelectedAdSet(null);
  };

  const handleBackToAdSets = () => {
    setViewLevel('adsets');
    setSelectedAdSet(null);
  };

  const resetNavigation = () => {
    setViewLevel('campaigns');
    setSelectedCampaign(null);
    setSelectedAdSet(null);
  };

  return {
    viewLevel,
    selectedCampaign,
    selectedAdSet,
    handleCampaignClick,
    handleAdSetClick,
    handleBackToCampaigns,
    handleBackToAdSets,
    resetNavigation,
  };
};
