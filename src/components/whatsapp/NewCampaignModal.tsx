
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { WhatsAppTemplate } from '@/hooks/useWhatsAppTemplates';

interface NewCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewCampaignModal({ open, onClose, onSuccess }: NewCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'relatorio' as 'relatorio' | 'financeiro' | 'promocional' | 'suporte',
    frequency: 'semanal' as 'diario' | 'semanal' | 'mensal',
    dayOfWeek: 1,
    sendTime: '09:00',
    dataPeriodDays: 7,
    contacts: [] as string[],
  });
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleTemplateSelect = (template: WhatsAppTemplate | null, variables: Record<string, string>) => {
    setSelectedTemplate(template);
    setTemplateVariables(variables);
  };

  const handleCreate = async () => {
    if (!formData.name || !selectedTemplate) {
      toast({
        title: "Erro",
        description: "Nome e template são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_campaigns')
        .insert({
          name: formData.name,
          type: formData.type,
          template_id: selectedTemplate.id,
          frequency: formData.frequency,
          day_of_week: formData.dayOfWeek,
          send_time: formData.sendTime,
          data_period_days: formData.dataPeriodDays,
          contacts: formData.contacts,
          variables_mapping: templateVariables,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Campanha criada com sucesso",
      });

      setFormData({
        name: '',
        type: 'relatorio',
        frequency: 'semanal',
        dayOfWeek: 1,
        sendTime: '09:00',
        dataPeriodDays: 7,
        contacts: [],
      });
      setSelectedTemplate(null);
      setTemplateVariables({});
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar campanha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Campanha Automatizada</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Campanha</Label>
            <Input
              id="name"
              placeholder="Ex: Relatório Semanal Cliente X"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'relatorio' | 'financeiro' | 'promocional' | 'suporte') => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relatorio">Relatório</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="promocional">Promocional</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select 
                value={formData.frequency} 
                onValueChange={(value: 'diario' | 'semanal' | 'mensal') => 
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.frequency === 'semanal' && (
            <div className="space-y-2">
              <Label>Dia da Semana</Label>
              <Select 
                value={formData.dayOfWeek.toString()} 
                onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayLabels.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Horário de Envio</Label>
              <Input
                id="time"
                type="time"
                value={formData.sendTime}
                onChange={(e) => setFormData({ ...formData, sendTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Período dos Dados (dias)</Label>
              <Select 
                value={formData.dataPeriodDays.toString()} 
                onValueChange={(value) => setFormData({ ...formData, dataPeriodDays: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 dia</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TemplateSelector
            onTemplateSelect={handleTemplateSelect}
            selectedTemplate={selectedTemplate?.name}
            initialVariables={templateVariables}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={loading || !selectedTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Criando...' : 'Criar Campanha'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
