
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useUserAccess() {
  const { user, isAdmin } = useAuth();

  const { data: clienteData } = useQuery({
    queryKey: ['user-cliente', user?.id],
    queryFn: async () => {
      if (!user?.id || isAdmin) return null;
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading cliente:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id && !isAdmin,
  });

  const { data: userAccounts } = useQuery({
    queryKey: ['user-accounts', clienteData?.id],
    queryFn: async () => {
      if (!clienteData?.id) return [];
      
      const { data, error } = await supabase
        .from('contas')
        .select('*')
        .eq('cliente_id', clienteData.id)
        .eq('ativo', true);
      
      if (error) {
        console.error('Error loading accounts:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!clienteData?.id,
  });

  const getAccessibleMetaAccounts = () => {
    if (isAdmin) return null; // Admin tem acesso a todas as contas
    return userAccounts?.filter(account => account.tipo === 'meta').map(account => account.identificador) || [];
  };

  const hasAccessToAccount = (accountId: string) => {
    if (isAdmin) return true;
    const accessibleAccounts = getAccessibleMetaAccounts();
    return accessibleAccounts.includes(accountId);
  };

  return {
    clienteData,
    userAccounts: userAccounts || [],
    getAccessibleMetaAccounts,
    hasAccessToAccount,
    isAdmin,
  };
}
