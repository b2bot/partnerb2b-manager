
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getMetaCredentials, getCampaigns, getAdSets } from '@/lib/metaApi';

interface HierarchicalFilterProps {
  selectedAccount: string;
  selectedCampaign?: string;
  selectedAdSet?: string;
  onCampaignChange?: (campaignId: string) => void;
  onAdSetChange?: (adSetId: string) => void;
  level: 'campaigns' | 'adsets' | 'ads';
  className?: string;
}

export function HierarchicalFilter({
  selectedAccount,
  selectedCampaign,
  selectedAdSet,
  onCampaignChange,
  onAdSetChange,
  level,
  className = ''
}: HierarchicalFilterProps) {
  const [internalCampaign, setInternalCampaign] = useState<string>(selectedCampaign || '');
  const [internalAdSet, setInternalAdSet] = useState<string>(selectedAdSet || '');

  const { data: credentials } = useQuery({
    queryKey: ['meta-credentials'],
    queryFn: getMetaCredentials,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', selectedAccount],
    queryFn: async () => {
      if (!credentials?.access_token || !selectedAccount) return [];
      try {
        return await getCampaigns(credentials.access_token, selectedAccount);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }
    },
    enabled: !!credentials?.access_token && !!selectedAccount && level !== 'campaigns',
  });

  const { data: adSets = [] } = useQuery({
    queryKey: ['adsets', selectedAccount, internalCampaign],
    queryFn: async () => {
      if (!credentials?.access_token || !selectedAccount) return [];
      try {
        return await getAdSets(credentials.access_token, selectedAccount);
      } catch (error) {
        console.error('Error fetching adsets:', error);
        return [];
      }
    },
    enabled: !!credentials?.access_token && !!selectedAccount && !!internalCampaign && level === 'ads',
  });

  // Reset subordinate filters when parent changes
  useEffect(() => {
    if (selectedAccount && internalCampaign && level === 'ads') {
      setInternalAdSet('');
    }
  }, [selectedAccount, internalCampaign, level]);

  const handleCampaignChange = (campaignId: string) => {
    setInternalCampaign(campaignId);
    setInternalAdSet(''); // Reset ad set when campaign changes
    onCampaignChange?.(campaignId);
  };

  const handleAdSetChange = (adSetId: string) => {
    setInternalAdSet(adSetId);
    onAdSetChange?.(adSetId);
  };

  const getFilteredAdSets = () => {
    if (!adSets || !Array.isArray(adSets) || !internalCampaign) return [];
    return adSets.filter(adSet => adSet.campaign_id === internalCampaign);
  };

  if (level === 'campaigns') {
    return null; // Campaigns page doesn't need additional filters
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Campaign Filter - Shows on AdSets and Ads pages */}
      {(level === 'adsets' || level === 'ads') && (
        <div className="space-y-2">
          <Label htmlFor="campaign-filter" className="text-sm font-medium">
            Filtrar por Campanha
          </Label>
          <div className="flex items-center gap-2">
            <Select value={internalCampaign} onValueChange={handleCampaignChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as campanhas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as campanhas</SelectItem>
                {campaigns && campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{campaign.name}</span>
                      <Badge 
                        variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {internalCampaign && campaigns && (
              <Badge variant="outline" className="whitespace-nowrap">
                {campaigns.find(c => c.id === internalCampaign)?.name}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Ad Set Filter - Shows only on Ads page */}
      {level === 'ads' && internalCampaign && (
        <div className="space-y-2">
          <Label htmlFor="adset-filter" className="text-sm font-medium">
            Filtrar por Grupo de Anúncio
          </Label>
          <div className="flex items-center gap-2">
            <Select value={internalAdSet} onValueChange={handleAdSetChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os grupos</SelectItem>
                {getFilteredAdSets().map((adSet) => (
                  <SelectItem key={adSet.id} value={adSet.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{adSet.name}</span>
                      <Badge 
                        variant={adSet.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {adSet.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {internalAdSet && (
              <Badge variant="outline" className="whitespace-nowrap">
                {getFilteredAdSets().find(a => a.id === internalAdSet)?.name}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
