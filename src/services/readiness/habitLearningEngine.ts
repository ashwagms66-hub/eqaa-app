import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HabitInsight, HabitObservation } from "./types";

const STORAGE_KEY = "@eqaa_habit_observations";
const MAX_OBSERVATIONS = 120;

// ── Persistence ───────────────────────────────────────────────────────────────

async function loadObservations(): Promise<HabitObservation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HabitObservation[]) : [];
  } catch {
    return [];
  }
}

async function saveObservations(obs: HabitObservation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obs.slice(-MAX_OBSERVATIONS)));
  } catch {}
}

// ── Record an observation ─────────────────────────────────────────────────────

export async function recordHabitObservation(obs: HabitObservation): Promise<void> {
  const all = await loadObservations();
  const exists = all.some((o) => o.date === obs.date);
  if (exists) return;
  all.push(obs);
  await saveObservations(all);
}

// ── Pattern analysis ──────────────────────────────────────────────────────────

interface PatternGroup {
  label: string;
  observations: HabitObservation[];
}

function groupBy(
  obs: HabitObservation[],
  keyFn: (o: HabitObservation) => string
): PatternGroup[] {
  const map = new Map<string, HabitObservation[]>();
  for (const o of obs) {
    const key = keyFn(o);
    const arr = map.get(key) ?? [];
    arr.push(o);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([label, observations]) => ({ label, observations }));
}

