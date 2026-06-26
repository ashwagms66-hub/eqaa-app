/**
 * Fitbit / Google Fit Integration — NOT YET IMPLEMENTED
 *
 * Fitbit uses the Fitbit Web API (OAuth 2.0 REST).
 * When implementing:
 *   1. Register at dev.fitbit.com
 *   2. OAuth flow → store token in SecureStore
 *   3. Fetch from https://api.fitbit.com/1/user/-/
 *      - /activities/steps/date/today/1d.json    → steps
 *      - /sleep/date/today.json                  → sleepHours
 *      - /activities/heart/date/today/1d.json    → heartRate, restingHeartRate
 *      - /activities/calories/date/today/1d.json → activeEnergyBurned
 *   Note: Fitbit does not expose HRV via public API as of 2024.
 *
 * `isAvailable()` returns false until the feature is shipped.
 */

import type { WearableProvider } from "./types";
import type { HealthMetrics } from "../types";

export const fitbitService: WearableProvider = {
  id: "fitbit",
  name: "Fitbit",
  nameAr: "Fitbit",
  icon: "📊",

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
