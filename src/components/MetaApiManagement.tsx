
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, CheckCircle, XCircle, Activity, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { getMetaCredentials, saveMetaCredentials, testMetaConnection } from '@/lib/metaApi';
import { ApiMonitoring } from '@/components/ApiMonitoring';
import { useSystemLog } from '@/hooks/useSystemLog';

export function MetaApiManagement() {
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { logActivity } = useSystemLog();
  const queryClient = useQueryClient();

  const { data: credentials, isLoading } = useQuery({
    queryKey: ['meta-credentials'],
    queryFn: getMetaCredentials,
  });

  const { data: connectionStatus, refetch: checkConnection } = useQuery({
    queryKey: ['meta-connection-status'],
    queryFn: async () => {
      if (!credentials?.access_token) return false;
      return await testMetaConnection(credentials.access_token);
    },
    enabled: !!credentials?.access_token,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  const saveCredentialsMutation = useMutation({
    mutationFn: async () => {
      const result = await saveMetaCredentials(appId, appSecret, accessToken);
      await logActivity('api_credentials_updated', 'meta_api', {
        app_id: appId,
        has_token: !!accessToken
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['meta-connection-status'] });
      toast.success('Credenciais salvas com sucesso!');
      setIsEditing(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao salvar credenciais: ' + error.message);
    },
  });

  const resetForm = () => {
    setAppId('');
    setAppSecret('');
    setAccessToken('');
    setShowPassword(false);
  };

  const handleTestConnection = async () => {
    if (!credentials?.access_token) {
      toast.error('Nenhuma credencial encontrada');
      return;
    }

    try {
      const isValid = await testMetaConnection(credentials.access_token);
      if (isValid) {
        toast.success('Conexão testada com sucesso!');
        await logActivity('api_connection_tested', 'meta_api', { status: 'success' });
      } else {
        toast.error('Falha na conexão. Verifique suas credenciais.');
        await logActivity('api_connection_tested', 'meta_api', { status: 'failed' });
      }
      checkConnection();
    } catch (error) {
      toast.error('Erro ao testar conexão');
      await logActivity('api_connection_tested', 'meta_api', { status: 'error', error: error.message });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !appSecret || !accessToken) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    saveCredentialsMutation.mutate();
  };

  const isConnected = !!credentials && connectionStatus === true;
  const hasCredentials = !!credentials?.app_id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Gestão da API Meta</h1>
        <p className="text-slate-600 mt-2">
          Configure suas credenciais da Meta API e monitore o status da conexão
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Status da Conexão
              </CardTitle>
              <CardDescription>
                {isConnected 
                  ? 'API Meta conectada e funcionando'
                  : hasCredentials 
                    ? 'Credenciais configuradas, mas conexão com falha'
                    : 'Nenhuma credencial configurada'
                }
              </CardDescription>
            </div>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">App ID:</span>
              <p className="font-mono">{credentials?.app_id || 'Não configurado'}</p>
            </div>
            <div>
              <span className="text-slate-500">Última verificação:</span>
              <p>{credentials ? new Date().toLocaleString('pt-BR') : 'Nunca'}</p>
            </div>
          </div>
          
          {hasCredentials && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleTestConnection} size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Testar Conexão
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(!isEditing)} 
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancelar' : 'Alterar Credenciais'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="credentials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credentials">Credenciais</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-4">
          {!hasCredentials || isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {!hasCredentials ? 'Configurar API Meta' : 'Alterar Credenciais'}
                </CardTitle>
                <CardDescription>
                  {!hasCredentials 
                    ? 'Configure suas credenciais da Meta API para começar a usar a plataforma'
                    : 'Atualize suas credenciais da Meta API'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="appId">App ID</Label>
                    <Input
                      id="appId"
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="Digite o App ID da Meta"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appSecret">App Secret</Label>
                    <div className="relative">
                      <Input
                        id="appSecret"
                        type={showPassword ? "text" : "password"}
                        value={appSecret}
                        onChange={(e) => setAppSecret(e.target.value)}
                        placeholder="Digite o App Secret"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessToken">Access Token</Label>
                    <div className="relative">
                      <Input
                        id="accessToken"
                        type={showPassword ? "text" : "password"}
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="Digite o Access Token"
                        required
                      />
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Essas credenciais são armazenadas de forma segura e usadas apenas para conectar com a Meta API.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={saveCredentialsMutation.isPending}
                      className="flex-1"
                    >
                      {saveCredentialsMutation.isPending ? 'Salvando...' : 'Salvar Credenciais'}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Credenciais Configuradas</CardTitle>
                <CardDescription>
                  Suas credenciais da Meta API estão configuradas e prontas para uso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">App ID</h3>
                          <p className="text-sm text-gray-600 font-mono">
                            {showCredentials ? credentials.app_id : '••••••••••••'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCredentials(!showCredentials)}
                        >
                          {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium">Access Token</h3>
                      <p className="text-sm text-gray-600 font-mono">
                        {showCredentials ? credentials.access_token.substring(0, 20) + '...' : '••••••••••••••••••••...'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring">
          <ApiMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}
