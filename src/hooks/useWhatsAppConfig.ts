import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppConfig {
  id: string;
  phone_number_id: string;
  access_token: string;
  business_account_id?: string;
  status: 'connected' | 'disconnected' | 'error' | string;
  last_verified_at?: string;
}

export function useWhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Força o fallback para tipagem local
      setConfig(data ? {
        id: data.id,
        phone_number_id: data.phone_number_id,
        access_token: data.access_token,
        business_account_id: data.business_account_id ?? "",
        status: (data.status === 'connected' || data.status === 'disconnected' || data.status === 'error') ? data.status : 'disconnected',
        last_verified_at: data.last_verified_at ?? "",
      } : null);
    } catch (error: any) {
      console.error('Error fetching WhatsApp config:', {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração do WhatsApp. Verifique as permissões da tabela.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (configData: Partial<WhatsAppConfig>) => {
    try {
      // Garantir que os campos obrigatórios estão presentes para upsert
      const upsertData = {
        phone_number_id: configData.phone_number_id || '',
        access_token: configData.access_token || '',
        business_account_id: configData.business_account_id,
        status: configData.status,
        last_verified_at: configData.last_verified_at,
        ...(configData.id && { id: configData.id }),
      };

      const { data, error } = await supabase
        .from('whatsapp_config')
        .upsert(upsertData)
        .select()
        .single();

      if (error) throw error;

      setConfig(data ? {
        id: data.id,
        phone_number_id: data.phone_number_id,
        access_token: data.access_token,
        business_account_id: data.business_account_id ?? "",
        status: (data.status === 'connected' || data.status === 'disconnected' || data.status === 'error') ? data.status : 'disconnected',
        last_verified_at: data.last_verified_at ?? "",
      } : null);
      toast({
        title: "Sucesso",
        description: "Configuração do WhatsApp atualizada",
      });
    } catch (error) {
      console.error('Error updating WhatsApp config:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive",
      });
    }
  };

  const testConnection = async () => {
    if (!config) return false;

    try {
      // Simulação de teste de conexão
      const isConnected = true; // TODO: chamada real API WhatsApp
      await updateConfig({
        ...config,
        status: isConnected ? 'connected' : 'error',
        last_verified_at: new Date().toISOString(),
      });

      return isConnected;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    updateConfig,
    testConnection,
    refetch: fetchConfig,
  };
}
