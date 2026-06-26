import type { CyclePhaseKey, DayForecast, WorkoutIntensity } from "./types";
import { phaseAccentColor } from "./dailyScoreEngine";

// ── Phase data tables ─────────────────────────────────────────────────────────

const PHASE_ENERGY_LEVEL: Record<CyclePhaseKey, number> = {
  menstrual:    28,
  power:        70,
  manifestation:95,
  secondPower:  74,
  reset:        40,
};

const PHASE_MOOD: Record<CyclePhaseKey, { emoji: string; en: string; ar: string }> = {
  menstrual:    { emoji: "🌸", en: "Reflective",  ar: "تأملية" },
  power:        { emoji: "😊", en: "Optimistic",  ar: "متفائلة" },
  manifestation:{ emoji: "🌟", en: "Radiant",     ar: "متألقة" },
  secondPower:  { emoji: "🧘", en: "Calm & Focused", ar: "هادئة ومركزة" },
  reset:        { emoji: "🌙", en: "Introspective", ar: "استبطانية" },
};

const PHASE_WORKOUT: Record<CyclePhaseKey, { type: WorkoutIntensity; en: string; ar: string }> = {
  menstrual:    { type: "rest",     en: "Rest / Yoga",       ar: "راحة / يوغا" },
  power:        { type: "heavy",    en: "Strength Training",  ar: "تدريب القوة" },
  manifestation:{ type: "heavy",    en: "High Intensity",     ar: "كثافة عالية" },
  secondPower:  { type: "moderate", en: "Moderate Cardio",   ar: "كارديو معتدل" },
  reset:        { type: "light",    en: "Light Movement",    ar: "حركة خفيفة" },
};

const PHASE_FASTING: Record<CyclePhaseKey, number> = {
  menstrual:    12,
  power:        14,
  manifestation:16,
  secondPower:  14,
  reset:        12,
};

const PHASE_RECOVERY_LEVEL: Record<CyclePhaseKey, number> = {
  menstrual:    50,
  power:        78,
  manifestation:88,
  secondPower:  72,
  reset:        55,
};

// ── Cycle engine: day → phase ─────────────────────────────────────────────────

function dayToPhase(cycleDay: number): CyclePhaseKey {
  const day = ((cycleDay - 1) % 28) + 1;
  if (day <= 5)  return "menstrual";
  if (day <= 10) return "power";
  if (day <= 15) return "manifestation";
  if (day <= 19) return "secondPower";
  return "reset";
}

// ── Day label helpers ─────────────────────────────────────────────────────────

const DAY_EN  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_AR  = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

// ── Public API ────────────────────────────────────────────────────────────────

export function generateWeeklyForecast(
  todayCycleDay: number,
  todayDate?: Date
): DayForecast[] {
  const base = todayDate ?? new Date();
  base.setHours(0, 0, 0, 0);

  const forecast: DayForecast[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    const cycleDay = todayCycleDay + i;
    const phaseKey = dayToPhase(cycleDay);
    const weekday  = d.getDay();

    const energyLevel   = PHASE_ENERGY_LEVEL[phaseKey];
    const recoveryLevel = PHASE_RECOVERY_LEVEL[phaseKey];
    const mood          = PHASE_MOOD[phaseKey];
    const workout       = PHASE_WORKOUT[phaseKey];
    const fastingHours  = PHASE_FASTING[phaseKey];
    const accentColor   = phaseAccentColor(phaseKey);

    forecast.push({
      date: d.toISOString().split("T")[0],
      dayLabelEn: DAY_EN[weekday],
      dayLabelAr: DAY_AR[weekday],
      isToday: i === 0,
      cycleDay,
      phaseKey,
      energyLevel,
      moodEmoji:    mood.emoji,
      moodLabelEn:  mood.en,
      moodLabelAr:  mood.ar,
      recoveryLevel,
      workoutType:  workout.type,
      workoutLabelEn: workout.en,
      workoutLabelAr: workout.ar,
      fastingHours,
      accentColor,
    });
  }

  return forecast;
}
