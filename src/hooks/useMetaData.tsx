import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getMetaCredentials,
  getAdAccountsWithRateLimit,
  getCampaignsWithRateLimit,
  getAdSetsWithRateLimit,
  getAdsWithRateLimit,
  getCampaignInsightsWithRateLimit
} from '@/lib/metaApiWithRateLimit';
import { useGlobalAdAccount } from './useGlobalAdAccount';
import { useUserAccess } from './useUserAccess';
import { useToast } from '@/hooks/use-toast';

export function useMetaData() {
  const { selectedAdAccount, selectedAdAccountName, setSelectedAdAccount } = useGlobalAdAccount();
  const { getAccessibleMetaAccounts, isAdmin } = useUserAccess();
  const { toast } = useToast();
  
  const { data: credentials, isLoading: credentialsLoading, error: credentialsError } = useQuery({
    queryKey: ['meta-credentials'],
    queryFn: async () => {
      console.log('Buscando credenciais Meta...');
      const creds = await getMetaCredentials();
      console.log('Credenciais encontradas:', creds ? 'Sim' : 'Não');
      return creds;
    },
    retry: 2,
    retryDelay: 1000,
  });

  const { data: adAccounts, isLoading: loadingAdAccounts, error: adAccountsError } = useQuery({
    queryKey: ['ad-accounts', credentials?.access_token],
    queryFn: async () => {
      if (!credentials?.access_token) {
        console.log('Sem access token para buscar contas');
        return [];
      }
      
      console.log('Buscando contas de anúncios com rate limiting...');
      try {
        const accounts = await getAdAccountsWithRateLimit(credentials.access_token);
        console.log('Contas encontradas:', accounts.length);
        return accounts;
      } catch (error: any) {
        console.error('Erro ao buscar contas:', error);
        
        // Exibir toast específico para rate limit
        if (error.message?.includes('Rate limit') || error.message?.includes('Aguarde')) {
          toast({
            title: 'API Meta - Rate Limit',
            description: error.message,
            variant: 'destructive',
          });
        }
        
        throw error;
      }
    },
    enabled: !!credentials?.access_token,
    retry: (failureCount, error: any) => {
      // Não retry em case de rate limit
      if (error.message?.includes('Rate limit') || error.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  // Filtrar contas baseado no acesso do usuário
  const accessibleAccounts = isAdmin 
    ? adAccounts 
    : adAccounts?.filter(account => {
        const userMetaAccounts = getAccessibleMetaAccounts();
        return userMetaAccounts?.includes(account.id);
      });

  const { data: campaigns, isLoading: loadingCampaigns, refetch: refetchCampaigns } = useQuery({
    queryKey: ['campaigns', credentials?.access_token, selectedAdAccount],
    queryFn: () => getCampaignsWithRateLimit(credentials!.access_token, selectedAdAccount),
    enabled: !!credentials?.access_token && !!selectedAdAccount,
    retry: (failureCount, error: any) => {
      if (error.message?.includes('Rate limit') || error.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  const { data: adSets, isLoading: loadingAdSets, refetch: refetchAdSets } = useQuery({
    queryKey: ['adsets', credentials?.access_token, selectedAdAccount],
    queryFn: () => getAdSetsWithRateLimit(credentials!.access_token, selectedAdAccount),
    enabled: !!credentials?.access_token && !!selectedAdAccount,
    retry: (failureCount, error: any) => {
      if (error.message?.includes('Rate limit') || error.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  const { data: ads, isLoading: loadingAds, refetch: refetchAds } = useQuery({
    queryKey: ['ads', credentials?.access_token, selectedAdAccount],
    queryFn: () => getAdsWithRateLimit(credentials!.access_token, selectedAdAccount),
    enabled: !!credentials?.access_token && !!selectedAdAccount,
    retry: (failureCount, error: any) => {
      if (error.message?.includes('Rate limit') || error.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  // Auto-select first accessible ad account if available and none is selected
  useEffect(() => {
    if (accessibleAccounts && accessibleAccounts.length > 0 && !selectedAdAccount) {
      console.log('Auto-selecionando primeira conta disponível:', accessibleAccounts[0].name);
      setSelectedAdAccount(accessibleAccounts[0].id, accessibleAccounts[0].name);
    }
  }, [accessibleAccounts, selectedAdAccount, setSelectedAdAccount]);

  const handleSetSelectedAdAccount = (accountId: string) => {
    const account = accessibleAccounts?.find(acc => acc.id === accountId);
    if (account) {
      console.log('Selecionando conta:', account.name);
      setSelectedAdAccount(accountId, account.name);
    }
  };

  // Log para debug
  useEffect(() => {
    console.log('Meta Data Debug:', {
      hasCredentials: !!credentials,
      credentialsLoading,
      credentialsError: credentialsError?.message,
      adAccountsCount: adAccounts?.length || 0,
      accessibleAccountsCount: accessibleAccounts?.length || 0,
      loadingAdAccounts,
      adAccountsError: adAccountsError?.message,
      selectedAdAccount,
      isAdmin
    });
  }, [credentials, credentialsLoading, credentialsError, adAccounts, accessibleAccounts, loadingAdAccounts, adAccountsError, selectedAdAccount, isAdmin]);

  return {
    credentials,
    adAccounts: accessibleAccounts || [],
    selectedAdAccount,
    selectedAdAccountName,
    setSelectedAdAccount: handleSetSelectedAdAccount,
    campaigns: campaigns || [],
    adSets: adSets || [],
    ads: ads || [],
    loading: {
      credentials: credentialsLoading,
      adAccounts: loadingAdAccounts,
      campaigns: loadingCampaigns,
      adSets: loadingAdSets,
      ads: loadingAds,
    },
    refetch: {
      campaigns: refetchCampaigns,
      adSets: refetchAdSets,
      ads: refetchAds,
    },
    errors: {
      credentials: credentialsError,
      adAccounts: adAccountsError,
    }
  };
}

// Hook para insights de campanha específica com rate limiting
export function useCampaignInsights(campaignId: string, dateRange: { since: string; until: string }) {
  const { credentials } = useMetaData();
  
  return useQuery({
    queryKey: ['campaign-insights', campaignId, dateRange, credentials?.access_token],
    queryFn: () => getCampaignInsightsWithRateLimit(credentials!.access_token, campaignId, dateRange),
    enabled: !!credentials?.access_token && !!campaignId,
    retry: (failureCount, error: any) => {
      if (error.message?.includes('Rate limit') || error.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
}
