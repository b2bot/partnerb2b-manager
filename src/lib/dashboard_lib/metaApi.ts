export interface MetaParams {
  token: string;
  accountId: string;
  fields?: string[];
  dateRange?: { from: string; to: string };
}

export async function fetchMetaData(params: MetaParams) {
  const { token, accountId, fields = ['impressions','clicks','spend'], dateRange } = params;
  const search = new URLSearchParams();
  search.set('access_token', token);
  search.set('fields', fields.join(','));
  if (dateRange) {
    search.set('time_range', JSON.stringify({ since: dateRange.from, until: dateRange.to }));
  }
  const res = await fetch(`https://graph.facebook.com/v19.0/act_${accountId}/insights?${search.toString()}`);
  if (!res.ok) throw new Error('Meta API error');
  const json = await res.json();
  return json.data || [];
}