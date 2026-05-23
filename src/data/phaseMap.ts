export type Phase = {
  key: string;

  startDay: number;
  endDay: number;

  icon: string;

  phaseArabic: string;

  title: string;

  description: string;
  descriptionArabic: string;

  days: string;

  color: string;
  glow: string;

  insight: string;

  fasting: string;
  movement: string;
  nutrition: string;
};
export const PHASES: Phase[] = [  {
    key: "power",

    startDay: 1,
    endDay: 10,
    icon: "☀️",
    phaseArabic: "مرحلة القوة",
    description:
      "A phase often associated with rebuilding energy, momentum, and focus.",
    descriptionArabic:
      "مرحلة تدعم بناء الطاقة والتركيز والحركة بشكل تدريجي.",

    title: "Power Phase",

    days: "1–10",

    color: "#E6C766",

    glow: "rgba(230,199,102,0.35)",

    insight:
      "A phase often associated with rebuilding energy, momentum, and focus.",

    fasting:
      "Some people may feel comfortable with slightly longer fasting windows during this phase.",

    movement:
      "Strength training, walking, and moderate movement may feel supportive.",

    nutrition:
      "Balanced meals with protein, fiber, and hydration may help support energy.",
  },

  {
    key: "manifestation",

    startDay: 11,
    endDay: 15,
    icon: "✨",
    phaseArabic: "مرحلة التجلي",
    description:
      "This phase may feel more expressive, creative, and socially open.",
    descriptionArabic:
      "مرحلة قد تدعم الوضوح والتواصل والإبداع بشكل أكبر.",

    title: "Manifestation Phase",

    days: "11–15",

    color: "#C8A3FF",

    glow: "rgba(200,163,255,0.35)",

    insight:
      "This phase may feel more expressive, creative, and socially open.",

    fasting:
      "Gentler fasting or flexible eating rhythms may feel more balanced.",

    movement:
      "Higher energy workouts or social movement may feel enjoyable.",

    nutrition:
      "Colorful meals and hydration may support consistency and energy.",
  },

  {
    key: "secondPower",

    startDay: 16,
    endDay: 19,
    icon: "🌙",
    phaseArabic: "مرحلة القوة الثانية",
    description:
      "A quieter strength phase that may support reflection and grounding.",
    descriptionArabic:
      "مرحلة أهدأ تدعم التوازن والهدوء والاستقرار.",

    title: "Second Power",

    days: "16–19",

    color: "#7AA8FF",

    glow: "rgba(122,168,255,0.35)",

    insight:
      "A quieter strength phase that may support reflection and grounding.",

    fasting:
      "Consistency and balance may feel more supportive than intensity.",

    movement:
      "Pilates, walks, and slower strength sessions may feel supportive.",

    nutrition:
      "Regular nourishing meals and hydration may support balance.",
  },

  {
    key: "nurture",

    startDay: 20,
    endDay: 28,
    icon: "🌊",
    phaseArabic: "مرحلة الاحتواء",
    description:
      "A softer phase that may support rest, calm, and emotional awareness.",
    descriptionArabic:
      "مرحلة ألطف تدعم الراحة والهدوء واستعادة التوازن.",

    title: "Nurture Phase",

    days: "20–28",

    color: "#F0A7C2",

    glow: "rgba(240,167,194,0.35)",

    insight:
      "A softer phase that may support rest, calm, and emotional awareness.",

    fasting:
      "Gentler nourishment and flexibility may feel more supportive during this phase.",

    movement:
      "Restorative movement, stretching, and slower routines may feel supportive.",

    nutrition:
      "Warm meals, hydration, and softer routines may support wellbeing.",
  },
];