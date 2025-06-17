
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, Database, AlertTriangle, RefreshCw } from 'lucide-react';
import { rateLimitManager } from '@/lib/rateLimit';

export function ApiMonitoring() {
  const [stats, setStats] = useState(rateLimitManager.getStats());
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newStats = rateLimitManager.getStats();
      setStats(newStats);
      setCountdown(Math.ceil(newStats.nextCallTime / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    const usage = (stats.callCount / stats.maxCalls) * 100;
    if (stats.isBlocked || usage >= 90) return 'destructive';
    if (usage >= 70) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (stats.isBlocked) return 'Bloqueado';
    const usage = (stats.callCount / stats.maxCalls) * 100;
    if (usage >= 90) return 'Crítico';
    if (usage >= 70) return 'Atenção';
    return 'Normal';
  };

  const handleClearCache = () => {
    rateLimitManager.clearCache();
    setStats(rateLimitManager.getStats());
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Geral */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Status da API</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor()}>
                {getStatusText()}
              </Badge>
              {stats.isBlocked && (
                <span className="text-xs text-red-600">
                  Retry em {countdown}s
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chamadas por Hora */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Chamadas/Hora</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{stats.callCount}</span>
                <span className="text-slate-500">/ {stats.maxCalls}</span>
              </div>
              <Progress 
                value={(stats.callCount / stats.maxCalls) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cache */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4" />
              <span className="text-sm font-medium">Cache</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">{stats.cacheSize}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                className="h-6 px-2 text-xs"
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Próximo Reset */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Reset em</span>
            </div>
            <div className="text-sm">
              {formatTime(stats.resetTime)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes e Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monitoramento da API Meta</CardTitle>
          <CardDescription>
            Controle de rate limiting e cache para evitar bloqueios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.isBlocked && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">API Temporariamente Bloqueada</p>
                  <p className="text-sm text-red-600">
                    Aguarde {countdown} segundos antes da próxima tentativa.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Configurações de Rate Limit</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>• Intervalo mínimo: 15 segundos</li>
                  <li>• Máximo por hora: {stats.maxCalls} chamadas</li>
                  <li>• Cache: 5 minutos</li>
                  <li>• Retry após bloqueio: 30 segundos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Status Atual</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>• Chamadas realizadas: {stats.callCount}</li>
                  <li>• Próxima chamada: {countdown > 0 ? `${countdown}s` : 'Disponível'}</li>
                  <li>• Itens em cache: {stats.cacheSize}</li>
                  <li>• Reset do contador: {formatTime(stats.resetTime)}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
