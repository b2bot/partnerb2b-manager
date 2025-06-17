
import { useQuery } from '@tanstack/react-query';

const parseNumber = (value: string): number => {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
};

export interface SheetRow {
  accountName: string;
  campaignName: string;
  adSetName: string;
  adName: string;
  impressions: number;
  clicks: number;
  amountSpent: number;
  cpm: number;
  cpc: number;
  ctr: number;
  actionMessagingConversationsStarted: number;
  costPerActionMessagingConversations: number;
  actionLinkClicks: number;
  reach: number;
  frequency: number;
  messagingConversations: number;


  // Google Ads specific fields
  conversions?: number;
  callAdConversionAction?: number;
  costPerConversion?: number;
  adStatus?: string;
  adGroupStatus?: string;
  campaignStatus?: string;
  conversionsFromInteractionsRate?: number;

  // LinkedIn specific fields
  reactions?: number;
  campaignGroupName?: string;
  campaignFormat?: string;
  campaignLocaleCountry?: string;
  campaignTotalBudgetAmount?: number;
  landingPageClicks?: number;
  textUrlClicks?: number;
  jobApplications?: number;

  // Relatórios specific fields
  contatos?: number;
  agendado?: number;
  atendimento?: number;
  orcamentos?: number;
  vendas?: number;
  faturado?: number;
  responsavel?: string;
  observacoes?: string;
  submissionDate?: string;
  
  devicePlatform: string;
  conversionDevice: string;
  adCreativeName: string;

  thumbnailUrl: string;
  day: string;
  [key: string]: unknown;
}

const fetchData = async (platform: string, sheetId: string, sheetRange: string): Promise<SheetRow[]> => {
  const apiBase = import.meta.env.VITE_GSHEETS_API_URL;
  const url = `${apiBase}/api/read?sheetId=${sheetId}&range=${sheetRange}`;
  const response = await fetch(url);
  const json = await response.json();

  if (!json.data || !Array.isArray(json.data)) {
    throw new Error('Formato inválido de dados do Google Sheets');
  }

  return json.data.map((row: Record<string, string>) => ({
    ...row,
    impressions: parseNumber(row.impressions),
    clicks: parseNumber(row.clicks),
    amountSpent: parseNumber(row.amountSpent),
    cpm: parseNumber(row.cpm),
    cpc: parseNumber(row.cpc),
    ctr: parseNumber(row.ctr),
    actionMessagingConversationsStarted: parseNumber(row.actionMessagingConversationsStarted),
    costPerActionMessagingConversations: parseNumber(row.costPerActionMessagingConversations),
    actionLinkClicks: parseNumber(row.actionLinkClicks),
    reach: parseNumber(row.reach),
    frequency: parseNumber(row.frequency),
    messagingConversations: parseNumber(row.messagingConversations),
  }));
};

