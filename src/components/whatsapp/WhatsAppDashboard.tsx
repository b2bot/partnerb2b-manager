
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Eye,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  todaySent: number;
  activeCampaigns: number;
}

export function WhatsAppDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalRead: 0,
    todaySent: 0,
    activeCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Buscar métricas das mensagens
      const { data: messages, error: messagesError } = await supabase
        .from('whatsapp_messages')
        .select('status, sent_at');

      if (messagesError) throw messagesError;

      // Buscar campanhas ativas
      const { data: campaigns, error: campaignsError } = await supabase
        .from('whatsapp_campaigns')
        .select('id')
        .eq('is_active', true);

      if (campaignsError) throw campaignsError;

      const today = new Date().toDateString();
      
      const totalSent = messages?.filter(m => m.status !== 'pending').length || 0;
      const totalDelivered = messages?.filter(m => m.status === 'delivered').length || 0;
      const totalFailed = messages?.filter(m => m.status === 'failed').length || 0;
      const totalRead = messages?.filter(m => m.status === 'read').length || 0;
      const todaySent = messages?.filter(m => 
        m.sent_at && new Date(m.sent_at).toDateString() === today
      ).length || 0;

      setMetrics({
        totalSent,
        totalDelivered,
        totalFailed,
        totalRead,
        todaySent,
        activeCampaigns: campaigns?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Enviadas Hoje',
      value: metrics.todaySent,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Enviadas',
      value: metrics.totalSent,
      icon: MessageSquare,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Entregues',
      value: metrics.totalDelivered,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Falharam',
      value: metrics.totalFailed,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Visualizadas',
      value: metrics.totalRead,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Campanhas Ativas',
      value: metrics.activeCampaigns,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-600 font-medium">{card.title}</p>
                <p className="text-lg font-bold">{card.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
