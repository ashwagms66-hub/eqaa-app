import type {
  CoachInput,
  CyclePhaseKey,
  DailyScores,
  HormoneFact,
  HormoneStatus,
} from "./types";

// ── Phase-based base scores ───────────────────────────────────────────────────

const PHASE_ENERGY: Record<CyclePhaseKey, number> = {
  menstrual:    32,
  power:        68,
  manifestation:92,
  secondPower:  76,
  reset:        44,
};

const PHASE_RECOVERY: Record<CyclePhaseKey, number> = {
  menstrual:    50,
  power:        78,
  manifestation:88,
  secondPower:  72,
  reset:        58,
};

const PHASE_MOOD: Record<CyclePhaseKey, number> = {
  menstrual:    40,
  power:        72,
  manifestation:90,
  secondPower:  68,
  reset:        38,
};

// Stress: 100 = perfectly calm, 0 = very stressed
const PHASE_STRESS: Record<CyclePhaseKey, number> = {
  menstrual:    48,
  power:        74,
  manifestation:82,
  secondPower:  64,
  reset:        42,
};

const PHASE_FOCUS: Record<CyclePhaseKey, number> = {
  menstrual:    52,
  power:        76,
  manifestation:88,
  secondPower:  72,
  reset:        50,
};

// Hunger: 100 = significant hunger expected
const PHASE_HUNGER: Record<CyclePhaseKey, number> = {
  menstrual:    62,
  power:        50,
  manifestation:44,
  secondPower:  60,
  reset:        78,
};

const PHASE_SLEEP_NEED: Record<CyclePhaseKey, number> = {
  menstrual:    8.5,
  power:        7.5,
  manifestation:7.0,
  secondPower:  7.5,
  reset:        8.5,
};

// ── Hormone status per phase ───────────────────────────────────────────────────