export const useSheetData = (
  sheetId: string,
  range: string = 'Meta!A1:Z',
  clientId?: string
) => {
  return useQuery({
    queryKey: ['sheetData', sheetId, range, clientId],
    queryFn: async (): Promise<SheetRow[]> => {
      const response = await fetch(
        `https://gsheets-api-1bdv.vercel.app/api/sheets?sheetId=${sheetId}&range=${range}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sheet data');
      }

      const json = await response.json();
      const rawData: string[][] = Array.isArray(json?.data) ? json.data : [];

      if (rawData.length === 0) return [];

      const headers = rawData[0];
      const rows = rawData.slice(1);

      return rows.map((row: string[]) => {
        const mappedRow: Record<string, unknown> = {};
        
        headers.forEach((header: string, index: number) => {
          const value = row[index] || '';
          const headerKey = header.toLowerCase();

          // Mapear colunas específicas utilizando o nome exato do cabeçalho
          switch (headerKey) {
            case 'account name':
              mappedRow.accountName = value;
              break;
            case 'campaign name':
              mappedRow.campaignName = value;
              break;
            case 'adset name':
              mappedRow.adSetName = value;
              break;
            case 'ad name':
              mappedRow.adName = value;
              break;
            case 'impressions':
              mappedRow.impressions = parseNumber(value);
              break;
            case 'clicks':
              mappedRow.clicks = parseNumber(value);
              break;
            case 'spend (cost, amount spent)':
            case 'amount spent':
              mappedRow.amountSpent = parseNumber(value);
              break;
            case 'cpm (cost per 1000 impressions)':
            case 'cpm':
              mappedRow.cpm = parseNumber(value);
              break;
            case 'cpc (cost per click)':
            case 'cpc':
              mappedRow.cpc = parseNumber(value);
              break;
            case 'ctr (clickthrough rate)':
            case 'ctr':
              mappedRow.ctr = parseNumber(value);
              break;
            case 'action messaging conversations started (onsite conversion)':
              mappedRow.actionMessagingConversationsStarted = parseNumber(value);
              mappedRow.messagingConversations = parseNumber(value);
              break;
            case 'cost per action messaging conversations started (onsite conversion)':
              mappedRow.costPerActionMessagingConversations = parseNumber(value);
              break;
            case 'action link clicks':
              mappedRow.actionLinkClicks = parseNumber(value);
              break;
            case 'conversions':
              mappedRow.conversions = parseNumber(value);
              break;
            case 'call ad conversion action':
              mappedRow.callAdConversionAction = parseNumber(value);
              break;
            case 'cost per conversion':
              mappedRow.costPerConversion = parseNumber(value);
              break;
            case 'ad status':
              mappedRow.adStatus = value;
              break;
            case 'ad group status':
              mappedRow.adGroupStatus = value;
              break;
            case 'campaign status':
              mappedRow.campaignStatus = value;
              break;
            case 'conversions from interactions rate':
              mappedRow.conversionsFromInteractionsRate = parseNumber(value);
              break;
            case 'ad analytics reactions':
              mappedRow.reactions = parseNumber(value);
              break;
            case 'campaign group name':
              mappedRow.campaignGroupName = value;
              break;
            case 'campaign format':
              mappedRow.campaignFormat = value;
              break;
            case 'campaign locale country':
              mappedRow.campaignLocaleCountry = value;
              break;
            case 'campaign total budget amount':
              mappedRow.campaignTotalBudgetAmount = parseNumber(value);
              break;
            case 'ad analytics landing page clicks':
              mappedRow.landingPageClicks = parseNumber(value);
              break;
            case 'ad analytics text url clicks':
              mappedRow.textUrlClicks = parseNumber(value);
              break;
            case 'ad analytics job applications':
              mappedRow.jobApplications = parseNumber(value);
              break;
            case 'contatos':
              mappedRow.contatos = parseNumber(value);
              break;
            case 'agendado':
              mappedRow.agendado = parseNumber(value);
              break;
            case 'atendimento':
              mappedRow.atendimento = parseNumber(value);
              break;
            case 'or\u00e7amentos':
            case 'orcamentos':
              mappedRow.orcamentos = parseNumber(value);
              break;
            case 'vendas':
              mappedRow.vendas = parseNumber(value);
              break;
            case 'faturado':
              mappedRow.faturado = parseNumber(value);
              break;
            case 'respons\u00e1vel':
            case 'responsavel':
              mappedRow.responsavel = value;
              break;
            case 'observa\u00e7\u00f5es':
            case 'observacoes':
              mappedRow.observacoes = value;
              break;
            case 'data de envio':
            case 'submission date':
              mappedRow.submissionDate = value;
              break;
            case 'messaging conversations':
              mappedRow.messagingConversations = parseNumber(value);
              break;
            case 'device platform':
              mappedRow.devicePlatform = value;
              break;
            case 'conversion device':
              mappedRow.conversionDevice = value;
              break;
            case 'reach':
              mappedRow.reach = parseNumber(value);
              break;
            case 'frequency':
              mappedRow.frequency = parseNumber(value);
              break;
            case 'ad creative name':
              mappedRow.adCreativeName = value;
              break;
            case 'thumbnail url':
              mappedRow.thumbnailUrl = value;
              break;
            case 'day':
            case 'date':
            case 'date (segment)':
              mappedRow.day = value;
              break;
            default:
              // Manter outras colunas como estão
              mappedRow[header] = value;
          }
        });

        return mappedRow as SheetRow;
      });

      // 🔐 Se tiver clientId, filtra os dados
      if (clientId) {
        const { data: contas, error } = await supabase
          .from('contas')
          .select('identificador')
          .eq('cliente_id', clientId);

        if (error) {
          console.error('Erro ao buscar contas permitidas:', error.message);
          return [];
        }

        const contasPermitidas = contas?.map((c) => c.identificador) || [];
        return parsedData.filter((row) =>
          contasPermitidas.includes(row.accountName)
        );
      }

      // Sem clientId, retorna tudo
      return parsedData;
    },
    enabled: !!sheetId,
  });
};