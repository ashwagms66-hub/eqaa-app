/**
 * Oura Ring Integration — NOT YET IMPLEMENTED
 *
 * Oura uses an OAuth 2.0 REST API (no native SDK required).
 * When implementing:
 *   1. Register at cloud.ouraring.com/oauth/applications
 *   2. Store access token in SecureStore
 *   3. Fetch from https://api.ouraring.com/v2/usercollection/
 *      - /sleep       → sleepHours, sleepScore
 *      - /daily_readiness → hrv, restingHeartRate
 *      - /daily_activity  → steps, activeEnergyBurned
 *   4. Oura's readiness_score (0-100) can feed directly into
 *      the UnifiedReadinessInput as an additional signal
 *
 * This stub satisfies the WearableProvider interface so the registry
 * compiles; `isAvailable()` returns false until the feature is shipped.
 */

import type { WearableProvider } from "./types";
import type { HealthMetrics } from "../types";

export const ouraProvider: WearableProvider = {
  id: "oura",
  name: "Oura Ring",
  nameAr: "خاتم أورا",
  icon: "💍",

  isAvailable(): boolean {
    return false;
  },

  async requestPermissions(): Promise<boolean> {
    return false;
  },

  async fetchData(): Promise<Partial<HealthMetrics>> {
    return {};
  },
};
