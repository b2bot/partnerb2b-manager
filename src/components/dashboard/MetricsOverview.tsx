
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard_ui/card';
import { TrendingUp, TrendingDown, Target, DollarSign, Eye, MousePointer } from 'lucide-react';
import { SheetRow } from '@/hooks/dashboard_hooks/useSheetData';

interface MetricsOverviewProps {
  data: SheetRow[];
}

const MetricsOverview = ({ data }: MetricsOverviewProps) => {
  const totalImpressions = data.reduce((sum, row) => sum + row.impressions, 0);
  const totalClicks = data.reduce((sum, row) => sum + row.clicks, 0);
  const totalSpent = data.reduce((sum, row) => sum + row.amountSpent, 0);
  const totalConversations = data.reduce(
    (sum, row) => sum + (row.actionMessagingConversationsStarted || 0),
    0
  );
  
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const metrics = [
    {
      title: 'Gasto Total',
      value: `R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Impressões',
      value: totalImpressions.toLocaleString('pt-BR'),
      change: '+8.3%',
      trend: 'up',
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'CTR Médio',
      value: `${ctr.toFixed(2)}%`,
      change: '-0.2%',
      trend: 'down',
      icon: MousePointer,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Conversas Iniciadas',
      value: totalConversations.toLocaleString('pt-BR'),
      change: '+18.9%',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {metric.value}
                </div>
                <div className="flex items-center mt-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsOverview;
