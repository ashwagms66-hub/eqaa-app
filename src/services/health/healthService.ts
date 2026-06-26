import { Platform } from "react-native";
import {
  isHealthKitAvailable,
  requestHealthKitPermissions,
  fetchAllHealthKitData,
} from "./healthKitService";
import {
  isHealthConnectAvailable,
  isHealthConnectApiUnsupported,
  requestHealthConnectPermissions,
  fetchAllHealthConnectData,
} from "./healthConnectService";

export { isHealthConnectApiUnsupported };
import {
  saveHealthMetrics,
  getHealthMetrics,
  savePermissionStatus,
  getPermissionStatus,
} from "./healthStorage";
import type { HealthMetrics, HealthPermissionStatus } from "./types";
import { EMPTY_HEALTH_METRICS } from "./types";

export function isPlatformHealthAvailable(): boolean {
  if (Platform.OS === "ios") return isHealthKitAvailable();
  if (Platform.OS === "android") return isHealthConnectAvailable();
  return false;
}

export async function requestHealthPermissions(): Promise<boolean> {
  try {
    let granted = false;
    if (Platform.OS === "ios") {
      granted = await requestHealthKitPermissions();
    } else if (Platform.OS === "android") {
      granted = await requestHealthConnectPermissions();
    }
    await savePermissionStatus(granted ? "granted" : "denied");
    return granted;
  } catch {
    await savePermissionStatus("denied");
    return false;
  }
}

export async function syncHealthData(): Promise<HealthMetrics> {
  try {
    let data: Partial<HealthMetrics> = {};
    if (Platform.OS === "ios") {
      data = await fetchAllHealthKitData();
    } else if (Platform.OS === "android") {
      data = await fetchAllHealthConnectData();
    }
    await saveHealthMetrics(data);
    return { ...EMPTY_HEALTH_METRICS, ...data, lastSynced: new Date().toISOString() };
  } catch {
    return { ...EMPTY_HEALTH_METRICS, lastSynced: new Date().toISOString() };
  }
}

export async function getCachedHealthMetrics(): Promise<HealthMetrics | null> {
  return getHealthMetrics();
}

export async function getHealthPermissionStatus(): Promise<HealthPermissionStatus> {
  return getPermissionStatus();
}

export function formatLastSynced(isoString: string | null, language: "ar" | "en"): string {
  if (!isoString) return language === "ar" ? "لم تتم المزامنة بعد" : "Not synced yet";
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);

  if (language === "ar") {
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return "أمس";
  }
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return "yesterday";
}
