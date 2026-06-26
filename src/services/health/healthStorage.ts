import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HealthMetrics, HealthPermissionStatus } from "./types";
import { EMPTY_HEALTH_METRICS } from "./types";

const HEALTH_KEY = "@eqaa_health_metrics";
const PERMISSION_KEY = "@eqaa_health_permission";

export async function saveHealthMetrics(metrics: Partial<HealthMetrics>): Promise<void> {
  try {
    const existing = await getHealthMetrics();
    const merged: HealthMetrics = {
      ...EMPTY_HEALTH_METRICS,
      ...existing,
      ...metrics,
      lastSynced: new Date().toISOString(),
    };
    await AsyncStorage.setItem(HEALTH_KEY, JSON.stringify(merged));
  } catch {}
}

export async function getHealthMetrics(): Promise<HealthMetrics | null> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HealthMetrics;
  } catch {
    return null;
  }
}

export async function savePermissionStatus(status: HealthPermissionStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(PERMISSION_KEY, status);
  } catch {}
}

export async function getPermissionStatus(): Promise<HealthPermissionStatus> {
  try {
    const val = await AsyncStorage.getItem(PERMISSION_KEY);
    return (val as HealthPermissionStatus) ?? "not_determined";
  } catch {
    return "not_determined";
  }
}