function avgNextDayEnergy(obs: HabitObservation[]): number | null {
  const values = obs.map((o) => o.nextDayEnergy).filter((e): e is number => e !== null);
  if (!values.length) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function confidence(sampleSize: number): number {
  // Sigmoid-like confidence based on sample size
  // 5 obs → ~40%, 10 obs → ~65%, 20 obs → ~85%, 30+ → ~95%
  return Math.min(95, Math.round((sampleSize / (sampleSize + 8)) * 100));
}

// ── Insight generators ────────────────────────────────────────────────────────

function workoutTypeInsight(obs: HabitObservation[]): HabitInsight[] {
  const MIN_SAMPLES = 5;
  const groups = groupBy(obs.filter((o) => o.workoutType !== "none"), (o) => o.workoutType);
  const insights: HabitInsight[] = [];

  for (const { label, observations } of groups) {
    if (observations.length < MIN_SAMPLES) continue;
    const avg = avgNextDayEnergy(observations);
    if (avg === null) continue;
    const conf = confidence(observations.length);
    const avgStr = avg.toFixed(1);

    const workoutName = label.charAt(0).toUpperCase() + label.slice(1);
    insights.push({
      id: `habit_workout_${label}`,
      patternEn: `After ${workoutName} sessions, your next-day energy averages ${avgStr}/10.`,
      patternAr: `بعد جلسات ${workoutName}، تبلغ طاقتكِ في اليوم التالي في المتوسط ${avgStr}/10.`,
      icon: avg >= 6.5 ? "💪" : "🔄",
      color: avg >= 6.5 ? "#22C55E" : "#F59E0B",
      confidence: conf,
      dataPoints: observations.length,
    });
  }

  return insights;
}

function fastingInsight(obs: HabitObservation[]): HabitInsight | null {
  const MIN_SAMPLES = 6;
  const withFasting   = obs.filter((o) => o.fastingHours !== null && o.fastingHours > 14);
  const withoutFasting = obs.filter((o) => o.fastingHours !== null && o.fastingHours <= 12);

  if (withFasting.length < MIN_SAMPLES || withoutFasting.length < MIN_SAMPLES) return null;

  const avgWith    = avgNextDayEnergy(withFasting);
  const avgWithout = avgNextDayEnergy(withoutFasting);
  if (avgWith === null || avgWithout === null) return null;

  const diff = avgWith - avgWithout;
  if (Math.abs(diff) < 0.6) return null;

  const conf = confidence(Math.min(withFasting.length, withoutFasting.length));

  if (diff > 0) {
    return {
      id: "habit_fasting_positive",
      patternEn: `Extended fasting (14h+) boosts your next-day energy by ${Math.abs(diff).toFixed(1)} points on average.`,
      patternAr: `الصيام الممتد (14 ساعة+) يرفع طاقتكِ في اليوم التالي بمعدل ${Math.abs(diff).toFixed(1)} نقاط.`,
      icon: "⚡", color: "#F59E0B", confidence: conf, dataPoints: withFasting.length,
    };
  }
  return {
    id: "habit_fasting_negative",
    patternEn: `You lose ${Math.abs(diff).toFixed(1)} energy points the day after extended fasting (14h+).`,
    patternAr: `تفقدين ${Math.abs(diff).toFixed(1)} نقطة طاقة في اليوم التالي للصيام الممتد (14 ساعة+).`,
    icon: "🔄", color: "#EF4444", confidence: conf, dataPoints: withFasting.length,
  };
}

function phaseWorkoutInsight(obs: HabitObservation[]): HabitInsight | null {
  const MIN_SAMPLES = 5;
  const ovulationObs = obs.filter((o) => o.phaseKey === "manifestation" && o.workoutType !== "none");
  const menstrualObs = obs.filter((o) => o.phaseKey === "menstrual" && o.workoutType !== "none");

  const ovulAvg = avgNextDayEnergy(ovulationObs);
  const menstrAvg = avgNextDayEnergy(menstrualObs);

  if (ovulationObs.length >= MIN_SAMPLES && ovulAvg !== null && ovulAvg >= 7) {
    return {
      id: "habit_phase_ovulation",
      patternEn: `You consistently perform best during the ovulation window — energy peaks at ${ovulAvg.toFixed(1)}/10.`,
      patternAr: `أداؤكِ الأفضل يكون باستمرار خلال نافذة التبويض — تبلغ الطاقة ذروتها ${ovulAvg.toFixed(1)}/10.`,
      icon: "🌟", color: "#F59E0B",
      confidence: confidence(ovulationObs.length),
      dataPoints: ovulationObs.length,
    };
  }

  if (menstrualObs.length >= MIN_SAMPLES && menstrAvg !== null && menstrAvg < 5) {
    return {
      id: "habit_phase_menstrual",
      patternEn: `Training during menstruation consistently yields lower next-day energy (${menstrAvg.toFixed(1)}/10). Rest is likely better.`,
      patternAr: `التدريب خلال الحيض يعطي باستمرار طاقة أقل في اليوم التالي (${menstrAvg.toFixed(1)}/10). الراحة على الأرجح أفضل.`,
      icon: "🌸", color: "#EC4899",
      confidence: confidence(menstrualObs.length),
      dataPoints: menstrualObs.length,
    };
  }

  return null;
}

function sleepInsight(obs: HabitObservation[]): HabitInsight | null {
  const MIN_SAMPLES = 6;
  const goodSleep = obs.filter((o) => o.sleepHours !== null && o.sleepHours >= 7.5);
  const poorSleep = obs.filter((o) => o.sleepHours !== null && o.sleepHours !== null && (o.sleepHours as number) < 6);

  if (goodSleep.length < MIN_SAMPLES || poorSleep.length < MIN_SAMPLES) return null;

  const goodAvg = avgNextDayEnergy(goodSleep);
  const poorAvg = avgNextDayEnergy(poorSleep);
  if (goodAvg === null || poorAvg === null) return null;

  const diff = goodAvg - poorAvg;
  if (diff < 1.0) return null;

  return {
    id: "habit_sleep_energy",
    patternEn: `Sleeping 7.5h+ adds ${diff.toFixed(1)} energy points next day compared to under-6h nights.`,
    patternAr: `النوم 7.5 ساعة+ يضيف ${diff.toFixed(1)} نقطة طاقة في اليوم التالي مقارنة بليالي أقل من 6 ساعات.`,
    icon: "😴", color: "#6366F1",
    confidence: confidence(Math.min(goodSleep.length, poorSleep.length)),
    dataPoints: goodSleep.length + poorSleep.length,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getHabitInsights(): Promise<HabitInsight[]> {
  const observations = await loadObservations();
  if (observations.length < 5) return [];

  const insights: HabitInsight[] = [
    ...workoutTypeInsight(observations),
    fastingInsight(observations),
    phaseWorkoutInsight(observations),
    sleepInsight(observations),
  ].filter((i): i is HabitInsight => i !== null);

  return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}
