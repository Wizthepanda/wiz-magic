/**
 * Feature flags for temporary auth system
 */

export const isYouTubeAPIEnabled = (): boolean => {
  return import.meta.env.VITE_USE_YOUTUBE_API === 'true';
};

export const isGoogleAuthEnabled = (): boolean => {
  return import.meta.env.VITE_USE_GOOGLE_AUTH === 'true';
};

export const logFeatureFlag = (feature: string, enabled: boolean, fallbackMessage?: string) => {
  if (enabled) {
    console.log(`✅ ${feature} is enabled`);
  } else {
    console.log(`⚠️  ${feature} is disabled${fallbackMessage ? ` - ${fallbackMessage}` : ''}`);
  }
};