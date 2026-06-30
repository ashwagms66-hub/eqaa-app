export type ExerciseCategory =
  | "glutes" | "legs" | "chest" | "back"
  | "shoulders" | "arms" | "core"
  | "mobility" | "cardio" | "recovery" | "stretching";

export type Equipment =
  | "barbell" | "dumbbell" | "cable" | "machine"
  | "bodyweight" | "resistance_band" | "kettlebell"
  | "foam_roller" | "none";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type CyclePhase = "menstrual" | "renewal" | "power" | "clarity" | "calm" | "all";

export interface Exercise {
  id: string;
  nameEn: string;
  nameAr: string;
  category: ExerciseCategory;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: Equipment[];
  difficulty: Difficulty;
  cyclePhases: CyclePhase[];   // phases this exercise is recommended for
  emoji: string;

  descriptionEn: string;
  descriptionAr: string;
  commonMistakesEn: string[];
  commonMistakesAr: string[];
  breathingEn: string;
  breathingAr: string;
  beginnerTipsEn: string[];
  beginnerTipsAr: string[];

  videoUrl: string;             // placeholder — replace with CDN URL
  demoImage?: number | null;        // local require() image for exercise demo
  demoAnimation?: string | null;    // future GIF/Lottie URL
  demoHint?: string | null;         // short English movement cue shown in placeholder
  muscleFocusType?: string | null;  // override category key for muscle focus section
  isTimeBased: boolean;         // true = duration in seconds, false = reps
  defaultSets: number;
  defaultReps: number;
  defaultDurationSec: number;   // used if isTimeBased
}
