
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createCampaign } from '@/lib/metaApi';
import { useMetaData } from '@/hooks/useMetaData';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CAMPAIGN_OBJECTIVES = [
  { value: 'OUTCOME_AWARENESS', label: 'Reconhecimento' },
  { value: 'OUTCOME_TRAFFIC', label: 'Tráfego' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engajamento' },
  { value: 'OUTCOME_LEADS', label: 'Leads' },
  { value: 'OUTCOME_APP_PROMOTION', label: 'Promoção do app' },
  { value: 'OUTCOME_SALES', label: 'Vendas' },
  { value: 'REACH', label: 'Alcance' },
  { value: 'CONVERSIONS', label: 'Conversões' },
  { value: 'LINK_CLICKS', label: 'Cliques no link' },
  { value: 'POST_ENGAGEMENT', label: 'Engajamento da publicação' },
  { value: 'VIDEO_VIEWS', label: 'Visualizações de vídeo' },
  { value: 'PAGE_LIKES', label: 'Curtidas da página' },
  { value: 'LEAD_GENERATION', label: 'Geração de leads' },
  { value: 'MESSAGES', label: 'Mensagens' },
  { value: 'APP_INSTALLS', label: 'Instalações do app' }
];

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const { credentials, selectedAdAccount } = useMetaData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    status: 'PAUSED',
    budgetType: 'daily',
    budget: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials?.access_token || !selectedAdAccount) return;

    setLoading(true);
    try {
      const campaignData = {
        name: formData.name,
        objective: formData.objective,
        status: formData.status,
        special_ad_categories: [],
        ...(formData.budgetType === 'daily' 
          ? { daily_budget: (parseFloat(formData.budget) * 100).toString() }
          : { lifetime_budget: (parseFloat(formData.budget) * 100).toString() }
        )
      };

      await createCampaign(credentials.access_token, selectedAdAccount, campaignData);
      
      toast({
        title: 'Sucesso',
        description: 'Campanha criada com sucesso.',
      });
      
      onSuccess();
      onClose();
      setFormData({
        name: '',
        objective: '',
        status: 'PAUSED',
        budgetType: 'daily',
        budget: ''
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar campanha.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Campanha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Campanha</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo</Label>
            <Select value={formData.objective} onValueChange={(value) => setFormData({ ...formData, objective: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_OBJECTIVES.map((obj) => (
                  <SelectItem key={obj.value} value={obj.value}>
                    {obj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Orçamento</Label>
              <Select value={formData.budgetType} onValueChange={(value) => setFormData({ ...formData, budgetType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Orçamento diário</SelectItem>
                  <SelectItem value="lifetime">Orçamento vitalício</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="1"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="PAUSED">Pausado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
