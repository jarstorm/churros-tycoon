import { realUnitId } from './adUnits';

/**
 * AdMob wrapper.
 *
 * The native module only exists in a real build (EAS / dev client), never in
 * Expo Go, so everything here is loaded defensively: if the module is missing
 * the app keeps working and `adsSupported` stays false, which hides every
 * ad-related affordance instead of crashing.
 *
 * Ad unit IDs come from ./adUnits — test units in development, the real ones
 * in a release build.
 */

type RewardedAdModule = {
  createForAdRequest: (unitId: string, options?: object) => RewardedAdInstance;
};

interface RewardedAdInstance {
  load: () => void;
  show: () => Promise<void>;
  addAdEventListener: (event: string, cb: (payload?: unknown) => void) => () => void;
}

interface InterstitialAdInstance {
  load: () => void;
  show: () => Promise<void>;
  addAdEventListener: (event: string, cb: (payload?: unknown) => void) => () => void;
}

let mobileAds: (() => { initialize: () => Promise<unknown> }) | null = null;
let RewardedAd: RewardedAdModule | null = null;
let InterstitialAd: { createForAdRequest: (unitId: string, options?: object) => InterstitialAdInstance } | null = null;
let RewardedAdEventType: Record<string, string> = {};
let AdEventType: Record<string, string> = {};
let TestIds: Record<string, string> = {};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ads = require('react-native-google-mobile-ads');
  mobileAds = ads.default;
  RewardedAd = ads.RewardedAd;
  InterstitialAd = ads.InterstitialAd;
  RewardedAdEventType = ads.RewardedAdEventType ?? {};
  AdEventType = ads.AdEventType ?? {};
  TestIds = ads.TestIds ?? {};
} catch {
  // Expo Go: no native module, ads stay disabled.
}

export const adsSupported = Boolean(RewardedAd && InterstitialAd);

// Test units in development, the real ones once they are filled in and the
// app is built for release.
const TEST_REWARDED = TestIds.REWARDED ?? 'ca-app-pub-3940256099942544/5224354917';
const TEST_INTERSTITIAL = TestIds.INTERSTITIAL ?? 'ca-app-pub-3940256099942544/1033173712';

const REWARDED_UNIT_ID = (!__DEV__ && realUnitId('rewarded')) || TEST_REWARDED;
const INTERSTITIAL_UNIT_ID = (!__DEV__ && realUnitId('interstitial')) || TEST_INTERSTITIAL;

// Show an interstitial on every Nth day change, never twice within the cooldown.
const INTERSTITIAL_EVERY_N_DAYS = 3;
const INTERSTITIAL_COOLDOWN_MS = 90_000;

let initialised = false;
let rewarded: RewardedAdInstance | null = null;
let rewardedReady = false;
let interstitial: InterstitialAdInstance | null = null;
let interstitialReady = false;
let lastInterstitialAt = 0;
let dayCounter = 0;
let lastError: string | null = null;

function describeError(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return String(e);
}

/** Short human-readable state, surfaced in dev builds to explain a missing ad. */
export function adsStatus(): string {
  if (!adsSupported) return 'sin módulo nativo (Expo Go)';
  if (!initialised) return 'sin inicializar';
  if (lastError) return `error: ${lastError}`;
  if (rewardedReady) return 'recompensado listo';
  return 'cargando...';
}

export async function initAds(): Promise<void> {
  if (!adsSupported || initialised || !mobileAds) return;
  initialised = true;
  try {
    await mobileAds().initialize();
    preloadRewarded();
    preloadInterstitial();
  } catch {
    // Initialisation failures should never take the game down.
  }
}

function preloadRewarded() {
  if (!RewardedAd) return;
  rewardedReady = false;
  rewarded = RewardedAd.createForAdRequest(REWARDED_UNIT_ID, { requestNonPersonalizedAdsOnly: true });
  // Rewarded ads emit their own load event ('rewarded_loaded'), not AdEventType.LOADED.
  rewarded.addAdEventListener(RewardedAdEventType.LOADED ?? 'rewarded_loaded', () => {
    rewardedReady = true;
    lastError = null;
  });
  rewarded.addAdEventListener(AdEventType.ERROR ?? 'error', (e: unknown) => {
    rewardedReady = false;
    lastError = describeError(e);
    console.warn('[ads] rewarded failed to load:', lastError);
  });
  rewarded.load();
}

function preloadInterstitial() {
  if (!InterstitialAd) return;
  interstitialReady = false;
  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, { requestNonPersonalizedAdsOnly: true });
  interstitial.addAdEventListener(AdEventType.LOADED ?? 'loaded', () => {
    interstitialReady = true;
  });
  interstitial.addAdEventListener(AdEventType.ERROR ?? 'error', (e: unknown) => {
    interstitialReady = false;
    lastError = describeError(e);
    console.warn('[ads] interstitial failed to load:', lastError);
  });
  interstitial.load();
}

export function isRewardedReady(): boolean {
  return adsSupported && rewardedReady;
}

/**
 * Shows the rewarded ad. Resolves true only when the user actually earned the
 * reward (i.e. watched it), so the caller can grant the bonus.
 */
export function showRewarded(): Promise<boolean> {
  if (!adsSupported || !rewarded || !rewardedReady) return Promise.resolve(false);

  return new Promise((resolve) => {
    let earned = false;
    const offEarned = rewarded!.addAdEventListener(RewardedAdEventType.EARNED_REWARD ?? 'earned_reward', () => {
      earned = true;
    });
    const offClosed = rewarded!.addAdEventListener(AdEventType.CLOSED ?? 'closed', () => {
      offEarned();
      offClosed();
      preloadRewarded();
      resolve(earned);
    });

    rewarded!.show().catch(() => {
      offEarned();
      offClosed();
      preloadRewarded();
      resolve(false);
    });
  });
}

/** Called on each day change; shows an interstitial only when it is due. */
export function maybeShowInterstitial(): void {
  if (!adsSupported || !interstitial || !interstitialReady) return;

  dayCounter += 1;
  if (dayCounter % INTERSTITIAL_EVERY_N_DAYS !== 0) return;
  if (Date.now() - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) return;

  lastInterstitialAt = Date.now();
  const offClosed = interstitial.addAdEventListener(AdEventType.CLOSED ?? 'closed', () => {
    offClosed();
    preloadInterstitial();
  });
  interstitial.show().catch(() => preloadInterstitial());
}
