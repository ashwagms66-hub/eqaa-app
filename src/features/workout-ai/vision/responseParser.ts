import type {
  GymMachineResult,
  MachineType,
  Difficulty,
  MuscleGroup,
} from "../models/types";

const VALID_MUSCLES: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "core",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "full_body",
];

const VALID_MACHINE_TYPES: MachineType[] = [
  "cable",
  "plate_loaded",
  "selectorized",
  "smith_machine",
  "functional",
  "cardio",
  "free_weights",
  "bodyweight",
  "unknown",
];

const VALID_DIFFICULTIES: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

function isMuscle(v: unknown): v is MuscleGroup {
  return typeof v === "string" && VALID_MUSCLES.includes(v as MuscleGroup);
}

function parseMuscles(raw: unknown): MuscleGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isMuscle);
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string" && v.length > 0);
}

export function parseVisionResponse(raw: string): GymMachineResult {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  const machineName =
    typeof parsed.machineName === "string" ? parsed.machineName : "Unknown Machine";
  const machineNameAr =
    typeof parsed.machineNameAr === "string" ? parsed.machineNameAr : "جهاز غير معروف";
  const exerciseName =
    typeof parsed.exerciseName === "string" ? parsed.exerciseName : "Unknown Exercise";
  const exerciseNameAr =
    typeof parsed.exerciseNameAr === "string" ? parsed.exerciseNameAr : "تمرين غير معروف";

  const machineType: MachineType = VALID_MACHINE_TYPES.includes(
    parsed.machineType as MachineType
  )
    ? (parsed.machineType as MachineType)
    : "unknown";

  const difficulty: Difficulty = VALID_DIFFICULTIES.includes(
    parsed.difficulty as Difficulty
  )
    ? (parsed.difficulty as Difficulty)
    : "intermediate";

  const primaryMuscles = parseMuscles(parsed.primaryMuscles);
  const secondaryMuscles = parseMuscles(parsed.secondaryMuscles);

  const instructions = parseStringArray(parsed.instructions);
  const instructionsAr = parseStringArray(parsed.instructionsAr);
  const tips = parseStringArray(parsed.tips);
  const tipsAr = parseStringArray(parsed.tipsAr);

  const caloriesPerMinute =
    typeof parsed.caloriesPerMinute === "number"
      ? Math.max(1, Math.min(20, Math.round(parsed.caloriesPerMinute)))
      : 5;
  const setsRecommended =
    typeof parsed.setsRecommended === "number"
      ? Math.max(1, Math.min(6, Math.round(parsed.setsRecommended)))
      : 3;
  const repsRecommended =
    typeof parsed.repsRecommended === "string" ? parsed.repsRecommended : "8-12";

  return {
    machineName,
    machineNameAr,
    machineType,
    exerciseName,
    exerciseNameAr,
    primaryMuscles,
    secondaryMuscles,
    difficulty,
    instructions,
    instructionsAr,
    tips,
    tipsAr,
    caloriesPerMinute,
    setsRecommended,
    repsRecommended,
  };
}
