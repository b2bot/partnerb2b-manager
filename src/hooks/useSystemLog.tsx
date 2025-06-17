
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSystemLog = () => {
  const { user } = useAuth();

  const logActivity = async (
    acao: string,
    modulo: string,
    detalhes?: any,
    ipAddress?: string,
    userAgent?: string
  ) => {
    try {
      if (!user) return;

      const { error } = await supabase.rpc('log_system_activity', {
        p_acao: acao,
        p_modulo: modulo,
        p_detalhes: detalhes ? JSON.stringify(detalhes) : null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent || navigator.userAgent
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
