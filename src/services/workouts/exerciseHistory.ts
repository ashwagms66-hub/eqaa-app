import { getAllWorkoutSessions } from "./workoutStorage";

export interface ExerciseLastSession {
  date: string;                   // ISO date "2024-01-15"
  bestSet: { weightKg: number; reps: number; rpe: number | null };
  sets: { weightKg: number; reps: number }[];
  totalVolume: number;            // kg × reps
  totalSets: number;
  sessionId: string;
}

function findBestSet(
  completedSets: Array<{ weightKg: number | null; reps: number | null; rpe: number | null }>
): { weightKg: number; reps: number; rpe: number | null } {
  return completedSets.reduce(
    (best, s) => {
      const orm = (s.weightKg ?? 0) * (1 + (s.reps ?? 0) / 30);
      const bestOrm = (best.weightKg ?? 0) * (1 + (best.reps ?? 0) / 30);
      return orm > bestOrm ? s : best;
    },
    completedSets[0]
  ) as { weightKg: number; reps: number; rpe: number | null };
}

export async function getExerciseLastSession(exerciseId: string): Promise<ExerciseLastSession | null> {
  const sessions = (await getAllWorkoutSessions())
    .filter((s) => s.status === "completed")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  for (const session of sessions) {
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;

    const valid = ex.sets.filter(
      (s): s is typeof s & { weightKg: number; reps: number } =>
        s.completed && s.weightKg !== null && s.reps !== null
    );
    if (valid.length === 0) continue;

    const best = findBestSet(valid);
    return {
      date: session.startedAt.split("T")[0],
      bestSet: { weightKg: best.weightKg, reps: best.reps, rpe: best.rpe },
      sets: valid.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
      totalVolume: valid.reduce((sum, s) => sum + s.weightKg * s.reps, 0),
      totalSets: valid.length,
      sessionId: session.id,
    };
  }
  return null;
}

export async function getExercisePreviousSessions(
  exerciseId: string,
  limit = 10
): Promise<ExerciseLastSession[]> {
  const sessions = (await getAllWorkoutSessions())
    .filter((s) => s.status === "completed")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const result: ExerciseLastSession[] = [];
  for (const session of sessions) {
    if (result.length >= limit) break;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;

    const valid = ex.sets.filter(
      (s): s is typeof s & { weightKg: number; reps: number } =>
        s.completed && s.weightKg !== null && s.reps !== null
    );
    if (valid.length === 0) continue;

    const best = findBestSet(valid);
    result.push({
      date: session.startedAt.split("T")[0],
      bestSet: { weightKg: best.weightKg, reps: best.reps, rpe: best.rpe },
      sets: valid.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
      totalVolume: valid.reduce((sum, s) => sum + s.weightKg * s.reps, 0),
      totalSets: valid.length,
      sessionId: session.id,
    });
  }
  return result;
}
