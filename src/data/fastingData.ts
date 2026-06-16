// ─────────────────────────────────────────────────────────────────────────────
// Fasting & Rhythm — phase data, foods, insights, rhythm plan, motivations
// Educational / wellness only. Not medical advice.
// ─────────────────────────────────────────────────────────────────────────────

export type FastingPhaseKey = "power" | "balance" | "clarity" | "rest";

// ── Phase definitions ─────────────────────────────────────────────────────────
export const FASTING_PHASES: Record<
  FastingPhaseKey,
  {
    nameAr: string;
    nameEn: string;
    daysRangeAr: string;
    daysRangeEn: string;
    descAr: string;
    descEn: string;
    fastingHoursMin: number;
    fastingHoursMax: number;
    fastingLabelAr: string;
    fastingLabelEn: string;
    color: string;
    glow: string;
    bgAccent: string;
    foods: Array<{ emoji: string; nameAr: string; nameEn: string }>;
    motivationAr: string;
    motivationEn: string;
    bodySupport: Array<{ ar: string; en: string }>;
    movement: { ar: string; en: string };
    recovery: { ar: string; en: string };
    intensity: {
      intermittentIF: number;
      autophagy: number;
      fatBurning: number;
      recoveryScore: number;
    };
  }
> = {
  power: {
    nameAr: "مرحلة القوة",
    nameEn: "Power Phase",
    daysRangeAr: "الأيام ١–١٠",
    daysRangeEn: "Days 1–10",
    descAr:
      "طاقتكِ قد تعود تدريجياً بعد بداية الدورة. هذه مرحلة إعادة بناء ناعمة وهادئة.",
    descEn:
      "Your energy may slowly return after your cycle begins. This is a soft, gentle rebuilding phase.",
    fastingHoursMin: 13,
    fastingHoursMax: 16,
    fastingLabelAr: "١٣–١٦ ساعة",
    fastingLabelEn: "13–16 hours",
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.32)",
    bgAccent: "rgba(120,60,255,0.18)",
    foods: [
      { emoji: "🥩", nameAr: "بروتين",          nameEn: "Protein"       },
      { emoji: "🥬", nameAr: "خضار ورقية",       nameEn: "Leafy Greens"  },
      { emoji: "🥑", nameAr: "دهون صحية",        nameEn: "Healthy Fats"  },
      { emoji: "🍫", nameAr: "شوكولاتة داكنة",   nameEn: "Dark Chocolate"},
      { emoji: "🫘", nameAr: "عدس",              nameEn: "Lentils"       },
      { emoji: "🌿", nameAr: "مغنيسيوم",         nameEn: "Magnesium"     },
    ],
    motivationAr: "خطوات متوازنة صغيرة تحتسب دائماً.",
    motivationEn: "Small balanced steps still count.",
    bodySupport: [
      { ar: "الصيام المتقطع مناسب",  en: "Intermittent fasting friendly" },
      { ar: "تقليل السكريات",        en: "Lower sugar intake"            },
      { ar: "بروتين أعلى",           en: "Higher protein"                },
      { ar: "تدريب المقاومة مناسب",  en: "Resistance training friendly"  },
      { ar: "مرحلة بناء الطاقة",     en: "Energy building phase"         },
    ],
    movement: { ar: "تدريب مقاومة أو مشي ٢٠–٣٠ دقيقة", en: "Resistance training or 20–30 min walk" },
    recovery: { ar: "نوم عميق لإعادة البناء",            en: "Quality sleep for rebuilding"          },
    intensity: { intermittentIF: 5, autophagy: 3, fatBurning: 3, recoveryScore: 2 },
  },

  balance: {
    nameAr: "مرحلة التوازن",
    nameEn: "Balance Phase",
    daysRangeAr: "الأيام ١١–١٥",
    daysRangeEn: "Days 11–15",
    descAr:
      "كثير من النساء يشعرن بطاقة أعلى ووضوح ذهني في هذه المرحلة. قد يكون وقتاً مناسباً للحركة والتجديد.",
    descEn:
      "Many women feel more energetic and mentally clear during this phase. It may feel like a good time for movement and renewal.",
    fastingHoursMin: 13,
    fastingHoursMax: 15,
    fastingLabelAr: "١٣–١٥ ساعة إن كان مريحاً",
    fastingLabelEn: "13–15 hours if comfortable",
    color: "#22D3EE",
    glow: "rgba(34,211,238,0.28)",
    bgAccent: "rgba(6,150,200,0.16)",
    foods: [
      { emoji: "🥬", nameAr: "خضار ورقية",    nameEn: "Leafy Greens" },
      { emoji: "🌰", nameAr: "بذور",           nameEn: "Seeds"        },
      { emoji: "🥜", nameAr: "مكسرات",         nameEn: "Nuts"         },
      { emoji: "🫐", nameAr: "مضادات أكسدة",   nameEn: "Antioxidants" },
      { emoji: "🥑", nameAr: "أفوكادو",        nameEn: "Avocado"      },
      { emoji: "💧", nameAr: "ترطيب وفير",     nameEn: "Hydration"    },
    ],
    motivationAr: "طاقتكِ قد تبدو أخف وأكثر انفتاحاً اليوم.",
    motivationEn: "Your energy may feel lighter and more open today.",
    bodySupport: [
      { ar: "توازن هرموني مثالي",   en: "Hormone balance"         },
      { ar: "أطعمة كاملة طبيعية",   en: "Whole foods"             },
      { ar: "خضروات ورقية",         en: "Leafy greens"            },
      { ar: "بذور ومكسرات",         en: "Seeds and nuts"          },
      { ar: "مرحلة إنتاجية عالية",  en: "High productivity phase" },
    ],
    movement: { ar: "نشاط معتدل أو التمرين المفضل",   en: "Moderate activity or preferred workout" },
    recovery: { ar: "ترطيب وفير طوال اليوم",          en: "Stay well-hydrated throughout"          },
    intensity: { intermittentIF: 5, autophagy: 4, fatBurning: 4, recoveryScore: 3 },
  },

  clarity: {
    nameAr: "مرحلة الوضوح",
    nameEn: "Clarity Phase",
    daysRangeAr: "الأيام ١٦–١٩",
    daysRangeEn: "Days 16–19",
    descAr:
      "هذه المرحلة قد تشعرين فيها بتركيز ذهني وثبات عاطفي. البنية اللطيفة قد تساعد.",
    descEn:
      "This phase may feel mentally focused and emotionally steady. Gentle structure may feel supportive.",
    fastingHoursMin: 13,
    fastingHoursMax: 16,
    fastingLabelAr: "١٣–١٦ ساعة",
    fastingLabelEn: "13–16 hours",
    color: "#34D399",
    glow: "rgba(52,211,153,0.28)",
    bgAccent: "rgba(16,160,100,0.14)",
    foods: [
      { emoji: "🥩", nameAr: "بروتين",    nameEn: "Protein"   },
      { emoji: "🥬", nameAr: "خضار",      nameEn: "Greens"    },
      { emoji: "🐟", nameAr: "أوميغا ٣",  nameEn: "Omega 3"   },
      { emoji: "🫐", nameAr: "توت",        nameEn: "Berries"   },
      { emoji: "🌰", nameAr: "مكسرات",    nameEn: "Nuts"      },
      { emoji: "🍵", nameAr: "شاي أخضر",  nameEn: "Green Tea" },
    ],
    motivationAr: "البنية الهادئة قد تبدو قوية.",
    motivationEn: "Calm structure can feel powerful.",
    bodySupport: [
      { ar: "دعم إصلاح الخلايا",       en: "Cellular repair support"       },
      { ar: "أطعمة كثيفة المغذيات",    en: "Nutrient dense foods"          },
      { ar: "العودة للصيام المتقطع",    en: "Return to intermittent fasting"},
      { ar: "مناسب للحركة النشطة",     en: "Movement friendly"             },
    ],
    movement: { ar: "يوغا أو تمرين هادئ ومركّز",        en: "Yoga or calm focused workout"         },
    recovery: { ar: "نوم مبكر يدعم الاستشفاء الخلوي",   en: "Early sleep supports cellular repair" },
    intensity: { intermittentIF: 5, autophagy: 5, fatBurning: 4, recoveryScore: 3 },
  },

  rest: {
    nameAr: "مرحلة الهدوء",
    nameEn: "Rest Phase",
    daysRangeAr: "الأيام ٢٠–٢٨",
    daysRangeEn: "Days 20–28",
    descAr:
      "جسمكِ قد يحتاج إلى مزيد من الراحة والتغذية في هذه المرحلة. استمعي لما يحتاجه.",
    descEn:
      "Your body may need more comfort and nourishment during this phase. Listen to what it needs.",
    fastingHoursMin: 12,
    fastingHoursMax: 13,
    fastingLabelAr: "١٢–١٣ ساعة فقط",
    fastingLabelEn: "12–13 hours only",
    color: "#F472B6",
    glow: "rgba(244,114,182,0.28)",
    bgAccent: "rgba(200,50,140,0.14)",
    foods: [
      { emoji: "🍠", nameAr: "كربوهيدرات ذكية",        nameEn: "Smart Carbs"          },
      { emoji: "🥬", nameAr: "خضار ورقية",              nameEn: "Greens"               },
      { emoji: "🍫", nameAr: "شوكولاتة داكنة",          nameEn: "Dark Chocolate"       },
      { emoji: "🌿", nameAr: "أغذية غنية بالمغنيسيوم",  nameEn: "Magnesium-rich Foods" },
      { emoji: "🫖", nameAr: "شاي دافئ",                nameEn: "Warm Tea"             },
      { emoji: "💧", nameAr: "ترطيب وفير",              nameEn: "Hydration"            },
    ],
    motivationAr: "الراحة جزء من إيقاعكِ، وليست تراجعاً.",
    motivationEn: "Rest is part of your rhythm, not a setback.",
    bodySupport: [
      { ar: "تخفيف ضغط الصيام",        en: "Reduce fasting stress"    },
      { ar: "إعطاء الأولوية للتغذية",  en: "Prioritize nourishment"   },
      { ar: "حركة لطيفة وهادئة",       en: "Gentle movement"          },
      { ar: "دعم هرمون البروجسترون",   en: "Support progesterone"     },
    ],
    movement: { ar: "مشي هادئ أو تمدد خفيف",             en: "Gentle walk or light stretching"  },
    recovery: { ar: "الراحة جزء أساسي من إيقاعكِ",       en: "Rest is essential to your rhythm" },
    intensity: { intermittentIF: 3, autophagy: 2, fatBurning: 2, recoveryScore: 5 },
  },
};

