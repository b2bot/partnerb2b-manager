import { useQuery } from '@tanstack/react-query'
import { fetchAnalyticsData, AnalyticsParams } from '@/lib/dashboard_lib/analyticsApi'

export const useAnalyticsData = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: ['analyticsData', params],
    queryFn: () => fetchAnalyticsData(params),
    enabled: Boolean(params.token) && Boolean(params.propertyId),
  })
}
