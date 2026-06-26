import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";
import type { DailyCheckIn } from "@/src/storage/checkinStorage";
import type { WorkoutSession } from "@/src/services/workouts/types";
import type { WeeklyReport } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

// ── Energy trend ──────────────────────────────────────────────────────────────

function calcEnergyTrend(checkIns: DailyCheckIn[]): "improving" | "stable" | "declining" {
  const energies = checkIns
    .filter((c) => c.energy !== undefined)
    .map((c) => c.energy as number);
  if (energies.length < 4) return "stable";
  const firstHalf = mean(energies.slice(0, Math.floor(energies.length / 2)))!;
  const secondHalf = mean(energies.slice(Math.floor(energies.length / 2)))!;
  const diff = secondHalf - firstHalf;
  if (diff > 0.8) return "improving";
  if (diff < -0.8) return "declining";
  return "stable";
}

// ── Phase dominant ────────────────────────────────────────────────────────────

function dominantPhase(cycleDay: number): CyclePhaseKey {
  const d = ((cycleDay - 1) % 28) + 1;
  if (d <= 5)  return "menstrual";
  if (d <= 10) return "power";
  if (d <= 15) return "manifestation";
  if (d <= 19) return "secondPower";
  return "reset";
}

const HORMONE_SUMMARY: Record<CyclePhaseKey, { en: string; ar: string }> = {
  menstrual:    { en: "Low estrogen phase — your body was in restoration mode.",    ar: "مرحلة إستروجين منخفض — كان جسمكِ في وضع الترميم." },
  power:        { en: "Rising estrogen supported your mood and energy all week.",   ar: "ارتفاع الإستروجين دعم مزاجكِ وطاقتكِ طوال الأسبوع." },
  manifestation:{ en: "Peak estrogen week — your best hormonal window of the month.",ar: "أسبوع ذروة الإستروجين — أفضل نافذة هرمونية في الشهر." },
  secondPower:  { en: "Progesterone rising — a focused, productive week hormonally.", ar: "البروجستيرون يرتفع — أسبوع هرموني مركّز ومنتج." },
  reset:        { en: "Both hormones declining — PMS period; rest was the right call.", ar: "كلا الهرمونين ينخفضان — فترة PMS؛ الراحة كانت الخيار الصحيح." },
};

// ── Achievement & improvement detectors ──────────────────────────────────────

function detectAchievement(
  checkIns: DailyCheckIn[],
  sessions: WorkoutSession[],
  workoutDays: number
): { en: string; ar: string } {
  const maxEnergy = Math.max(...checkIns.map((c) => c.energy ?? 0));
  if (maxEnergy >= 9) return { en: `Peak energy of ${maxEnergy}/10 recorded this week.`, ar: `طاقة ذروة ${maxEnergy}/10 مسجّلة هذا الأسبوع.` };
  if (workoutDays >= 4) return { en: `${workoutDays} training sessions completed — excellent consistency.`, ar: `${workoutDays} جلسات تدريب مكتملة — اتساق ممتاز.` };
  const longestFast = checkIns.filter((c) => c.fastingCompleted).length;
  if (longestFast >= 5) return { en: `${longestFast} fasting days completed — strong discipline.`, ar: `${longestFast} أيام صيام مكتملة — انضباط قوي.` };
  return { en: "You showed up every day this week — that consistency compounds.", ar: "حضرتِ كل يوم هذا الأسبوع — هذا الاتساق يتراكم." };
}

