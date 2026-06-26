import AsyncStorage from "@react-native-async-storage/async-storage";

const PR_KEY = "@eqaa_personal_records";

export interface PersonalRecord {
  exerciseId: string;
  exerciseNameEn: string;
  exerciseNameAr: string;
  maxWeightKg: number | null;
  maxReps: number | null;
  estimated1RMkg: number | null;   // Epley formula
  achievedAt: string;              // ISO
  workoutSessionId: string;
}

/** Epley 1RM estimate: weight × (1 + reps / 30) */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export async function getAllPRs(): Promise<PersonalRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(PR_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getPRForExercise(exerciseId: string): Promise<PersonalRecord | null> {
  const all = await getAllPRs();
  return all.find((pr) => pr.exerciseId === exerciseId) ?? null;
}

/**
 * Update PRs from a completed set. Returns the record if a new PR was set.
 */
export async function checkAndUpdatePR(
  exerciseId: string,
  exerciseNameEn: string,
  exerciseNameAr: string,
  weightKg: number,
  reps: number,
  workoutSessionId: string
): Promise<PersonalRecord | null> {
  try {
    const all = await getAllPRs();
    const existing = all.find((pr) => pr.exerciseId === exerciseId);
    const new1RM = estimate1RM(weightKg, reps);

    const isNewWeightPR = !existing?.maxWeightKg || weightKg > existing.maxWeightKg;
    const isNew1RMPR = !existing?.estimated1RMkg || new1RM > existing.estimated1RMkg;
    const isNewRepsPR = !existing?.maxReps || reps > existing.maxReps;

    if (!isNewWeightPR && !isNew1RMPR && !isNewRepsPR) return null;

    const updated: PersonalRecord = {
      exerciseId,
      exerciseNameEn,
      exerciseNameAr,
      maxWeightKg: isNewWeightPR ? weightKg : (existing?.maxWeightKg ?? weightKg),
      maxReps: isNewRepsPR ? reps : (existing?.maxReps ?? reps),
      estimated1RMkg: isNew1RMPR ? new1RM : (existing?.estimated1RMkg ?? new1RM),
      achievedAt: new Date().toISOString(),
      workoutSessionId,
    };

    const idx = all.findIndex((pr) => pr.exerciseId === exerciseId);
    if (idx !== -1) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }
    await AsyncStorage.setItem(PR_KEY, JSON.stringify(all));
    return updated;
  } catch {
    return null;
  }
}

export async function deletePR(exerciseId: string): Promise<void> {
  try {
    const all = await getAllPRs();
    const filtered = all.filter((pr) => pr.exerciseId !== exerciseId);
    await AsyncStorage.setItem(PR_KEY, JSON.stringify(filtered));
  } catch {}
}
