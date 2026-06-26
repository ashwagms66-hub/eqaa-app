import { getAllWorkoutSessions } from "./workoutStorage";
import { getAllPRs } from "../pr";
import type { WorkoutSession } from "./types";

export interface WorkoutStats {
  weeklyVolumeKg: number;
  monthlyVolumeKg: number;
  totalLiftedKg: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalSessions: number;
  weekSessions: number;
  averageSessionDurationMin: number;
  totalPRs: number;
}

function volume(sessions: WorkoutSession[]): number {
  return sessions.reduce(
    (total, s) =>
      total +
      s.exercises.reduce(
        (ex, e) =>
          ex +
          e.sets
            .filter((set) => set.completed && set.reps !== null && set.weightKg !== null)
            .reduce((sum, set) => sum + (set.reps ?? 0) * (set.weightKg ?? 0), 0),
        0
      ),
    0
  );
}

function computeStreaks(sessions: WorkoutSession[]): { current: number; longest: number } {
  const dates = new Set(sessions.map((s) => s.startedAt.split("T")[0]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = 0;
  let longest = 0;
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    if (dates.has(key)) {
      streak++;
      if (i <= 1) current = streak;
    } else {
      if (streak > longest) longest = streak;
      if (i > 1) break;
      streak = 0;
    }
  }
  if (streak > longest) longest = streak;
  return { current, longest };
}

export async function getWorkoutStats(): Promise<WorkoutStats> {
  const [sessions, prs] = await Promise.all([getAllWorkoutSessions(), getAllPRs()]);
  const completed = sessions.filter((s) => s.status === "completed");

  const now = Date.now();
  const weekSessions = completed.filter((s) => new Date(s.startedAt).getTime() >= now - 7 * 86400000);
  const monthSessions = completed.filter((s) => new Date(s.startedAt).getTime() >= now - 30 * 86400000);

  const streaks = computeStreaks(completed);

  const avgDuration =
    completed.length === 0
      ? 0
      : Math.round(completed.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0) / completed.length);

  return {
    weeklyVolumeKg: Math.round(volume(weekSessions)),
    monthlyVolumeKg: Math.round(volume(monthSessions)),
    totalLiftedKg: Math.round(volume(completed)),
    currentStreakDays: streaks.current,
    longestStreakDays: streaks.longest,
    totalSessions: completed.length,
    weekSessions: weekSessions.length,
    averageSessionDurationMin: avgDuration,
    totalPRs: prs.length,
  };
}