// ── Phase detection from cycle day ────────────────────────────────────────────
export function getFastingPhase(cycleDay: number): FastingPhaseKey {
  if (cycleDay <= 10) return "power";
  if (cycleDay <= 15) return "balance";
  if (cycleDay <= 19) return "clarity";
  return "rest";
}

// ── Daily insights per phase ──────────────────────────────────────────────────
export const DAILY_INSIGHTS: Record<FastingPhaseKey, { ar: string; en: string }> = {
  power: {
    ar: "جسمكِ قد يقدّر وجبات أخف وترطيباً أكثر اليوم. استمعي لما يطلبه.",
    en: "Your body may appreciate lighter meals and more hydration today. Listen to what it asks for.",
  },
  balance: {
    ar: "قد يكون اليوم مناسباً لتجربة فترة صيام مريحة إن شعرتِ بذلك.",
    en: "Today might feel like a good time for a comfortable fasting window, if it feels right.",
  },
  clarity: {
    ar: "وجبات منتظمة ومغذية قد تساعد في الحفاظ على تركيزكِ وهدوئكِ اليوم.",
    en: "Regular nourishing meals may help maintain your focus and calm today.",
  },
  rest: {
    ar: "وجبات دافئة ومغذية قد تشعركِ بأكثر راحة وأمان اليوم.",
    en: "Warm and nourishing meals may feel most supportive and comforting today.",
  },
};

