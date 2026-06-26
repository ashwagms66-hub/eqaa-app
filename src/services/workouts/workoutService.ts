import { saveWorkoutSession, clearActiveSession } from "./workoutStorage";
import type { WorkoutSession, LoggedExercise } from "./types";

function generateId(): string {
  return `workout_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createWorkoutSession(
  cycleDay: number | null = null,
  cyclePhase: string | null = null
): WorkoutSession {
  return {
    id: generateId(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationMinutes: null,
    exercises: [],
    status: "in_progress",
    notes: "",
    cycleDay,
    cyclePhase,
    perceivedEnergy: null,
    mood: null,
  };
}

export async function completeWorkoutSession(
  session: WorkoutSession,
  perceivedEnergy: number | null = null,
  mood: string | null = null,
  notes = ""
): Promise<WorkoutSession> {
  const completedAt = new Date().toISOString();
  const startMs = new Date(session.startedAt).getTime();
  const endMs = new Date(completedAt).getTime();
  const durationMinutes = Math.round((endMs - startMs) / 60000);

  const completed: WorkoutSession = {
    ...session,
    completedAt,
    durationMinutes,
    status: "completed",
    perceivedEnergy,
    mood,
    notes,
  };

  await saveWorkoutSession(completed);
  await clearActiveSession();
  return completed;
}

export async function abandonWorkoutSession(session: WorkoutSession): Promise<void> {
  const abandoned: WorkoutSession = {
    ...session,
    completedAt: new Date().toISOString(),
    status: "abandoned",
  };
  await saveWorkoutSession(abandoned);
  await clearActiveSession();
}

export function addExerciseToSession(
  session: WorkoutSession,
  exercise: LoggedExercise
): WorkoutSession {
  return {
    ...session,
    exercises: [...session.exercises, exercise],
  };
}

export function updateExerciseInSession(
  session: WorkoutSession,
  updatedExercise: LoggedExercise
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((e) =>
      e.exerciseId === updatedExercise.exerciseId ? updatedExercise : e
    ),
  };
}

export function getTotalVolumeKg(session: WorkoutSession): number {
  return session.exercises.reduce((total, ex) => {
    const exVolume = ex.sets
      .filter((s) => s.completed && s.reps && s.weightKg)
      .reduce((sum, s) => sum + (s.reps ?? 0) * (s.weightKg ?? 0), 0);
    return total + exVolume;
  }, 0);
}

export function getCompletedSetCount(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, ex) => total + ex.sets.filter((s) => s.completed).length,
    0
  );
}
