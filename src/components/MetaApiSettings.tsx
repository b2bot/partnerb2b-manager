
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Key, RefreshCw } from 'lucide-react';

export function MetaApiSettings() {
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: credentials, isLoading } = useQuery({
    queryKey: ['meta-api-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meta_api_credentials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: { app_id: string; app_secret: string; access_token: string }) => {
      const { error } = await supabase
        .from('meta_api_credentials')
        .upsert(data, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Credenciais salvas",
        description: "As credenciais da Meta API foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['meta-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['meta-api-settings'] });
      // Limpar os campos após o sucesso
      setAppId('');
      setAppSecret('');
      setAccessToken('');
    },
    onError: (error) => {
      console.error('Error updating credentials:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as credenciais. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appId || !appSecret || !accessToken) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    updateCredentialsMutation.mutate({
      app_id: appId,
      app_secret: appSecret,
      access_token: accessToken,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configurações da Meta API
          </CardTitle>
          <CardDescription>
            Configure as credenciais para conectar com a API do Meta Business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app-id">App ID</Label>
              <Input
                id="app-id"
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="Digite o App ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-secret">App Secret</Label>
              <Input
                id="app-secret"
                type="password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder="Digite o App Secret"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-token">Access Token</Label>
              <Input
                id="access-token"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Digite o Access Token"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={updateCredentialsMutation.isPending}
              className="w-full"
            >
              {updateCredentialsMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Credenciais'
              )}
            </Button>
          </form>

          {credentials && (
            <Alert className="mt-4">
              <AlertDescription>
                Última atualização: {new Date(credentials.created_at).toLocaleString('pt-BR')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
