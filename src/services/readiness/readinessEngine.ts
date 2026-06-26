import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";
import type {
  ReadinessLevel,
  ReadinessResult,
  UnifiedReadinessInput,
} from "./types";

// ── Phase baselines ───────────────────────────────────────────────────────────
// Base score reflects the biological expectation for that phase.

const PHASE_BASE: Record<CyclePhaseKey, number> = {
  menstrual:    38,
  power:        72,
  manifestation:92,
  secondPower:  76,
  reset:        45,
};

// ── Signal delta calculators ──────────────────────────────────────────────────

function sleepDelta(hours: number | null): number {
  if (hours === null) return 0;
  if (hours < 5)   return -22;
  if (hours < 6)   return -14;
  if (hours < 7)   return -7;
  if (hours < 8)   return 0;
  if (hours < 9.5) return +6;
  return +3; // oversleeping can signal illness
}

function hrvDelta(hrv: number | null): number {
  if (hrv === null) return 0;
  if (hrv < 20)  return -20;
  if (hrv < 30)  return -12;
  if (hrv < 40)  return -5;
  if (hrv < 55)  return 0;
  if (hrv < 70)  return +6;
  return +10;
}

function rhrDelta(rhr: number | null): number {
  if (rhr === null) return 0;
  if (rhr > 90) return -15;
  if (rhr > 80) return -8;
  if (rhr > 70) return -3;
  if (rhr > 60) return 0;
  if (rhr > 55) return +5;
  return +8;
}

function workoutLoadDelta(
  intensity: UnifiedReadinessInput["lastWorkoutIntensity"],
  workoutDaysLast7: number
): number {
  let d = 0;
  switch (intensity) {
    case "none":     d += -2; break;
    case "light":    d += +2; break;
    case "moderate": d +=  0; break;
    case "heavy":    d += -10; break;
  }
  // Frequency penalty/bonus
  if (workoutDaysLast7 === 0)  d -= 6;
  else if (workoutDaysLast7 <= 2) d += 0;
  else if (workoutDaysLast7 <= 4) d += 4;
  else if (workoutDaysLast7 <= 6) d += 0;
  else d -= 12; // 7/7 = overtraining
  return d;
}

function fastingDelta(hours: number | null): number {
  if (hours === null || hours < 14) return 0;
  if (hours < 18) return -4;
  if (hours < 22) return -8;
  return -14;
}

function energyDelta(rating: number | null): number {
  if (rating === null) return 0;
  const map: Record<number, number> = {
    1: -15, 2: -10, 3: -6, 4: -3,
    5: 0, 6: +2, 7: +5, 8: +8, 9: +10, 10: +12,
  };
  return map[Math.round(rating)] ?? 0;
}

const TAXING_SYMPTOMS = new Set([
  "cramps", "heavy_bleeding", "fatigue", "nausea",
  "headache", "backpain", "dizziness", "vomiting",
]);

function symptomDelta(symptoms: string[]): number {
  const count = symptoms.filter((s) => TAXING_SYMPTOMS.has(s)).length;
  return -Math.min(count * 7, 28);
}

function trendDelta(input: UnifiedReadinessInput): number {
  let d = 0;
  if (input.avgSleepLast7 !== null) {
    if (input.avgSleepLast7 < 5.5) d -= 10;
    else if (input.avgSleepLast7 < 6.5) d -= 5;
  }
  if (input.consecutiveLowEnergyDays > 3) d -= (input.consecutiveLowEnergyDays - 3) * 4;
  if (input.consecutivePoorSleepDays > 3) d -= (input.consecutivePoorSleepDays - 3) * 3;
  return d;
}

// ── Level & label ─────────────────────────────────────────────────────────────

function toLevel(score: number): ReadinessLevel {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  return "recovery";
}

interface LevelMeta {
  labelEn: string; labelAr: string; color: string; emoji: string;
  modifier: number;
}

const LEVEL_META: Record<ReadinessLevel, LevelMeta> = {
  excellent: { labelEn: "Excellent",         labelAr: "ممتاز",            color: "#22C55E", emoji: "🟢", modifier: 1.15 },
  good:      { labelEn: "Good",              labelAr: "جيد",              color: "#3B82F6", emoji: "🟡", modifier: 1.0  },
  moderate:  { labelEn: "Moderate",          labelAr: "معتدل",            color: "#F59E0B", emoji: "🟠", modifier: 0.80 },
  recovery:  { labelEn: "Recovery Needed",   labelAr: "بحاجة للتعافي",   color: "#EF4444", emoji: "🔴", modifier: 0.55 },
};

// ── Public API ────────────────────────────────────────────────────────────────

export interface SignalDeltas {
  phase: number;
  sleep: number;
  hrv: number;
  rhr: number;
  workoutLoad: number;
  fasting: number;
  userEnergy: number;
  symptoms: number;
  trends: number;
}

export function computeSignalDeltas(input: UnifiedReadinessInput): SignalDeltas {
  return {
    phase:       PHASE_BASE[input.phaseKey],
    sleep:       sleepDelta(input.sleepHours),
    hrv:         hrvDelta(input.hrv),
    rhr:         rhrDelta(input.restingHeartRate),
    workoutLoad: workoutLoadDelta(input.lastWorkoutIntensity, input.workoutDaysLast7),
    fasting:     fastingDelta(input.fastingHoursToday),
    userEnergy:  energyDelta(input.userEnergyRating),
    symptoms:    symptomDelta(input.symptoms),
    trends:      trendDelta(input),
  };
}

export function computeUnifiedReadiness(input: UnifiedReadinessInput): ReadinessResult {
  const d = computeSignalDeltas(input);
  const raw = d.phase + d.sleep + d.hrv + d.rhr + d.workoutLoad + d.fasting + d.userEnergy + d.symptoms + d.trends;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const level = toLevel(score);
  const meta = LEVEL_META[level];

  return {
    score,
    level,
    labelEn: meta.labelEn,
    labelAr: meta.labelAr,
    color: meta.color,
    emoji: meta.emoji,
    intensityModifier: meta.modifier,
    generatedAt: new Date().toISOString(),
  };
}

export { LEVEL_META };
