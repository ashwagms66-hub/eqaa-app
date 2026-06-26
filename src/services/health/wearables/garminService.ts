/**
 * Garmin Integration — NOT YET IMPLEMENTED
 *
 * Garmin offers two integration paths:
 *   A. Garmin Health API (enterprise OAuth, requires application approval)
 *   B. Connect IQ SDK (native device app — not relevant here)
 *
 * Recommended path for Eqa'a: Garmin Health API
 *   1. Apply at health.garmin.com/health-api
 *   2. OAuth PKCE flow → store token in SecureStore
 *   3. Webhook-based push model (Garmin pushes data to a server endpoint)
 *      Server stores daily summaries → app fetches from your backend
 *   4. Available metrics: steps, sleep, heart rate, HRV, calories
 *      Note: Garmin HRV is daily (HRV4Training-compatible format)
 *
 * `isAvailable()` returns false until the feature is shipped.
 */

import type { WearableProvider } from "./types";
import type { HealthMetrics } from "../types";

export const garminService: WearableProvider = {
  id: "garmin",
  name: "Garmin",
  nameAr: "Garmin",
  icon: "🏃",

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
