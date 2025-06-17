
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { usePermissions, PermissionType } from '@/hooks/usePermissions';

interface CreateCollaboratorModalProps {
  open: boolean;
  onClose: () => void;
}

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

export function CreateCollaboratorModal({ open, onClose }: CreateCollaboratorModalProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [status, setStatus] = useState('ativo');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [error, setError] = useState('');

  const { permissionTemplates, grantPermission } = usePermissions();
  const queryClient = useQueryClient();

  const createCollaboratorMutation = useMutation({
    mutationFn: async (data: {
      nome: string;
      email: string;
      senha: string;
      foto_url?: string;
      status: string;
      permissions: PermissionType[];
    }) => {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome: data.nome,
            role: 'cliente',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      // Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          nome: data.nome,
          email: data.email,
          foto_url: data.foto_url,
          status: data.status,
          role: 'cliente',
          ativo: data.status === 'ativo',
        });

      if (profileError) throw profileError;

      // Aguardar criação do perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atribuir permissões
      for (const permission of data.permissions) {
        const { error: permError } = await supabase
          .from('user_permissions')
          .insert({
            user_id: authData.user.id,
            permission,
          });

        if (permError) {
          console.error('Erro ao atribuir permissão:', permission, permError);
        }
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast.success('Colaborador criado com sucesso!');
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      console.error('Erro ao criar colaborador:', error);
      const errorMessage = error.message || 'Erro ao criar colaborador. Verifique os dados e tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const resetForm = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setFotoUrl('');
    setStatus('ativo');
    setSelectedPermissions([]);
    setSelectedTemplate('');
    setError('');
  };

  const handlePermissionChange = (permission: PermissionType, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = permissionTemplates?.find(t => t.id === templateId);
    if (template) {
      setSelectedPermissions(template.permissions);
      setSelectedTemplate(templateId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setError('Nome, email e senha são obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    createCollaboratorMutation.mutate({
      nome: nome.trim(),
      email: email.trim(),
      senha,
      foto_url: fotoUrl.trim() || undefined,
      status,
      permissions: selectedPermissions,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Novo Colaborador</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[80vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do colaborador"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto">URL da Foto</Label>
              <Input
                id="foto"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>

            {permissionTemplates && permissionTemplates.length > 0 && (
              <div className="space-y-2">
                <Label>Template de Permissões</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {permissionTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Permissões Personalizadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                  <div key={groupName} className="space-y-2">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">{groupName}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={selectedPermissions.includes(permission as PermissionType)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission as PermissionType, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={permission} 
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createCollaboratorMutation.isPending}
                className="flex-1"
              >
                {createCollaboratorMutation.isPending ? 'Criando...' : 'Criar Colaborador'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
