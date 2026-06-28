import type { WorkoutSet } from "./WorkoutSet";

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  machineId: string | null;
  sets: WorkoutSet[];
  targetSets: number;
  targetReps: string;
  targetRestSeconds: number;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
}
