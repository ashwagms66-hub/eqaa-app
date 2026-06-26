import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";
import type { DayReadiness, ReadinessLevel, UnifiedReadinessInput } from "./types";
import { LEVEL_META } from "./readinessEngine";

// ── Phase baseline (pure prediction — no biometric data) ──────────────────────

const PHASE_PREDICTED_SCORE: Record<CyclePhaseKey, number> = {
  menstrual:    40,
  power:        72,
  manifestation:90,
  secondPower:  74,
  reset:        44,
};

const WORKOUT_SUGGESTION: Record<CyclePhaseKey, { en: string; ar: string }> = {
  menstrual:    { en: "Rest / yoga",         ar: "راحة / يوغا" },
  power:        { en: "Strength training",   ar: "تدريب قوة" },
  manifestation:{ en: "High intensity / PR", ar: "كثافة عالية / رقم قياسي" },
  secondPower:  { en: "Moderate cardio",     ar: "كارديو معتدل" },
  reset:        { en: "Light movement",      ar: "حركة خفيفة" },
};

const DAY_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_AR = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

function phaseForDay(cycleDay: number): CyclePhaseKey {
  const d = ((cycleDay - 1) % 28) + 1;
  if (d <= 5)  return "menstrual";
  if (d <= 10) return "power";
  if (d <= 15) return "manifestation";
  if (d <= 19) return "secondPower";
  return "reset";
}

function scoreToLevel(score: number): ReadinessLevel {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  return "recovery";
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateReadinessTimeline(
  todayCycleDay: number,
  todayScore: number,
  input: UnifiedReadinessInput,
  baseDate?: Date
): DayReadiness[] {
  const base = baseDate ?? new Date();
  base.setHours(0, 0, 0, 0);

  // Trend modifier: if current readiness deviates from phase average, gradually return to average
  const phaseAvg = PHASE_PREDICTED_SCORE[input.phaseKey];
  const todayDeviation = todayScore - phaseAvg;

  const timeline: DayReadiness[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    const cycleDay  = todayCycleDay + i;
    const phase     = phaseForDay(cycleDay);
    const baseScore = PHASE_PREDICTED_SCORE[phase];

    // Today uses actual score; future days revert deviation by 40% per day
    const dampedDeviation = i === 0 ? todayDeviation : todayDeviation * Math.pow(0.6, i);
    const predicted = Math.max(10, Math.min(100, Math.round(baseScore + dampedDeviation)));
    const level = scoreToLevel(predicted);
    const meta = LEVEL_META[level];
    const suggestion = WORKOUT_SUGGESTION[phase];

    timeline.push({
      date:             d.toISOString().split("T")[0],
      dayLabelEn:       DAY_EN[d.getDay()],
      dayLabelAr:       DAY_AR[d.getDay()],
      cycleDay,
      predictedScore:   predicted,
      level,
      color:            meta.color,
      isToday:          i === 0,
      workoutSuggestionEn: suggestion.en,
      workoutSuggestionAr: suggestion.ar,
    });
  }

  return timeline;
}
