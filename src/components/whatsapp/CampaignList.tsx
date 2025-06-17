
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Clock, Users, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Permitir string para tipo custom vindo do banco
type Campaign = {
  id: string;
  name: string;
  type: "relatorio" | "financeiro" | "promocional" | "suporte" | string,
  frequency: "diario" | "semanal" | "mensal" | string,
  day_of_week?: number | null,
  send_time: string;
  is_active: boolean;
  contacts: string[];
  template_id?: string | null;
  meta_account_id?: string | null;
  variables_mapping?: any;
  created_at?: string;
  updated_at?: string;
  data_period_days?: number;
};

interface CampaignListProps {
  onNewCampaign: () => void;
}

const typeLabels: Record<string, string> = {
  relatorio: 'Relatório',
  financeiro: 'Financeiro', 
  promocional: 'Promocional',
  suporte: 'Suporte',
};

const typeColors: Record<string, string> = {
  relatorio: 'bg-blue-100 text-blue-800',
  financeiro: 'bg-green-100 text-green-800',
  promocional: 'bg-purple-100 text-purple-800',
  suporte: 'bg-orange-100 text-orange-800',
};

const frequencyLabels: Record<string, string> = {
  diario: 'Diário',
  semanal: 'Semanal',
  mensal: 'Mensal',
};

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Função utilitária para normalizar dados da campanha
const normalizeCampaign = (c: any): Campaign => {
  const validTypes = ["relatorio", "financeiro", "promocional", "suporte"];
  const validFrequencies = ["diario", "semanal", "mensal"];

  return {
    ...c,
    type: typeof c.type === "string" && validTypes.includes(c.type) 
      ? c.type 
      : (c.type || ""),
    frequency: typeof c.frequency === "string" && validFrequencies.includes(c.frequency)
      ? c.frequency 
      : (c.frequency || ""),
    day_of_week: typeof c.day_of_week === "number" ? c.day_of_week : null,
    is_active: typeof c.is_active === "boolean" ? c.is_active : false,
    contacts: Array.isArray(c.contacts) ? c.contacts : [],
  };
};

export function CampaignList({ onNewCampaign }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Usar a função utilitária para normalizar os dados
      const parsedCampaigns: Campaign[] = (data || []).map(normalizeCampaign);
      setCampaigns(parsedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar campanhas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_campaigns')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setCampaigns(campaigns.map(c => 
        c.id === id ? { ...c, is_active: isActive } : c
      ));

      toast({
        title: "Sucesso",
        description: `Campanha ${isActive ? 'ativada' : 'pausada'}`,
      });
    } catch (error) {
      console.error('Error toggling campaign:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da campanha",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campanhas Automatizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Campanhas Automatizadas</CardTitle>
          <Button onClick={onNewCampaign} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Nova Campanha
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-600 mb-2">Nenhuma campanha criada</h3>
            <p className="text-sm text-gray-500 mb-4">
              Crie campanhas automatizadas para enviar relatórios e notificações
            </p>
            <Button onClick={onNewCampaign} variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Criar Primeira Campanha
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{campaign.name}</h3>
                    <Badge className={typeColors[campaign.type] ?? 'bg-gray-100 text-gray-800'}>
                      {typeLabels[campaign.type] ?? campaign.type ?? 'Outro'}
                    </Badge>
                    <Badge variant={campaign.is_active ? "default" : "secondary"}>
                      {campaign.is_active ? "Ativo" : "Pausado"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!campaign.is_active}
                      onCheckedChange={(checked) => toggleCampaign(campaign.id, checked)}
                    />
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Frequência:</span>
                    <div className="font-medium">{frequencyLabels[campaign.frequency] ?? campaign.frequency ?? '-'}</div>
                  </div>
                  {(campaign.day_of_week !== undefined && campaign.day_of_week !== null) && (
                    <div>
                      <span className="text-gray-500">Dia:</span>
                      <div className="font-medium">{dayLabels[campaign.day_of_week] ?? campaign.day_of_week}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Horário:</span>
                    <div className="font-medium">{campaign.send_time}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Contatos:</span>
                    <div className="font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {campaign.contacts.length}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
