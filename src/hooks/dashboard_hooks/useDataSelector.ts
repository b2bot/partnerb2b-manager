import { useSettings } from './useSettings';
import { useMetaData } from './useMetaData';
import { useAnalyticsData } from './useAnalyticsData';
import { useSheetData } from './useSheetData';
import { Platform } from './usePlatformNavigation';

/* eslint-disable react-hooks/rules-of-hooks */
export const useDataSelector = (
  platform: Platform,
  sheetId: string,
  range: string
) => {
  const { settings } = useSettings();
  const conf = settings.platforms[platform];
  if (conf?.mode === 'api') {
    if (platform === 'analytics') {
      return useAnalyticsData({
        token: conf.apiKey || '',
        propertyId: conf.accountId || '',
        metrics: conf.metrics,
      });
    }
    return useMetaData({
      token: conf.apiKey || '',
      accountId: conf.accountId || '',
      fields: conf.metrics,
    });
  }
  return useSheetData(sheetId, range);
};