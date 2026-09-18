import { Platform } from 'react-native';

/**
 * Ad unit IDs from the AdMob console.
 *
 * Leave these empty while developing: the app falls back to Google's test
 * units, and showing *real* ads to yourself is what gets an AdMob account
 * flagged for invalid traffic. Fill them in for the production build.
 *
 * The app ID (a different thing, `ca-app-pub-…~…`) lives in app.json.
 */
export const AD_UNITS = {
  rewarded: {
    android: 'ca-app-pub-2820467913740158/4705809950',
    ios: '',
  },
  interstitial: {
    android: 'ca-app-pub-2820467913740158/3984966672',
    ios: '',
  },
};

export function realUnitId(kind: 'rewarded' | 'interstitial'): string | null {
  const id = Platform.OS === 'ios' ? AD_UNITS[kind].ios : AD_UNITS[kind].android;
  return id.length > 0 ? id : null;
}
