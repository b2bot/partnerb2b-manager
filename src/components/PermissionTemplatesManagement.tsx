
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions, PermissionType } from '@/hooks/usePermissions';

const PERMISSION_GROUPS = {
  'Sistema': ['access_dashboard'],
  'WhatsApp': [
    'access_whatsapp',
    'create_campaigns',
    'edit_campaigns',
    'view_templates',
    'send_messages',
    'view_metrics'
  ],
  'Tarefas': [
    'access_tasks',
    'create_tasks',
    'assign_tasks',
    'finalize_tasks',
    'edit_execution_time'
  ],
  'Chamados': [
    'access_calls',
    'create_calls',
    'finalize_calls',
    'link_calls_to_tasks'
  ],
  'Criativos': [
    'access_creatives',
    'create_edit_creatives',
    'approve_creatives',
    'view_change_history'
  ],
  'Mídia Paga': [
    'access_paid_media',
    'create_campaigns_media',
    'view_metrics_media'
  ],
  'Relatórios': [
    'access_reports',
    'create_automatic_reports'
  ],
  'Configurações': [
    'manage_user_settings',
    'manage_collaborators',
    'manage_whatsapp_templates',
    'manage_api_settings',
    'manage_appearance_and_visual_identity',
    'manage_external_integrations',
    'manage_variables_and_pre_configurations',
    'view_billing_settings',
    'view_system_logs'
  ]
};

const PERMISSION_LABELS: Record<PermissionType, string> = {
  'access_dashboard': 'Acessar Dashboard',
  'access_whatsapp': 'Acessar WhatsApp',
  'create_campaigns': 'Criar campanhas',
  'edit_campaigns': 'Editar campanhas',
  'view_templates': 'Visualizar templates',
  'send_messages': 'Enviar mensagens',
  'view_metrics': 'Visualizar métricas',
  'access_tasks': 'Acessar tarefas',
  'create_tasks': 'Criar tarefas',
  'assign_tasks': 'Atribuir tarefas a outros usuários',
  'finalize_tasks': 'Finalizar tarefas',
  'edit_execution_time': 'Editar tempo de execução',
  'access_calls': 'Acessar chamados',
  'create_calls': 'Criar chamados',
  'finalize_calls': 'Finalizar chamados',
  'link_calls_to_tasks': 'Vincular chamados a tarefas',
  'access_creatives': 'Acessar criativos',
  'create_edit_creatives': 'Criar/editar criativos',
  'approve_creatives': 'Aprovar criativos',
  'view_change_history': 'Ver histórico de alterações',
  'access_paid_media': 'Acessar Campanhas, Conjuntos e Anúncios',
  'create_campaigns_media': 'Criar campanhas',
  'view_metrics_media': 'Ver métricas',
  'access_reports': 'Acessar relatórios',
  'create_automatic_reports': 'Criar relatórios automáticos',
  'manage_user_settings': 'Gerenciar configurações do usuário',
  'manage_collaborators': '⚠️ Gerenciar colaboradores',
  'manage_whatsapp_templates': 'Gerenciar templates WhatsApp',
  'manage_api_settings': 'Gerenciar configurações de API',
  'manage_appearance_and_visual_identity': 'Gerenciar aparência e identidade visual',
  'manage_external_integrations': 'Gerenciar integrações externas',
  'manage_variables_and_pre_configurations': 'Gerenciar variáveis e pré-configurações',
  'view_billing_settings': '⚠️ Visualizar configurações de faturamento',
  'view_system_logs': '⚠️ Visualizar logs do sistema'
};

export function PermissionTemplatesManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([]);

  const { permissionTemplates, createTemplate, isCreatingTemplate } = usePermissions();
  const queryClient = useQueryClient();

  const handlePermissionChange = (permission: PermissionType, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Nome do template é obrigatório');
      return;
    }

    createTemplate({
      name: templateName.trim(),
      description: templateDescription.trim() || undefined,
      permissions: selectedPermissions,
    });

    // Reset form
    setTemplateName('');
    setTemplateDescription('');
    setSelectedPermissions([]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Templates de Permissões</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Crie templates predefinidos para agilizar a criação de colaboradores
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {permissionTemplates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-sm">{template.name}</CardTitle>
              {template.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400">{template.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {template.permissions.length} permissões configuradas
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Template de Permissões</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nome do Template *</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Atendente, Gestor de Mídia, Financeiro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateDescription">Descrição</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Descrição opcional do template"
                rows={3}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Permissões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                  <div key={groupName} className="space-y-2">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">{groupName}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={`template-${permission}`}
                            checked={selectedPermissions.includes(permission as PermissionType)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission as PermissionType, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`template-${permission}`} 
                            className={`text-sm ${
                              PERMISSION_LABELS[permission as PermissionType]?.startsWith('⚠️') 
                                ? 'text-amber-600 dark:text-amber-400 font-medium' 
                                : ''
                            }`}
                          >
                            {PERMISSION_LABELS[permission as PermissionType]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateModal(false)} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={isCreatingTemplate}
                className="flex-1"
              >
                {isCreatingTemplate ? 'Criando...' : 'Criar Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
