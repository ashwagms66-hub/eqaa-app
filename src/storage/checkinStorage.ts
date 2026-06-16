import AsyncStorage from "@react-native-async-storage/async-storage";

export const CHECKIN_STORAGE_KEY = "@eqaa_daily_checkins";

export type DailyCheckIn = {
  date: string;
  mood?: string;
  flow?: "Light" | "Medium" | "Heavy";
  symptoms?: string[];
  energy?: number;       // 1–10
  sleepHours?: number;   // e.g. 4–12
  fastingCompleted?: boolean;
  workoutCompleted?: boolean;
  weight?: number;       // kg
  notes?: string;
  isPeriodDay?: boolean;
  createdAt: string;
};

export type DaySnapshot = {
  date: string;
  mood: string | null;
  energy: number | null;
  sleepHours: number | null;
  fastingCompleted: boolean;
  workoutCompleted: boolean;
  symptoms: string[];
};

export type WeeklySummary = {
  days: DaySnapshot[];
  avgEnergy: number | null;
  avgSleep: number | null;
  fastingDays: number;
  workoutDays: number;
  topMood: string | null;
};

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayISO(): string {
  return isoDate(new Date());
}

export async function saveDailyCheckIn(
  data: Partial<Omit<DailyCheckIn, "date" | "createdAt">>
): Promise<void> {
  try {
    const today = todayISO();
    const all = await getAllCheckIns();
    const existing = all[today] ?? { date: today, createdAt: new Date().toISOString() };
    all[today] = { ...existing, ...data, date: today };
    await AsyncStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(all));
    if (typeof data.sleepHours === "number") await saveSleep(data.sleepHours);
    if (typeof data.energy === "number")     await saveEnergy(data.energy);
  } catch {
    // silent
  }
}

export async function getDailyCheckIn(date?: string): Promise<DailyCheckIn | null> {
  try {
    const target = date ?? todayISO();
    const all = await getAllCheckIns();
    return all[target] ?? null;
  } catch {
    return null;
  }
}

export async function getWeeklySummary(): Promise<WeeklySummary> {
  const all = await getAllCheckIns();
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const snapshots: DaySnapshot[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
    const iso = isoDate(d);
    const ci = all[iso];
    snapshots.push({
      date: iso,
      mood: ci?.mood ?? null,
      energy: typeof ci?.energy === "number" ? ci.energy : null,
      sleepHours: typeof ci?.sleepHours === "number" ? ci.sleepHours : null,
      fastingCompleted: ci?.fastingCompleted ?? false,
      workoutCompleted: ci?.workoutCompleted ?? false,
      symptoms: ci?.symptoms ?? [],
    });
  }

  const energies  = snapshots.flatMap(d => d.energy     !== null ? [d.energy]     : []);
  const sleeps    = snapshots.flatMap(d => d.sleepHours  !== null ? [d.sleepHours] : []);
  const moodCount: Record<string, number> = {};
  snapshots.forEach(d => { if (d.mood) moodCount[d.mood] = (moodCount[d.mood] ?? 0) + 1; });
  const topEntry  = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];

  return {
    days: snapshots,
    avgEnergy:  energies.length ? Math.round(energies.reduce((s, e) => s + e, 0) / energies.length) : null,
    avgSleep:   sleeps.length   ? Math.round((sleeps.reduce((s, h) => s + h, 0) / sleeps.length) * 10) / 10 : null,
    fastingDays: snapshots.filter(d => d.fastingCompleted).length,
    workoutDays: snapshots.filter(d => d.workoutCompleted).length,
    topMood:    topEntry?.[0] ?? null,
  };
}

export async function getAllCheckIns(): Promise<Record<string, DailyCheckIn>> {
  try {
    const raw = await AsyncStorage.getItem(CHECKIN_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function getCheckIn(date: string): Promise<DailyCheckIn | null> {
  try {
    const all = await getAllCheckIns();
    return all[date] || null;
  } catch {
    return null;
  }
}

export async function saveCheckIn(checkIn: DailyCheckIn): Promise<void> {
  try {
    const all = await getAllCheckIns();
    all[checkIn.date] = {
      ...checkIn,
      createdAt: checkIn.createdAt || new Date().toISOString(),
    };
    await AsyncStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent
  }
}

export async function deleteCheckIn(date: string): Promise<void> {
  try {
    const all = await getAllCheckIns();
    delete all[date];
    await AsyncStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent
  }
}

export async function clearAllCheckIns(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHECKIN_STORAGE_KEY);
  } catch {
    // silent
  }
}

export async function hasCheckIn(date: string): Promise<boolean> {
  const checkIn = await getCheckIn(date);
  return !!checkIn;
}

export async function getRecentCheckIns(limit: number = 7): Promise<DailyCheckIn[]> {
  try {
    const all = await getAllCheckIns();
    return Object.values(all)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function getMoodStats() {
  try {
    const all = await getAllCheckIns();
    const moods: Record<string, number> = {};
    Object.values(all).forEach((item) => {
      if (!item.mood) return;
      moods[item.mood] = (moods[item.mood] || 0) + 1;
    });
    return moods;
  } catch {
    return {};
  }
}

export async function getSymptomStats() {
  try {
    const all = await getAllCheckIns();
    const symptoms: Record<string, number> = {};
    Object.values(all).forEach((item) => {
      item.symptoms?.forEach((symptom) => {
        symptoms[symptom] = (symptoms[symptom] || 0) + 1;
      });
    });
    return symptoms;
  } catch {
    return {};
  }
}

export async function getAverageEnergy() {
  try {
    const all = await getAllCheckIns();
    const energies = Object.values(all)
      .map((item) => item.energy)
      .filter((value): value is number => typeof value === "number");
    if (!energies.length) return 0;
    const total = energies.reduce((sum, value) => sum + value, 0);
    return Math.round(total / energies.length);
  } catch {
    return 0;
  }
}

export async function getPeriodDays() {
  try {
    const all = await getAllCheckIns();
    return Object.values(all)
      .filter((item) => item.isPeriodDay)
      .map((item) => item.date);
  } catch {
    return [];
  }
}

export async function getRecentNotes(limit: number = 5) {
  try {
    const all = await getAllCheckIns();
    return Object.values(all)
      .filter((item) => item.notes)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((item) => ({ date: item.date, notes: item.notes }));
  } catch {
    return [];
  }
}

const SLEEP_KEY = "@eqaa_sleep";
const ENERGY_KEY = "@eqaa_energy";
const STRESS_KEY = "@eqaa_stress";

export async function saveSleep(value: number) {
  await AsyncStorage.setItem(SLEEP_KEY, value.toString());
}

export async function getSleep() {
  const value = await AsyncStorage.getItem(SLEEP_KEY);
  return value ? Number(value) : null;
}

export async function saveEnergy(value: number) {
  await AsyncStorage.setItem(ENERGY_KEY, value.toString());
}

export async function getEnergy() {
  const value = await AsyncStorage.getItem(ENERGY_KEY);
  return value ? Number(value) : null;
}

export async function saveStress(value: string) {
  await AsyncStorage.setItem(STRESS_KEY, value);
}

export async function getStress() {
  return await AsyncStorage.getItem(STRESS_KEY);
}
