export interface HealthMetrics {
  steps: number | null;
  sleepHours: number | null;
  heartRate: number | null;
  restingHeartRate: number | null;
  hrv: number | null;
  activeEnergyBurned: number | null;
  weight: number | null;
  lastSynced: string | null;
}

export const EMPTY_HEALTH_METRICS: HealthMetrics = {
  steps: null,
  sleepHours: null,
  heartRate: null,
  restingHeartRate: null,
  hrv: null,
  activeEnergyBurned: null,
  weight: null,
  lastSynced: null,
};

export type HealthPermissionStatus = "granted" | "denied" | "not_determined";
