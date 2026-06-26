import type { CyclePhase } from "@/src/engine/wellnessEngine";
import { getWellnessPhaseForDay } from "@/src/engine/wellnessEngine";

export interface EqaaScore {
  total: number;
  sleepScore: number;       // out of 30
  activityScore: number;    // out of 20
  cycleAlignScore: number;  // out of 20
  symptomScore: number;     // out of 15
  recoveryScore: number;    // out of 15
  label: string;
  labelAr: string;
  color: string;
  description: string;
  descriptionAr: string;
}

interface ScoreInput {
  sleepHours: number | null;
  steps: number | null;
  activeEnergyBurned: number | null;
  cycleDay: number;
  symptoms: string[];
  hrv: number | null;
  restingHeartRate: number | null;
  energyLevel: number | null;
}

function scoreSleep(hours: number | null): number {
  if (hours === null) return 18; // neutral when no data
  if (hours >= 7 && hours <= 9) return 30;
  if (hours >= 6 || hours <= 10) return 22;
  if (hours >= 5 || hours <= 11) return 14;
  return 8;
}

function scoreActivity(
  steps: number | null,
  activeCalories: number | null,
  phase: CyclePhase
): number {
  // During menstrual phase, rest is the ideal — lower steps score higher for alignment
  const effectiveSteps = steps ?? 0;
  if (phase === "menstrual") {
    if (effectiveSteps < 5000) return 20;
    if (effectiveSteps < 8000) return 16;
    return 12;
  }
  if (effectiveSteps >= 10_000) return 20;
  if (effectiveSteps >= 7_000) return 16;
  if (effectiveSteps >= 4_000) return 11;
  if (effectiveSteps >= 2_000) return 7;
  if (activeCalories && activeCalories > 200) return 10;
  return 4;
}

function scoreCycleAlignment(
  phase: CyclePhase,
  steps: number | null,
  energyLevel: number | null,
  sleepHours: number | null
): number {
  const energy = energyLevel ?? 5;
  const stepCount = steps ?? 0;

  switch (phase) {
    case "menstrual":
      // Rest + good sleep = aligned
      return (sleepHours ?? 0) >= 7 && stepCount < 8000 ? 20 : 14;
    case "renewal":
      // Gradual build — moderate activity aligned
      return stepCount >= 5000 && stepCount <= 12000 ? 20 : 14;
    case "power":
      // High performance — high energy + activity
      return energy >= 7 && stepCount >= 7000 ? 20 : stepCount >= 4000 ? 15 : 10;
    case "clarity":
      // Moderate — balanced activity
      return stepCount >= 5000 ? 20 : 14;
    case "calm":
      // Recovery — rest & gentle movement
      return stepCount < 10000 && (sleepHours ?? 0) >= 7 ? 20 : 14;
    default:
      return 15;
  }
}

function scoreSymptoms(symptoms: string[]): number {
  const count = symptoms.length;
  if (count === 0) return 15;
  if (count <= 2) return 11;
  if (count <= 4) return 7;
  return 4;
}

function scoreRecovery(hrv: number | null, rhr: number | null): number {
  let score = 8; // baseline when no data
  if (hrv !== null) {
    if (hrv >= 50) score += 4;
    else if (hrv >= 35) score += 3;
    else if (hrv >= 20) score += 1;
  }
  if (rhr !== null) {
    // Lower RHR generally = better recovery (55-65 bpm is excellent for women)
    if (rhr <= 60) score += 3;
    else if (rhr <= 70) score += 2;
    else if (rhr <= 80) score += 1;
  }
  return Math.min(score, 15);
}

function getLabel(total: number): { en: string; ar: string; color: string; descEn: string; descAr: string } {
  if (total >= 90) {
    return {
      en: "Excellent",
      ar: "ممتاز",
      color: "#34D399",
      descEn: "Your body is thriving today.",
      descAr: "جسمك في أفضل حالاته اليوم.",
    };
  }
  if (total >= 75) {
    return {
      en: "Good",
      ar: "جيد",
      color: "#60A5FA",
      descEn: "Strong balance across all areas.",
      descAr: "توازن قوي في جميع المجالات.",
    };
  }
  if (total >= 60) {
    return {
      en: "Fair",
      ar: "مقبول",
      color: "#FBBF24",
      descEn: "Some areas could use extra care today.",
      descAr: "بعض المجالات تحتاج عناية إضافية.",
    };
  }
  return {
    en: "Needs Attention",
    ar: "يحتاج اهتمام",
    color: "#F87171",
    descEn: "Prioritize rest and recovery today.",
    descAr: "اجعلي الراحة والتعافي أولويتك اليوم.",
  };
}

export function calculateEqaaScore(input: ScoreInput): EqaaScore {
  const phase = getWellnessPhaseForDay(input.cycleDay);

  const sleepScore = scoreSleep(input.sleepHours);
  const activityScore = scoreActivity(input.steps, input.activeEnergyBurned, phase);
  const cycleAlignScore = scoreCycleAlignment(
    phase,
    input.steps,
    input.energyLevel,
    input.sleepHours
  );
  const symptomScore = scoreSymptoms(input.symptoms);
  const recoveryScore = scoreRecovery(input.hrv, input.restingHeartRate);

  const total = Math.min(
    100,
    sleepScore + activityScore + cycleAlignScore + symptomScore + recoveryScore
  );

  const { en, ar, color, descEn, descAr } = getLabel(total);

  return {
    total,
    sleepScore,
    activityScore,
    cycleAlignScore,
    symptomScore,
    recoveryScore,
    label: en,
    labelAr: ar,
    color,
    description: descEn,
    descriptionAr: descAr,
  };
}
