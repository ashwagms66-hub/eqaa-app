import type { DailyInsightTimeline, InsightChange } from "./types";
import type { DailyBriefInput } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function changeType(current: number | null, previous: number | null, higherIsBetter: boolean): "improved" | "declined" | "stable" {
  if (current == null || previous == null) return "stable";
  const delta = current - previous;
  if (Math.abs(delta) < 0.05 * Math.max(current, previous, 1)) return "stable";
  const better = higherIsBetter ? delta > 0 : delta < 0;
  return better ? "improved" : "declined";
}

function colorFor(ct: "improved" | "declined" | "stable"): string {
  return ct === "improved" ? "#5BBB85" : ct === "declined" ? "#FF6FAE" : "#8FD3FF";
}

// ── Individual metric comparisons ──────────────────────────────────────────────

function energyChange(input: DailyBriefInput): InsightChange | null {
  const { readinessScore, yesterdayEnergy } = input;
  if (yesterdayEnergy == null) return null;
  const ct = changeType(readinessScore, yesterdayEnergy, true);
  const diff = Math.round(readinessScore - yesterdayEnergy);
  const sign = diff > 0 ? "+" : "";
  return {
    metric: "energy",
    previousValueEn: `${yesterdayEnergy}%`,
    currentValueEn:  `${readinessScore}%`,
    previousValueAr: `${yesterdayEnergy}٪`,
    currentValueAr:  `${readinessScore}٪`,
    changeType: ct,
    explanationEn: ct === "improved"
      ? `Your readiness is ${sign}${diff} points higher than yesterday — your body responded well to last night's recovery.`
      : ct === "declined"
      ? `Readiness dropped ${Math.abs(diff)} points since yesterday — likely reduced sleep quality or accumulated fatigue.`
      : "Your energy is holding steady from yesterday.",
    explanationAr: ct === "improved"
      ? `جاهزيتك أعلى بـ ${sign}${diff} نقطة عن أمس — أجادت جسمكِ الاستجابة لتعافي ليلة أمس.`
      : ct === "declined"
      ? `انخفضت الجاهزية ${Math.abs(diff)} نقطة منذ أمس — على الأرجح جودة نوم أقل أو تراكم إجهاد.`
      : "طاقتكِ ثابتة منذ أمس.",
    icon: "⚡",
    color: colorFor(ct),
  };
}

function sleepChange(input: DailyBriefInput): InsightChange | null {
  const { sleepHours, yesterdaySleep } = input;
  if (sleepHours == null || yesterdaySleep == null) return null;
  const ct = changeType(sleepHours, yesterdaySleep, true);
  const diff = +(sleepHours - yesterdaySleep).toFixed(1);
  const sign = diff > 0 ? "+" : "";
  return {
    metric: "sleep",
    previousValueEn: `${yesterdaySleep}h`,
    currentValueEn:  `${sleepHours}h`,
    previousValueAr: `${yesterdaySleep} ساعة`,
    currentValueAr:  `${sleepHours} ساعة`,
    changeType: ct,
    explanationEn: ct === "improved"
      ? `You slept ${sign}${diff}h more than yesterday — deeper recovery hormone cycles completed.`
      : ct === "declined"
      ? `Sleep was ${Math.abs(diff)}h shorter than yesterday — cortisol may be elevated today.`
      : "Sleep duration is consistent with yesterday.",
    explanationAr: ct === "improved"
      ? `نمتِ ${sign}${diff} ساعة أكثر من أمس — اكتملت دورات هرمون التعافي بشكل أعمق.`
      : ct === "declined"
      ? `كان النوم أقصر بـ ${Math.abs(diff)} ساعة من أمس — قد يكون الكورتيزول مرتفعاً اليوم.`
      : "مدة النوم متسقة مع أمس.",
    icon: "🌙",
    color: colorFor(ct),
  };
}

function moodChange(input: DailyBriefInput): InsightChange | null {
  const { todayMood, yesterdayMood } = input;
  if (!todayMood || !yesterdayMood || todayMood === yesterdayMood) return null;
  const moodRank: Record<string, number> = { great: 4, good: 3, okay: 2, low: 1, drained: 0 };
  const prev = moodRank[yesterdayMood] ?? 2;
  const curr = moodRank[todayMood] ?? 2;
  const ct = changeType(curr, prev, true);
  return {
    metric: "mood",
    previousValueEn: yesterdayMood,
    currentValueEn:  todayMood,
    previousValueAr: yesterdayMood,
    currentValueAr:  todayMood,
    changeType: ct,
    explanationEn: ct === "improved"
      ? "Your mood lifted since yesterday — hormonal rhythm and sleep both played a role."
      : ct === "declined"
      ? "Mood dipped compared to yesterday — this often mirrors late-phase hormone withdrawal or poor sleep."
      : "Mood is steady from yesterday.",
    explanationAr: ct === "improved"
      ? "تحسّن مزاجكِ منذ أمس — أدّى كلٌّ من الإيقاع الهرموني والنوم دوراً في ذلك."
      : ct === "declined"
      ? "انخفض المزاج مقارنة بأمس — غالباً يعكس انسحاب هرمونات المرحلة المتأخرة أو ضعف النوم."
      : "المزاج ثابت منذ أمس.",
    icon: "🌸",
    color: colorFor(ct),
  };
}

function fastingChange(input: DailyBriefInput): InsightChange | null {
  // We only note if fasting significantly changed
  const { fastingHours } = input;
  if (fastingHours == null) return null;
  const goalMet = fastingHours >= 14;
  return {
    metric: "fasting",
    previousValueEn: "—",
    currentValueEn:  `${fastingHours}h`,
    previousValueAr: "—",
    currentValueAr:  `${fastingHours} ساعة`,
    changeType: goalMet ? "improved" : "stable",
    explanationEn: goalMet
      ? `${fastingHours}h fasting window — autophagy and fat-burning pathways are active.`
      : `${fastingHours}h fasting — below the 14h metabolic threshold for this phase.`,
    explanationAr: goalMet
      ? `نافذة صيام ${fastingHours} ساعة — مسارات الالتهام الذاتي وحرق الدهون نشطة.`
      : `${fastingHours} ساعة صيام — دون عتبة الاستقلاب 14 ساعة لهذه المرحلة.`,
    icon: "⏱️",
    color: goalMet ? "#5BBB85" : "#8FD3FF",
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateInsightsTimeline(input: DailyBriefInput): DailyInsightTimeline {
  const changes: InsightChange[] = [
    energyChange(input),
    sleepChange(input),
    moodChange(input),
    fastingChange(input),
  ].filter((c): c is InsightChange => c !== null);

  const improved = changes.filter(c => c.changeType === "improved").length;
  const declined = changes.filter(c => c.changeType === "declined").length;

  let summaryEn: string;
  let summaryAr: string;

  if (improved > declined) {
    summaryEn = "Today looks better than yesterday across most signals — keep the momentum.";
    summaryAr = "يبدو اليوم أفضل من أمس في معظم المؤشرات — حافظي على الزخم.";
  } else if (declined > improved) {
    summaryEn = "A few signals dipped since yesterday — your body may need extra recovery care today.";
    summaryAr = "انخفضت بعض المؤشرات منذ أمس — قد يحتاج جسمكِ رعاية تعافي إضافية اليوم.";
  } else {
    summaryEn = "Your health signals are holding steady from yesterday.";
    summaryAr = "مؤشرات صحتكِ ثابتة منذ أمس.";
  }

  return { summaryEn, summaryAr, changes };
}
