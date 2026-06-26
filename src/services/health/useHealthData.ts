import { useState, useEffect, useCallback } from "react";
import { Alert, Platform } from "react-native";
import {
  isPlatformHealthAvailable,
  isHealthConnectApiUnsupported,
  requestHealthPermissions,
  syncHealthData,
  getCachedHealthMetrics,
  getHealthPermissionStatus,
} from "./healthService";
import type { HealthMetrics, HealthPermissionStatus } from "./types";

export interface HealthDataState {
  metrics: HealthMetrics | null;
  loading: boolean;
  syncing: boolean;
  permissionStatus: HealthPermissionStatus;
  isAvailable: boolean;
  /** True when running on Android API < 26 — Health Connect cannot be used. */
  isUnsupported: boolean;
  requestAndSync: () => Promise<void>;
  sync: () => Promise<void>;
}

export function useHealthData(): HealthDataState {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<HealthPermissionStatus>("not_determined");

  const isAvailable = isPlatformHealthAvailable();
  const isUnsupported = isHealthConnectApiUnsupported();

  useEffect(() => {
    async function loadAndMaybeSync() {
      const [cached, status] = await Promise.all([
        getCachedHealthMetrics(),
        getHealthPermissionStatus(),
      ]);
      setMetrics(cached);
      setPermissionStatus(status);
      setLoading(false);

      // Silent background sync only when permission was previously granted.
      // Never triggers a permission dialog — that requires explicit user action.
      if (isAvailable && status === "granted") {
        try {
          const updated = await syncHealthData();
          setMetrics(updated);
        } catch {
          // Silently ignore sync failures; cached data remains displayed
        }
      }
    }
    loadAndMaybeSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync() — only reads data, never requests permissions
  const sync = useCallback(async () => {
    if (!isAvailable || permissionStatus !== "granted") return;
    setSyncing(true);
    try {
      const updated = await syncHealthData();
      setMetrics(updated);
    } catch {
      // Silently ignore
    } finally {
      setSyncing(false);
    }
  }, [isAvailable, permissionStatus]);

  // requestAndSync() — only called from explicit user action (Connect button)
  const requestAndSync = useCallback(async () => {
    if (Platform.OS === "android" && (Platform.Version as number) < 26) {
      Alert.alert(
        "Health Connect",
        "Health Connect requires Android 8 (Oreo) or higher.",
        [{ text: "OK" }]
      );
      return;
    }
    if (!isAvailable) return;
    setSyncing(true);
    try {
      const granted = await requestHealthPermissions();
      setPermissionStatus(granted ? "granted" : "denied");
      if (granted) {
        const updated = await syncHealthData();
        setMetrics(updated);
      }
    } catch {
      // Permission denied or unavailable — graceful no-op
    } finally {
      setSyncing(false);
    }
  }, [isAvailable]);

  return { metrics, loading, syncing, permissionStatus, isAvailable, isUnsupported, requestAndSync, sync };
}
