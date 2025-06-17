
import { useQuery } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

export function useUserProfile(user: User | null) {
  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('🔄 Loading profile for user:', user.id, user.email);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error loading profile:', error);
        
        // Se não encontrar o perfil, tentar criar um básico
        if (error.code === 'PGRST116') {
          console.log('🔧 Profile not found, creating default profile...');
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              nome: user.email?.split('@')[0] || 'Usuário',
              email: user.email || '',
              role: 'admin',
              is_root_admin: false,
              ativo: true
            })
            .select()
            .single();
            
          if (insertError) {
            console.error('❌ Error creating profile:', insertError);
            return null;
          }
          
          console.log('✅ Created new profile:', newProfile);
          return newProfile as UserProfile;
        }
        
        return null;
      }

      console.log('✅ Profile loaded from DB:', data);
      return data as UserProfile;
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
