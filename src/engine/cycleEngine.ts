export interface Phase {
  key: string;

  startDay: number;
  endDay: number;

  icon: string;

  title: string;
  phaseArabic: string;

  description: string;
  descriptionArabic: string;
}

export const PHASES: Phase[] = [
  {
    key: "power",
    startDay: 1,
    endDay: 10,
    icon: "☀️",
    title: "Power",
    phaseArabic: "الطاقة",
    description: "High energy and motivation phase.",
    descriptionArabic: "مرحلة الطاقة العالية والتحفيز.",
  },
  {
    key: "manifestation",
    startDay: 11,
    endDay: 15,
    icon: "✨",
    title: "Manifestation",
    phaseArabic: "التجلي",
    description: "Focus on clarity and communication.",
    descriptionArabic: "التركيز على الوضوح والتواصل.",
  },
  {
    key: "secondPower",
    startDay: 16,
    endDay: 19,
    icon: "🌙",
    title: "Second Power",
    phaseArabic: "الطاقة الثانية",
    description: "Balance and calmness phase.",
    descriptionArabic: "مرحلة التوازن والهدوء.",
  },
  {
    key: "reset",
    startDay: 20,
    endDay: 28,
    icon: "🌊",
    title: "Reset",
    phaseArabic: "إعادة التعيين",
    description: "Rest and recovery phase.",
    descriptionArabic: "مرحلة الراحة والتعافي.",
  },
];

export function getCycleDay(
  lastPeriodDate: string,
  cycleLength = 28
) {
  if (!lastPeriodDate) {
    return 1;
  }

  const today = new Date();

  const lastPeriod = new Date(
    lastPeriodDate
  );

  const diffTime =
    today.getTime() -
    lastPeriod.getTime();

  const diffDays = Math.floor(
    diffTime /
      (1000 * 60 * 60 * 24)
  );

  return (
    (diffDays % cycleLength) + 1
  );
}

export function getCurrentPhase(
  cycleDay: number
) {
  const safeDay = Math.max(
    1,
    Math.min(cycleDay, 28)
  );

  return (
    PHASES.find((phase) => {
      return (
        safeDay >= phase.startDay &&
        safeDay <= phase.endDay
      );
    }) || PHASES[0]
  );
}

export function getPhaseTitle(
  cycleDay: number,
  language: "ar" | "en" = "ar"
) {
  const phase =
    getCurrentPhase(cycleDay);

  return language === "ar"
    ? phase.phaseArabic
    : phase.title;
}

export function getPhaseDescription(
  cycleDay: number,
  language: "ar" | "en" = "ar"
) {
  const phase =
    getCurrentPhase(cycleDay);

  return language === "ar"
    ? phase.descriptionArabic
    : phase.description;
}

export function getPhaseTheme(
  cycleDay: number
) {
  const safeDay = Math.max(
    1,
    Math.min(cycleDay, 28)
  );

  if (safeDay <= 10) {
    return {
      glow: "#F6C453",
      accent: "#FFD86B",
      icon: "☀️",
    };
  }

  if (safeDay <= 15) {
    return {
      glow: "#FFD6C2",
      accent: "#FFE5D8",
      icon: "✨",
    };
  }

  if (safeDay <= 19) {
    return {
      glow: "#C7A6FF",
      accent: "#E1D1FF",
      icon: "🌙",
    };
  }

  return {
    glow: "#8FD3FF",
    accent: "#CBE8FF",
    icon: "🌊",
  };
}

export function getCycleInsight(
  cycleDay: number,
  language: "ar" | "en" = "ar"
) {
  const safeDay = Math.max(
    1,
    Math.min(cycleDay, 28)
  );

  if (safeDay <= 10) {
    return language === "ar"
      ? "مرحلة تدعم الحركة والطاقة والتركيز."
      : "A phase that may support movement and energy.";
  }

  if (safeDay <= 15) {
    return language === "ar"
      ? "مرحلة الوضوح والتوازن والتواصل."
      : "A phase that may support clarity and balance.";
  }

  if (safeDay <= 19) {
    return language === "ar"
      ? "مرحلة مناسبة للإبداع والإنجاز."
      : "A phase that may support creativity and momentum.";
  }

  return language === "ar"
    ? "مرحلة أهدأ تساعد على الراحة والاستعادة."
    : "A softer phase focused on recovery.";
}