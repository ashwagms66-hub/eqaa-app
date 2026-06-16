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
    key: "menstrual",
    startDay: 1,
    endDay: 5,
    icon: "❤️",
    title: "Menstrual",
    phaseArabic: "مرحلة الدورة",
    description: "Rest and gentle nourishment support your body in renewal.",
    descriptionArabic: "مرحلة التجديد. الراحة والتغذية اللطيفة تدعمكِ الآن.",
  },
  {
    key: "power",
    startDay: 6,
    endDay: 10,
    icon: "🌱",
    title: "Renewal",
    phaseArabic: "مرحلة التجديد",
    description: "Your energy is rising. Gradual renewal and building.",
    descriptionArabic: "طاقتك تبدأ بالصعود — مرحلة التجديد التدريجي.",
  },
  {
    key: "manifestation",
    startDay: 11,
    endDay: 15,
    icon: "⚡",
    title: "Power",
    phaseArabic: "مرحلة القوة",
    description: "Peak energy and clarity. Best time for decisions and achievements.",
    descriptionArabic: "ذروة الطاقة والوضوح — أفضل وقت للإنجاز.",
  },
  {
    key: "secondPower",
    startDay: 16,
    endDay: 19,
    icon: "✨",
    title: "Clarity",
    phaseArabic: "مرحلة الوضوح",
    description: "Mental clarity and deeper focus.",
    descriptionArabic: "وضوح ذهني وتركيز أعمق.",
  },
  {
    key: "reset",
    startDay: 20,
    endDay: 28,
    icon: "🌙",
    title: "Calm",
    phaseArabic: "مرحلة الهدوء",
    description: "Rest, calm and gentle nourishment support you best.",
    descriptionArabic: "الهدوء والراحة والتغذية اللطيفة تدعمكِ الآن.",
  },
];

export function getCycleDay(
  lastPeriodDate: string,
  cycleLength = 28
) {
  if (!lastPeriodDate) return 1;
  // Parse both dates at LOCAL midnight to avoid UTC-offset errors in UTC+ timezones
  const [y, m, d] = lastPeriodDate.split("-").map(Number);
  const startLocal = new Date(y, m - 1, d);
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (todayLocal.getTime() - startLocal.getTime()) / (1000 * 60 * 60 * 24)
  );
  return (diffDays % cycleLength) + 1;
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

  if (safeDay <= 5) {
    return { glow: "#FF6FAE", accent: "#FFB3D1", icon: "❤️" };
  }
  if (safeDay <= 10) {
    return { glow: "#5BBB85", accent: "#7ECFA0", icon: "🌱" };
  }
  if (safeDay <= 15) {
    return { glow: "#E9CF74", accent: "#FFD86B", icon: "⚡" };
  }
  if (safeDay <= 19) {
    return { glow: "#C7A6FF", accent: "#E1D1FF", icon: "✨" };
  }
  return { glow: "#8FD3FF", accent: "#CBE8FF", icon: "🌙" };
}

export function getCycleInsight(
  cycleDay: number,
  language: "ar" | "en" = "ar"
) {
  const safeDay = Math.max(
    1,
    Math.min(cycleDay, 28)
  );

  if (safeDay <= 5) {
    return language === "ar"
      ? "جسمكِ في مرحلة التجديد. الراحة والتغذية الداعمة أهم شيء الآن."
      : "Your body is in renewal. Rest and supportive nourishment come first.";
  }

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