function detectImprovementArea(
  avgSleep: number | null,
  avgEnergy: number | null,
  workoutDays: number,
  fastingDays: number
): { en: string; ar: string } {
  if (avgSleep !== null && avgSleep < 6.5) return { en: "Sleep quality — aim for 7+ hours consistently.", ar: "جودة النوم — استهدفي 7+ ساعات باستمرار." };
  if (workoutDays < 2)  return { en: "Movement consistency — even 2 sessions per week makes a difference.", ar: "اتساق الحركة — حتى جلستان في الأسبوع يحدثان فرقاً." };
  if (avgEnergy !== null && avgEnergy < 5) return { en: "Energy management — review sleep, nutrition, and fasting timing.", ar: "إدارة الطاقة — راجعي النوم والتغذية وتوقيت الصيام." };
  if (fastingDays < 3)  return { en: "Fasting consistency — try extending to 3+ days per week.", ar: "اتساق الصيام — حاولي التمديد إلى 3+ أيام في الأسبوع." };
  return { en: "Maintain your current routine — you're performing well across all areas.", ar: "حافظي على روتينكِ الحالي — أداؤكِ جيد في جميع المجالات." };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateWeeklyReport(
  checkInsMap: Record<string, DailyCheckIn>,
  recentSessions: WorkoutSession[],
  todayCycleDay: number
): WeeklyReport {
  const days = getLast7Days();
  const checkIns = days.map((d) => checkInsMap[d]).filter((c): c is DailyCheckIn => !!c);

  // Session count
  const weekStart = new Date(days[0]);
  const weekEnd   = new Date(days[days.length - 1]);
  const workoutDays = recentSessions.filter((s) => {
    const d = new Date(s.startedAt);
    return d >= weekStart && d <= weekEnd && s.status === "completed";
  }).length;

  // Best / worst energy day
  const energyDays = checkIns
    .filter((c) => c.energy !== undefined)
    .map((c) => ({ date: c.date, score: c.energy as number }));
  const bestDay  = energyDays.reduce((a, b) => b.score > a.score ? b : a, { date: days[days.length - 1], score: 0 });
  const worstDay = energyDays.reduce((a, b) => b.score < a.score ? b : a, { date: days[0], score: 10 });

  // Sleep
  const sleeps = checkIns.filter((c) => c.sleepHours !== undefined).map((c) => c.sleepHours as number);
  const avgSleepHours = sleeps.length ? parseFloat((sleeps.reduce((s, h) => s + h, 0) / sleeps.length).toFixed(1)) : null;
  const sleepQuality = avgSleepHours === null ? "fair" : avgSleepHours >= 7 ? "good" : avgSleepHours >= 6 ? "fair" : "poor";

  // Energy
  const energyValues = checkIns.filter((c) => c.energy !== undefined).map((c) => c.energy as number);
  const avgEnergy = mean(energyValues);
  const energyTrend = calcEnergyTrend(checkIns);
  const overallScore = avgEnergy !== null ? Math.round(avgEnergy * 10) : 50;

  // Fasting
  const fastingDays = checkIns.filter((c) => c.fastingCompleted).length;
  const fastingQuality = fastingDays >= 5 ? "excellent" : fastingDays >= 3 ? "good" : "inconsistent";
  const fastingSummary = {
    en: `${fastingDays}/7 days fasted — ${fastingQuality} consistency.`,
    ar: `${fastingDays}/7 أيام صيام — اتساق ${fastingQuality === "excellent" ? "ممتاز" : fastingQuality === "good" ? "جيد" : "غير منتظم"}.`,
  };

  // Recovery
  const recoverySummary = {
    en: sleepQuality === "good"
      ? "Sleep-driven recovery was strong this week."
      : sleepQuality === "fair"
      ? "Partial recovery — sleep could be improved."
      : "Poor sleep quality impacted recovery this week.",
    ar: sleepQuality === "good"
      ? "التعافي المدفوع بالنوم كان قوياً هذا الأسبوع."
      : sleepQuality === "fair"
      ? "تعافٍ جزئي — يمكن تحسين النوم."
      : "جودة النوم الضعيفة أثّرت على التعافي هذا الأسبوع.",
  };

  // Mood
  const moods = checkIns.filter((c) => c.mood).map((c) => c.mood as string);
  const positiveMoods = moods.filter((m) => ["happy", "energetic", "calm", "focused"].includes(m)).length;
  const moodRatio = moods.length ? positiveMoods / moods.length : 0.5;
  const moodSummary = {
    en: moodRatio >= 0.6
      ? "Predominantly positive mood this week — hormones and lifestyle in balance."
      : moodRatio >= 0.4
      ? "Mixed mood patterns — typical for this cycle phase."
      : "Mood was challenging this week — support your neurotransmitters with sleep and nutrition.",
    ar: moodRatio >= 0.6
      ? "مزاج إيجابي في معظمه هذا الأسبوع — الهرمونات ونمط الحياة في توازن."
      : moodRatio >= 0.4
      ? "أنماط مزاجية مختلطة — طبيعية لهذه المرحلة من الدورة."
      : "المزاج كان صعباً هذا الأسبوع — ادعمي ناقلاتكِ العصبية بالنوم والتغذية.",
  };

  const phase = dominantPhase(todayCycleDay);
  const hormoneSummary = HORMONE_SUMMARY[phase];
  const achievement = detectAchievement(checkIns, recentSessions, workoutDays);
  const improvement = detectImprovementArea(avgSleepHours, avgEnergy, workoutDays, fastingDays);

  const trendMap: Record<string, string> = { improving: "improving", stable: "stable", declining: "declining" };

  return {
    weekStartDate: days[0],
    weekEndDate:   days[days.length - 1],
    overallScore,
    bestDayDate:   bestDay.date,
    bestDayScore:  bestDay.score * 10,
    worstDayDate:  worstDay.date,
    worstDayScore: worstDay.score * 10,
    energyTrend:   trendMap[energyTrend] as "improving" | "stable" | "declining",
    workoutDays,
    avgSleepHours,
    sleepQuality,
    hormoneSummaryEn:   hormoneSummary.en,
    hormoneSummaryAr:   hormoneSummary.ar,
    fastingSummaryEn:   fastingSummary.en,
    fastingSummaryAr:   fastingSummary.ar,
    recoverySummaryEn:  recoverySummary.en,
    recoverySummaryAr:  recoverySummary.ar,
    moodSummaryEn:      moodSummary.en,
    moodSummaryAr:      moodSummary.ar,
    biggestAchievementEn: achievement.en,
    biggestAchievementAr: achievement.ar,
    improvementAreaEn:  improvement.en,
    improvementAreaAr:  improvement.ar,
    generatedAt: new Date().toISOString(),
  };
}
