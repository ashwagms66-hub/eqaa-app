import AsyncStorage from "@react-native-async-storage/async-storage";

export const CHECKIN_STORAGE_KEY =
  "@eqaa_daily_checkins";

export type DailyCheckIn = {
  date: string;
  mood?: string;
  flow?: "Light" | "Medium" | "Heavy";
  symptoms?: string[];
  energy?: number;
  notes?: string;
  isPeriodDay?: boolean;
  createdAt: string;
};

export async function getAllCheckIns(): Promise<
  Record<string, DailyCheckIn>
> {
  try {
    const raw = await AsyncStorage.getItem(
      CHECKIN_STORAGE_KEY
    );

    if (!raw) {
      return {};
    }

    return JSON.parse(raw);
  } catch (error) {
    console.log(
      "Error loading check-ins:",
      error
    );

    return {};
  }
}

export async function getCheckIn(
  date: string
): Promise<DailyCheckIn | null> {
  try {
    const all = await getAllCheckIns();

    return all[date] || null;
  } catch (error) {
    console.log(
      "Error getting check-in:",
      error
    );

    return null;
  }
}

export async function saveCheckIn(
  checkIn: DailyCheckIn
): Promise<void> {
  try {
    const all = await getAllCheckIns();

    all[checkIn.date] = {
      ...checkIn,
      createdAt:
        checkIn.createdAt ||
        new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      CHECKIN_STORAGE_KEY,
      JSON.stringify(all)
    );
  } catch (error) {
    console.log(
      "Error saving check-in:",
      error
    );
  }
}

export async function deleteCheckIn(
  date: string
): Promise<void> {
  try {
    const all = await getAllCheckIns();

    delete all[date];

    await AsyncStorage.setItem(
      CHECKIN_STORAGE_KEY,
      JSON.stringify(all)
    );
  } catch (error) {
    console.log(
      "Error deleting check-in:",
      error
    );
  }
}

export async function clearAllCheckIns(): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      CHECKIN_STORAGE_KEY
    );
  } catch (error) {
    console.log(
      "Error clearing check-ins:",
      error
    );
  }
}

export async function hasCheckIn(
  date: string
): Promise<boolean> {
  const checkIn = await getCheckIn(date);

  return !!checkIn;
}

export async function getRecentCheckIns(
  limit: number = 7
): Promise<DailyCheckIn[]> {
  try {
    const all = await getAllCheckIns();

    return Object.values(all)
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      })
      .slice(0, limit);
  } catch (error) {
    console.log(
      "Error loading recent check-ins:",
      error
    );

    return [];
  }
}

export async function getMoodStats() {
  try {
    const all = await getAllCheckIns();

    const moods: Record<string, number> = {};

    Object.values(all).forEach((item) => {
      if (!item.mood) return;

      moods[item.mood] =
        (moods[item.mood] || 0) + 1;
    });

    return moods;
  } catch (error) {
    console.log(
      "Error calculating mood stats:",
      error
    );

    return {};
  }
}

export async function getSymptomStats() {
  try {
    const all = await getAllCheckIns();

    const symptoms: Record<string, number> = {};

    Object.values(all).forEach((item) => {
      item.symptoms?.forEach((symptom) => {
        symptoms[symptom] =
          (symptoms[symptom] || 0) + 1;
      });
    });

    return symptoms;
  } catch (error) {
    console.log(
      "Error calculating symptom stats:",
      error
    );

    return {};
  }
}

export async function getAverageEnergy() {
  try {
    const all = await getAllCheckIns();

    const energies = Object.values(all)
      .map((item) => item.energy)
      .filter(
        (value): value is number =>
          typeof value === "number"
      );

    if (!energies.length) {
      return 0;
    }

    const total = energies.reduce(
      (sum, value) => sum + value,
      0
    );

    return Math.round(
      total / energies.length
    );
  } catch (error) {
    console.log(
      "Error calculating average energy:",
      error
    );

    return 0;
  }
}

export async function getPeriodDays() {
  try {
    const all = await getAllCheckIns();

    return Object.values(all)
      .filter((item) => item.isPeriodDay)
      .map((item) => item.date);
  } catch (error) {
    console.log(
      "Error loading period days:",
      error
    );

    return [];
  }
}

export async function getRecentNotes(
  limit: number = 5
) {
  try {
    const all = await getAllCheckIns();

    return Object.values(all)
      .filter((item) => item.notes)
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      })
      .slice(0, limit)
      .map((item) => ({
        date: item.date,
        notes: item.notes,
      }));
  } catch (error) {
    console.log(
      "Error loading recent notes:",
      error
    );

    return [];
  }
}
const SLEEP_KEY = "@eqaa_sleep";
const ENERGY_KEY = "@eqaa_energy";
const STRESS_KEY = "@eqaa_stress";

export async function saveSleep(value: number) {
  await AsyncStorage.setItem(
    SLEEP_KEY,
    value.toString()
  );
}

export async function getSleep() {
  const value =
    await AsyncStorage.getItem(SLEEP_KEY);

  return value ? Number(value) : null;
}

export async function saveEnergy(value: number) {
  await AsyncStorage.setItem(
    ENERGY_KEY,
    value.toString()
  );
}

export async function getEnergy() {
  const value =
    await AsyncStorage.getItem(ENERGY_KEY);

  return value ? Number(value) : null;
}

export async function saveStress(value: string) {
  await AsyncStorage.setItem(
    STRESS_KEY,
    value
  );
}

export async function getStress() {
  return await AsyncStorage.getItem(
    STRESS_KEY
  );
}