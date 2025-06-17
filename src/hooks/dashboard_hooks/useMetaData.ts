import { useQuery } from '@tanstack/react-query';
import { fetchMetaData, MetaParams } from '@/lib/dashboard_lib/metaApi';

export const useMetaData = (params: MetaParams) => {
  return useQuery({
    queryKey: ['metaData', params],
    queryFn: () => fetchMetaData(params),
    enabled: Boolean(params.token) && Boolean(params.accountId),
  });
};