import type {
  BodyRegion,
  Difficulty,
  EquipmentType,
  MovementPattern,
  WorkoutCategory,
} from "./types";

export interface ExerciseVariant {
  id: string;
  arabicName: string;
  englishName: string;
  description: string;
  descriptionAr: string;
  difficultyModifier: -1 | 0 | 1;
}

export interface Exercise {
  id: string;
  arabicName: string;
  englishName: string;
  aliases: string[];

  machineId: string | null;

  primaryMuscles: string[];
  secondaryMuscles: string[];
  stabilizers: string[];

  movementPattern: MovementPattern;
  difficulty: Difficulty;
  equipment: EquipmentType;
  category: WorkoutCategory;
  bodyRegion: BodyRegion;

  steps: string[];
  stepsAr: string[];
  commonMistakes: string[];
  commonMistakesAr: string[];

  breathing: string;
  breathingAr: string;
  tempo: string;
  rangeOfMotion: string;

  tips: string[];
  tipsAr: string[];
  warnings: string[];
  warningsAr: string[];

  variants: ExerciseVariant[];

  beginnerFriendly: boolean;
  pregnancySafe: boolean;
  periodSafe: boolean;
  ovulationSafe: boolean;
  lutealSafe: boolean;

  estimatedCaloriesPerMinute: number;
  defaultSets: number;
  defaultReps: string;
  defaultRest: number;

  thumbnail: string | null;
  gif: string | null;
  video: string | null;
}
