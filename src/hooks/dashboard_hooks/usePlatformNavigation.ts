
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type Platform = 
  | 'meta' 
  | 'google' 
  | 'youtube'
  | 'linkedin' 
  | 'tiktok' 
  | 'analytics' 
  | 'instagram'
  | 'b2bot'
  | 'relatorios'
  | 'rd';

export type TabSection = 'campanhas' | 'grupos' | 'anuncios';

export const platformConfig = {
  meta: { name: 'Meta', color: 'bg-blue-500', sheetRange: 'Meta!A1:Z' },
  google: { name: 'Google', color: 'bg-green-500', sheetRange: 'Google!A1:Z' },
  youtube: { name: 'YouTube', color: 'bg-red-500', sheetRange: 'YouTube!A1:Z' },
  linkedin: { name: 'LinkedIn', color: 'bg-blue-600', sheetRange: 'LinkedIn!A1:Z' },
  tiktok: { name: 'TikTok', color: 'bg-black', sheetRange: 'TikTok!A1:Z' },
  analytics: { name: 'Analytics', color: 'bg-orange-500', sheetRange: 'Analytics!A1:Z' },
  instagram: { name: 'Instagram', color: 'bg-pink-500', sheetRange: 'Instagram!A1:Z' },
  b2bot: { name: 'B2bot', color: 'bg-purple-500', sheetRange: 'B2bot!A1:Z' },
  relatorios: { name: 'Relatórios', color: 'bg-gray-500', sheetRange: 'Relatorios!A1:Z' },
  rd: { name: 'RD', color: 'bg-indigo-500', sheetRange: 'RD!A1:Z' },
};

export const usePlatformNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const platform = (searchParams.get('platform') as Platform) || 'meta';
  const section = (searchParams.get('section') as TabSection) || 'campanhas';
  
  const setPlatform = (newPlatform: Platform) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('platform', newPlatform);
      // Reset section when changing platform
      newParams.set('section', 'campanhas');
      return newParams;
    });
  };
  
  const setSection = (newSection: TabSection) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('section', newSection);
      return newParams;
    });
  };
  
  const currentSheetRange = platformConfig[platform]?.sheetRange || 'Meta!A1:Z';
  
  return {
    platform,
    section,
    setPlatform,
    setSection,
    currentSheetRange,
    platformConfig: platformConfig[platform],
  };
};
