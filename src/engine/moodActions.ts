

export type MoodAction = {
  key: string;

  title: string;

  subtitle: string;

  cta: string;

  route: string;

  emoji: string;

  glow: string;

  suggestions: string[];
};

export function getMoodAction(
  mood: string,
  language: "ar" | "en" = "ar",
  cycleDay = 1
): MoodAction {
  // 🌙 Calm
  if (mood === "calm") {
    return language === "ar"
      ? {
          key: "calm",
          title: "مساحة للهدوء",
          subtitle:
            "قد يكون جسدك الآن بحاجة إلى تقليل الضوضاء واستعادة التوازن بلطف.",
          cta: "ابدئي جلسة تنفس",
          route: "/breathing",
          emoji: "🌙",
          glow: "#C7A6FF",
          suggestions: [
            "تنفس ببطء لمدة دقيقة",
            "خففي الإضاءة حولك",
            "جربي المشي الهادئ",
          ],
        }
      : {
          key: "calm",
          title: "Space For Calm",
          subtitle:
            "Your body may benefit from slower moments and softer recovery.",
          cta: "Start Breathing",
          route: "/breathing",
          emoji: "🌙",
          glow: "#C7A6FF",
          suggestions: [
            "Take one slower breath",
            "Dim your lights",
            "Try a softer walk",
          ],
        };
  }

  // ⚡ Energy
  if (mood === "focus") {
    return language === "ar"
      ? {
          key: "focus",
          title: "طاقة وحركة",
          subtitle:
            "قد تكون هذه اللحظة مناسبة للحركة التدريجية والتركيز والإنجاز.",
          cta: "ابدئي الحركة",
          route: "/movement",
          emoji: "⚡",
          glow: "#F6C453",
          suggestions: [
            "تمرين خفيف 20 دقيقة",
            "ابدئي أهم مهمة أولًا",
            "اشربي الماء قبل الحركة",
          ],
        }
      : {
          key: "focus",
          title: "Energy & Motion",
          subtitle:
            "This may be a beautiful moment for movement and momentum.",
          cta: "Start Moving",
          route: "/movement",
          emoji: "⚡",
          glow: "#F6C453",
          suggestions: [
            "20 minute movement",
            "Start with your biggest task",
            "Hydrate before movement",
          ],
        };
  }

  // 🌸 Support
  if (mood === "soft") {
    const explanation =
      cycleDay <= 10
        ? language === "ar"
          ? "قد ترتفع الطاقة تدريجيًا في هذه المرحلة مع حاجة للتوازن أيضًا."
          : "Your energy may slowly rise during this phase while still needing balance."

        : cycleDay <= 19
        ? language === "ar"
          ? "قد تصبح المشاعر أوضح الآن ويحتاج جسمك للهدوء أكثر من الضغط."
          : "Your emotions may feel more vivid now, and your body may benefit from gentleness."

        : language === "ar"
        ? "هذه المرحلة أبطأ بطبيعتها وقد تدعم الراحة والاحتواء أكثر."
        : "This slower phase may support deeper recovery and softness.";

    return language === "ar"
      ? {
          key: "soft",
          title: "احتواء وفهم",
          subtitle: explanation,
          cta: "فهم مرحلتي",
          route: "/journal",
          emoji: "🌸",
          glow: "#FFB7D5",
          suggestions: [
            "خففي الضغط على نفسك",
            "جربي الكتابة السريعة",
            "استمعي لجسدك بدون مقاومة",
          ],
        }
      : {
          key: "soft",
          title: "Support & Reflection",
          subtitle: explanation,
          cta: "Understand My Phase",
          route: "/journal",
          emoji: "🌸",
          glow: "#FFB7D5",
          suggestions: [
            "Reduce inner pressure",
            "Try short journaling",
            "Listen to your body softly",
          ],
        };
  }

  // 🥗 Nutrition
  const foodSuggestions =
    cycleDay <= 10
      ? language === "ar"
        ? [
            "بروتين خفيف",
            "خضار منعشة",
            "ترطيب أعلى",
          ]
        : [
            "Lean protein",
            "Fresh vegetables",
            "More hydration",
          ]

      : cycleDay <= 19
      ? language === "ar"
        ? [
            "مغنيسيوم",
            "وجبات متوازنة",
            "تقليل السكر العالي",
          ]
        : [
            "Magnesium-rich foods",
            "Balanced meals",
            "Reduce high sugar spikes",
          ]

      : language === "ar"
      ? [
          "شوربات دافئة",
          "حديد أكثر",
          "وجبات ألطف للهضم",
        ]
      : [
          "Warm soups",
          "More iron-rich foods",
          "Gentler digestion meals",
        ];

  return language === "ar"
    ? {
        key: "slow",
        title: "احتياج جسمك الغذائي",
        subtitle:
          "قد تتغير احتياجاتك الغذائية حسب المرحلة الحالية من إيقاعك.",
        cta: "اقتراحات غذائية",
        route: "/nutrition",
        emoji: "🥗",
        glow: "#7EE7B8",
        suggestions: foodSuggestions,
      }
    : {
        key: "slow",
        title: "Nutrition Support",
        subtitle:
          "Your nutritional needs may shift throughout your rhythm.",
        cta: "Nutrition Suggestions",
        route: "/nutrition",
        emoji: "🥗",
        glow: "#7EE7B8",
        suggestions: foodSuggestions,
      };
}