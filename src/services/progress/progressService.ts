import { getAllWorkoutSessions } from "../workouts/workoutStorage";
import type { WorkoutSession } from "../workouts/types";

export interface WeeklyVolume {
  weekLabel: string;  // e.g. "Jun 16"
  totalKg: number;
  sessionCount: number;
}

export interface ExerciseStrengthPoint {
  date: string;  // ISO date
  estimated1RMkg: number;
  weightKg: number;
  reps: number;
}

export interface WorkoutFrequencyStats {
  totalSessions: number;
  lastSevenDays: number;
  lastThirtyDays: number;
  averageSessionDurationMin: number;
  longestStreakDays: number;
  currentStreakDays: number;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export async function getVolumeByWeek(weeks = 8): Promise<WeeklyVolume[]> {
  const sessions = (await getAllWorkoutSessions()).filter(
    (s) => s.status === "completed"
  );

  const buckets: Map<string, { totalKg: number; count: number; weekStart: Date }> = new Map();

  const now = new Date();
  for (let i = 0; i < weeks; i++) {
    const weekStart = startOfWeek(new Date(now.getTime() - i * 7 * 86400000));
    const label = formatWeekLabel(weekStart);
    buckets.set(label, { totalKg: 0, count: 0, weekStart });
  }

  for (const session of sessions) {
    const sessionDate = new Date(session.startedAt);
    const weekStart = startOfWeek(sessionDate);
    const label = formatWeekLabel(weekStart);
    if (buckets.has(label)) {
      const bucket = buckets.get(label)!;
      const volume = session.exercises.reduce((total, ex) => {
        return (
          total +
          ex.sets
            .filter((s) => s.completed && s.reps && s.weightKg)
            .reduce((sum, s) => sum + (s.reps ?? 0) * (s.weightKg ?? 0), 0)
        );
      }, 0);
      bucket.totalKg += volume;
      bucket.count += 1;
    }
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[1].weekStart.getTime() - b[1].weekStart.getTime())
    .map(([weekLabel, { totalKg, count }]) => ({
      weekLabel,
      totalKg: Math.round(totalKg),
      sessionCount: count,
    }));
}

export async function getStrengthProgressForExercise(
  exerciseId: string,
  limit = 12
): Promise<ExerciseStrengthPoint[]> {
  const sessions = (await getAllWorkoutSessions()).filter(
    (s) => s.status === "completed"
  );

  const points: ExerciseStrengthPoint[] = [];

  for (const session of sessions) {
    const exercise = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exercise) continue;

    let bestWeight = 0;
    let bestReps = 0;
    let best1RM = 0;

    for (const set of exercise.sets) {
      if (!set.completed || !set.reps || !set.weightKg) continue;
      const orm = set.weightKg * (1 + set.reps / 30);
      if (orm > best1RM) {
        best1RM = orm;
        bestWeight = set.weightKg;
        bestReps = set.reps;
      }
    }

    if (best1RM > 0) {
      points.push({
        date: session.startedAt.split("T")[0],
        estimated1RMkg: Math.round(best1RM * 10) / 10,
        weightKg: bestWeight,
        reps: bestReps,
      });
    }
  }

  return points
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-limit);
}

export async function getWorkoutFrequencyStats(): Promise<WorkoutFrequencyStats> {
  const sessions = (await getAllWorkoutSessions()).filter(
    (s) => s.status === "completed"
  );

  const now = Date.now();
  const sevenDays = now - 7 * 86400000;
  const thirtyDays = now - 30 * 86400000;

  const lastSeven = sessions.filter(
    (s) => new Date(s.startedAt).getTime() >= sevenDays
  ).length;
  const lastThirty = sessions.filter(
    (s) => new Date(s.startedAt).getTime() >= thirtyDays
  ).length;

  const avgDuration =
    sessions.length === 0
      ? 0
      : Math.round(
          sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0) /
            sessions.length
        );

  // Streak calculation (consecutive days with at least 1 session)
  const sessionDates = new Set(
    sessions.map((s) => s.startedAt.split("T")[0])
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    if (sessionDates.has(key)) {
      streak++;
      if (i === 0 || i === 1) currentStreak = streak;
    } else {
      if (streak > longestStreak) longestStreak = streak;
      if (i > 1) break;
      streak = 0;
    }
  }
  if (streak > longestStreak) longestStreak = streak;

  return {
    totalSessions: sessions.length,
    lastSevenDays: lastSeven,
    lastThirtyDays: lastThirty,
    averageSessionDurationMin: avgDuration,
    longestStreakDays: longestStreak,
    currentStreakDays: currentStreak,
  };
}
