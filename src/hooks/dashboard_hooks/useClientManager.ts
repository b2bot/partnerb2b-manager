import { useEffect, useState } from 'react';
import { supabase } from '@/lib/dashboard_lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export const useClientManager = () => {
  const { user } = useAuth();
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      if (!user?.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar cliente:', error.message);
        setError(error.message);
      } else {
        setCurrentClientId(data.id);
      }
      setLoading(false);
    };

    fetchClient();
  }, [user?.id]);

  return {
    currentClientId,
    setCurrentClientId,
    loading,
    error,
  };
};