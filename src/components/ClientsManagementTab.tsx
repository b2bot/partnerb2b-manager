
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { CreateClientModal } from '@/components/CreateClientModal';
import { EditClientModal } from '@/components/EditClientModal';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  observacoes_internas?: string;
  tipo_acesso: 'api' | 'sheet';
  ativo: boolean;
  created_at: string;
  profiles: {
    email: string;
    role: string;
  };
  contas: {
    id: string;
    tipo: 'meta' | 'google';
    identificador: string;
    nome: string;
  }[];
}

export function ClientsManagementTab() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const queryClient = useQueryClient();

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clients-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          profiles:user_id (email, role),
          contas (id, tipo, identificador, nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles)
          ? item.profiles
          : { email: '', role: '' },
      })) as Cliente[];
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase.from('clientes').delete().eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-management'] });
      toast.success('Cliente removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover cliente:', error);
      toast.error('Erro ao remover cliente. Tente novamente.');
    },
  });

  const toggleClientStatus = useMutation({
    mutationFn: async ({ clientId, ativo }: { clientId: string; ativo: boolean }) => {
      const { error } = await supabase.from('clientes').update({ ativo }).eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-management'] });
      toast.success('Status do cliente atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status. Tente novamente.');
    },
  });

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Gerenciar Clientes</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Cadastre e gerencie clientes, suas contas e permissões
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="sm" className="h-7 text-xs px-2">
          <Plus className="h-3 w-3 mr-1" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid gap-3">
        {!clientes || clientes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Nenhum cliente cadastrado
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Comece criando seu primeiro cliente e configurando suas contas.
              </p>
              <Button onClick={() => setCreateModalOpen(true)} size="sm" className="h-7 text-xs px-2">
                <Plus className="h-3 w-3 mr-1" />
                Criar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          clientes.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm">{cliente.nome}</CardTitle>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {cliente.profiles?.email || 'Email não disponível'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={cliente.ativo ? 'default' : 'secondary'}
                      className={`text-xs ${cliente.ativo ? 'bg-green-100 text-green-800' : ''}`}
                    >
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {cliente.profiles?.role === 'admin' ? 'Admin' : 'Cliente'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo de acesso:</span>
                    <span className="ml-2 text-xs">
                      {cliente.tipo_acesso === 'api' ? 'API' : 'Google Sheets'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Contas vinculadas:</span>
                    <div className="ml-2 mt-1">
                      {!cliente.contas || cliente.contas.length === 0 ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Nenhuma conta vinculada</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {cliente.contas.map((conta) => (
                            <Badge key={conta.id} variant="outline" className="text-xs">
                              {conta.tipo.toUpperCase()}: {conta.nome}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingClient(cliente)} className="h-6 text-xs px-2">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleClientStatus.mutate({
                          clientId: cliente.id,
                          ativo: !cliente.ativo,
                        })
                      }
                      className="h-6 text-xs px-2"
                    >
                      {cliente.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClient(cliente.id)}
                      className="h-6 text-xs px-2"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {createModalOpen && (
        <CreateClientModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          open={!!editingClient}
          onClose={() => setEditingClient(null)}
        />
      )}
    </div>
  );
}
