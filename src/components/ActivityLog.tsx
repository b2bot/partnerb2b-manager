
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Play, 
  Pause, 
  Archive, 
  Upload, 
  MessageSquare,
  User,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityLogEntry {
  id: string;
  action: string;
  entity_type: 'campaign' | 'adset' | 'ad' | 'creative' | 'ticket' | 'client';
  entity_id: string;
  entity_name: string;
  user_id: string | null;
  user_name: string;
  created_at: string;
  details?: any;
}

export function ActivityLog() {
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }
      return data as ActivityLogEntry[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CAMPAIGN_CREATED':
      case 'ADSET_CREATED':
      case 'AD_CREATED':
        return <Play className="w-4 h-4 text-green-600" />;
      case 'CAMPAIGN_PAUSED':
      case 'ADSET_PAUSED':
      case 'AD_PAUSED':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'CAMPAIGN_ARCHIVED':
      case 'ADSET_ARCHIVED':
      case 'AD_ARCHIVED':
        return <Archive className="w-4 h-4 text-slate-600" />;
      case 'CREATIVE_UPLOADED':
        return <Upload className="w-4 h-4 text-blue-600" />;
      case 'TICKET_CREATED':
      case 'TICKET_RESPONDED':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'CLIENT_CREATED':
        return <User className="w-4 h-4 text-indigo-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'CAMPAIGN_CREATED': 'Campanha criada',
      'CAMPAIGN_PAUSED': 'Campanha pausada',
      'CAMPAIGN_ARCHIVED': 'Campanha arquivada',
      'ADSET_CREATED': 'Conjunto criado',
      'ADSET_PAUSED': 'Conjunto pausado',
      'ADSET_ARCHIVED': 'Conjunto arquivado',
      'AD_CREATED': 'Anúncio criado',
      'AD_PAUSED': 'Anúncio pausado',
      'AD_ARCHIVED': 'Anúncio arquivado',
      'CREATIVE_UPLOADED': 'Criativo enviado',
      'TICKET_CREATED': 'Chamado aberto',
      'TICKET_RESPONDED': 'Chamado respondido',
      'CLIENT_CREATED': 'Cliente criado',
    };
    return labels[action] || action;
  };

  const getEntityTypeLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      'campaign': 'Campanha',
      'adset': 'Conjunto',
      'ad': 'Anúncio',
      'creative': 'Criativo',
      'ticket': 'Chamado',
      'client': 'Cliente',
    };
    return labels[entityType] || entityType;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Log de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            Log de Atividades
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {getActionLabel(log.action)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getEntityTypeLabel(log.entity_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      <span className="font-medium">{log.entity_name}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Nenhuma atividade registrada</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
