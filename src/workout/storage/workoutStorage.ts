import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WorkoutSession } from "../models/WorkoutSession";

const KEY = "@eqaa_workout_sessions";

export async function loadAllSessions(): Promise<WorkoutSession[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
  } catch {
    return [];
  }
}

export async function saveAllSessions(sessions: WorkoutSession[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(sessions));
}
