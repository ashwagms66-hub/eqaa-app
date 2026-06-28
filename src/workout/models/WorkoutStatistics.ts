export interface WorkoutStatistics {
  totalSessions: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalDurationSeconds: number;
  uniqueMachinesUsed: string[];
  muscleFrequency: Record<string, number>;
  lastWorkoutAt: string | null;
  mostTrainedMuscleId: string | null;
  undertrainedMuscleIds: string[];
}
