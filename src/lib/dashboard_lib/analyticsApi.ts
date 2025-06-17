export interface AnalyticsParams {
  token: string
  propertyId: string
  metrics?: string[]
  dateRange?: { from: string; to: string }
}

export async function fetchAnalyticsData(params: AnalyticsParams) {
  const { token, propertyId, metrics = ['activeUsers'], dateRange } = params
  const metricStr = metrics.map(m => `metrics=${m}`).join('&')
  const dateStr = dateRange ? `&dateRanges.startDate=${dateRange.from}&dateRanges.endDate=${dateRange.to}` : ''
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport?${metricStr}${dateStr}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Analytics API error')
  const json = await res.json()
  return json.rows || []
}
