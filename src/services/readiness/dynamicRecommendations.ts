import type { DynamicRecommendation, DynamicRecCategory, ReadinessResult, UnifiedReadinessInput } from "./types";

// ── Rule system ───────────────────────────────────────────────────────────────

interface RecRule {
  id: string;
  category: DynamicRecCategory;
  priority: "high" | "medium" | "low";
  icon: string;
  accentColor: string;
  titleEn: string;
  titleAr: string;
  condition: (input: UnifiedReadinessInput, result: ReadinessResult) => boolean;
}

const RULES: RecRule[] = [
  // ── Workout ────────────────────────────────────────────────────────────────
  {
    id: "go_heavy",
    category: "workout", priority: "high", icon: "🏋️", accentColor: "#C6A7FF",
    titleEn: "Today is your best strength day — go heavy.",
    titleAr: "اليوم هو أفضل أيامكِ للقوة — ارفعي أثقالاً.",
    condition: (i, r) => r.level === "excellent" && (i.phaseKey === "manifestation" || i.phaseKey === "power"),
  },
  {
    id: "pr_window",
    category: "workout", priority: "high", icon: "🔥", accentColor: "#F59E0B",
    titleEn: "Peak hormone window — aim for a personal record.",
    titleAr: "نافذة الذروة الهرمونية — استهدفي رقماً قياسياً.",
    condition: (i, r) => r.score >= 85 && i.phaseKey === "manifestation",
  },
  {
    id: "train_upper",
    category: "workout", priority: "medium", icon: "💪", accentColor: "#C6A7FF",
    titleEn: "Focus on upper body today — lower body needs recovery.",
    titleAr: "ركّزي على الجزء العلوي اليوم — الجزء السفلي يحتاج تعافياً.",
    condition: (i, r) => r.level === "good" && i.lastWorkoutIntensity === "heavy",
  },
  {
    id: "deload",
    category: "workout", priority: "high", icon: "🌿", accentColor: "#22C55E",
    titleEn: "Deload today — your body has reached its weekly training limit.",
    titleAr: "خففي اليوم — جسمكِ وصل إلى حد التدريب الأسبوعي.",
    condition: (i) => i.workoutDaysLast7 >= 6,
  },
  {
    id: "active_recovery",
    category: "workout", priority: "high", icon: "🧘‍♀️", accentColor: "#8FD3FF",
    titleEn: "Active recovery only — walk or yoga, no resistance training.",
    titleAr: "تعافٍ نشط فقط — مشي أو يوغا، لا تدريب مقاومة.",
    condition: (_, r) => r.level === "recovery",
  },
  {
    id: "skip_hiit",
    category: "workout", priority: "high", icon: "⚠️", accentColor: "#EF4444",
    titleEn: "Avoid HIIT today — HRV is suppressed.",
    titleAr: "تجنبي HIIT اليوم — HRV منخفض.",
    condition: (i) => i.hrv !== null && i.hrv < 30,
  },
  {
    id: "moderate_session",
    category: "workout", priority: "medium", icon: "🚴", accentColor: "#3B82F6",
    titleEn: "Moderate session — train at 75–80% of normal intensity.",
    titleAr: "جلسة معتدلة — تدربي بنسبة 75–80٪ من الكثافة العادية.",
    condition: (_, r) => r.level === "moderate",
  },
  {
    id: "rest_day_benefit",
    category: "workout", priority: "low", icon: "😴", accentColor: "#6B7280",
    titleEn: "A rest day now will boost tomorrow's performance by ~15%.",
    titleAr: "يوم راحة الآن سيرفع أداء غد بنسبة ~15٪.",
    condition: (i) => i.workoutDaysLast7 >= 4 && i.lastWorkoutIntensity === "heavy",
  },

  // ── Nutrition ──────────────────────────────────────────────────────────────
  {
    id: "protein_boost",
    category: "nutrition", priority: "high", icon: "🥩", accentColor: "#22C55E",
    titleEn: "Increase protein by ~20g today — peak estrogen amplifies muscle synthesis.",
    titleAr: "زيدي البروتين بـ ~20غ اليوم — ذروة الإستروجين تضخم تخليق العضلات.",
    condition: (i) => i.phaseKey === "manifestation" || i.phaseKey === "power",
  },
  {
    id: "iron_priority",
    category: "nutrition", priority: "high", icon: "🍖", accentColor: "#EF4444",
    titleEn: "Prioritise iron-rich foods — red meat, lentils, spinach.",
    titleAr: "أعطي الأولوية للأطعمة الغنية بالحديد — لحم أحمر، عدس، سبانخ.",
    condition: (i) => i.phaseKey === "menstrual",
  },
  {
    id: "magnesium_pms",
    category: "nutrition", priority: "medium", icon: "🍫", accentColor: "#A78BFA",
    titleEn: "Add dark chocolate and almonds — magnesium supports GABA and reduces PMS.",
    titleAr: "أضيفي شوكولاتة داكنة ولوزاً — المغنيسيوم يدعم GABA ويقلل PMS.",
    condition: (i) => i.phaseKey === "reset" || i.symptoms.includes("mood_swings"),
  },
  {
    id: "carb_fuel",
    category: "nutrition", priority: "medium", icon: "🍌", accentColor: "#FBBF24",
    titleEn: "Eat complex carbs 2h before your workout for peak output.",
    titleAr: "تناولي كربوهيدرات معقدة قبل تمرينكِ بساعتين للأداء الأقصى.",
    condition: (_, r) => r.level === "excellent" || r.level === "good",
  },

  // ── Fasting ────────────────────────────────────────────────────────────────
  {
    id: "fasting_cap",
    category: "fasting", priority: "high", icon: "⏰", accentColor: "#F59E0B",
    titleEn: "Don't exceed a 14-hour fast today — HRV suggests metabolic stress.",
    titleAr: "لا تتجاوزي 14 ساعة صيام اليوم — HRV يشير لضغط أيضي.",
    condition: (i) => i.hrv !== null && i.hrv < 32 && (i.fastingHoursToday === null || i.fastingHoursToday > 12),
  },
  {
    id: "break_fast",
    category: "fasting", priority: "high", icon: "🍽️", accentColor: "#EF4444",
    titleEn: "Break your fast soon — extended fasting on low readiness causes muscle loss.",
    titleAr: "أفطري قريباً — الصيام الممتد مع الاستعداد المنخفض يسبب فقدان العضلات.",
    condition: (i, r) => r.level === "recovery" && i.fastingHoursToday !== null && i.fastingHoursToday > 16,
  },
  {
    id: "peak_fast",
    category: "fasting", priority: "low", icon: "⚡", accentColor: "#C6A7FF",
    titleEn: "Your 16–18h fasting window is perfectly timed — autophagy is active.",
    titleAr: "نافذة صيامكِ 16–18 ساعة موقوتة بشكل مثالي — الالتهام الذاتي نشط.",
    condition: (i, r) => r.level !== "recovery" && i.phaseKey === "manifestation" && (i.fastingHoursToday ?? 0) >= 16,
  },

  // ── Sleep ─────────────────────────────────────────────────────────────────
  {
    id: "sleep_debt",
    category: "sleep", priority: "high", icon: "🌙", accentColor: "#6366F1",
    titleEn: "Sleep before 10:00 PM tonight — you have a 3-day sleep debt.",
    titleAr: "نامي قبل 10 مساءً الليلة — لديكِ دين نوم لمدة 3 أيام.",
    condition: (i) => i.consecutivePoorSleepDays >= 3,
  },
  {
    id: "sleep_no_screens",
    category: "sleep", priority: "medium", icon: "📵", accentColor: "#8FD3FF",
    titleEn: "No screens after 9 PM — blue light delays your melatonin by 90 min.",
    titleAr: "لا شاشات بعد 9 مساءً — الضوء الأزرق يؤخر الميلاتونين بـ 90 دقيقة.",
    condition: (i) => i.sleepHours !== null && i.sleepHours < 6.5,
  },
  {
    id: "sleep_cool_room",
    category: "sleep", priority: "low", icon: "❄️", accentColor: "#3B82F6",
    titleEn: "Keep bedroom at 18–20°C — elevated progesterone disrupts sleep otherwise.",
    titleAr: "أبقي الغرفة عند 18–20°C — البروجستيرون المرتفع يعطل النوم خلافاً لذلك.",
    condition: (i) => i.phaseKey === "secondPower" || i.phaseKey === "reset",
  },

  // ── Hydration ─────────────────────────────────────────────────────────────
  {
    id: "hydration_extra",
    category: "hydration", priority: "high", icon: "💧", accentColor: "#3B82F6",
    titleEn: "Drink 500ml extra today — progesterone raises your core temperature.",
    titleAr: "اشربي 500 مل إضافية اليوم — البروجستيرون يرفع درجة حرارتكِ الأساسية.",
    condition: (i) => i.phaseKey === "secondPower",
  },
  {
    id: "electrolytes",
    category: "hydration", priority: "medium", icon: "🧂", accentColor: "#22C55E",
    titleEn: "Add electrolytes to water — you're losing more sodium this week.",
    titleAr: "أضيفي إلكتروليتات للماء — تفقدين صوديوماً أكثر هذا الأسبوع.",
    condition: (i) => i.phaseKey === "menstrual" || (i.steps !== null && i.steps > 10000),
  },

  // ── Recovery ──────────────────────────────────────────────────────────────
  {
    id: "walk_after_dinner",
    category: "recovery", priority: "medium", icon: "🚶‍♀️", accentColor: "#22C55E",
    titleEn: "Walk for 20 min after dinner — it lowers cortisol and aids digestion.",
    titleAr: "امشي 20 دقيقة بعد العشاء — يخفض الكورتيزول ويساعد الهضم.",
    condition: (_, r) => r.level === "good" || r.level === "moderate",
  },
  {
    id: "breathwork",
    category: "mind", priority: "medium", icon: "🌬️", accentColor: "#A78BFA",
    titleEn: "5 min of box breathing before bed — it activates parasympathetic recovery.",
    titleAr: "5 دقائق من التنفس المربّع قبل النوم — ينشّط التعافي السمبثاوي.",
    condition: (i, r) => r.level !== "excellent" || i.hrv !== null && i.hrv < 40,
  },

  // ── Mind ──────────────────────────────────────────────────────────────────
  {
    id: "peak_cognitive",
    category: "mind", priority: "high", icon: "🧠", accentColor: "#FBBF24",
    titleEn: "Schedule your most demanding cognitive tasks today — you're at mental peak.",
    titleAr: "جدولي أصعب مهامكِ الإدراكية اليوم — أنتِ في الذروة الذهنية.",
    condition: (i) => i.phaseKey === "manifestation",
  },
  {
    id: "journaling",
    category: "mind", priority: "low", icon: "📝", accentColor: "#6B7280",
    titleEn: "Journaling helps process emotions during low-hormone phases.",
    titleAr: "التدوين يساعد على معالجة المشاعر خلال مراحل الهرمونات المنخفضة.",
    condition: (i) => i.phaseKey === "menstrual" || i.phaseKey === "reset",
  },
];

// ── Public API ────────────────────────────────────────────────────────────────

export function generateDynamicRecommendations(
  input: UnifiedReadinessInput,
  result: ReadinessResult
): DynamicRecommendation[] {
  const matched = RULES
    .filter((rule) => rule.condition(input, result))
    .map<DynamicRecommendation>(({ id, category, priority, icon, accentColor, titleEn, titleAr }) => ({
      id, category, priority, icon, accentColor, titleEn, titleAr,
    }));

  // Deduplicate by category (keep highest priority per category)
  const byCategory = new Map<string, DynamicRecommendation>();
  for (const rec of matched) {
    const existing = byCategory.get(rec.category);
    if (!existing) { byCategory.set(rec.category, rec); continue; }
    const order = { high: 0, medium: 1, low: 2 };
    if (order[rec.priority] < order[existing.priority]) byCategory.set(rec.category, rec);
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return Array.from(byCategory.values())
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 6);
}