// ── Rhythm plan per phase ─────────────────────────────────────────────────────
export const RHYTHM_PLAN: Record<
  FastingPhaseKey,
  Array<{ icon: string; titleAr: string; titleEn: string; descAr: string; descEn: string }>
> = {
  power: [
    { icon: "🌅", titleAr: "أول وجبة", titleEn: "First Meal", descAr: "حوالي الساعة ١٢–١ ظهراً", descEn: "Around 12–1 PM" },
    { icon: "💧", titleAr: "ترطيب", titleEn: "Hydration", descAr: "١.٥–٢ لتر ماء يومياً", descEn: "1.5–2L of water daily" },
    { icon: "🚶‍♀️", titleAr: "حركة لطيفة", titleEn: "Gentle Movement", descAr: "مشي ١٥–٢٠ دقيقة", descEn: "15–20 min walk" },
    { icon: "🌙", titleAr: "آخر وجبة", titleEn: "Last Meal", descAr: "قبل الساعة ٧–٨ مساءً", descEn: "Before 7–8 PM" },
  ],
  balance: [
    { icon: "🌅", titleAr: "أول وجبة", titleEn: "First Meal", descAr: "حوالي الساعة ١٢–٢ ظهراً", descEn: "Around 12–2 PM" },
    { icon: "💧", titleAr: "ترطيب", titleEn: "Hydration", descAr: "٢–٢.٥ لتر ماء يومياً", descEn: "2–2.5L of water daily" },
    { icon: "✨", titleAr: "نشاط معتدل", titleEn: "Moderate Activity", descAr: "٣٠ دقيقة نشاط مريح", descEn: "30 min comfortable activity" },
    { icon: "🌙", titleAr: "آخر وجبة", titleEn: "Last Meal", descAr: "قبل الساعة ٦–٧ مساءً", descEn: "Before 6–7 PM" },
  ],
  clarity: [
    { icon: "🌅", titleAr: "أول وجبة", titleEn: "First Meal", descAr: "حوالي الساعة ١٢–١ ظهراً", descEn: "Around 12–1 PM" },
    { icon: "💧", titleAr: "ترطيب", titleEn: "Hydration", descAr: "١.٥–٢ لتر ماء يومياً", descEn: "1.5–2L of water daily" },
    { icon: "🧘‍♀️", titleAr: "تأمل أو يوغا", titleEn: "Meditation or Yoga", descAr: "١٠–١٥ دقيقة هدوء", descEn: "10–15 minutes of calm" },
    { icon: "🌙", titleAr: "آخر وجبة", titleEn: "Last Meal", descAr: "قبل الساعة ٧ مساءً", descEn: "Before 7 PM" },
  ],
  rest: [
    { icon: "🌅", titleAr: "أول وجبة", titleEn: "First Meal", descAr: "حوالي الساعة ١١ ص–١ ظ", descEn: "Around 11 AM–1 PM" },
    { icon: "🫖", titleAr: "ترطيب دافئ", titleEn: "Warm Hydration", descAr: "شاي أعشاب أو ماء دافئ", descEn: "Herbal tea or warm water" },
    { icon: "🌸", titleAr: "رعاية ذاتية", titleEn: "Self-care", descAr: "استمعي لجسمكِ اليوم", descEn: "Listen to your body today" },
    { icon: "🌙", titleAr: "آخر وجبة", titleEn: "Last Meal", descAr: "قبل الساعة ٧–٨ مساءً", descEn: "Before 7–8 PM" },
  ],
};

// ── Motivational messages (rotating) ─────────────────────────────────────────
export const MOTIVATIONAL_MESSAGES = [
  { ar: "جسمكِ لا يحتاج الكمال.", en: "Your body does not need perfection." },
  { ar: "الاتساق اللطيف أهم من القواعد الصارمة.", en: "Gentle consistency matters more." },
  { ar: "الإيقاعات الأبطأ قد تكون قوية أيضاً.", en: "Slower rhythms can still be powerful." },
  { ar: "الاستماع لنفسكِ هو تقدم حقيقي.", en: "Listening to yourself is progress." },
  { ar: "كل يوم فرصة لعناية لطيفة.", en: "Every day is a chance for gentle care." },
  { ar: "جسمكِ يعرف ما تحتاجه.", en: "Your body knows what it needs." },
  { ar: "التغذية الجيدة هي احترام للنفس.", en: "Good nourishment is self-respect." },
  { ar: "أنتِ في إيقاع مستمر، وهذا يكفي.", en: "You are in a continuous rhythm, and that is enough." },
];
