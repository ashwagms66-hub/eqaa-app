import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WorkoutSession } from "./types";

const SESSIONS_KEY = "@eqaa_workout_sessions";
const ACTIVE_SESSION_KEY = "@eqaa_active_workout_session";

// ── Completed sessions ───────────────────────────────────────────────────────

export async function saveWorkoutSession(session: WorkoutSession): Promise<void> {
  try {
    const sessions = await getAllWorkoutSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx !== -1) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

export async function getAllWorkoutSessions(): Promise<WorkoutSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getRecentWorkoutSessions(limit = 10): Promise<WorkoutSession[]> {
  const all = await getAllWorkoutSessions();
  return all
    .filter((s) => s.status === "completed")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

export async function getWorkoutSessionById(id: string): Promise<WorkoutSession | null> {
  const sessions = await getAllWorkoutSessions();
  return sessions.find((s) => s.id === id) ?? null;
}

export async function deleteWorkoutSession(id: string): Promise<void> {
  try {
    const sessions = await getAllWorkoutSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  } catch {}
}

export async function duplicateWorkoutSession(id: string): Promise<WorkoutSession | null> {
  try {
    const original = await getWorkoutSessionById(id);
    if (!original) return null;
    const now = new Date().toISOString();
    const copy: WorkoutSession = {
      ...original,
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      startedAt: now,
      completedAt: null,
      durationMinutes: null,
      status: "in_progress",
      perceivedEnergy: null,
      notes: "",
      exercises: original.exercises.map((ex) => ({
        ...ex,
        id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        sets: ex.sets.map((set) => ({ ...set, completed: false })),
      })),
    };
    await saveActiveSession(copy);
    return copy;
  } catch {
    return null;
  }
}

// ── Active session (in-progress) ─────────────────────────────────────────────

export async function saveActiveSession(session: WorkoutSession): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch {}
}

export async function loadActiveSession(): Promise<WorkoutSession | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {}
}
