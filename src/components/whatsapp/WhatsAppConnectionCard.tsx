
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Settings 
} from 'lucide-react';
import { useWhatsAppConfig } from '@/hooks/useWhatsAppConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function WhatsAppConnectionCard() {
  const { config, loading, updateConfig, testConnection } = useWhatsAppConfig();
  const [showConfig, setShowConfig] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({
    phone_number_id: '',
    access_token: '',
    business_account_id: '',
  });

  const handleTest = async () => {
    setTesting(true);
    await testConnection();
    setTesting(false);
  };

  const handleSave = async () => {
    await updateConfig(formData);
    setShowConfig(false);
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />;
    
    switch (config?.status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (config?.status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">WhatsApp Business API</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Dialog open={showConfig} onOpenChange={setShowConfig}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Configurar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuração WhatsApp Business API</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      value={formData.phone_number_id}
                      onChange={(e) => setFormData({...formData, phone_number_id: e.target.value})}
                      placeholder="Digite o Phone Number ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      value={formData.access_token}
                      onChange={(e) => setFormData({...formData, access_token: e.target.value})}
                      placeholder="Digite o Access Token"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessAccountId">Business Account ID (Opcional)</Label>
                    <Input
                      id="businessAccountId"
                      value={formData.business_account_id}
                      onChange={(e) => setFormData({...formData, business_account_id: e.target.value})}
                      placeholder="Digite o Business Account ID"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      Salvar Configuração
                    </Button>
                    <Button variant="outline" onClick={() => setShowConfig(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium">
                Status da Conexão: {config?.status === 'connected' ? 'Autenticado' : 'Não conectado'}
              </p>
              {config?.last_verified_at && (
                <p className="text-xs text-gray-500">
                  Última verificação: {new Date(config.last_verified_at).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          
          {config && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Testar Conexão
            </Button>
          )}
        </div>

        {config?.status !== 'connected' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">WhatsApp não conectado</p>
                <p>Configure suas credenciais da API do WhatsApp Business para começar a enviar mensagens automatizadas.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
