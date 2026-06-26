import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllWorkoutSessions } from "../workouts/workoutStorage";
import { getAllPRs } from "../pr";
import type { WorkoutSession } from "../workouts/types";

const KEY = "@eqaa_fitness_insights";
const CACHE_TTL_MS = 6 * 3600000; // 6 hours

export interface FitnessInsight {
  id: string;
  type:
    | "phase_performance"
    | "consistency"
    | "strength_trend"
    | "recovery"
    | "volume"
    | "encouragement"
    | "overload"
    | "streak";
  textEn: string;
  textAr: string;
  icon: string;
  generatedAt: string;
}

async function loadStored(): Promise<{ insights: FitnessInsight[]; generatedAt: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function saveInsights(insights: FitnessInsight[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ insights, generatedAt: new Date().toISOString() }));
  } catch {}
}

function sessionsByPhase(sessions: WorkoutSession[]): Record<string, WorkoutSession[]> {
  const map: Record<string, WorkoutSession[]> = {};
  for (const s of sessions) {
    if (s.cyclePhase) {
      (map[s.cyclePhase] ??= []).push(s);
    }
  }
  return map;
}

function avgDuration(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  return sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0) / sessions.length;
}

function calcVolume(sessions: WorkoutSession[]): number {
  return sessions.reduce(
    (total, s) =>
      total +
      s.exercises.reduce(
        (exTotal, ex) =>
          exTotal +
          ex.sets
            .filter((set) => set.completed && set.reps !== null && set.weightKg !== null)
            .reduce((sum, set) => sum + (set.reps ?? 0) * (set.weightKg ?? 0), 0),
        0
      ),
    0
  );
}