function buildHormoneStatus(phaseKey: CyclePhaseKey): HormoneStatus {
  const facts: HormoneFact[] = [];

  switch (phaseKey) {
    case "menstrual":
      facts.push(
        {
          hormoneEn: "Estrogen", hormoneAr: "الإستروجين",
          trendEn: "Low",       trendAr: "منخفض",
          effectEn: "Reduced motivation and energy — rest is physiologically optimal.",
          effectAr: "الدافعية والطاقة منخفضتان — الراحة هي الأمثل فيزيولوجياً.",
          icon: "📉", color: "#EF4444",
        },
        {
          hormoneEn: "Prostaglandins", hormoneAr: "البروستاغلاندينات",
          trendEn: "Elevated",         trendAr: "مرتفعة",
          effectEn: "Cause uterine contractions — may increase cramps and sensitivity to pain.",
          effectAr: "تسبب تقلصات الرحم وقد تزيد التشنجات والحساسية للألم.",
          icon: "⚡", color: "#FB923C",
        }
      );
      return {
        dominantEn: "Prostaglandins", dominantAr: "البروستاغلاندينات",
        level: "peak", levelLabelEn: "High", levelLabelAr: "مرتفعة",
        descriptionEn: "Estrogen and progesterone are at their lowest. Prostaglandins are driving menstruation. This is a restoration phase — your body is doing important work.",
        descriptionAr: "الإستروجين والبروجستيرون في أدنى مستوياتهما. البروستاغلاندينات تقود الحيض. هذه مرحلة ترميم — جسمكِ يقوم بعمل مهم.",
        color: "#EF4444", facts,
      };

    case "power":
      facts.push(
        {
          hormoneEn: "Estrogen", hormoneAr: "الإستروجين",
          trendEn: "Rising",     trendAr: "آخذ في الارتفاع",
          effectEn: "Improving mood, motivation, and pain tolerance — perfect for progressive training.",
          effectAr: "يحسن المزاج والدافعية وتحمل الألم — مثالي للتدريب التدريجي.",
          icon: "📈", color: "#22C55E",
        },
        {
          hormoneEn: "FSH", hormoneAr: "الهرمون المنبه للحوصلة",
          trendEn: "Active",    trendAr: "نشط",
          effectEn: "Stimulating follicle growth — building toward your peak week.",
          effectAr: "ينشط نمو الحوصلة — يبني نحو أسبوع الذروة.",
          icon: "🌱", color: "#3B82F6",
        }
      );
      return {
        dominantEn: "Estrogen (rising)", dominantAr: "الإستروجين (آخذ في الارتفاع)",
        level: "rising", levelLabelEn: "Rising", levelLabelAr: "آخذ في الارتفاع",
        descriptionEn: "Estrogen is climbing steadily. This hormone promotes serotonin production, improves insulin sensitivity, and enhances muscle protein synthesis — a great window for strength work.",
        descriptionAr: "الإستروجين يرتفع بثبات. يعزز إنتاج السيروتونين، ويحسن حساسية الأنسولين، ويعزز تخليق بروتين العضلات — نافذة رائعة لتدريب القوة.",
        color: "#22C55E", facts,
      };

    case "manifestation":
      facts.push(
        {
          hormoneEn: "Estrogen", hormoneAr: "الإستروجين",
          trendEn: "Peak",       trendAr: "في الذروة",
          effectEn: "Maximum strength, coordination, and mental clarity — you are at biological peak performance.",
          effectAr: "أقصى قوة وتنسيق ووضوح ذهني — أنتِ في أعلى أداء بيولوجي.",
          icon: "✨", color: "#FBBF24",
        },
        {
          hormoneEn: "LH Surge", hormoneAr: "ارتفاع LH",
          trendEn: "Surge",      trendAr: "ارتفاع حاد",
          effectEn: "Triggers ovulation. You may feel a natural confidence and social drive peak.",
          effectAr: "يطلق التبويض. قد تشعرين بذروة طبيعية في الثقة والنشاط الاجتماعي.",
          icon: "⚡", color: "#F59E0B",
        }
      );
      return {
        dominantEn: "Estrogen (peak) + LH", dominantAr: "الإستروجين (ذروة) + LH",
        level: "peak", levelLabelEn: "Peak", levelLabelAr: "في الذروة",
        descriptionEn: "You are in your biological prime this week. Estrogen is at its absolute peak, driving strength, metabolism, mood, and focus. LH surge is triggering ovulation. This is the best time for demanding workouts, PRs, and hard decisions.",
        descriptionAr: "أنتِ في ذروتكِ البيولوجية هذا الأسبوع. الإستروجين في أعلى مستوياته، يدفع القوة والأيض والمزاج والتركيز. LH يطلق التبويض. هذا هو أفضل وقت للتدريبات المكثفة والأرقام القياسية والقرارات الصعبة.",
        color: "#FBBF24", facts,
      };

    case "secondPower":
      facts.push(
        {
          hormoneEn: "Progesterone", hormoneAr: "البروجستيرون",
          trendEn: "Rising",         trendAr: "آخذ في الارتفاع",
          effectEn: "Elevates core body temperature by ~0.5°C — hydration becomes critical for performance.",
          effectAr: "يرفع درجة حرارة الجسم الأساسية بـ ~0.5°C — الترطيب يصبح حاسماً للأداء.",
          icon: "🌡️", color: "#F59E0B",
        },
        {
          hormoneEn: "Estrogen", hormoneAr: "الإستروجين",
          trendEn: "Secondary peak then falling", trendAr: "ذروة ثانوية ثم هبوط",
          effectEn: "Still supports mood and focus — enjoy this clarity before the late luteal dip.",
          effectAr: "لا يزال يدعم المزاج والتركيز — استمتعي بهذا الوضوح قبل انخفاض المرحلة المتأخرة.",
          icon: "📊", color: "#C6A7FF",
        }
      );
      return {
        dominantEn: "Progesterone (rising)", dominantAr: "البروجستيرون (آخذ في الارتفاع)",
        level: "rising", levelLabelEn: "Rising", levelLabelAr: "آخذ في الارتفاع",
        descriptionEn: "Progesterone is taking over. Your body temperature is slightly elevated — drink more water. You may prefer moderate training over HIIT. Mental focus is still strong; use it for detail-oriented work.",
        descriptionAr: "البروجستيرون يسيطر. درجة حرارة جسمكِ مرتفعة قليلاً — اشربي المزيد من الماء. قد تفضلين التدريب المعتدل على HIIT. التركيز الذهني لا يزال قوياً؛ استخدميه للعمل الدقيق.",
        color: "#C6A7FF", facts,
      };

    case "reset":
    default:
      facts.push(
        {
          hormoneEn: "Progesterone", hormoneAr: "البروجستيرون",
          trendEn: "Falling",        trendAr: "آخذ في الانخفاض",
          effectEn: "Declining progesterone can cause PMS symptoms, disrupted sleep, and increased appetite.",
          effectAr: "انخفاض البروجستيرون قد يسبب أعراض PMS واضطراب النوم وزيادة الشهية.",
          icon: "📉", color: "#EF4444",
        },
        {
          hormoneEn: "Estrogen", hormoneAr: "الإستروجين",
          trendEn: "Low + falling",  trendAr: "منخفض وآخذ في الانخفاض",
          effectEn: "Lower serotonin availability — mood may feel more sensitive or introspective.",
          effectAr: "توافر السيروتونين منخفض — قد يشعر المزاج بمزيد من الحساسية أو التأمل الداخلي.",
          icon: "🌑", color: "#6B7280",
        }
      );
      return {
        dominantEn: "Progesterone (falling)", dominantAr: "البروجستيرون (آخذ في الانخفاض)",
        level: "falling", levelLabelEn: "Falling", levelLabelAr: "آخذ في الانخفاض",
        descriptionEn: "Both estrogen and progesterone are declining toward baseline. This biological withdrawal can affect mood, sleep quality, and hunger. Support your body with gentle movement, high-protein food, and extra sleep.",
        descriptionAr: "كل من الإستروجين والبروجستيرون ينخفضان نحو الخط الأساسي. هذا الانسحاب البيولوجي يمكن أن يؤثر على المزاج وجودة النوم والجوع. ادعمي جسمكِ بحركة لطيفة وطعام عالي البروتين ونوم إضافي.",
        color: "#6B7280", facts,
      };
  }
}

