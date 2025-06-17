
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Collaborator {
  id: string;
  nome: string;
  email: string;
  foto_url?: string;
  status: string;
  role: string;
  created_at: string;
  is_root_admin: boolean;
}

export function useCollaborators() {
  const queryClient = useQueryClient();

  // Buscar colaboradores (excluindo root admin)
  const { data: collaborators, isLoading } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_root_admin', false)
        .order('nome');
      
      if (error) throw error;
      return data as Collaborator[];
    },
  });

  // Mutation para desativar colaborador
  const deactivateCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inativo' })
        .eq('id', collaboratorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast.success('Colaborador desativado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao desativar colaborador:', error);
      toast.error('Erro ao desativar colaborador');
    },
  });

  return {
    collaborators: collaborators || [],
    isLoading,
    deactivateCollaborator: deactivateCollaboratorMutation.mutate,
    isDeactivating: deactivateCollaboratorMutation.isPending,
  };
}
