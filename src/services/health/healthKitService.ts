import { Platform } from "react-native";
import type { HealthMetrics } from "./types";

// Dynamic require prevents crashes on Android / missing native module
function getHK(): any {
  if (Platform.OS !== "ios") return null;
  try {
    const mod = require("react-native-health");
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

export function isHealthKitAvailable(): boolean {
  return Platform.OS === "ios" && getHK() !== null;
}

export async function requestHealthKitPermissions(): Promise<boolean> {
  const HK = getHK();
  if (!HK) return false;

  return new Promise((resolve) => {
    const permissions = {
      permissions: {
        read: [
          HK.Constants.Permissions.Steps,
          HK.Constants.Permissions.SleepAnalysis,
          HK.Constants.Permissions.HeartRate,
          HK.Constants.Permissions.RestingHeartRate,
          HK.Constants.Permissions.HeartRateVariability,
          HK.Constants.Permissions.ActiveEnergyBurned,
          HK.Constants.Permissions.BodyMass,
        ],
        write: [],
      },
    };
    HK.initHealthKit(permissions, (error: Error | null) => {
      resolve(!error);
    });
  });
}

async function fetchSteps(): Promise<number | null> {
  const HK = getHK();
  if (!HK) return null;
  return new Promise((resolve) => {
    HK.getStepCount(
      { date: new Date().toISOString() },
      (_err: Error | null, result: { value: number }) => {
        resolve(result?.value ?? null);
      }
    );
  });
}

async function fetchSleepHours(): Promise<number | null> {
  const HK = getHK();
  if (!HK) return null;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return new Promise((resolve) => {
    HK.getSleepSamples(
      { startDate: yesterday.toISOString(), endDate: now.toISOString(), limit: 30 },
      (_err: Error | null, results: Array<{ value: string; startDate: string; endDate: string }>) => {
        if (!results?.length) return resolve(null);
        const asleepValues = ["ASLEEP", "ASLEEP_CORE", "ASLEEP_DEEP", "ASLEEP_REM"];
        const totalMs = results
          .filter((s) => asleepValues.includes(s.value))
          .reduce((sum, s) => {
            return sum + (new Date(s.endDate).getTime() - new Date(s.startDate).getTime());
          }, 0);
        resolve(totalMs > 0 ? Math.round((totalMs / 3_600_000) * 10) / 10 : null);
      }
    );
  });
}

async function fetchHeartRate(): Promise<number | null> {
  const HK = getHK();
  if (!HK) return null;
  const now = new Date();
  const anHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  return new Promise((resolve) => {
    HK.getHeartRateSamples(
      { startDate: anHourAgo.toISOString(), endDate: now.toISOString(), limit: 5, ascending: false },
      (_err: Error | null, results: Array<{ value: number }>) => {
        const latest = results?.[0]?.value ?? null;
        resolve(latest ? Math.round(latest) : null);
      }
    );
  });
}

async function fetchRestingHeartRate(): Promise<number | null> {
  const HK = getHK();
  if (!HK) return null;
  return new Promise((resolve) => {
    HK.getRestingHeartRate(
      { date: new Date().toISOString() },
      (_err: Error | null, result: { value: { quantity: number } }) => {
        const val = result?.value?.quantity ?? null;
        resolve(val ? Math.round(val) : null);
      }
    );
  });
}

async function fetchHRV(): Promise<number | null> {
  const HK = getHK();
  if (!HK) return null;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return new Promise((resolve) => {
    HK.getHeartRateVariabilitySamples(
      { startDate: yesterday.toISOString(), endDate: now.toISOString(), limit: 5, ascending: false },
      (_err: Error | null, results: Array<{ value: number }>) => {
        const latest = results?.[0]?.value ?? null;
        // HRV from HealthKit is in seconds; convert to ms
        resolve(latest ? Math.round(latest * 1000) : null);
      }
    );
  });
}

async function fetchActiveEnergyBurned(): Promise<number | null> {
  const HK = getHK();
  if (!HK) return null;
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  return new Promise((resolve) => {
    HK.getActiveEnergyBurned(
      { startDate: startOfDay.toISOString(), endDate: now.toISOString() },
      (_err: Error | null, results: Array<{ value: number }>) => {
        if (!results?.length) return resolve(null);
        const total = results.reduce((sum, r) => sum + (r.value ?? 0), 0);
        resolve(total > 0 ? Math.round(total) : null);
      }
    );
  });
}

async function fetchWeight(): Promise<number | null> {
  const HK = getHK();
  if (!HK) return null;
  return new Promise((resolve) => {
    HK.getLatestWeight(
      { unit: "kilogram" },
      (_err: Error | null, result: { value: number }) => {
        const val = result?.value ?? null;
        resolve(val ? Math.round(val * 10) / 10 : null);
      }
    );
  });
}

export async function fetchAllHealthKitData(): Promise<Partial<HealthMetrics>> {
  try {
    const [steps, sleepHours, heartRate, restingHeartRate, hrv, activeEnergyBurned, weight] =
      await Promise.allSettled([
        fetchSteps(),
        fetchSleepHours(),
        fetchHeartRate(),
        fetchRestingHeartRate(),
        fetchHRV(),
        fetchActiveEnergyBurned(),
        fetchWeight(),
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
