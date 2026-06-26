// ── Hormone Coach — shared types ──────────────────────────────────────────────

export type CyclePhaseKey =
  | "menstrual"      // days  1–5
  | "power"          // days  6–10  (follicular/renewal)
  | "manifestation"  // days 11–15  (ovulation/peak)
  | "secondPower"    // days 16–19  (early luteal/clarity)
  | "reset";         // days 20–28  (late luteal/calm)

// ── Daily score output ────────────────────────────────────────────────────────

export interface DailyScores {
  cycleDay: number;
  phaseKey: CyclePhaseKey;
  overallScore: number;    // 0-100 composite
  energyScore: number;     // 0-100
  recoveryScore: number;   // 0-100
  moodScore: number;       // 0-100
  stressScore: number;     // 0-100 (100 = very low stress)
  focusScore: number;      // 0-100
  hungerScore: number;     // 0-100 (100 = high hunger expected)
  sleepNeedHours: number;  // recommended nightly hours
  hormoneStatus: HormoneStatus;
  generatedAt: string;
}

export interface HormoneStatus {
  dominantEn: string;
  dominantAr: string;
  level: "rising" | "peak" | "falling" | "low";
  levelLabelEn: string;
  levelLabelAr: string;
  descriptionEn: string;
  descriptionAr: string;
  color: string;
  facts: HormoneFact[];
}

export interface HormoneFact {
  hormoneEn: string;
  hormoneAr: string;
  trendEn: string;
  trendAr: string;
  effectEn: string;
  effectAr: string;
  icon: string;
  color: string;
}

// ── Recommendations ────────────────────────────────────────────────────────────

export type RecommendationCategory =
  | "workout" | "nutrition" | "fasting" | "hydration"
  | "sleep" | "mood" | "focus" | "supplement";

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  priority: "high" | "medium" | "low";
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  whyEn: string;
  whyAr: string;
  icon: string;
  accentColor: string;
}

// ── Weekly forecast ────────────────────────────────────────────────────────────

export type WorkoutIntensity = "heavy" | "moderate" | "light" | "rest";

export interface DayForecast {
  date: string;
  dayLabelEn: string;
  dayLabelAr: string;
  isToday: boolean;
  cycleDay: number;
  phaseKey: CyclePhaseKey;
  energyLevel: number;
  moodEmoji: string;
  moodLabelEn: string;
  moodLabelAr: string;
  recoveryLevel: number;
  workoutType: WorkoutIntensity;
  workoutLabelEn: string;
  workoutLabelAr: string;
  fastingHours: number;
  accentColor: string;
}

// ── Monthly timeline ───────────────────────────────────────────────────────────

export interface MonthDay {
  cycleDay: number;
  phaseKey: CyclePhaseKey;
  phaseNameEn: string;
  phaseNameAr: string;
  energyLevel: number;
  moodEmoji: string;
  moodLabelEn: string;
  moodLabelAr: string;
  cravingsEn: string;
  cravingsAr: string;
  isPeriod: boolean;
  isOvulationWindow: boolean;
  isToday: boolean;
  accentColor: string;
}

// ── Score engine input ────────────────────────────────────────────────────────

export interface CoachInput {
  cycleDay: number;
  phaseKey: CyclePhaseKey;
  sleepHours: number | null;
  hrv: number | null;
  restingHeartRate: number | null;
  activeCalories: number | null;
  steps: number | null;
  symptoms: string[];
  userEnergyRating: number | null;     // 1-10 from daily check-in
  daysSinceLastWorkout: number | null;
  lastFastHours: number | null;
  todayFastingActive: boolean;
}
