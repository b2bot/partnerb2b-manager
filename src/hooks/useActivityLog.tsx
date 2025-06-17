
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useActivityLog = () => {
  const { user } = useAuth();

  const logActivity = async (
    action: string,
    entityType: 'campaign' | 'adset' | 'ad' | 'creative' | 'ticket' | 'client',
    entityId: string,
    entityName: string,
    details?: any
  ) => {
    try {
      if (!user) {
        console.warn('No user found for activity logging');
        return;
      }

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          action,
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName,
          user_id: user.id,
          user_name: user.email || 'Usuário Desconhecido',
          details
        });

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return { logActivity };
};
