import type { RiskAlert, RiskSeverity, RiskType, UnifiedReadinessInput } from "./types";
import type { DailyCheckIn } from "@/src/storage/checkinStorage";

// ── Rule helpers ──────────────────────────────────────────────────────────────

function makeAlert(
  type: RiskType,
  severity: RiskSeverity,
  icon: string,
  color: string,
  titleEn: string, titleAr: string,
  bodyEn: string, bodyAr: string,
  actionEn: string, actionAr: string
): RiskAlert {
  return {
    id: `risk_${type}_${Date.now()}`,
    type, severity, icon, color,
    titleEn, titleAr, bodyEn, bodyAr, actionEn, actionAr,
    detectedAt: new Date().toISOString(),
  };
}

// ── Individual risk detectors ──────────────────────────────────────────────────

function detectOvertraining(input: UnifiedReadinessInput): RiskAlert | null {
  const overtrained = input.workoutDaysLast7 >= 5 &&
    ((input.hrv !== null && input.hrv < 32) ||
     (input.avgEnergyLast7 !== null && input.avgEnergyLast7 < 4.5));

  if (!overtrained) return null;

  return makeAlert(
    "overtraining", "warning", "⚠️", "#EF4444",
    "Overtraining Signal Detected", "إشارة إفراط في التدريب",
    `You've trained ${input.workoutDaysLast7} days this week with suppressed recovery markers. Your nervous system needs a break.`,
    `تدربتِ ${input.workoutDaysLast7} أيام هذا الأسبوع مع انخفاض علامات التعافي. جهازكِ العصبي يحتاج استراحة.`,
    "Take 1–2 full rest days, prioritise sleep and protein.",
    "خذي 1–2 أيام راحة كاملة، وأعطي الأولوية للنوم والبروتين.",
  );
}

function detectPoorRecovery(input: UnifiedReadinessInput): RiskAlert | null {
  const poorRecovery = input.consecutiveLowEnergyDays >= 3 &&
    input.hrv !== null && input.hrv < 35;

  if (!poorRecovery) return null;

  return makeAlert(
    "poor_recovery", "warning", "💔", "#F97316",
    "Under-Recovery Pattern", "نمط نقص التعافي",
    `${input.consecutiveLowEnergyDays} consecutive low-energy days combined with low HRV indicates your body hasn't fully recovered.`,
    `${input.consecutiveLowEnergyDays} أيام متتالية من الطاقة المنخفضة مع HRV منخفض يشير إلى أن جسمكِ لم يتعافَ بالكامل.`,
    "Reduce training intensity, add one extra hour of sleep, and increase anti-inflammatory foods.",
    "قللي كثافة التدريب، وأضيفي ساعة نوم إضافية، وزيدي الأطعمة المضادة للالتهاب.",
  );
}

function detectHighStress(input: UnifiedReadinessInput, checkIns: DailyCheckIn[]): RiskAlert | null {
  const stressSymptoms = ["mood_swings", "anxiety", "irritability", "brain_fog"];
  const hasStressSymptoms = input.symptoms.some((s) => stressSymptoms.includes(s));
  const lowAvgEnergy = input.avgEnergyLast7 !== null && input.avgEnergyLast7 < 4.0;
  const moodDrop = checkIns.slice(0, 4).filter((c) => c.mood === "sad" || c.mood === "anxious").length >= 2;

  if (!(lowAvgEnergy && (hasStressSymptoms || moodDrop))) return null;

  return makeAlert(
    "high_stress", "caution", "🧠", "#F59E0B",
    "Elevated Stress Detected", "مستوى إجهاد مرتفع",
    "Your energy and mood patterns suggest elevated cortisol levels. Chronic stress disrupts hormone balance and sleep quality.",
    "أنماط طاقتكِ ومزاجكِ تشير إلى ارتفاع مستويات الكورتيزول. الإجهاد المزمن يعطل توازن الهرمونات وجودة النوم.",
    "Try 10-min morning sunlight, limit caffeine after 1pm, and consider breathwork.",
    "جربي 10 دقائق من ضوء الشمس الصباحي، وحدّي الكافيين بعد 1م، وفكّري في تمارين التنفس.",
  );
}

function detectPoorSleepTrend(input: UnifiedReadinessInput): RiskAlert | null {
  const poorSleep =
    input.avgSleepLast7 !== null && input.avgSleepLast7 < 6.0 &&
    input.consecutivePoorSleepDays >= 4;

  if (!poorSleep) return null;

  const avg = input.avgSleepLast7!.toFixed(1);
  return makeAlert(
    "poor_sleep_trend", "caution", "😴", "#6366F1",
    "Chronic Sleep Deficit", "عجز نوم مزمن",
    `You've averaged ${avg}h of sleep for the past week. Sleep debt accumulates quickly and impairs hormone regulation.`,
    `بلغ متوسط نومكِ ${avg} ساعة خلال الأسبوع الماضي. دين النوم يتراكم بسرعة ويضعف تنظيم الهرمونات.`,
    "Set a firm lights-out time 30 min earlier each night this week.",
    "ضعي وقتاً محدداً لإطفاء الأضواء قبل 30 دقيقة كل ليلة هذا الأسبوع.",
  );
}

