
import React from 'react';
import { Card, CardContent } from '@/components/dashboard_ui/card';
import { Badge } from '@/components/dashboard_ui/badge';
import { TrendingUp, TrendingDown, Eye, MousePointer, DollarSign, Users, Target, Zap, Repeat } from 'lucide-react';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';
import { TabSection, usePlatformNavigation } from '@/hooks/dashboard_hooks/usePlatformNavigation';
import { useSettings } from '@/hooks/dashboard_hooks/useSettings';

interface MetricsGridProps {
  data: SheetRow[];
  section?: TabSection;
}

const MetricsGrid = ({ data, section = 'campanhas' }: MetricsGridProps) => {
  const { platform } = usePlatformNavigation();
  const { settings } = useSettings();
  const totalImpressions = data.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const totalClicks = data.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const totalInvestment = data.reduce((sum, row) => sum + (row.amountSpent || 0), 0);
  const totalConversions = data.reduce(
    (sum, row) =>
      sum +
      (row.actionMessagingConversationsStarted ||
        row.conversions ||
        0),
    0
  );
  const totalCostPerConversion =
    data.length > 0
      ? data.reduce(
          (sum, row) =>
            sum +
            (row.costPerActionMessagingConversations || row.costPerConversion || 0),
          0
        ) / data.length
      : 0;
  const totalActionLinkClicks = data.reduce(
    (sum, row) => sum + (row.actionLinkClicks || row.landingPageClicks || 0),
    0
  );
  const totalFrequency = data.reduce((sum, row) => sum + (row.frequency || 0), 0);
  const totalCallAdConversion = data.reduce(
    (sum, row) => sum + (row.callAdConversionAction || 0),
    0
  );
  const totalContatos = data.reduce((sum, row) => sum + (row.contatos || 0), 0);
  const totalAgendado = data.reduce((sum, row) => sum + (row.agendado || 0), 0);
  const totalAtendimento = data.reduce((sum, row) => sum + (row.atendimento || 0), 0);
  const totalOrcamentos = data.reduce((sum, row) => sum + (row.orcamentos || 0), 0);
  const totalVendas = data.reduce((sum, row) => sum + (row.vendas || 0), 0);
  const totalFaturado = data.reduce((sum, row) => sum + (row.faturado || 0), 0);
  
  let conversionRate = 0;
  if (platform === 'relatorios') {
    conversionRate = totalAtendimento > 0 ? (totalVendas / totalAtendimento) * 100 : 0;
  } else {
    conversionRate = totalActionLinkClicks > 0 ? (totalConversions / totalActionLinkClicks) * 100 : 0;
  }

  const formatNumber = (num: number) => num ? new Intl.NumberFormat('pt-BR').format(num) : '0';
  const formatCurrency = (num: number) => num ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num) : 'R$ 0,00';
  const formatPercentage = (num: number) => num ? `${num.toFixed(2)}%` : '0,00%';
  const formatFrequency = (num: number) =>
    num ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) : '0,00';

  let metrics;

  if (platform === 'google') {
    metrics = [
      { title: 'Impressões', value: formatNumber(totalImpressions), icon: Eye, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: '', trendUp: true },
      { title: 'Cliques', value: formatNumber(totalClicks), icon: MousePointer, color: 'text-green-600', bgColor: 'bg-green-50', trend: '', trendUp: true },
      { title: 'Custo', value: formatCurrency(totalInvestment), icon: DollarSign, color: 'text-red-600', bgColor: 'bg-red-50', trend: '', trendUp: true },
      { title: 'Conversões', value: formatNumber(totalConversions), icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50', trend: '', trendUp: true },
      { title: 'Custo/Conversão', value: formatCurrency(totalCostPerConversion), icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-50', trend: '', trendUp: true },
      { title: 'Call Ad', value: formatNumber(totalCallAdConversion), icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50', trend: '', trendUp: true },
    ];
  } else if (platform === 'linkedin') {
    metrics = [
      { title: 'Impressões', value: formatNumber(totalImpressions), icon: Eye, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: '', trendUp: true },
      { title: 'Cliques', value: formatNumber(totalClicks), icon: MousePointer, color: 'text-green-600', bgColor: 'bg-green-50', trend: '', trendUp: true },
      { title: 'Custo', value: formatCurrency(totalInvestment), icon: DollarSign, color: 'text-red-600', bgColor: 'bg-red-50', trend: '', trendUp: true },
      { title: 'CTR', value: formatPercentage(data.length > 0 ? (totalClicks / totalImpressions) * 100 : 0), icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50', trend: '', trendUp: true },
      { title: 'CPC', value: formatCurrency(totalClicks > 0 ? totalInvestment / totalClicks : 0), icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-50', trend: '', trendUp: true },
      { title: 'CPM', value: formatCurrency(totalImpressions > 0 ? (totalInvestment / totalImpressions) * 1000 : 0), icon: Repeat, color: 'text-purple-600', bgColor: 'bg-purple-50', trend: '', trendUp: true },
    ];
  } else if (platform === 'relatorios') {
    metrics = [
      { title: 'Contatos', value: formatNumber(totalContatos), icon: Eye, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: '', trendUp: true },
      { title: 'Agendado', value: formatNumber(totalAgendado), icon: MousePointer, color: 'text-green-600', bgColor: 'bg-green-50', trend: '', trendUp: true },
      { title: 'Atendimento', value: formatNumber(totalAtendimento), icon: DollarSign, color: 'text-red-600', bgColor: 'bg-red-50', trend: '', trendUp: true },
      { title: 'Orçamentos', value: formatNumber(totalOrcamentos), icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50', trend: '', trendUp: true },
      { title: 'Vendas', value: formatNumber(totalVendas), icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-50', trend: '', trendUp: true },
      { title: 'Faturado', value: formatCurrency(totalFaturado), icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50', trend: '', trendUp: true },
    ];
  } else {
    const campaignMetrics = [
      {
        title: 'Impressões',
        value: formatNumber(totalImpressions),
        icon: Eye,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        trend: '+12.5%',
        trendUp: true,
      },
      {
        title: 'Cliques',
        value: formatNumber(totalClicks),
        icon: MousePointer,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        trend: '+8.2%',
        trendUp: true,
      },
      {
        title: 'Investimento',
        value: formatCurrency(totalInvestment),
        icon: DollarSign,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        trend: '+3.1%',
        trendUp: true,
      },
      {
        title: 'Conversões',
        value: formatNumber(totalConversions),
        icon: Target,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        trend: '+15.7%',
        trendUp: true,
      },
      {
        title: 'Taxa de Conversão',
        value: formatPercentage(conversionRate),
        icon: Users,
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        trend: '+0.8%',
        trendUp: true,
      },
      {
        title: 'Custo/Conversão',
        value: formatCurrency(totalCostPerConversion),
        icon: Zap,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        trend: '-2.1%',
        trendUp: false,
      },
    ];

    const groupMetrics = [
      {
        title: 'Impressões',
        value: formatNumber(totalImpressions),
        icon: Eye,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        trend: '+12.5%',
        trendUp: true,
      },
      {
        title: 'Cliques',
        value: formatNumber(totalClicks),
        icon: MousePointer,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        trend: '+8.2%',
        trendUp: true,
      },
      {
        title: 'Frequência',
        value: formatFrequency(totalFrequency / (data.length || 1)),
        icon: Repeat,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        trend: '+3.1%',
        trendUp: true,
      },
      {
        title: 'Conversões',
        value: formatNumber(totalConversions),
        icon: Target,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        trend: '+15.7%',
        trendUp: true,
      },
      {
        title: 'Taxa de Conversão',
        value: formatPercentage(conversionRate),
        icon: Users,
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        trend: '+0.8%',
        trendUp: true,
      },
      {
        title: 'Custo/Conversão',
        value: formatCurrency(totalCostPerConversion),
        icon: Zap,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        trend: '-2.1%',
        trendUp: false,
      },
    ];

    metrics = section === 'campanhas' ? campaignMetrics : groupMetrics;
  }
  

  const order = settings.platforms[platform]?.metrics;
  if (order && order.length) {
    metrics = metrics
      .filter(m => order.includes(m.title))
      .sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trendUp ? TrendingUp : TrendingDown;
        
        return (
          <Card 
            key={index} 
            className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-[1.02]"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={`${metric.trendUp ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'} transition-all duration-200 group-hover:scale-105`}
                  >
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {metric.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsGrid;
