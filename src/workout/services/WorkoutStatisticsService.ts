import type { WorkoutStatistics } from "../models/WorkoutStatistics";
import { workoutRepository } from "../repository";
import { exerciseRepository } from "@/src/fitness/repository";

export class WorkoutStatisticsService {
  async compute(): Promise<WorkoutStatistics> {
    const completed = await workoutRepository.getByStatus("completed");

    let totalSets = 0;
    let totalReps = 0;
    let totalDuration = 0;
    const muscleFreq: Record<string, number> = {};
    const machineSet = new Set<string>();
    const usedMusclesLast7Days = new Set<string>();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const session of completed) {
      totalDuration += session.durationSeconds;

      for (const we of session.exercises) {
        totalSets += we.sets.length;
        totalReps += we.sets.reduce((sum, s) => sum + s.reps, 0);

        if (we.machineId) machineSet.add(we.machineId);

        const exercise = await exerciseRepository.getById(we.exerciseId);
        if (exercise) {
          const isRecent =
            new Date(session.startedAt).getTime() >= sevenDaysAgo;
          for (const muscleId of exercise.primaryMuscles) {
            muscleFreq[muscleId] = (muscleFreq[muscleId] ?? 0) + we.sets.length;
            if (isRecent) usedMusclesLast7Days.add(muscleId);
          }
        }
      }
    }

    let mostTrainedMuscleId: string | null = null;
    let maxFreq = 0;
    for (const [id, freq] of Object.entries(muscleFreq)) {
      if (freq > maxFreq) {
        maxFreq = freq;
        mostTrainedMuscleId = id;
      }
    }

    const undertrainedMuscleIds = Object.keys(muscleFreq).filter(
      (m) => !usedMusclesLast7Days.has(m)
    );

    return {
      totalSessions: completed.length,
      totalExercises: completed.reduce((sum, s) => sum + s.exercises.length, 0),
      totalSets,
      totalReps,
      totalDurationSeconds: totalDuration,
      uniqueMachinesUsed: [...machineSet],
      muscleFrequency: muscleFreq,
      lastWorkoutAt: completed.length > 0 ? completed[0].startedAt : null,
      mostTrainedMuscleId,
      undertrainedMuscleIds,
    };
  }
}

export const workoutStatisticsService = new WorkoutStatisticsService();
