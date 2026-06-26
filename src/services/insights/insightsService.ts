import { getAllCheckIns } from "@/src/storage/checkinStorage";
import type { DailyCheckIn } from "@/src/storage/checkinStorage";
import {
  saveInsights,
  getStoredInsights,
  shouldRegenerateInsights,
  type StoredInsight,
} from "./insightsStorage";

export type { StoredInsight } from "./insightsStorage";

function avg(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function generateId(): string {
  return `insight_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function makePhaseSleepInsight(checkIns: DailyCheckIn[]): StoredInsight | null {
  const periodDays = checkIns.filter((ci) => ci.isPeriodDay && ci.sleepHours);
  const nonPeriodDays = checkIns.filter((ci) => !ci.isPeriodDay && ci.sleepHours);

  const periodSleepAvg = avg(periodDays.map((ci) => ci.sleepHours!));
  const nonPeriodSleepAvg = avg(nonPeriodDays.map((ci) => ci.sleepHours!));

  if (!periodSleepAvg || !nonPeriodSleepAvg) return null;
  const diff = nonPeriodSleepAvg - periodSleepAvg;
  if (Math.abs(diff) < 0.5) return null;

  const worse = diff > 0;
  return {
    id: generateId(),
    type: "sleep",
    icon: "🌙",
    text: worse
      ? `Your sleep tends to be ${diff.toFixed(1)} hours shorter during your period compared to the rest of your cycle.`
      : `You sleep ${Math.abs(diff).toFixed(1)} hours longer during your period — your body is asking for extra rest.`,
    textAr: worse
      ? `نومك ينخفض بمعدل ${diff.toFixed(1)} ساعة أثناء الدورة مقارنة ببقية الدورة.`
      : `تنامين ${Math.abs(diff).toFixed(1)} ساعة أكثر أثناء الدورة — جسمك يطلب راحة إضافية.`,
    generatedAt: new Date().toISOString(),
    weekOf: new Date().toISOString().slice(0, 10),
  };
}

function makeSymptomPhaseInsight(checkIns: DailyCheckIn[]): StoredInsight | null {
  const symptomMap: Record<string, number> = {};
  let total = 0;
  for (const ci of checkIns) {
    if (!ci.symptoms?.length) continue;
    total++;
    for (const s of ci.symptoms) {
      symptomMap[s] = (symptomMap[s] ?? 0) + 1;
    }
  }
  if (!total) return null;

  const top = Object.entries(symptomMap).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 2) return null;

  const [symptom, count] = top;
  return {
    id: generateId(),
    type: "cycle",
    icon: "📊",
    text: `"${symptom}" appears in ${count} of your logged days. Tracking it helps predict future patterns.`,
    textAr: `"${symptom}" ظهر في ${count} من أيامك المسجلة. تتبعه يساعد على التنبؤ بالأنماط المستقبلية.`,
    generatedAt: new Date().toISOString(),
    weekOf: new Date().toISOString().slice(0, 10),
  };
}

function makeEnergyTrendInsight(checkIns: DailyCheckIn[]): StoredInsight | null {
  const recent = checkIns.slice(-14);
  const energies = recent
    .filter((ci) => typeof ci.energy === "number")
    .map((ci) => ci.energy!);
  if (energies.length < 5) return null;

  const firstHalf = avg(energies.slice(0, Math.floor(energies.length / 2)));
  const secondHalf = avg(energies.slice(Math.floor(energies.length / 2)));
  if (!firstHalf || !secondHalf) return null;

  const diff = secondHalf - firstHalf;
  if (Math.abs(diff) < 1) return null;

  const rising = diff > 0;
  return {
    id: generateId(),
    type: "energy",
    icon: "⚡",
    text: rising
      ? "Your energy levels have been rising over the past two weeks — a positive trend."
      : "Your energy has dipped recently. Prioritize sleep and gentle movement.",
    textAr: rising
      ? "مستوى طاقتك يرتفع خلال الأسبوعين الماضيين — هذا مؤشر إيجابي."
      : "طاقتك انخفضت مؤخراً. اجعلي النوم والحركة اللطيفة أولوية.",
    generatedAt: new Date().toISOString(),
    weekOf: new Date().toISOString().slice(0, 10),
  };
}

function makeSleepConsistencyInsight(checkIns: DailyCheckIn[]): StoredInsight | null {
  const sleepValues = checkIns
    .filter((ci) => typeof ci.sleepHours === "number")
    .map((ci) => ci.sleepHours!);
  if (sleepValues.length < 5) return null;

  const meanSleep = avg(sleepValues)!;
  const variance =
    sleepValues.reduce((sum, v) => sum + Math.pow(v - meanSleep, 2), 0) / sleepValues.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 1) {
    return {
      id: generateId(),
      type: "sleep",
      icon: "🌙",
      text: `Your sleep schedule is very consistent — averaging ${meanSleep.toFixed(1)} hours. Consistency is a superpower.`,
      textAr: `جدول نومك منتظم جداً — بمعدل ${meanSleep.toFixed(1)} ساعة. الانتظام قوة خارقة.`,
      generatedAt: new Date().toISOString(),
      weekOf: new Date().toISOString().slice(0, 10),
    };
  }
  if (stdDev > 2) {
    return {
      id: generateId(),
      type: "sleep",
      icon: "🌙",
      text: "Your sleep timing varies significantly. A consistent bedtime could improve your energy and cycle regulation.",
      textAr: "نومك يتفاوت كثيراً. وقت نوم منتظم يمكن أن يحسن طاقتك وانتظام دورتك.",
      generatedAt: new Date().toISOString(),
      weekOf: new Date().toISOString().slice(0, 10),
    };
  }
  return null;
}

function makeFastingInsight(checkIns: DailyCheckIn[]): StoredInsight | null {
  const recent = checkIns.slice(-14);
  const fastingDays = recent.filter((ci) => ci.fastingCompleted).length;
  if (!fastingDays) return null;

  if (fastingDays >= 10) {
    return {
      id: generateId(),
      type: "activity",
      icon: "⚡",
      text: `You completed ${fastingDays} fasting sessions in the past two weeks — excellent consistency.`,
      textAr: `أتممتِ ${fastingDays} جلسة صيام خلال الأسبوعين الماضيين — انتظام رائع.`,
      generatedAt: new Date().toISOString(),
      weekOf: new Date().toISOString().slice(0, 10),
    };
  }
  return null;
}

function makeWorkoutInsight(checkIns: DailyCheckIn[]): StoredInsight | null {
  const recent = checkIns.slice(-14);
  const workoutDays = recent.filter((ci) => ci.workoutCompleted).length;
  const periodWorkouts = recent.filter(
    (ci) => ci.workoutCompleted && ci.isPeriodDay
  ).length;

  if (workoutDays >= 4 && periodWorkouts > 0) {
    return {
      id: generateId(),
      type: "activity",
      icon: "🏃",
      text: "You've been active even during your period — gentle movement during menstruation can ease cramps.",
      textAr: "نشاطك مستمر حتى أثناء الدورة — الحركة اللطيفة تخفف التشنجات.",
      generatedAt: new Date().toISOString(),
      weekOf: new Date().toISOString().slice(0, 10),
    };
  }
  if (workoutDays >= 8) {
    return {
      id: generateId(),
      type: "activity",
      icon: "🏃",
      text: `${workoutDays} workout days in two weeks — your consistency is building a strong foundation.`,
      textAr: `${workoutDays} يوم تمرين في أسبوعين — انتظامك يبني أساساً قوياً.`,
      generatedAt: new Date().toISOString(),
      weekOf: new Date().toISOString().slice(0, 10),
    };
  }
  return null;
}

export async function generateAndSaveInsights(): Promise<StoredInsight[]> {
  const allCheckIns = await getAllCheckIns();
  const sorted = Object.values(allCheckIns).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length < 5) {
    // Not enough data — return motivational starter insight
    const starter: StoredInsight = {
      id: generateId(),
      type: "pattern",
      icon: "💡",
      text: "Log your daily check-ins for at least one week to unlock personalized health insights.",
      textAr: "سجّلي تسجيلاتك اليومية لمدة أسبوع على الأقل لفتح رؤى صحية مخصصة.",
      generatedAt: new Date().toISOString(),
      weekOf: new Date().toISOString().slice(0, 10),
    };
    await saveInsights([starter]);
    return [starter];
  }

  const candidates = [
    makePhaseSleepInsight(sorted),
    makeSymptomPhaseInsight(sorted),
    makeEnergyTrendInsight(sorted),
    makeSleepConsistencyInsight(sorted),
    makeFastingInsight(sorted),
    makeWorkoutInsight(sorted),
  ].filter((i): i is StoredInsight => i !== null);

  // Always have at least one insight
  if (!candidates.length) {
    const fallback: StoredInsight = {
      id: generateId(),
      type: "pattern",
      icon: "📈",
      text: "Keep logging daily — patterns become clearer with consistent data.",
      textAr: "استمري في التسجيل اليومي — الأنماط تتضح مع البيانات المنتظمة.",
      generatedAt: new Date().toISOString(),
      weekOf: new Date().toISOString().slice(0, 10),
    };
    await saveInsights([fallback]);
    return [fallback];
  }

  await saveInsights(candidates);
  return candidates;
}

export async function getInsights(forceRefresh = false): Promise<StoredInsight[]> {
  if (forceRefresh || (await shouldRegenerateInsights())) {
    return generateAndSaveInsights();
  }
  const stored = await getStoredInsights();
  return stored.length ? stored : generateAndSaveInsights();
}
