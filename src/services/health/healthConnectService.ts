import { Platform } from "react-native";
import type { HealthMetrics } from "./types";

function getHC(): any {
  if (Platform.OS !== "android") return null;
  if ((Platform.Version as number) < 26) return null;
  try {
    // react-native-health-connect is excluded from Android autolinking until a
    // version compatible with minSdkVersion 24 is available. The require() will
    // throw on all Android builds; the catch keeps every call site safe.
    return require("react-native-health-connect");
  } catch {
    return null;
  }
}

/** True on Android devices that cannot support Health Connect (API < 26). */
export function isHealthConnectApiUnsupported(): boolean {
  return Platform.OS === "android" && (Platform.Version as number) < 26;
}

export function isHealthConnectAvailable(): boolean {
  return Platform.OS === "android" && getHC() !== null;
}

function todayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return {
    operator: "between" as const,
    startTime: start.toISOString(),
    endTime: now.toISOString(),
  };
}

function last24hRange() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return {
    operator: "between" as const,
    startTime: yesterday.toISOString(),
    endTime: now.toISOString(),
  };
}

export async function requestHealthConnectPermissions(): Promise<boolean> {
  const HC = getHC();
  if (!HC) return false;
  try {
    const initialized = await HC.initialize();
    if (!initialized) return false;
    await HC.requestPermission([
      { accessType: "read", recordType: "Steps" },
      { accessType: "read", recordType: "SleepSession" },
      { accessType: "read", recordType: "HeartRate" },
      { accessType: "read", recordType: "RestingHeartRate" },
      { accessType: "read", recordType: "HeartRateVariabilityRmssd" },
      { accessType: "read", recordType: "ActiveCaloriesBurned" },
      { accessType: "read", recordType: "Weight" },
    ]);
    return true;
  } catch {
    return false;
  }
}

async function fetchSteps(HC: any): Promise<number | null> {
  try {
    const result = await HC.readRecords("Steps", { timeRangeFilter: todayRange() });
    const records = result?.records ?? [];
    const total = records.reduce(
      (sum: number, r: { count: number }) => sum + (r.count ?? 0),
      0
    );
    return total > 0 ? total : null;
  } catch {
    return null;
  }
}

async function fetchSleepHours(HC: any): Promise<number | null> {
  try {
    const result = await HC.readRecords("SleepSession", { timeRangeFilter: last24hRange() });
    const records = result?.records ?? [];
    const totalMs = records.reduce((sum: number, r: { startTime: string; endTime: string }) => {
      return sum + (new Date(r.endTime).getTime() - new Date(r.startTime).getTime());
    }, 0);
    return totalMs > 0 ? Math.round((totalMs / 3_600_000) * 10) / 10 : null;
  } catch {
    return null;
  }
}

async function fetchHeartRate(HC: any): Promise<number | null> {
  try {
    const result = await HC.readRecords("HeartRate", { timeRangeFilter: last24hRange() });
    const records = result?.records ?? [];
    if (!records.length) return null;
    const samples: Array<{ beatsPerMinute: number }> = records.flatMap(
      (r: { samples: Array<{ beatsPerMinute: number }> }) => r.samples ?? []
    );
    if (!samples.length) return null;
    const avg = samples.reduce((s, r) => s + r.beatsPerMinute, 0) / samples.length;
    return Math.round(avg);
  } catch {
    return null;
  }
}

async function fetchRestingHeartRate(HC: any): Promise<number | null> {
  try {
    const result = await HC.readRecords("RestingHeartRate", { timeRangeFilter: last24hRange() });
    const records = result?.records ?? [];
    const latest = records[records.length - 1];
    return latest?.beatsPerMinute ? Math.round(latest.beatsPerMinute) : null;
  } catch {
    return null;
  }
}

async function fetchHRV(HC: any): Promise<number | null> {
  try {
    const result = await HC.readRecords("HeartRateVariabilityRmssd", {
      timeRangeFilter: last24hRange(),
    });
    const records = result?.records ?? [];
    const latest = records[records.length - 1];
    return latest?.heartRateVariabilityMillis
      ? Math.round(latest.heartRateVariabilityMillis)
      : null;
  } catch {
    return null;
  }
}

async function fetchActiveCalories(HC: any): Promise<number | null> {
  try {
    const result = await HC.readRecords("ActiveCaloriesBurned", {
      timeRangeFilter: todayRange(),
    });
    const records = result?.records ?? [];
    const total = records.reduce(
      (sum: number, r: { energy: { inKilocalories: number } }) =>
        sum + (r.energy?.inKilocalories ?? 0),
      0
    );
    return total > 0 ? Math.round(total) : null;
  } catch {
    return null;
  }
}

async function fetchWeight(HC: any): Promise<number | null> {
  try {
    const thirtyDays = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await HC.readRecords("Weight", {
      timeRangeFilter: {
        operator: "between" as const,
        startTime: thirtyDays.toISOString(),
        endTime: new Date().toISOString(),
      },
    });
    const records = result?.records ?? [];
    const latest = records[records.length - 1];
    return latest?.weight?.inKilograms
      ? Math.round(latest.weight.inKilograms * 10) / 10
      : null;
  } catch {
    return null;
  }
}

export async function fetchAllHealthConnectData(): Promise<Partial<HealthMetrics>> {
  const HC = getHC();
  if (!HC) return {};
  try {
    const [steps, sleepHours, heartRate, restingHeartRate, hrv, activeEnergyBurned, weight] =
      await Promise.allSettled([
        fetchSteps(HC),
        fetchSleepHours(HC),
        fetchHeartRate(HC),
        fetchRestingHeartRate(HC),
        fetchHRV(HC),
        fetchActiveCalories(HC),
        fetchWeight(HC),
      ]);

    const get = (r: PromiseSettledResult<number | null>) =>
      r.status === "fulfilled" ? r.value : null;

    return {
      steps: get(steps),
      sleepHours: get(sleepHours),
      heartRate: get(heartRate),
      restingHeartRate: get(restingHeartRate),
      hrv: get(hrv),
      activeEnergyBurned: get(activeEnergyBurned),
      weight: get(weight),
    };
  } catch {
    return {};
  }
}
