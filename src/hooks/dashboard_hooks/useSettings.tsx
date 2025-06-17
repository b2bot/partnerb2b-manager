import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from './usePlatformNavigation';
import { supabase } from '@/lib/dashboard_lib/supabase';

export interface PlatformConfig {
  mode: 'sheets' | 'api';
  apiKey?: string;
  accountId?: string;
  metrics: string[];
}

interface SettingsState {
  platforms: Record<Platform, PlatformConfig>;
}

const defaultSettings: SettingsState = {
  platforms: {
    meta: { mode: 'sheets', metrics: [] },
    google: { mode: 'sheets', metrics: [] },
    youtube: { mode: 'sheets', metrics: [] },
    linkedin: { mode: 'sheets', metrics: [] },
    tiktok: { mode: 'sheets', metrics: [] },
    analytics: { mode: 'sheets', metrics: [] },
    instagram: { mode: 'sheets', metrics: [] },
    b2bot: { mode: 'sheets', metrics: [] },
    relatorios: { mode: 'sheets', metrics: [] },
    rd: { mode: 'sheets', metrics: [] },
  },
};

interface SettingsContextValue {
  settings: SettingsState;
  updatePlatform: (platform: Platform, config: Partial<PlatformConfig>) => void;
  saveSettings: (data: SettingsState) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const SettingsProvider = ({
  children,
  clientId,
}: {
  children: React.ReactNode;
  clientId?: string;
}) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const stored = localStorage.getItem('dashboard-settings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dashboard-settings', JSON.stringify(settings));

    if (!clientId || !isValidUUID(clientId)) return;
    supabase
      .from('settings')
      .upsert({ client_id: clientId, data: settings })
      .then(({ error }) => {
        if (error) console.error('Erro ao salvar settings:', error.message);
      })
      .catch(err => {
        console.error('Erro inesperado ao salvar settings:', err);
      });
  }, [settings, clientId]);

  useEffect(() => {
    if (!clientId || !isValidUUID(clientId)) return;

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('data')
        .eq('client_id', clientId)
        .single();

      if (error) {
        console.error('Erro ao buscar settings:', error.message);
      } else if (data?.data) {
        setSettings(data.data as SettingsState);
      }
    };

    fetchSettings();
  }, [clientId]);

  const updatePlatform = (platform: Platform, config: Partial<PlatformConfig>) => {
    setSettings(prev => ({
      platforms: {
        ...prev.platforms,
        [platform]: { ...prev.platforms[platform], ...config },
      },
    }));
  };

  const saveSettings = async (data: SettingsState) => {
    setSettings(data);
    localStorage.setItem('dashboard-settings', JSON.stringify(data));

    if (clientId && isValidUUID(clientId)) {
      const { error } = await supabase.from('settings').upsert({ client_id: clientId, data });
      if (error) {
        console.error('Erro ao salvar settings manualmente:', error.message);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updatePlatform, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
