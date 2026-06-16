import AsyncStorage from "@react-native-async-storage/async-storage";

export const FASTING_HISTORY_KEY = "fasting_history";

export interface FastingRecord {
  date: string;        // "YYYY-MM-DD"
  startTime: number;   // ms timestamp
  endTime: number;     // ms timestamp
  durationSec: number;
}

export async function getFastingHistory(): Promise<FastingRecord[]> {
  const raw = await AsyncStorage.getItem(FASTING_HISTORY_KEY);
  return raw ? (JSON.parse(raw) as FastingRecord[]) : [];
}

export async function getAverageFast(): Promise<number> {
  const history = await getFastingHistory();
  if (history.length === 0) return 0;
  const total = history.reduce((s, r) => s + r.durationSec, 0);
  return total / history.length;
}

export async function getLongestFast(): Promise<number> {
  const history = await getFastingHistory();
  if (history.length === 0) return 0;
  return Math.max(...history.map((r) => r.durationSec));
}

export async function getWeeklyFastCount(): Promise<number> {
  const history = await getFastingHistory();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.filter((r) => r.startTime >= sevenDaysAgo).length;
}

// targetHours: the phase-recommended minimum (e.g. 12, 14, 16)
export async function getCompletionRate(targetHours: number): Promise<number> {
  const history = await getFastingHistory();
  if (history.length === 0) return 0;
  const targetSec = targetHours * 3600;
  const completed = history.filter((r) => r.durationSec >= targetSec).length;
  return Math.round((completed / history.length) * 100);
}
