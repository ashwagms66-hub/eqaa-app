import type { WearableProvider, WearableProviderId } from "./types";
import { whoopService } from "./whoopService";
import { fitbitService } from "./fitbitService";
import { garminService } from "./garminService";
import { ouraProvider } from "./ouraProvider";

/**
 * Central registry of all wearable providers.
 * Apple Health and Health Connect are registered separately in healthService.ts
 * because they use platform-native APIs rather than REST OAuth.
 *
 * To add a new provider: implement WearableProvider, add to this map, done.
 */
const WEARABLE_REGISTRY: Record<WearableProviderId, WearableProvider | null> = {
  apple_health:   null,    // managed by healthKitService
  health_connect: null,    // managed by healthConnectService
  whoop:          whoopService,
  fitbit:         fitbitService,
  garmin:         garminService,
  oura:           ouraProvider,
};

/** Returns all third-party providers (excludes platform health APIs). */
export function getThirdPartyProviders(): WearableProvider[] {
  const thirdParty: WearableProviderId[] = ["whoop", "fitbit", "garmin", "oura"];
  return thirdParty
    .map((id) => WEARABLE_REGISTRY[id])
    .filter((p): p is WearableProvider => p !== null);
}

/** Returns only providers that are currently available on this device/platform. */
export function getAvailableProviders(): WearableProvider[] {
  return getThirdPartyProviders().filter((p) => p.isAvailable());
}

export function getProvider(id: WearableProviderId): WearableProvider | null {
  return WEARABLE_REGISTRY[id] ?? null;
}
