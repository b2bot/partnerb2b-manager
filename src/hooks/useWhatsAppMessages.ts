
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppMessage {
  id: string;
  phone_number: string;
  message_type: string;
  message_content?: string;
  template_name?: string;
  template_variables?: Record<string, string>;
  status: string;
  campaign_id?: string;
  contact_id?: string;
  template_id?: string;
  whatsapp_message_id?: string;
  error_message?: string;
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
}

// Função utilitária para garantir que template_variables sempre seja um Record<string, string>
function fixTemplateVariables(data: any): WhatsAppMessage {
  let tplVars = data.template_variables;
  if (!tplVars) {
    tplVars = {};
  } else if (typeof tplVars === 'string') {
    try {
      const parsed = JSON.parse(tplVars);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        tplVars = parsed;
      } else {
        tplVars = {};
      }
    } catch {
      tplVars = {};
    }
  } else if (typeof tplVars !== 'object' || Array.isArray(tplVars)) {
    tplVars = {};
  }
  return {
    ...data,
    template_variables: tplVars,
  };
}

export interface SendMessageParams {
  phoneNumber: string;
  templateName: string;
  templateVariables: Record<string, string>;
  contactId?: string;
  campaignId?: string;
}

export function useWhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async (filters: {
    status?: string;
    dateRange?: [Date, Date];
    campaignId?: string;
    contactId?: string;
  } = {}) => {
    try {
      let query = supabase
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId);
      }

      if (filters.contactId) {
        query = query.eq('contact_id', filters.contactId);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange[0].toISOString())
          .lte('created_at', filters.dateRange[1].toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Corrigir o tipo de template_variables para cada mensagem
      setMessages((data || []).map(fixTemplateVariables));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (params: SendMessageParams) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert({
          phone_number: params.phoneNumber,
          message_type: 'template',
          template_name: params.templateName,
          template_variables: params.templateVariables,
          contact_id: params.contactId,
          campaign_id: params.campaignId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [fixTemplateVariables(data), ...prev]);

      toast({
        title: "Sucesso",
        description: "Mensagem agendada para envio",
      });

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendBulkMessages = async (
    phoneNumbers: string[],
    templateName: string,
    templateVariables: Record<string, string>,
    campaignId?: string
  ) => {
    try {
      const messages = phoneNumbers.map(phone => ({
        phone_number: phone,
        message_type: 'template',
        template_name: templateName,
        template_variables: templateVariables,
        campaign_id: campaignId,
        status: 'pending',
      }));

      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert(messages)
        .select();

      if (error) throw error;

      setMessages(prev => ([...(Array.isArray(data) ? data.map(fixTemplateVariables) : []), ...prev]));

      toast({
        title: "Sucesso",
        description: `${phoneNumbers.length} mensagens agendadas para envio`,
      });

      return data;
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagens em lote",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getMessageStats = () => {
    const total = messages.length;
    const sent = messages.filter(m => m.status === 'sent').length;
    const delivered = messages.filter(m => m.status === 'delivered').length;
    const read = messages.filter(m => m.status === 'read').length;
    const failed = messages.filter(m => m.status === 'failed').length;
    const pending = messages.filter(m => m.status === 'pending').length;

    return {
      total,
      sent,
      delivered,
      read,
      failed,
      pending,
      deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(1) : '0',
      readRate: delivered > 0 ? ((read / delivered) * 100).toFixed(1) : '0',
    };
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    sendBulkMessages,
    getMessageStats,
    refetch: fetchMessages,
  };
}
