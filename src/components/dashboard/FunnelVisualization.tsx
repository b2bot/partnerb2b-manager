
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard_ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard_ui/select';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';
import { usePlatformNavigation } from '@/hooks/dashboard_hooks/usePlatformNavigation';

interface FunnelVisualizationProps {
  data: SheetRow[];
}

const defaultMetricOptions = [
  { value: 'impressions', label: 'Impressões' },
  { value: 'clicks', label: 'Cliques' },
  { value: 'actionLinkClicks', label: 'Link Clicks' },
  { value: 'actionMessagingConversationsStarted', label: 'Conversas' },
  { value: 'messagingConversations', label: 'Mensagens' },
];

const formatNumber = (num: number) =>
  num ? new Intl.NumberFormat('pt-BR').format(num) : '0';
const formatCurrency = (num: number) =>
  num
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
    : 'R$ 0,00';

const FunnelVisualization = ({ data }: FunnelVisualizationProps) => {
  const { platform } = usePlatformNavigation();
  const metricOptions = React.useMemo(() => {
    if (platform === 'google') {
      return [
        { value: 'impressions', label: 'Impressões' },
        { value: 'clicks', label: 'Cliques' },
        { value: 'conversions', label: 'Conversões' },
      ];
    }
    if (platform === 'relatorios') {
      return [
        { value: 'contatos', label: 'Contatos' },
        { value: 'agendado', label: 'Agendado' },
        { value: 'vendas', label: 'Vendas' },
      ];
    }
    return defaultMetricOptions;
  }, [platform]);

  const [topMetric, setTopMetric] = useState(metricOptions[0].value);
  const [middleMetric, setMiddleMetric] = useState(metricOptions[1].value);
  const [bottomMetric, setBottomMetric] = useState(metricOptions[2].value);

  const totals = useMemo(() => {
    const sum = (field: keyof SheetRow) =>
      data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);

    return {
      impressions: sum('impressions'),
      clicks: sum('clicks'),
      actionLinkClicks: sum('actionLinkClicks'),
      actionMessagingConversationsStarted: sum('actionMessagingConversationsStarted'),
      messagingConversations: sum('messagingConversations'),
      conversions: sum('conversions'),
      contatos: sum('contatos'),
      agendado: sum('agendado'),
      vendas: sum('vendas'),
      amountSpent: sum('amountSpent'),
    };
  }, [data]);

  const topValue = totals[topMetric as keyof typeof totals] || 0;
  const middleValue = totals[middleMetric as keyof typeof totals] || 0;
  const bottomValue = totals[bottomMetric as keyof typeof totals] || 0;

  const conversionRate = (current: number, previous: number) => {
    if (previous === 0) return '0.0';
    const rate = (current / previous) * 100;
    return rate.toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    });
  };

  const Block = ({
    label,
    value,
    color,
    widthClass,
  }: {
    label: string;
    value: number;
    color: string;
    widthClass: string;
  }) => (
    <div className="flex flex-col items-center space-y-1 mb-2">
      <div
        className={`relative h-24 flex flex-col items-center justify-center text-white ${color} ${widthClass}`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)' }}
      >
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold">{formatNumber(value)}</span>
        <span className="text-xs">{formatCurrency(totals.amountSpent / (value || 1))}</span>
      </div>
    </div>
  );

  return (
    <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="flex justify-between items-center gap-2 pb-2">
          <div className="flex flex-col items-start text-xs gap-1 text-gray-500 font-normal">
            <span className="font-medium">Topo</span>
            <Select value={topMetric} onValueChange={setTopMetric}>
              <SelectTrigger className="h-8 w-28 text-xs bg-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start text-xs gap-1 text-gray-500 font-normal">
            <span className="font-medium">Meio</span>
            <Select value={middleMetric} onValueChange={setMiddleMetric}>
              <SelectTrigger className="h-8 w-28 text-xs bg-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start text-xs gap-1 text-gray-500 font-normal">
            <span className="font-medium">Fundo</span>
            <Select value={bottomMetric} onValueChange={setBottomMetric}>
              <SelectTrigger className="h-8 w-28 text-xs bg-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Block label={metricOptions.find(o => o.value === topMetric)?.label || topMetric}
          value={topValue}
          color="bg-blue-600"
          widthClass="w-full"
        />

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          {conversionRate(middleValue, topValue)}% Conversão
        </div>

        <Block label={metricOptions.find(o => o.value === middleMetric)?.label || middleMetric}
          value={middleValue}
          color="bg-green-600"
          widthClass="w-4/5"
        />

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          {conversionRate(bottomValue, middleValue)}% Conversão
        </div>

        <Block label={metricOptions.find(o => o.value === bottomMetric)?.label || bottomMetric}
          value={bottomValue}
          color="bg-purple-600"
          widthClass="w-3/5"
        />
      </CardContent>
    </Card>
  );
};

export default FunnelVisualization;
