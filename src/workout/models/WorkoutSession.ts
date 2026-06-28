import type { WorkoutExercise } from "./WorkoutExercise";

export type WorkoutStatus = "active" | "completed" | "abandoned";

export interface WorkoutSession {
  id: string;
  exercises: WorkoutExercise[];
  startedAt: string;
  completedAt: string | null;
  status: WorkoutStatus;
  durationSeconds: number;
  scanEntryId: string | null;
  notes: string | null;
}
