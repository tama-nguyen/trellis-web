import { get } from "@/shared/api/http";

/**
 * Feature flags the server sends in `GET /api/app-config`. Typed, so a misspelt flag is a
 * compile error (DataHub's hook takes a plain string).
 *
 * Every default is the safe value: what the UI shows before config arrives, when the request
 * fails, and for a flag an older backend does not know. Review the flag-off branch as carefully
 * as the flag-on branch.
 */
export type FeatureFlags = {
  /** Sample: search box on the notification list. */
  notificationSearch: boolean;
};
export type FeatureFlagKey = keyof FeatureFlags;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  notificationSearch: false,
};

export const APP_CONFIG_PATH = "/api/app-config";

/** localStorage key for the last flags seen, so the next load does not flash the defaults. */
export const FEATURE_FLAGS_STORAGE_KEY = "trellis.featureFlags";

export type AppConfig = {
  featureFlags: Partial<FeatureFlags>;
};

export const featureFlagKeys = {
  all: ["featureFlags"] as const,
};

export async function fetchFeatureFlags(signal?: AbortSignal): Promise<FeatureFlags> {
  const config = await get<AppConfig>(APP_CONFIG_PATH, { signal, anonymous: true });
  const flags = { ...DEFAULT_FEATURE_FLAGS, ...config.featureFlags };
  writeCachedFlags(flags);
  return flags;
}

let cachedRaw: string | null = null;
let cachedFlags: FeatureFlags = DEFAULT_FEATURE_FLAGS;

/**
 * Last flags seen, or the defaults. Returns the same object while storage is unchanged, as
 * `useSyncExternalStore` requires. Storage can throw (private mode, blocked site data).
 */
export function readCachedFlags(): FeatureFlags {
  try {
    const raw = window.localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
    if (raw === cachedRaw) return cachedFlags;
    cachedRaw = raw;
    cachedFlags = raw
      ? { ...DEFAULT_FEATURE_FLAGS, ...(JSON.parse(raw) as Partial<FeatureFlags>) }
      : DEFAULT_FEATURE_FLAGS;
  } catch {
    cachedFlags = DEFAULT_FEATURE_FLAGS;
  }
  return cachedFlags;
}

function writeCachedFlags(flags: FeatureFlags): void {
  try {
    window.localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // Not caching only costs a flash of defaults on the next load.
  }
}
