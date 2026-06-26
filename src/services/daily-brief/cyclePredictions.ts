import type { CyclePrediction, CycleEventType } from "./types";

// Phase accent colors (matches hormone-coach)
const COLORS: Record<string, string> = {
  menstrual:     "#FF6FAE",
  power:         "#5BBB85",
  manifestation: "#F59E0B",
  secondPower:   "#C6A7FF",
  reset:         "#8FD3FF",
};

function addDays(baseDate: Date, n: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// Map cycleDay → phase base confidence (biology certainty)
function phaseConfidence(cycleDay: number, cycleLength: number): number {
  const variation = Math.max(1, Math.abs(cycleLength - 28));
  return Math.max(55, 95 - variation * 3);
}

export function generateCyclePredictions(
  cycleDay: number,
  cycleLength: number,
  today: Date = new Date()
): CyclePrediction[] {
  const predictions: CyclePrediction[] = [];
  const baseConf = phaseConfidence(cycleDay, cycleLength);

  const push = (
    daysFromNow: number,
    eventType: CycleEventType,
    labelEn: string, labelAr: string,
    descriptionEn: string, descriptionAr: string,
    confidence: number,
    accentColor: string,
    icon: string,
  ) => {
    if (daysFromNow < 0 || daysFromNow > 14) return;
    predictions.push({
      daysFromNow,
      date: addDays(today, daysFromNow),
      eventType,
      labelEn,
      labelAr,
      descriptionEn,
      descriptionAr,
      confidence: Math.min(95, Math.max(40, confidence)),
      accentColor,
      icon,
    });
  };

  const daysUntil = (targetDay: number): number => {
    let delta = targetDay - cycleDay;
    if (delta <= 0) delta += cycleLength;
    return delta;
  };

  // Energy peak: manifestation phase start (day 11)
  const d_energyPeak = daysUntil(11);
  push(d_energyPeak, "energy_peak",
    "Energy Peak", "ذروة الطاقة",
    "Estrogen surges — your sharpest, most energetic window.",
    "ارتفاع الإستروجين — أكثر نوافذك حدة وطاقةً.",
    baseConf, COLORS.manifestation, "⚡",
  );

  // Ovulation: around day 14
  const d_ovulation = daysUntil(14);
  push(d_ovulation, "ovulation",
    "Ovulation Window", "نافذة الإباضة",
    "LH surge — peak confidence, libido, and social energy.",
    "ارتفاع LH — ذروة الثقة وطاقة التواصل.",
    baseConf - 5, COLORS.manifestation, "🌟",
  );

  // Peak libido: around ovulation
  const d_libido = daysUntil(13);
  push(d_libido, "peak_libido",
    "Peak Libido", "ذروة الدافع الجنسي",
    "Testosterone & estrogen at maximum — attraction energy at its highest.",
    "التستوستيرون والإستروجين في الذروة.",
    baseConf - 8, COLORS.manifestation, "💫",
  );

  // Peak creativity: manifestation + secondPower (days 12-20)
  const d_creativity = daysUntil(12);
  push(d_creativity, "peak_creativity",
    "Peak Creativity", "ذروة الإبداع",
    "Right-brain fluency rises — ideas flow effortlessly.",
    "تزداد طلاقة النصف الأيمن — تتدفق الأفكار بسهولة.",
    baseConf - 5, COLORS.secondPower, "🎨",
  );

  // High confidence: secondPower zone (day 16)
  const d_confidence = daysUntil(16);
  push(d_confidence, "high_confidence",
    "High Confidence Window", "نافذة الثقة العالية",
    "Progesterone + estrogen balance creates deep self-assurance.",
    "توازن البروجسترون والإستروجين يخلق ثقة عميقة بالذات.",
    baseConf - 5, COLORS.secondPower, "💎",
  );

  // Craving window: reset phase (day 21)
  const d_craving = daysUntil(21);
  push(d_craving, "craving_window",
    "Craving Window", "نافذة الشهوة",
    "Progesterone drop triggers sugar & carb cravings. Plan warm nourishing meals.",
    "انخفاض البروجسترون يثير الشوق للسكر والكربوهيدرات. جهّزي وجبات دافئة.",
    baseConf - 10, COLORS.reset, "🍫",
  );

  // PMS onset: reset phase (day 22)
  const d_pms = daysUntil(22);
  push(d_pms, "pms_onset",
    "PMS Window", "نافذة PMS",
    "Hormone withdrawal begins — prioritise sleep, magnesium, and gentleness.",
    "يبدأ انسحاب الهرمونات — أولوية للنوم والمغنيسيوم واللطف مع النفس.",
    baseConf - 12, COLORS.reset, "🌊",
  );

  // Energy dip: menstrual start (day 1)
  const d_dip = daysUntil(cycleLength); // day 1 of next cycle
  push(d_dip, "energy_dip",
    "Energy Dip", "انخفاض الطاقة",
    "Menstruation begins — honour rest and reduce intensity.",
    "تبدأ الدورة — كرّمي الراحة وقللي الشدة.",
    baseConf - 10, COLORS.menstrual, "🔴",
  );

  // Recovery day (day 2-3 of next period)
  const d_recovery = daysUntil(cycleLength) + 2;
  push(d_recovery, "recovery_day",
    "Deep Recovery Day", "يوم التعافي العميق",
    "Iron and energy are lowest — light nourishment and full rest.",
    "الحديد والطاقة في أدناها — تغذية خفيفة وراحة كاملة.",
    baseConf - 15, COLORS.menstrual, "🛌",
  );

  // Period start (day cycleLength+1 = next day 1)
  const d_period = daysUntil(cycleLength);
  push(d_period, "period_start",
    "New Cycle Begins", "تبدأ دورة جديدة",
    "Your menstrual phase begins. Honour your body's reset.",
    "تبدأ مرحلة الحيض. كرّمي تجديد جسمك.",
    baseConf - 8, COLORS.menstrual, "🩸",
  );

  // Sort by daysFromNow and deduplicate by date
  const seen = new Set<string>();
  return predictions
    .sort((a, b) => a.daysFromNow - b.daysFromNow)
    .filter(p => {
      const key = `${p.date}_${p.eventType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 7); // max 7 predictions shown
}
