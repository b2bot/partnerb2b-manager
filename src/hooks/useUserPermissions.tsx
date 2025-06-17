
import { useQuery } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Permission, ALL_PERMISSIONS } from '@/types/auth';

export function useUserPermissions(user: User | null, isRootAdmin: boolean) {
  return useQuery({
    queryKey: ['user-permissions', user?.id, isRootAdmin],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Se é root admin, retorna todas as permissões
      if (isRootAdmin) {
        console.log('✅ Root admin - returning all permissions');
        return ALL_PERMISSIONS;
      }

      console.log('🔄 Loading permissions for user:', user.id);

      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error loading user permissions:', error);
        return [];
      }

      const permissions = data.map(p => p.permission as Permission);
      console.log('✅ User permissions loaded:', permissions);
      return permissions;
    },
    enabled: !!user?.id,
  });
}
