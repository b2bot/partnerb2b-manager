export const platforms = {
  meta: {
    label: 'Meta Ads',
    fields: [
      { name: 'appId', label: 'App ID' },
      { name: 'appSecret', label: 'App Secret' },
      { name: 'accessToken', label: 'Access Token' },
      { name: 'accountId', label: 'Account ID' },
    ],
  },
  googleAds: {
    label: 'Google Ads',
    fields: [
      { name: 'developerToken', label: 'Developer Token' },
      { name: 'clientId', label: 'Client ID' },
      { name: 'clientSecret', label: 'Client Secret' },
      { name: 'refreshToken', label: 'Refresh Token' },
    ],
  },
  linkedin: {
    label: 'LinkedIn Ads',
    fields: [
      { name: 'clientId', label: 'Client ID' },
      { name: 'clientSecret', label: 'Client Secret' },
      { name: 'accessToken', label: 'Access Token' },
    ],
  },
  analytics: {
    label: 'Google Analytics',
    fields: [
      { name: 'propertyId', label: 'Property ID' },
      { name: 'accessToken', label: 'Access Token' },
    ],
  },
};

export type PlatformKey = keyof typeof platforms;