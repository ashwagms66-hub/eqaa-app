import type { ExplanationFactor, ReadinessExplanation, ReadinessLevel, UnifiedReadinessInput } from "./types";
import { computeSignalDeltas } from "./readinessEngine";

// ── Factor builders ───────────────────────────────────────────────────────────

type Magnitude = "strong" | "moderate" | "mild";

function mag(delta: number): Magnitude {
  const abs = Math.abs(delta);
  if (abs >= 10) return "strong";
  if (abs >= 5)  return "moderate";
  return "mild";
}

// Map each signal to human-readable factor copy
function buildFactor(
  delta: number,
  posEn: string, posAr: string,
  negEn: string, negAr: string,
  icon: string
): ExplanationFactor | null {
  if (Math.abs(delta) < 2) return null;
  return {
    labelEn: delta > 0 ? posEn : negEn,
    labelAr: delta > 0 ? posAr : negAr,
    impact:  delta > 0 ? "positive" : "negative",
    magnitude: mag(delta),
    icon,
    delta,
  };
}

// ── Phase factor copy ─────────────────────────────────────────────────────────

const PHASE_FACTOR: Record<string, { posEn: string; posAr: string; negEn: string; negAr: string }> = {
  menstrual:    { posEn: "Menstrual phase", posAr: "مرحلة الحيض", negEn: "Menstrual phase", negAr: "مرحلة الحيض" },
  power:        { posEn: "Follicular energy surge", posAr: "زيادة طاقة الجريبية", negEn: "Follicular phase", negAr: "المرحلة الجريبية" },
  manifestation:{ posEn: "Ovulation peak power", posAr: "ذروة قوة التبويض", negEn: "Ovulation phase", negAr: "مرحلة التبويض" },
  secondPower:  { posEn: "Early luteal strength", posAr: "قوة الأصفرية المبكرة", negEn: "Luteal phase", negAr: "المرحلة الأصفرية" },
  reset:        { posEn: "Late luteal phase", posAr: "الأصفرية المتأخرة", negEn: "Hormones withdrawing", negAr: "انسحاب الهرمونات" },
};

// ── Headline generation ───────────────────────────────────────────────────────

function buildHeadline(
  score: number,
  level: ReadinessLevel,
  topPositive: ExplanationFactor | undefined,
  topNegative: ExplanationFactor | undefined
): { en: string; ar: string } {
  if (level === "excellent") {
    const reason = topPositive?.labelEn ?? "all systems are aligned";
    const reasonAr = topPositive?.labelAr ?? "كل الأنظمة متوافقة";
    return {
      en: `Today your readiness is ${score} — ${reason} is powering your peak.`,
      ar: `استعدادكِ اليوم ${score} — ${reasonAr} يدفع ذروة أدائكِ.`,
    };
  }
  if (level === "good") {
    const limiter = topNegative?.labelEn ?? "minor factors";
    const limiterAr = topNegative?.labelAr ?? "عوامل طفيفة";
    return {
      en: `Readiness ${score} — strong foundation with ${limiter} as the main limiter.`,
      ar: `الاستعداد ${score} — أساس قوي مع ${limiterAr} كعامل تحديد رئيسي.`,
    };
  }
  if (level === "moderate") {
    const cause = topNegative?.labelEn ?? "recovery deficit";
    const causeAr = topNegative?.labelAr ?? "عجز في التعافي";
    return {
      en: `Readiness ${score} — ${cause} is holding performance back today.`,
      ar: `الاستعداد ${score} — ${causeAr} يحد الأداء اليوم.`,
    };
  }
  const primary = topNegative?.labelEn ?? "multiple signals";
  const primaryAr = topNegative?.labelAr ?? "إشارات متعددة";
  return {
    en: `Readiness ${score} — ${primary} requires rest and recovery today.`,
    ar: `الاستعداد ${score} — ${primaryAr} يستوجب الراحة والتعافي اليوم.`,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateExplanation(
  input: UnifiedReadinessInput,
  score: number,
  level: ReadinessLevel
): ReadinessExplanation {
  const d = computeSignalDeltas(input);
  const pf = PHASE_FACTOR[input.phaseKey] ?? PHASE_FACTOR.power;

  const candidates: (ExplanationFactor | null)[] = [
    // Phase is always shown
    buildFactor(d.phase - 65, pf.posEn, pf.posAr, pf.negEn, pf.negAr, "🌙"),
    buildFactor(d.sleep, "Excellent sleep", "نوم ممتاز", "Sleep deficit", "عجز نوم", "😴"),
    buildFactor(d.hrv, "Strong HRV — nervous system recovered", "HRV قوي — الجهاز العصبي متعافٍ",
      "Low HRV — nervous system under stress", "HRV منخفض — الجهاز العصبي تحت ضغط", "💓"),
    buildFactor(d.rhr, "Resting heart rate optimal", "معدل ضربات القلب في الراحة مثالي",
      "Elevated resting heart rate", "معدل ضربات القلب في الراحة مرتفع", "❤️"),
    buildFactor(d.workoutLoad,
      d.workoutLoad > 0 ? "Consistent training pattern" : "Training frequency optimal",
      d.workoutLoad > 0 ? "نمط تدريبي منتظم" : "تكرار التدريب مثالي",
      d.workoutLoad < -8 ? "Heavy training residual fatigue" : "Insufficient recent training",
      d.workoutLoad < -8 ? "إرهاق متبقٍّ من تدريب شاق" : "تدريب حديث غير كافٍ",
      "🏋️"),
    buildFactor(d.fasting, "Fasting window managed well", "نافذة الصيام مُدارة جيداً",
      "Extended fast creating metabolic stress", "الصيام الممتد يُنشئ ضغطاً أيضياً", "⏰"),
    buildFactor(d.userEnergy, "High self-reported energy", "طاقة ذاتية مرتفعة",
      "Low self-reported energy", "طاقة ذاتية منخفضة", "⚡"),
    buildFactor(d.symptoms, "", "", "Active symptoms detected", "أعراض نشطة", "🩸"),
    buildFactor(d.trends, "Positive recovery trend", "اتجاه تعافٍ إيجابي",
      "Accumulated fatigue trend", "اتجاه إرهاق متراكم", "📈"),
  ];

  const factors = candidates
    .filter((f): f is ExplanationFactor => f !== null)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6);

  const topPositive = factors.find((f) => f.impact === "positive");
  const topNegative = factors.find((f) => f.impact === "negative");
  const headline = buildHeadline(score, level, topPositive, topNegative);

  return {
    headlineEn: headline.en,
    headlineAr: headline.ar,
    factors,
  };
}
