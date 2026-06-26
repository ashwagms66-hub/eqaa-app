import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface UnifiedReadinessInput {
  // Cycle
  cycleDay: number;
  phaseKey: CyclePhaseKey;
  expectedCycleLength: number;

  // Today's biometrics
  sleepHours: number | null;
  hrv: number | null;
  restingHeartRate: number | null;
  activeCalories: number | null;
  steps: number | null;

  // User-reported
  symptoms: string[];
  userEnergyRating: number | null;  // 1–10
  fastingHoursToday: number | null;

  // 7-day historical
  avgSleepLast7: number | null;
  avgEnergyLast7: number | null;    // 1–10
  workoutDaysLast7: number;         // 0–7
  lastWorkoutIntensity: "heavy" | "moderate" | "light" | "none";
  consecutiveLowEnergyDays: number; // days with energy ≤ 4
  consecutivePoorSleepDays: number; // days with sleep < 6h
}

// ── Readiness result ──────────────────────────────────────────────────────────

export type ReadinessLevel = "excellent" | "good" | "moderate" | "recovery";

export interface ReadinessResult {
  score: number;             // 0–100
  level: ReadinessLevel;
  labelEn: string;
  labelAr: string;
  color: string;
  emoji: string;
  intensityModifier: number; // 0.55–1.15
  generatedAt: string;
}

// ── Explanation ───────────────────────────────────────────────────────────────

export interface ExplanationFactor {
  labelEn: string;
  labelAr: string;
  impact: "positive" | "negative";
  magnitude: "strong" | "moderate" | "mild";
  icon: string;
  delta: number;
}

export interface ReadinessExplanation {
  headlineEn: string;
  headlineAr: string;
  factors: ExplanationFactor[];
}

// ── Risk detection ────────────────────────────────────────────────────────────

export type RiskType =
  | "overtraining"
  | "poor_recovery"
  | "high_stress"
  | "poor_sleep_trend"
  | "low_energy_trend"
  | "missed_period"
  | "possible_dehydration"
  | "pms_risk";

export type RiskSeverity = "warning" | "caution" | "info";

export interface RiskAlert {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  actionEn: string;
  actionAr: string;
  icon: string;
  color: string;
  detectedAt: string;
}

// ── Dynamic recommendations ───────────────────────────────────────────────────

export type DynamicRecCategory =
  | "workout" | "nutrition" | "fasting" | "sleep"
  | "recovery" | "hydration" | "mind";

export interface DynamicRecommendation {
  id: string;
  category: DynamicRecCategory;
  priority: "high" | "medium" | "low";
  titleEn: string;
  titleAr: string;
  icon: string;
  accentColor: string;
}

// ── Readiness timeline ────────────────────────────────────────────────────────

export interface DayReadiness {
  date: string;
  dayLabelEn: string;
  dayLabelAr: string;
  cycleDay: number;
  predictedScore: number;
  level: ReadinessLevel;
  color: string;
  isToday: boolean;
  workoutSuggestionEn: string;
  workoutSuggestionAr: string;
}

// ── Weekly report ─────────────────────────────────────────────────────────────

export interface WeeklyReport {
  weekStartDate: string;
  weekEndDate: string;
  overallScore: number;
  bestDayDate: string;
  bestDayScore: number;
  worstDayDate: string;
  worstDayScore: number;
  energyTrend: "improving" | "stable" | "declining";
  workoutDays: number;
  avgSleepHours: number | null;
  sleepQuality: "good" | "fair" | "poor";
  hormoneSummaryEn: string;
  hormoneSummaryAr: string;
  fastingSummaryEn: string;
  fastingSummaryAr: string;
  recoverySummaryEn: string;
  recoverySummaryAr: string;
  moodSummaryEn: string;
  moodSummaryAr: string;
  biggestAchievementEn: string;
  biggestAchievementAr: string;
  improvementAreaEn: string;
  improvementAreaAr: string;
  generatedAt: string;
}

// ── Habit learning ────────────────────────────────────────────────────────────

export interface HabitObservation {
  date: string;
  workoutType: string;
  fastingHours: number | null;
  phaseKey: string;
  sleepHours: number | null;
  nextDayEnergy: number | null; // 1–10
}

export interface HabitInsight {
  id: string;
  patternEn: string;
  patternAr: string;
  icon: string;
  color: string;
  confidence: number; // 0–100
  dataPoints: number;
}