// ── Adjustments from biometric data ───────────────────────────────────────────

function applyBiometricAdjustments(
  base: number,
  metric: "energy" | "recovery" | "mood" | "stress" | "focus",
  input: CoachInput
): number {
  let adj = 0;

  // Sleep hours
  if (input.sleepHours !== null) {
    if (input.sleepHours >= 8) adj += metric === "energy" ? 6 : 4;
    else if (input.sleepHours >= 6) adj += 0;
    else if (input.sleepHours >= 4) adj -= 8;
    else adj -= 15;
  }

  // HRV (higher = better recovery, affects energy and recovery)
  if (input.hrv !== null && (metric === "energy" || metric === "recovery")) {
    if (input.hrv >= 60) adj += 6;
    else if (input.hrv >= 40) adj += 2;
    else if (input.hrv < 25) adj -= 8;
  }

  // Resting heart rate (lower = better)
  if (input.restingHeartRate !== null && metric === "recovery") {
    if (input.restingHeartRate <= 55) adj += 6;
    else if (input.restingHeartRate >= 80) adj -= 8;
  }

  // User self-reported energy
  if (input.userEnergyRating !== null && (metric === "energy" || metric === "mood")) {
    const norm = ((input.userEnergyRating - 5) / 5) * 10;
    adj += Math.round(norm);
  }

  // Days since last workout (recovery improves but energy dips if too long)
  if (input.daysSinceLastWorkout !== null && metric === "energy") {
    if (input.daysSinceLastWorkout === 1) adj += 4;  // well-rested
    else if (input.daysSinceLastWorkout >= 4) adj -= 6; // deconditioning dip
  }

  // Symptoms
  const heavySymptoms = ["cramps", "heavy_bleeding", "fatigue", "nausea", "headache"];
  const symptomPenalty = input.symptoms.filter((s) => heavySymptoms.includes(s)).length;
  if (symptomPenalty > 0 && ["energy", "mood", "focus"].includes(metric)) {
    adj -= symptomPenalty * 6;
  }

  return Math.max(0, Math.min(100, base + adj));
}

// ── Main compute function ──────────────────────────────────────────────────────

export function computeDailyScores(input: CoachInput): DailyScores {
  const { phaseKey, cycleDay } = input;

  const energyBase    = PHASE_ENERGY[phaseKey];
  const recoveryBase  = PHASE_RECOVERY[phaseKey];
  const moodBase      = PHASE_MOOD[phaseKey];
  const stressBase    = PHASE_STRESS[phaseKey];
  const focusBase     = PHASE_FOCUS[phaseKey];
  const hungerBase    = PHASE_HUNGER[phaseKey];

  const energy   = applyBiometricAdjustments(energyBase,   "energy",   input);
  const recovery = applyBiometricAdjustments(recoveryBase, "recovery", input);
  const mood     = applyBiometricAdjustments(moodBase,     "mood",     input);
  const stress   = applyBiometricAdjustments(stressBase,   "stress",   input);
  const focus    = applyBiometricAdjustments(focusBase,    "focus",    input);
  const hunger   = Math.min(100, Math.max(0, hungerBase + (input.lastFastHours && input.lastFastHours < 8 ? 10 : 0)));
  const sleepNeed = PHASE_SLEEP_NEED[phaseKey];

  const overall = Math.round((energy + recovery + mood + stress + focus) / 5);
  const hormoneStatus = buildHormoneStatus(phaseKey);

  return {
    cycleDay,
    phaseKey,
    overallScore: overall,
    energyScore: energy,
    recoveryScore: recovery,
    moodScore: mood,
    stressScore: stress,
    focusScore: focus,
    hungerScore: hunger,
    sleepNeedHours: sleepNeed,
    hormoneStatus,
    generatedAt: new Date().toISOString(),
  };
}

export function phaseAccentColor(phaseKey: CyclePhaseKey): string {
  const colors: Record<CyclePhaseKey, string> = {
    menstrual:    "#FF6FAE",
    power:        "#5BBB85",
    manifestation:"#F59E0B",
    secondPower:  "#C6A7FF",
    reset:        "#8FD3FF",
  };
  return colors[phaseKey];
}
