import type { ExerciseLastSession } from "./exerciseHistory";

export type OverloadType = "increase_weight" | "increase_reps" | "maintain" | "deload";

export interface OverloadSuggestion {
  weightKg: number;
  reps: number;
  sets: number;
  type: OverloadType;
  hintEn: string;
  hintAr: string;
  lastEn: string;
  lastAr: string;
}

/** Round to nearest 0.25 kg increment */
function snap(kg: number): number {
  return Math.round(kg * 4) / 4;
}

export function suggestOverload(
  last: ExerciseLastSession | null,
  cyclePhase: string | null,
  readinessScore: number | null = null
): OverloadSuggestion | null {
  if (!last) return null;

  const { weightKg: w, reps: r } = last.bestSet;
  const readiness = readinessScore ?? 70;

  const isPeak = cyclePhase === "power";
  const isLow = cyclePhase === "menstrual" || cyclePhase === "calm";
  const isVeryLowReadiness = readiness < 50;
  const isLowReadiness = readiness < 65;

  const lastEn = `Last: ${w}kg × ${r}`;
  const lastAr = `السابق: ${w}كغ × ${r}`;

  // Deload — menstrual phase or very low readiness
  if (isLow || isVeryLowReadiness) {
    const nw = snap(w * 0.88);
    return {
      weightKg: nw,
      reps: r,
      sets: 3,
      type: "deload",
      hintEn: `Try ${nw}kg × ${r} (recovery load)`,
      hintAr: `جربي ${nw}كغ × ${r} (حمل تعافٍ)`,
      lastEn,
      lastAr,
    };
  }

  // Maintain — low readiness but not rock bottom
  if (isLowReadiness) {
    return {
      weightKg: w,
      reps: r,
      sets: 3,
      type: "maintain",
      hintEn: `Same as last time — quality over intensity today`,
      hintAr: `نفس المرة السابقة — الجودة قبل الشدة اليوم`,
      lastEn,
      lastAr,
    };
  }

  // Ovulation power window — increase weight
  if (isPeak && r >= 8) {
    const increment = w >= 50 ? 2.5 : w >= 20 ? 1.25 : 0.5;
    const nw = snap(w + increment);
    const nr = Math.max(r - 2, 5);
    return {
      weightKg: nw,
      reps: nr,
      sets: 4,
      type: "increase_weight",
      hintEn: `Try ${nw}kg × ${nr} (power phase — go heavier!)`,
      hintAr: `جربي ${nw}كغ × ${nr} (مرحلة القوة — ارفعي أثقل!)`,
      lastEn,
      lastAr,
    };
  }

  // Reps plateau — move weight up
  if (r >= 12) {
    const increment = w >= 50 ? 2.5 : 1.25;
    const nw = snap(w + increment);
    return {
      weightKg: nw,
      reps: r - 3,
      sets: 3,
      type: "increase_weight",
      hintEn: `Try ${nw}kg × ${r - 3} (reps goal hit — add load)`,
      hintAr: `جربي ${nw}كغ × ${r - 3} (وصلتِ الهدف — أضيفي وزناً)`,
      lastEn,
      lastAr,
    };
  }

  // Standard progressive overload — add 1 rep
  return {
    weightKg: w,
    reps: r + 1,
    sets: 3,
    type: "increase_reps",
    hintEn: `Try ${w}kg × ${r + 1} (+1 rep progression)`,
    hintAr: `جربي ${w}كغ × ${r + 1} (تقدم بتكرار إضافي)`,
    lastEn,
    lastAr,
  };
}
