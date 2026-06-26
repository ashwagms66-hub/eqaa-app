/**
 * WHOOP Integration — NOT YET IMPLEMENTED
 *
 * WHOOP uses an OAuth 2.0 REST API (no native SDK required).
 * When implementing:
 *   1. Register an app at developer.whoop.com
 *   2. Store the access token in SecureStore (not AsyncStorage)
 *   3. Fetch from https://api.prod.whoop.com/developer/v1/
 *      - /activity/sleep   → sleepHours
 *      - /recovery         → hrv, restingHeartRate (recovery score)
 *      - /cycle            → activeEnergyBurned
 *   4. Map WHOOP's strain score → activityScore factor in scoringService
 *
 * This stub satisfies the WearableProvider interface so the registry
 * compiles; `isAvailable()` returns false until the feature is shipped.
 */

import type { WearableProvider } from "./types";
import type { HealthMetrics } from "../types";

export const whoopService: WearableProvider = {
  id: "whoop",
  name: "WHOOP",
  nameAr: "WHOOP",
  icon: "⌚",

  isAvailable(): boolean {
    return false; // not yet implemented
  },

  async requestPermissions(): Promise<boolean> {
    return false;
  },

  async fetchData(): Promise<Partial<HealthMetrics>> {
    return {};
  },
};
