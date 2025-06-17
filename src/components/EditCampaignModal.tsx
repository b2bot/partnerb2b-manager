
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Campaign, updateCampaign } from '@/lib/metaApi';
import { useMetaData } from '@/hooks/useMetaData';

interface EditCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCampaignModal({ campaign, isOpen, onClose, onSuccess }: EditCampaignModalProps) {
  const { credentials } = useMetaData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'placeholder',
    daily_budget: '',
    lifetime_budget: ''
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        status: campaign.status || 'ACTIVE',
        daily_budget: campaign.daily_budget ? (parseInt(campaign.daily_budget) / 100).toString() : '',
        lifetime_budget: campaign.lifetime_budget ? (parseInt(campaign.lifetime_budget) / 100).toString() : ''
      });
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !credentials?.access_token) return;

    setLoading(true);
    try {
      const updates: any = {
        name: formData.name,
        status: formData.status
      };

      if (formData.daily_budget) {
        updates.daily_budget = (parseFloat(formData.daily_budget) * 100).toString();
      }
      if (formData.lifetime_budget) {
        updates.lifetime_budget = (parseFloat(formData.lifetime_budget) * 100).toString();
      }

      await updateCampaign(credentials.access_token, campaign.id, updates);
      
      toast({
        title: 'Sucesso',
        description: 'Campanha atualizada com sucesso.',
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar campanha.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Campanha</DialogTitle>
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
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Selecione um status</SelectItem>
                <SelectItem value="ACTIVE">Ativa</SelectItem>
                <SelectItem value="PAUSED">Pausada</SelectItem>
                <SelectItem value="DELETED">Excluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_budget">Orçamento Diário (R$)</Label>
              <Input
                id="daily_budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.daily_budget}
                onChange={(e) => setFormData({ ...formData, daily_budget: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifetime_budget">Orçamento Total (R$)</Label>
              <Input
                id="lifetime_budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.lifetime_budget}
                onChange={(e) => setFormData({ ...formData, lifetime_budget: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
