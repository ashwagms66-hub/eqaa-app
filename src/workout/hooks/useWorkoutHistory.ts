import { useState, useEffect, useCallback } from "react";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutStatistics } from "../models/WorkoutStatistics";
import { workoutRepository } from "../repository";
import { workoutStatisticsService } from "../services/WorkoutStatisticsService";

export interface UseWorkoutHistoryResult {
  sessions: WorkoutSession[];
  stats: WorkoutStatistics | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useWorkoutHistory(): UseWorkoutHistoryResult {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState<WorkoutStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [all, computed] = await Promise.all([
      workoutRepository.getAll(),
      workoutStatisticsService.compute(),
    ]);
    setSessions(all.filter((s) => s.status === "completed"));
    setStats(computed);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, stats, loading, refresh };
}
