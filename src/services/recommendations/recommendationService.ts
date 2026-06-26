import { getWellnessPhaseForDay, type CyclePhase } from "@/src/engine/wellnessEngine";

export interface WorkoutItem {
  name: string;
  nameAr: string;
  duration: string;
  durationAr: string;
  intensity: "low" | "moderate" | "high";
}

export interface WorkoutRecommendation {
  phase: CyclePhase;
  intensity: "rest" | "low" | "moderate" | "high";
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  description: string;
  descriptionAr: string;
  workouts: WorkoutItem[];
  icon: string;
  accentColor: string;
  tip: string;
  tipAr: string;
}

const RECOMMENDATIONS: Record<CyclePhase, WorkoutRecommendation> = {
  menstrual: {
    phase: "menstrual",
    intensity: "rest",
    title: "Rest & Restore",
    titleAr: "الراحة والتعافي",
    subtitle: "Honor your body's need for renewal",
    subtitleAr: "أكرمي جسدك بالتجديد الذي يحتاجه",
    description:
      "Your body is working hard during menstruation. Light, gentle movement supports circulation without draining energy.",
    descriptionAr:
      "جسمك يعمل بجهد أثناء الدورة. الحركة اللطيفة تدعم الدورة الدموية دون استنزاف الطاقة.",
    icon: "🌿",
    accentColor: "#FF6FAE",
    workouts: [
      {
        name: "Gentle Yoga",
        nameAr: "يوغا لطيفة",
        duration: "20–30 min",
        durationAr: "٢٠–٣٠ دقيقة",
        intensity: "low",
      },
      {
        name: "Walking",
        nameAr: "المشي",
        duration: "20 min",
        durationAr: "٢٠ دقيقة",
        intensity: "low",
      },
      {
        name: "Stretching & Mobility",
        nameAr: "إطالة ومرونة",
        duration: "15 min",
        durationAr: "١٥ دقيقة",
        intensity: "low",
      },
    ],
    tip: "Avoid high-intensity training. Heat packs, gentle movement, and rest are your best friends.",
    tipAr: "تجنبي التمرين عالي الكثافة. الدفء والحركة اللطيفة والراحة هي أصدقاؤكِ الأفضل.",
  },

  renewal: {
    phase: "renewal",
    intensity: "low",
    title: "Build Momentum",
    titleAr: "ابني الزخم",
    subtitle: "Rising energy meets rising strength",
    subtitleAr: "طاقة متصاعدة تلتقي بقوة متنامية",
    description:
      "Estrogen is rising and so is your capacity. This is the best time to introduce new exercises or increase weights gradually.",
    descriptionAr:
      "الإستروجين يرتفع وكذلك قدرتك. هذا أفضل وقت لتقديم تمارين جديدة أو زيادة الأوزان تدريجياً.",
    icon: "🌱",
    accentColor: "#5BBB85",
    workouts: [
      {
        name: "Light Strength Training",
        nameAr: "تمرين القوة الخفيف",
        duration: "30–40 min",
        durationAr: "٣٠–٤٠ دقيقة",
        intensity: "moderate",
      },
      {
        name: "Cardio Walk / Light Run",
        nameAr: "مشي / جري خفيف",
        duration: "25 min",
        durationAr: "٢٥ دقيقة",
        intensity: "low",
      },
      {
        name: "Pilates",
        nameAr: "بيلاتيس",
        duration: "30 min",
        durationAr: "٣٠ دقيقة",
        intensity: "moderate",
      },
    ],
    tip: "Your recovery is fast in this phase — you can push a little harder than usual without overdoing it.",
    tipAr: "تعافيكِ سريع في هذه المرحلة — يمكنكِ الضغط أكثر قليلاً دون إفراط.",
  },

  power: {
    phase: "power",
    intensity: "high",
    title: "Peak Performance",
    titleAr: "أداء الذروة",
    subtitle: "Your strongest week — make it count",
    subtitleAr: "أسبوعك الأقوى — اجعليه يستحق",
    description:
      "Peak estrogen and testosterone give you maximum strength, endurance, and coordination. This is your window for personal bests.",
    descriptionAr:
      "ذروة الإستروجين والتستوستيرون تمنحكِ أقصى قوة وتحمل وتنسيق. هذه هي فرصتكِ للإنجازات الشخصية.",
    icon: "⚡",
    accentColor: "#E9CF74",
    workouts: [
      {
        name: "Heavy Strength Training",
        nameAr: "تدريب قوة بأوزان ثقيلة",
        duration: "45–60 min",
        durationAr: "٤٥–٦٠ دقيقة",
        intensity: "high",
      },
      {
        name: "HIIT",
        nameAr: "تمرين تبادلي عالي الكثافة",
        duration: "30 min",
        durationAr: "٣٠ دقيقة",
        intensity: "high",
      },
      {
        name: "Running / Sprint Intervals",
        nameAr: "الجري / فترات السرعة",
        duration: "30–40 min",
        durationAr: "٣٠–٤٠ دقيقة",
        intensity: "high",
      },
    ],
    tip: "Chase PRs and challenge yourself. Your body can handle more stress and recovers faster right now.",
    tipAr: "اطاردي إنجازاتك الشخصية وتحدّي نفسك. جسمك قادر على تحمل الجهد والتعافي بشكل أسرع الآن.",
  },

  clarity: {
    phase: "clarity",
    intensity: "moderate",
    title: "Focused Intensity",
    titleAr: "كثافة مركزة",
    subtitle: "Strength meets precision",
    subtitleAr: "القوة تلتقي بالدقة",
    description:
      "Progesterone rises — your body prefers steady, controlled workouts over explosive movements. Focus on form and technique.",
    descriptionAr:
      "البروجسترون يرتفع — جسمك يفضل التمارين المستقرة والمتحكمة على الحركات المتفجرة. ركزي على الشكل والأسلوب.",
    icon: "✨",
    accentColor: "#C6A7FF",
    workouts: [
      {
        name: "Moderate Strength Training",
        nameAr: "تمرين قوة متوسط",
        duration: "40 min",
        durationAr: "٤٠ دقيقة",
        intensity: "moderate",
      },
      {
        name: "Cycling / Steady-State Cardio",
        nameAr: "دراجة / كارديو منتظم",
        duration: "30–40 min",
        durationAr: "٣٠–٤٠ دقيقة",
        intensity: "moderate",
      },
      {
        name: "Yoga Flow",
        nameAr: "يوغا متدفقة",
        duration: "30 min",
        durationAr: "٣٠ دقيقة",
        intensity: "low",
      },
    ],
    tip: "Listen to how you feel. Some days call for more, others for less — trust your body's signals.",
    tipAr: "استمعي لشعورك. بعض الأيام تتطلب أكثر، وبعضها أقل — ثقي في إشارات جسدك.",
  },

  calm: {
    phase: "calm",
    intensity: "moderate",
    title: "Recovery Focus",
    titleAr: "تركيز على التعافي",
    subtitle: "Restore, regulate, prepare",
    subtitleAr: "استعيدي، انتظمي، استعدّي",
    description:
      "Your body is preparing for the next cycle. Moderate movement supports progesterone and reduces PMS. Prioritize recovery.",
    descriptionAr:
      "جسمك يتهيأ للدورة القادمة. الحركة المعتدلة تدعم البروجسترون وتقلل أعراض ما قبل الدورة. أولوية للتعافي.",
    icon: "🌙",
    accentColor: "#89CFF0",
    workouts: [
      {
        name: "Walking or Gentle Cycling",
        nameAr: "مشي أو دراجة هادئة",
        duration: "30 min",
        durationAr: "٣٠ دقيقة",
        intensity: "low",
      },
      {
        name: "Yoga / Yin Yoga",
        nameAr: "يوغا / يين يوغا",
        duration: "30–45 min",
        durationAr: "٣٠–٤٥ دقيقة",
        intensity: "low",
      },
      {
        name: "Light Strength + Stretching",
        nameAr: "قوة خفيفة + إطالة",
        duration: "30 min",
        durationAr: "٣٠ دقيقة",
        intensity: "moderate",
      },
    ],
    tip: "Reduce intensity as your period approaches. Magnesium-rich foods and warmth support your body now.",
    tipAr: "قللي الكثافة مع اقتراب الدورة. الأطعمة الغنية بالمغنيسيوم والدفء يدعمان جسمك الآن.",
  },
};

export function getWorkoutRecommendation(cycleDay: number): WorkoutRecommendation {
  const phase = getWellnessPhaseForDay(cycleDay);
  return RECOMMENDATIONS[phase];
}

export function getIntensityLabel(
  intensity: WorkoutRecommendation["intensity"],
  language: "ar" | "en"
): string {
  const labels: Record<WorkoutRecommendation["intensity"], { en: string; ar: string }> = {
    rest: { en: "Rest Day", ar: "يوم راحة" },
    low: { en: "Low Intensity", ar: "كثافة منخفضة" },
    moderate: { en: "Moderate", ar: "معتدل" },
    high: { en: "High Intensity", ar: "كثافة عالية" },
  };
  return language === "ar" ? labels[intensity].ar : labels[intensity].en;
}
