
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AdSet, updateAdSet } from '@/lib/metaApi';
import { useMetaData } from '@/hooks/useMetaData';

interface EditAdSetModalProps {
  adSet: AdSet | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditAdSetModal({ adSet, isOpen, onClose, onSuccess }: EditAdSetModalProps) {
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
    if (adSet) {
      setFormData({
        name: adSet.name || '',
        status: adSet.status || 'ACTIVE',
        daily_budget: adSet.daily_budget ? (parseInt(adSet.daily_budget) / 100).toString() : '',
        lifetime_budget: adSet.lifetime_budget ? (parseInt(adSet.lifetime_budget) / 100).toString() : ''
      });
    }
  }, [adSet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSet || !credentials?.access_token) return;

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

      await updateAdSet(credentials.access_token, adSet.id, updates);
      
      toast({
        title: 'Sucesso',
        description: 'Conjunto de anúncios atualizado com sucesso.',
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar conjunto de anúncios.',
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
          <DialogTitle>Editar Conjunto de Anúncios</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Conjunto</Label>
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
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="PAUSED">Pausado</SelectItem>
                <SelectItem value="DELETED">Excluído</SelectItem>
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
