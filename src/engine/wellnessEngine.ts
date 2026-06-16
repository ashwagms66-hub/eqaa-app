// Single source of truth for cycle phase definitions.
// All screens must read phaseArabic / phaseEnglish / emoji / color from here.

export type CyclePhase =
  | "menstrual"  // days 1-5
  | "renewal"    // days 6-10
  | "power"      // days 11-15
  | "clarity"    // days 16-19
  | "calm";      // days 20-28

export type WellnessOutput = {
  phase: CyclePhase;
  phaseArabic: string;
  phaseEnglish: string;
  title: string;
  description: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  emoji: string;
  color: string;
  readiness: number;
  fastingHours: number;
  sleepSupport: string;
  movementSupport: string;
};

// ── Canonical phase registry ── import this in other screens ──────────────────
export const WELLNESS_PHASES: Record<CyclePhase, {
  phaseArabic: string;
  phaseEnglish: string;
  emoji: string;
  color: string;
  startDay: number;
  endDay: number;
}> = {
  menstrual: { phaseArabic: "مرحلة الدورة",  phaseEnglish: "Menstrual", emoji: "❤️", color: "#FF6FAE", startDay: 1,  endDay: 5  },
  renewal:   { phaseArabic: "مرحلة التجديد", phaseEnglish: "Renewal",   emoji: "🌱", color: "#5BBB85", startDay: 6,  endDay: 10 },
  power:     { phaseArabic: "مرحلة القوة",   phaseEnglish: "Power",     emoji: "⚡", color: "#E9CF74", startDay: 11, endDay: 15 },
  clarity:   { phaseArabic: "مرحلة الوضوح",  phaseEnglish: "Clarity",   emoji: "✨", color: "#C6A7FF", startDay: 16, endDay: 19 },
  calm:      { phaseArabic: "مرحلة الهدوء",  phaseEnglish: "Calm",      emoji: "🌙", color: "#89CFF0", startDay: 20, endDay: 28 },
};

export function getWellnessPhaseForDay(day: number): CyclePhase {
  if (day <= 5)  return "menstrual";
  if (day <= 10) return "renewal";
  if (day <= 15) return "power";
  if (day <= 19) return "clarity";
  return "calm";
}

