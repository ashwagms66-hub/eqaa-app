import type { HealthMetrics } from "../types";

/**
 * Generic provider interface every wearable integration must implement.
 * Keeping this consistent lets healthService swap providers without UI changes.
 */
export interface WearableProvider {
  readonly id: WearableProviderId;
  readonly name: string;
  readonly nameAr: string;
  readonly icon: string;

  /** Returns true only if the SDK is linked AND the platform is supported */
  isAvailable(): boolean;

  /** Requests the minimum permissions needed. Returns true if granted. */
  requestPermissions(): Promise<boolean>;

  /** Fetches today's metrics. Throws only for unrecoverable errors. */
  fetchData(): Promise<Partial<HealthMetrics>>;
}

export type WearableProviderId =
  | "apple_health"
  | "health_connect"
  | "whoop"
  | "fitbit"
  | "garmin"
  | "oura";

export type WearableStatus =
  | "not_configured"   // SDK not linked or platform unsupported
  | "not_connected"    // Available but no account/permission yet
  | "connected"        // Active and returning data
  | "error";           // Connected but last sync failed