function computeStreak(sessions: WorkoutSession[]): number {
  const dates = new Set(sessions.map((s) => s.startedAt.split("T")[0]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    if (dates.has(key)) {
      streak++;
    } else if (i > 1) {
      break;
    }
  }
  return streak;
}

export async function getFitnessInsights(forceRefresh = false): Promise<FitnessInsight[]> {
  const stored = await loadStored();
  if (!forceRefresh && stored) {
    const ageMs = Date.now() - new Date(stored.generatedAt).getTime();
    if (ageMs < CACHE_TTL_MS) return stored.insights;
  }

  const [allSessions, allPRs] = await Promise.all([getAllWorkoutSessions(), getAllPRs()]);
  const completed = allSessions.filter((s) => s.status === "completed");

  if (completed.length === 0) {
    const starter: FitnessInsight[] = [
      {
        id: "starter_1",
        type: "encouragement",
        textEn: "Log your first workout to unlock personalized AI fitness insights!",
        textAr: "سجّلي تمرينك الأول لفتح رؤى اللياقة الشخصية بالذكاء الاصطناعي!",
        icon: "🌱",
        generatedAt: new Date().toISOString(),
      },
    ];
    await saveInsights(starter);
    return starter;
  }

  const insights: FitnessInsight[] = [];
  const byPhase = sessionsByPhase(completed);
  const now = Date.now();

  // 1. Best performance phase
  let bestPhase = "";
  let bestAvgDuration = 0;
  for (const [phase, sessions] of Object.entries(byPhase)) {
    const avg = avgDuration(sessions);
    if (avg > bestAvgDuration) { bestAvgDuration = avg; bestPhase = phase; }
  }
  if (bestPhase && bestAvgDuration > 0) {
    const phaseNames: Record<string, [string, string]> = {
      menstrual: ["menstrual", "الحيض"],
      renewal:   ["follicular", "الجريب"],
      power:     ["ovulation", "التبويض"],
      clarity:   ["luteal", "الطور الأصفر"],
      calm:      ["late luteal", "الطور الأصفر المتأخر"],
    };
    const [en, ar] = phaseNames[bestPhase] ?? [bestPhase, bestPhase];
    insights.push({
      id: "phase_perf",
      type: "phase_performance",
      textEn: `Your longest sessions happen during your ${en} phase (avg ${Math.round(bestAvgDuration)}min). Your body is strongest here — push it.`,
      textAr: `أطول جلساتك تحدث خلال مرحلة ${ar} (متوسط ${Math.round(bestAvgDuration)} دقيقة). جسمك في أقوى حالاته هنا — ادفعيه.`,
      icon: "⚡",
      generatedAt: new Date().toISOString(),
    });
  }

  // 2. Streak insight
  const streak = computeStreak(completed);
  if (streak >= 7) {
    insights.push({
      id: "streak_strong",
      type: "streak",
      textEn: `${streak}-day training streak! Consistency at this level creates lasting neural adaptations.`,
      textAr: `سلسلة تدريب ${streak} يوماً! الثبات على هذا المستوى يخلق تكيفات عصبية دائمة.`,
      icon: "🔥",
      generatedAt: new Date().toISOString(),
    });
  } else if (streak >= 3) {
    insights.push({
      id: "streak_good",
      type: "streak",
      textEn: `${streak} days in a row — momentum is building. Aim for 7 to lock in the habit.`,
      textAr: `${streak} أيام متتالية — الزخم يتشكل. استهدفي 7 أيام لترسيخ العادة.`,
      icon: "🔥",
      generatedAt: new Date().toISOString(),
    });
  }

  // 3. Consistency (30-day)
  const recentCount = completed.filter((s) => new Date(s.startedAt).getTime() >= now - 30 * 86400000).length;
  if (recentCount >= 12) {
    insights.push({
      id: "consistency_strong",
      type: "consistency",
      textEn: `${recentCount} workouts in 30 days — elite consistency. The top 5% train this regularly.`,
      textAr: `${recentCount} تمريناً في 30 يوماً — ثبات نخبوي. أفضل 5% يتدربن بهذا الانتظام.`,
      icon: "💎",
      generatedAt: new Date().toISOString(),
    });
  } else if (recentCount < 4 && completed.length >= 3) {
    insights.push({
      id: "consistency_low",
      type: "consistency",
      textEn: `${recentCount} workouts in the last 30 days. Even 2 short sessions per week makes a measurable difference.`,
      textAr: `${recentCount} تمارين في الـ 30 يوماً الماضية. حتى جلستان قصيرتان في الأسبوع تصنعان فارقاً ملموساً.`,
      icon: "💡",
      generatedAt: new Date().toISOString(),
    });
  }

  // 4. Volume trend (last 14 days vs previous 14)
  const twoWeeksAgo = now - 14 * 86400000;
  const fourWeeksAgo = now - 28 * 86400000;
  const recentVolume = calcVolume(completed.filter((s) => new Date(s.startedAt).getTime() >= twoWeeksAgo));
  const prevVolume = calcVolume(
    completed.filter((s) => {
      const t = new Date(s.startedAt).getTime();
      return t >= fourWeeksAgo && t < twoWeeksAgo;
    })
  );
  if (prevVolume > 0 && recentVolume > prevVolume * 1.1) {
    insights.push({
      id: "volume_up",
      type: "volume",
      textEn: `Training volume up ${Math.round(((recentVolume - prevVolume) / prevVolume) * 100)}% this fortnight vs. the previous. Progressive overload working.`,
      textAr: `حجم التدريب ارتفع ${Math.round(((recentVolume - prevVolume) / prevVolume) * 100)}% هذا الأسبوعين مقارنة بالسابق. الحمل التدريجي يعمل.`,
      icon: "📈",
      generatedAt: new Date().toISOString(),
    });
  } else if (prevVolume > 0 && recentVolume < prevVolume * 0.8) {
    insights.push({
      id: "volume_down",
      type: "volume",
      textEn: "Volume dipped recently. A planned deload is smart — just aim to return stronger next week.",
      textAr: "حجم التدريب انخفض مؤخراً. التخفيف المخطط ذكي — فقط استهدفي العودة بقوة أكبر الأسبوع القادم.",
      icon: "📉",
      generatedAt: new Date().toISOString(),
    });
  }

  // 5. Progressive overload hint (most logged exercise)
  const exFreq: Record<string, number> = {};
  for (const s of completed) {
    for (const ex of s.exercises) {
      exFreq[ex.exerciseNameEn] = (exFreq[ex.exerciseNameEn] ?? 0) + 1;
    }
  }
  const topEx = Object.entries(exFreq).sort((a, b) => b[1] - a[1])[0];
  if (topEx && topEx[1] >= 4) {
    insights.push({
      id: "overload_hint",
      type: "overload",
      textEn: `You've logged ${topEx[0]} ${topEx[1]} times — enough data to track progressive overload. Check your PR history.`,
      textAr: `سجّلتِ "${topEx[0]}" ${topEx[1]} مرات — بيانات كافية لتتبع الحمل التدريجي. راجعي سجل أرقامك القياسية.`,
      icon: "📊",
      generatedAt: new Date().toISOString(),
    });
  }

  // 6. PR milestone
  if (allPRs.length >= 5) {
    insights.push({
      id: "pr_milestone",
      type: "strength_trend",
      textEn: `${allPRs.length} personal records set! Strength is accumulating — each PR represents weeks of adaptation.`,
      textAr: `تم تسجيل ${allPRs.length} رقماً قياسياً شخصياً! تتراكم القوة — كل رقم قياسي يمثل أسابيع من التكيف.`,
      icon: "🏆",
      generatedAt: new Date().toISOString(),
    });
  }

  // 7. Recovery patterns
  const ratedSessions = completed.filter((s) => s.perceivedEnergy !== null);
  if (ratedSessions.length >= 5) {
    const avgEnergy = ratedSessions.reduce((sum, s) => sum + (s.perceivedEnergy ?? 3), 0) / ratedSessions.length;
    if (avgEnergy >= 4) {
      insights.push({
        id: "recovery_great",
        type: "recovery",
        textEn: "Post-workout energy consistently high — your recovery habits are working. Sleep, nutrition, and pacing are aligned.",
        textAr: "طاقتك بعد التمرين مرتفعة باستمرار — عادات التعافي تعمل. النوم والتغذية والإيقاع متناسقة.",
        icon: "✨",
        generatedAt: new Date().toISOString(),
      });
    } else if (avgEnergy < 2.5) {
      insights.push({
        id: "recovery_low",
        type: "recovery",
        textEn: "Low post-workout energy ratings. Prioritize 7–9h sleep and 1.6g protein/kg bodyweight for faster recovery.",
        textAr: "تقييمات طاقة منخفضة بعد التمارين. أعطي الأولوية لـ 7-9 ساعات نوم و1.6 غرام بروتين/كغ من وزن الجسم للتعافي الأسرع.",
        icon: "🌙",
        generatedAt: new Date().toISOString(),
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: "encouragement_default",
      type: "encouragement",
      textEn: `${completed.length} session${completed.length !== 1 ? "s" : ""} logged — every rep is building the athlete in you. Keep going!`,
      textAr: `${completed.length} جلسة مسجّلة — كل تكرار يبني الرياضية بداخلك. استمري!`,
      icon: "🏋️‍♀️",
      generatedAt: new Date().toISOString(),
    });
  }

  await saveInsights(insights);
  return insights;
}
