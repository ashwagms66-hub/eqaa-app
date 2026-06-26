export interface LoggedSet {
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSec: number | null;  // for time-based exercises
  rpe: number | null;           // Rate of Perceived Exertion 1–10
  completed: boolean;
  restTimeSec: number | null;
  notes: string;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseNameEn: string;
  exerciseNameAr: string;
  sets: LoggedSet[];
  notes: string;
  orderIndex: number;
}

export type WorkoutStatus = "in_progress" | "completed" | "abandoned";

export interface WorkoutSession {
  id: string;
  startedAt: string;          // ISO
  completedAt: string | null;
  durationMinutes: number | null;
  exercises: LoggedExercise[];
  status: WorkoutStatus;
  notes: string;
  cycleDay: number | null;
  cyclePhase: string | null;
  perceivedEnergy: number | null; // 1–5 stars
  mood: string | null;
}
