export type CyclePhase =
  | "power"
  | "manifest"
  | "clarity"
  | "rest";

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

export function getCyclePhase(
  cycleDay: number,
  sleepHours: number = 7,
  steps: number = 6000
): WellnessOutput {

  let readinessBoost = 0;

  if (sleepHours >= 8) {
    readinessBoost += 4;
  }

  if (sleepHours <= 5) {
    readinessBoost -= 8;
  }

  if (steps >= 10000) {
    readinessBoost += 3;
  }

  if (steps <= 2500) {
    readinessBoost -= 4;
  }

  // POWER
  if (cycleDay <= 10) {
    return {
      phase: "power",

      phaseArabic: "مرحلة القوة",
      phaseEnglish: "Power Phase",

      title: "Power Phase",

      description:
        "طاقتك الحالية قد تدعم الإنجاز والتركيز والحركة بثقة أكبر اليوم.",

      descriptionArabic:
        "طاقتك الحالية قد تدعم الإنجاز والتركيز والحركة بثقة أكبر اليوم.",

      descriptionEnglish:
        "Your current energy may support focus, movement and productivity today.",

      emoji: "☀️",
      color: "#E9CF74",

      readiness: Math.min(
        100,
        Math.max(70, 92 + readinessBoost)
      ),

      fastingHours: 13,

      sleepSupport:
        "Recovery and deeper sleep may support your energy stability.",

      movementSupport:
        "Strength movement and walking may feel supportive today.",
    };
  }

  // MANIFEST
  if (cycleDay <= 15) {
    return {
      phase: "manifest",

      phaseArabic: "مرحلة التجلي",
      phaseEnglish: "Manifest Phase",

      title: "Manifest Phase",

      description:
        "هذه المرحلة قد تدعم الوضوح والتواصل والثقة أكثر.",

      descriptionArabic:
        "هذه المرحلة قد تدعم الوضوح والتواصل والثقة أكثر.",

      descriptionEnglish:
        "This phase may support confidence, communication and clarity.",

      emoji: "✨",
      color: "#F2C6FF",

      readiness: Math.min(
        100,
        Math.max(72, 96 + readinessBoost)
      ),

      fastingHours: 15,

      sleepSupport:
        "Balanced sleep may help maintain emotional clarity.",

      movementSupport:
        "Pilates, walking, or lighter strength may feel aligned.",
    };
  }

  // CLARITY
  if (cycleDay <= 19) {
    return {
      phase: "clarity",

      phaseArabic: "مرحلة الوضوح",
      phaseEnglish: "Clarity Phase",

      title: "Clarity Phase",

      description:
        "قد تشعرين بطاقة ذهنية أوضح وتركيز أعلى خلال هذه المرحلة.",

      descriptionArabic:
        "قد تشعرين بطاقة ذهنية أوضح وتركيز أعلى خلال هذه المرحلة.",

      descriptionEnglish:
        "Mental clarity and stronger focus may feel more present during this phase.",

      emoji: "🌕",
      color: "#C6A7FF",

      readiness: Math.min(
        100,
        Math.max(65, 88 + readinessBoost)
      ),

      fastingHours: 17,

      sleepSupport:
        "Mental clarity often feels stronger with deeper recovery.",

      movementSupport:
        "Flexible movement and moderate intensity may feel ideal.",
    };
  }

  // REST
  return {
    phase: "rest",

    phaseArabic: "مرحلة الراحة",
    phaseEnglish: "Rest Phase",

    title: "Rest Phase",

    description:
      "قد يكون الهدوء والراحة والتغذية اللطيفة أكثر دعمًا لك الآن.",

    descriptionArabic:
      "قد يكون الهدوء والراحة والتغذية اللطيفة أكثر دعمًا لك الآن.",

    descriptionEnglish:
      "Rest, calm and gentler nourishment may feel more supportive right now.",

    emoji: "🌙",
    color: "#89CFF0",

    readiness: Math.min(
      92,
      Math.max(50, 74 + readinessBoost)
    ),

    fastingHours: 12,

    sleepSupport:
      "Rest and nervous system recovery may feel more important now.",

    movementSupport:
      "Gentle walking, stretching, and slower movement may support you better.",
  };
}

export function generateDailyWellness(
  cycleDay: number,
  sleepHours: number = 7,
  steps: number = 6000
): WellnessOutput {
  return getCyclePhase(
    cycleDay,
    sleepHours,
    steps
  );
}