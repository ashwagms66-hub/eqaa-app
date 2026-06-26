import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";

// ── Time windows ──────────────────────────────────────────────────────────────

export interface TimeWindow {
  startHour: number; // 0-23
  endHour:   number;
  labelEn:   string;
  labelAr:   string;
}

// ── Meals ─────────────────────────────────────────────────────────────────────

export interface Meal {
  nameEn:        string;
  nameAr:        string;
  descriptionEn: string;
  descriptionAr: string;
  proteinG:      number;
  carbsG:        number;
  fatG:          number;
  calories:      number;
  timingHour:    number;
}

export interface MealPlan {
  breakfast:      Meal;
  lunch:          Meal;
  dinner:         Meal;
  snack:          Meal;
  totalCalories:  number;
  totalProteinG:  number;
  totalCarbsG:    number;
  totalFatG:      number;
}

// ── Productivity ──────────────────────────────────────────────────────────────

export interface ProductivitySchedule {
  deepWork:    TimeWindow;
  meetings:    TimeWindow;
  creative:    TimeWindow;
  learning:    TimeWindow;
  workout:     TimeWindow;
  meditation:  TimeWindow;
  rest:        TimeWindow;
  reading:     TimeWindow;
  social:      TimeWindow;
  shopping:    TimeWindow;
  familyTime:  TimeWindow;
}

// ── Emotion coach ─────────────────────────────────────────────────────────────

export interface BreathingExercise {
  nameEn:        string;
  nameAr:        string;
  instructionEn: string;
  instructionAr: string;
  inSeconds:     number;
  holdSeconds:   number;
  outSeconds:    number;
  rounds:        number;
}

export interface EmotionSupportPlan {
  breathingExercise: BreathingExercise;
  journalPromptEn:   string;
  journalPromptAr:   string;
  walkSuggestionEn:  string;
  walkSuggestionAr:  string;
  musicMoodEn:       string;
  musicMoodAr:       string;
  affirmationEn:     string;
  affirmationAr:     string;
  meditationMinutes: number;
}

// ── Cycle predictions ─────────────────────────────────────────────────────────

export type CycleEventType =
  | "pms_onset" | "period_start" | "ovulation"
  | "energy_peak" | "energy_dip" | "craving_window"
  | "high_confidence" | "peak_creativity"
  | "recovery_day" | "peak_libido";

export interface CyclePrediction {
  daysFromNow:   number;
  date:          string;
  eventType:     CycleEventType;
  labelEn:       string;
  labelAr:       string;
  descriptionEn: string;
  descriptionAr: string;
  confidence:    number; // 0-100
  accentColor:   string;
  icon:          string;
}

// ── Insights timeline ─────────────────────────────────────────────────────────

export interface InsightChange {
  metric:            string;
  previousValueEn:   string;
  currentValueEn:    string;
  previousValueAr:   string;
  currentValueAr:    string;
  changeType:        "improved" | "declined" | "stable";
  explanationEn:     string;
  explanationAr:     string;
  icon:              string;
  color:             string;
}

export interface DailyInsightTimeline {
  summaryEn:  string;
  summaryAr:  string;
  changes:    InsightChange[];
}

// ── Daily widgets ─────────────────────────────────────────────────────────────

export type WidgetType = "focus" | "challenge" | "win" | "tomorrow";

export interface DailyWidget {
  type:        WidgetType;
  titleEn:     string;
  titleAr:     string;
  contentEn:   string;
  contentAr:   string;
  icon:        string;
  accentColor: string;
}

// ── Full daily brief ──────────────────────────────────────────────────────────

export interface DailyBriefInput {
  cycleDay:          number;
  phaseKey:          CyclePhaseKey;
  readinessScore:    number;
  energyScore:       number;
  hormoneStatusEn:   string;
  hormoneStatusAr:   string;
  sleepHours:        number | null;
  workoutToday:      boolean;
  fastingHours:      number | null;
  waterGoalBase:     number; // litres
  weightKg:          number | null;
  symptoms:          string[];
  todayMood:         string | null;
  yesterdayMood:     string | null;
  yesterdayEnergy:   number | null;
  yesterdaySleep:    number | null;
}

export interface DailyBrief {
  date:                string;
  readinessScore:      number;
  readinessLabelEn:    string;
  readinessLabelAr:    string;
  hormoneStatusEn:     string;
  hormoneStatusAr:     string;
  energyScore:         number;
  bestWorkWindow:      TimeWindow;
  bestStudyWindow:     TimeWindow;
  bestWorkoutWindow:   TimeWindow;
  fastingWindow:       { startHour: number; endHour: number; hoursTotal: number };
  meals:               MealPlan;
  waterGoalLiters:     number;
  sleepGoalHours:      number;
  motivationalEn:      string;
  motivationalAr:      string;
  productivitySchedule:ProductivitySchedule;
  emotionPlan:         EmotionSupportPlan;
  widgets:             DailyWidget[];
  predictions:         CyclePrediction[];
  insightTimeline:     DailyInsightTimeline;
  generatedAt:         string;
}
