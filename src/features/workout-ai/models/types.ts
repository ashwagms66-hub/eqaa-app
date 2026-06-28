export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "full_body";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type MachineType =
  | "cable"
  | "plate_loaded"
  | "selectorized"
  | "smith_machine"
  | "functional"
  | "cardio"
  | "free_weights"
  | "bodyweight"
  | "unknown";

export type ScanErrorCode =
  | "camera_permission_denied"
  | "camera_cancelled"
  | "api_key_missing"
  | "analysis_failed"
  | "parse_failed";

export interface GymMachineResult {
  machineName: string;
  machineNameAr: string;
  machineType: MachineType;
  exerciseName: string;
  exerciseNameAr: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  difficulty: Difficulty;
  instructions: string[];
  instructionsAr: string[];
  tips: string[];
  tipsAr: string[];
  caloriesPerMinute: number;
  setsRecommended: number;
  repsRecommended: string;
}

export interface ScanEntry {
  id: string;
  capturedAt: string;
  imageUri: string;
  result: GymMachineResult;
}

export type ScanStatus =
  | { kind: "idle" }
  | { kind: "capturing" }
  | { kind: "analyzing" }
  | { kind: "success"; result: GymMachineResult; imageUri: string }
  | { kind: "error"; message: string; code: ScanErrorCode };