function detectLowEnergyTrend(input: UnifiedReadinessInput): RiskAlert | null {
  if (input.consecutiveLowEnergyDays < 5) return null;

  return makeAlert(
    "low_energy_trend", "caution", "⚡", "#A78BFA",
    "Persistent Low Energy", "طاقة منخفضة مستمرة",
    `Your energy has been consistently low for ${input.consecutiveLowEnergyDays} days. This goes beyond the normal cycle dip.`,
    `طاقتكِ كانت منخفضة باستمرار لمدة ${input.consecutiveLowEnergyDays} أيام. هذا يتجاوز الانخفاض الطبيعي للدورة.`,
    "Check iron, vitamin D, and B12 levels. Avoid fasting longer than 13h until energy recovers.",
    "تحققي من مستويات الحديد وفيتامين D وB12. تجنبي الصيام أكثر من 13 ساعة حتى تتعافى الطاقة.",
  );
}

function detectMissedPeriod(input: UnifiedReadinessInput, checkIns: DailyCheckIn[]): RiskAlert | null {
  const lateDays = input.cycleDay - (input.expectedCycleLength + 7);
  if (lateDays <= 0) return null;

  // Only flag if we haven't seen a period marked recently
  const recentPeriod = checkIns.slice(0, 14).some((c) => c.isPeriodDay);
  if (recentPeriod) return null;

  return makeAlert(
    "missed_period", "info", "📅", "#EC4899",
    "Late Cycle Detected", "دورة متأخرة",
    `Your cycle is ${lateDays} days late. Stress, under-eating, and intense training can all delay menstruation.`,
    `دورتكِ متأخرة ${lateDays} أيام. الإجهاد وانخفاض السعرات الحرارية والتدريب المكثف يمكن أن يؤخر الحيض.`,
    "If consistently late, consult your healthcare provider.",
    "إذا كان التأخر متكرراً، استشيري مقدم الرعاية الصحية.",
  );
}

function detectDehydration(input: UnifiedReadinessInput): RiskAlert | null {
  const dehydrationSymptoms = input.symptoms.some((s) =>
    ["headache", "dizziness", "brain_fog"].includes(s)
  );
  const activeDay = input.steps !== null && input.steps > 8000;
  const hotPhase = input.phaseKey === "secondPower"; // progesterone raises temp

  if (!(dehydrationSymptoms && (activeDay || hotPhase))) return null;

  return makeAlert(
    "possible_dehydration", "info", "💧", "#3B82F6",
    "Possible Dehydration", "جفاف محتمل",
    "Headache or dizziness combined with elevated activity or the luteal temperature rise may indicate dehydration.",
    "الصداع أو الدوار مع النشاط المرتفع أو ارتفاع حرارة الأصفرية قد يشير إلى الجفاف.",
    "Drink 500ml of water with a pinch of electrolytes now.",
    "اشربي 500 مل ماء مع رشة إلكتروليتات الآن.",
  );
}

function detectPMSRisk(input: UnifiedReadinessInput): RiskAlert | null {
  const isPremenstrual = input.phaseKey === "reset";
  const heavySymptoms = ["mood_swings", "bloating", "cramps", "fatigue", "irritability"];
  const symptomCount = input.symptoms.filter((s) => heavySymptoms.includes(s)).length;

  if (!isPremenstrual || symptomCount < 3) return null;

  return makeAlert(
    "pms_risk", "info", "🌙", "#C6A7FF",
    "PMS Pattern Identified", "نمط PMS محدد",
    "Multiple premenstrual symptoms detected. Your estrogen and progesterone are withdrawing — this is expected biology.",
    "تم الكشف عن أعراض ما قبل الحيض المتعددة. الإستروجين والبروجستيرون ينسحبان — هذا بيولوجيا متوقعة.",
    "Increase magnesium, reduce alcohol and caffeine, and allow more rest this week.",
    "زيدي المغنيسيوم، وقللي الكحول والكافيين، واسمحي بمزيد من الراحة هذا الأسبوع.",
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export function detectRisks(
  input: UnifiedReadinessInput,
  recentCheckIns: DailyCheckIn[]
): RiskAlert[] {
  const alerts: (RiskAlert | null)[] = [
    detectOvertraining(input),
    detectPoorRecovery(input),
    detectHighStress(input, recentCheckIns),
    detectPoorSleepTrend(input),
    detectLowEnergyTrend(input),
    detectMissedPeriod(input, recentCheckIns),
    detectDehydration(input),
    detectPMSRisk(input),
  ];

  const severityOrder: Record<RiskSeverity, number> = { warning: 0, caution: 1, info: 2 };

  return alerts
    .filter((a): a is RiskAlert => a !== null)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
