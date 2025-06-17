
import { useQuery } from '@tanstack/react-query';
import { getAdAccountInsights } from '@/lib/metaApi';
import { useMetaData } from '@/hooks/useMetaData';

export function useAccountInsights(dateRange?: { since: string; until: string }) {
  const { credentials, selectedAdAccount } = useMetaData();

  const defaultDateRange = {
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    until: new Date().toISOString().split('T')[0]
  };

  return useQuery({
    queryKey: ['account-insights', selectedAdAccount, dateRange || defaultDateRange, credentials?.access_token],
    queryFn: () => getAdAccountInsights(
      credentials!.access_token, 
      selectedAdAccount, 
      dateRange || defaultDateRange
    ),
    enabled: !!credentials?.access_token && !!selectedAdAccount,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Rate limit') || error?.message?.includes('Aguarde')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
