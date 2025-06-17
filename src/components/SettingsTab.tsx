
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetaApiManagement } from '@/components/MetaApiManagement';
import { DataManagement } from '@/components/DataManagement';
import { CollaboratorsManagement } from '@/components/CollaboratorsManagement';
import { ClientsManagementTab } from '@/components/ClientsManagementTab';
import { useAuth } from '@/hooks/useAuth';

export function SettingsTab() {
  const { hasPermission, profile } = useAuth();

  // Verificar permissões específicas
  const canManageApi = hasPermission('manage_api_settings');
  const canManageData = hasPermission('manage_user_settings');
  const canManageCollaborators = hasPermission('manage_collaborators') || profile?.is_root_admin;
  const canManageClients = hasPermission('manage_collaborators') || profile?.is_root_admin; // Mesma permissão que colaboradores

  if (!canManageApi && !canManageData && !canManageCollaborators && !canManageClients) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-600">Acesso Negado</h2>
        <p className="text-slate-500 mt-2">
          Você não tem permissão para acessar as configurações do sistema.
        </p>
      </div>
    );
  }

  // Determinar a aba padrão baseada nas permissões
  const defaultTab = canManageApi ? 'api' : canManageData ? 'data' : canManageCollaborators ? 'collaborators' : canManageClients ? 'clients' : 'api';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Configurações</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Gerencie as configurações da plataforma e integrações
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="text-xs">
          {canManageApi && (
            <TabsTrigger value="api" className="text-xs">Gestão da API Meta</TabsTrigger>
          )}
          {canManageData && (
            <TabsTrigger value="data" className="text-xs">Gestão de Dados</TabsTrigger>
          )}
          {canManageCollaborators && (
            <TabsTrigger value="collaborators" className="text-xs">Colaboradores</TabsTrigger>
          )}
          {canManageClients && (
            <TabsTrigger value="clients" className="text-xs">Clientes</TabsTrigger>
          )}
        </TabsList>

        {canManageApi && (
          <TabsContent value="api">
            <MetaApiManagement />
          </TabsContent>
        )}

        {canManageData && (
          <TabsContent value="data">
            <DataManagement />
          </TabsContent>
        )}

        {canManageCollaborators && (
          <TabsContent value="collaborators">
            <CollaboratorsManagement />
          </TabsContent>
        )}

        {canManageClients && (
          <TabsContent value="clients">
            <ClientsManagementTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
