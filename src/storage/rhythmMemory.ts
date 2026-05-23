

import AsyncStorage from "@react-native-async-storage/async-storage";

const RHYTHM_MEMORY_KEY =
  "@eqaa_rhythm_memory";

export type RhythmMemoryEntry = {
  date: string;

  readiness: number;
  mood: string;

  sleepHours: number;
  stressLevel: string;
  energyLevel: number;

  emotionalState: string;
  rhythmLabel: string;
};

export async function saveDailyRhythm(
  entry: RhythmMemoryEntry
) {
  try {
    const existing =
      await getRhythmHistory();

    const alreadyExists =
      existing.find(
        (item) =>
          item.date === entry.date
      );

    let updated: RhythmMemoryEntry[] =
      [];

    if (alreadyExists) {
      updated = existing.map((item) =>
        item.date === entry.date
          ? entry
          : item
      );
    } else {
      updated = [entry, ...existing];
    }

    await AsyncStorage.setItem(
      RHYTHM_MEMORY_KEY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.log(
      "saveDailyRhythm error",
      error
    );
  }
}

export async function getRhythmHistory(): Promise<
  RhythmMemoryEntry[]
> {
  try {
    const data =
      await AsyncStorage.getItem(
        RHYTHM_MEMORY_KEY
      );

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.log(
      "getRhythmHistory error",
      error
    );

    return [];
  }
}

export async function getAverageReadiness() {
  const history =
    await getRhythmHistory();

  if (history.length === 0) {
    return 0;
  }

  const total = history.reduce(
    (sum, item) =>
      sum + item.readiness,
    0
  );

  return Math.round(
    total / history.length
  );
}

export async function getRecentMoodTrend() {
  const history =
    await getRhythmHistory();

  const latest = history.slice(0, 5);

  const highStressDays = latest.filter(
    (item) =>
      item.stressLevel === "High"
  ).length;

  if (highStressDays >= 3) {
    return "stress_high";
  }

  const lowReadinessDays = latest.filter(
    (item) => item.readiness < 60
  ).length;

  if (lowReadinessDays >= 3) {
    return "low_energy";
  }

  return "balanced";
}

export async function getEmotionalPattern() {
  const history =
    await getRhythmHistory();

  const recent = history.slice(0, 7);

  const recoveryCount = recent.filter(
    (item) =>
      item.emotionalState ===
      "Recovery"
  ).length;

  if (recoveryCount >= 4) {
    return "needs_recovery";
  }

  const momentumCount = recent.filter(
    (item) =>
      item.emotionalState ===
      "Momentum"
  ).length;

  if (momentumCount >= 4) {
    return "high_momentum";
  }

  return "stable";
}

export async function clearRhythmMemory() {
  try {
    await AsyncStorage.removeItem(
      RHYTHM_MEMORY_KEY
    );
  } catch (error) {
    console.log(
      "clearRhythmMemory error",
      error
    );
  }
}