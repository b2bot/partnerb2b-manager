
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppConfig } from './useWhatsAppConfig';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: {
    type: string;
    format?: string;
    text?: string;
    parameters?: Array<{
      type: string;
      text?: string;
    }>;
  }[];
  variables: string[]; // Campos dinâmicos extraídos do template
}

export function useWhatsAppTemplates() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { config } = useWhatsAppConfig();
  const { toast } = useToast();

  const extractVariables = (components: any[]): string[] => {
    const variables: string[] = [];
    
    components.forEach(component => {
      if (component.text) {
        // Extrair variáveis no formato {{variavel}}
        const matches = component.text.match(/\{\{(\w+)\}\}/g);
        if (matches) {
          matches.forEach((match: string) => {
            const variable = match.replace(/\{\{|\}\}/g, '');
            if (!variables.includes(variable)) {
              variables.push(variable);
            }
          });
        }
      }
    });
    
    return variables;
  };

  const fetchTemplatesFromWhatsApp = async () => {
    if (!config?.business_account_id || !config?.access_token) {
      console.log('WhatsApp config not available');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${config.business_account_id}/message_templates?access_token=${config.access_token}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar templates do WhatsApp');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      // Filtrar apenas templates aprovados
      const approvedTemplates = data.data
        .filter((template: any) => template.status === 'APPROVED')
        .map((template: any) => ({
          id: template.id,
          name: template.name,
          language: template.language,
          category: template.category,
          status: template.status,
          components: template.components,
          variables: extractVariables(template.components),
        }));

      setTemplates(approvedTemplates);

      // Sincronizar com banco local para cache
      await supabase
        .from('whatsapp_templates')
        .upsert(
          approvedTemplates.map(template => ({
            name: template.name,
            language: template.language,
            category: template.category,
            status: template.status,
            body_text: template.components.find(c => c.type === 'BODY')?.text || '',
            header_text: template.components.find(c => c.type === 'HEADER')?.text,
            footer_text: template.components.find(c => c.type === 'FOOTER')?.text,
            variables: template.variables,
            components: template.components,
          })),
          { onConflict: 'name' }
        );

    } catch (error: any) {
      console.error('Error fetching WhatsApp templates:', { 
        message: error.message,
        business_account_id: config.business_account_id,
      });
      toast({
        title: "Erro",
        description: "Erro ao buscar templates do WhatsApp. Usando cache local.",
        variant: "destructive",
      });
      
      // Fallback para templates locais
      await fetchLocalTemplates();
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('status', 'APPROVED')
        .order('name');

      if (error) throw error;

      const localTemplates: WhatsAppTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        language: template.language,
        category: (template.category as 'MARKETING' | 'UTILITY' | 'AUTHENTICATION') || 'UTILITY',
        status: (template.status as 'APPROVED' | 'PENDING' | 'REJECTED') || 'APPROVED',
        components: Array.isArray(template.components) ? template.components as any[] : [],
        variables: Array.isArray(template.variables) ? template.variables as string[] : [],
      }));

      setTemplates(localTemplates);
    } catch (error) {
      console.error('Error fetching local templates:', error);
      toast({
        title: "Erro de Fallback",
        description: "Não foi possível carregar templates do cache local.",
        variant: "destructive",
      });
    }
  };

  const getTemplatePreview = (template: WhatsAppTemplate, variables: Record<string, string> = {}) => {
    let preview = '';
    
    template.components.forEach(component => {
      if (component.type === 'HEADER' && component.text) {
        preview += `*${component.text}*\n\n`;
      } else if (component.type === 'BODY' && component.text) {
        let bodyText = component.text;
        // Substituir variáveis no preview
        Object.entries(variables).forEach(([key, value]) => {
          bodyText = bodyText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
        });
        preview += `${bodyText}\n\n`;
      } else if (component.type === 'FOOTER' && component.text) {
        preview += `_${component.text}_`;
      }
    });
    
    return preview.trim();
  };

  useEffect(() => {
    setLoading(true);
    if (config?.business_account_id && config?.access_token) {
      fetchTemplatesFromWhatsApp();
    } else {
      fetchLocalTemplates().finally(() => {
        setLoading(false);
      });
    }
  }, [config]);

  return {
    templates,
    loading,
    refetch: fetchTemplatesFromWhatsApp,
    getTemplatePreview,
  };
}