export function getCyclePhase(
  cycleDay: number,
  sleepHours: number = 7,
  steps: number = 6000,
  energyLevel?: number,
  symptomsCount: number = 0,
): WellnessOutput {
  let readinessBoost = 0;

  if (sleepHours >= 8) readinessBoost += 4;
  if (sleepHours <= 5) readinessBoost -= 8;
  if (steps >= 10000)  readinessBoost += 3;
  if (steps <= 2500)   readinessBoost -= 4;

  // Energy-based adjustment (from check-in)
  if (energyLevel !== undefined) {
    if (energyLevel >= 8)      readinessBoost += 5;
    else if (energyLevel >= 6) readinessBoost += 2;
    else if (energyLevel <= 3) readinessBoost -= 8;
    else if (energyLevel <= 5) readinessBoost -= 4;
  }

  // Symptoms drag readiness
  if (symptomsCount >= 3) readinessBoost -= 6;
  else if (symptomsCount >= 1) readinessBoost -= 3;

  // MENSTRUAL (days 1-5)
  if (cycleDay <= 5) {
    return {
      phase: "menstrual",
      phaseArabic: "مرحلة الدورة",
      phaseEnglish: "Menstrual Phase",
      title: "Menstrual Phase",
      description: "جسمكِ في مرحلة التجديد. الراحة والتغذية الداعمة أهم أولوياتك الآن.",
      descriptionArabic: "جسمكِ في مرحلة التجديد. الراحة والتغذية الداعمة أهم أولوياتك الآن.",
      descriptionEnglish: "Your body is renewing. Rest and supportive nourishment come first.",
      emoji: "❤️",
      color: "#FF6FAE",
      readiness: Math.min(75, Math.max(35, 58 + readinessBoost)),
      fastingHours: 12,
      sleepSupport: "Extra rest eases discomfort and supports hormonal balance.",
      movementSupport: "Gentle walks and light stretching feel best. Avoid intense training.",
    };
  }

  // RENEWAL (days 6-10)
  if (cycleDay <= 10) {
    return {
      phase: "renewal",
      phaseArabic: "مرحلة التجديد",
      phaseEnglish: "Renewal Phase",
      title: "Renewal Phase",
      description: "طاقتك تبدأ بالصعود. هذه المرحلة تدعم البناء والتجديد التدريجي.",
      descriptionArabic: "طاقتك تبدأ بالصعود. هذه المرحلة تدعم البناء والتجديد التدريجي.",
      descriptionEnglish: "Your energy is rising. This phase supports gradual renewal and building.",
      emoji: "🌱",
      color: "#5BBB85",
      readiness: Math.min(100, Math.max(65, 85 + readinessBoost)),
      fastingHours: 13,
      sleepSupport: "Recovery sleep builds energy reserves for the active phase ahead.",
      movementSupport: "Moderate strength and walking feel supportive now.",
    };
  }

  // POWER (days 11-15)
  if (cycleDay <= 15) {
    return {
      phase: "power",
      phaseArabic: "مرحلة القوة",
      phaseEnglish: "Power Phase",
      title: "Power Phase",
      description: "ذروة الطاقة والوضوح. أفضل وقت للقرارات والإنجاز والحركة القوية.",
      descriptionArabic: "ذروة الطاقة والوضوح. أفضل وقت للقرارات والإنجاز والحركة القوية.",
      descriptionEnglish: "Peak energy and clarity. Best time for decisions, achievements and strong movement.",
      emoji: "⚡",
      color: "#E9CF74",
      readiness: Math.min(100, Math.max(72, 96 + readinessBoost)),
      fastingHours: 15,
      sleepSupport: "Balanced sleep maintains peak performance through this phase.",
      movementSupport: "Strength training, HIIT, and social workouts may feel aligned.",
    };
  }

  // CLARITY (days 16-19)
  if (cycleDay <= 19) {
    return {
      phase: "clarity",
      phaseArabic: "مرحلة الوضوح",
      phaseEnglish: "Clarity Phase",
      title: "Clarity Phase",
      description: "قد تشعرين بطاقة ذهنية أوضح وتركيز أعلى خلال هذه المرحلة.",
      descriptionArabic: "قد تشعرين بطاقة ذهنية أوضح وتركيز أعلى خلال هذه المرحلة.",
      descriptionEnglish: "Mental clarity and deeper focus may feel more present during this phase.",
      emoji: "✨",
      color: "#C6A7FF",
      readiness: Math.min(100, Math.max(60, 86 + readinessBoost)),
      fastingHours: 17,
      sleepSupport: "Mental clarity often feels stronger with deeper recovery.",
      movementSupport: "Pilates, walking, or moderate intensity may feel ideal.",
    };
  }

  // CALM (days 20-28)
  return {
    phase: "calm",
    phaseArabic: "مرحلة الهدوء",
    phaseEnglish: "Calm Phase",
    title: "Calm Phase",
    description: "قد يكون الهدوء والراحة والتغذية اللطيفة أكثر دعمًا لك الآن.",
    descriptionArabic: "قد يكون الهدوء والراحة والتغذية اللطيفة أكثر دعمًا لك الآن.",
    descriptionEnglish: "Rest, calm and gentler nourishment may feel more supportive right now.",
    emoji: "🌙",
    color: "#89CFF0",
    readiness: Math.min(90, Math.max(45, 72 + readinessBoost)),
    fastingHours: 12,
    sleepSupport: "Rest and nervous system recovery feel more important now.",
    movementSupport: "Gentle walking, stretching, and slower movement support you best.",
  };
}

export function generateDailyWellness(
  cycleDay: number,
  sleepHours: number = 7,
  steps: number = 6000
): WellnessOutput {
  return getCyclePhase(cycleDay, sleepHours, steps);
}
