export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number | null;
  durationSeconds: number | null;
  restTakenSeconds: number;
  rpe: number | null;
  completedAt: string;
}
