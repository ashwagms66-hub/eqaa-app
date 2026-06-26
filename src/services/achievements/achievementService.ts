import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WorkoutStats } from "../workouts/statsService";
import { getAllWorkoutSessions } from "../workouts/workoutStorage";

const KEY = "@eqaa_achievements";

export interface Achievement {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  category: "consistency" | "strength" | "volume" | "cycle" | "milestone";
  unlockedAt: string | null;
}

const ACHIEVEMENT_CATALOG: Omit<Achievement, "unlockedAt">[] = [
  {
    id: "first_workout",
    nameEn: "First Rep",
    nameAr: "الخطوة الأولى",
    descriptionEn: "Complete your very first workout",
    descriptionAr: "أتمّي تمرينك الأول",
    icon: "🌱",
    category: "milestone",
  },
  {
    id: "streak_3",
    nameEn: "On Fire",
    nameAr: "شعلة",
    descriptionEn: "Train 3 days in a row",
    descriptionAr: "تدربي 3 أيام متتالية",
    icon: "🔥",
    category: "consistency",
  },
  {
    id: "sessions_10",
    nameEn: "Ten Strong",
    nameAr: "عشرة قوية",
    descriptionEn: "Complete 10 total workouts",
    descriptionAr: "أتمّي 10 تمارين",
    icon: "💪",
    category: "milestone",
  },
  {
    id: "first_pr",
    nameEn: "Record Breaker",
    nameAr: "كاسرة الأرقام",
    descriptionEn: "Set your first Personal Record",
    descriptionAr: "سجّلي رقمك القياسي الأول",
    icon: "🏆",
    category: "strength",
  },
  {
    id: "power_week",
    nameEn: "Power Week",
    nameAr: "أسبوع القوة",
    descriptionEn: "Complete 4 or more sessions in a single week",
    descriptionAr: "أتمّي 4 تمارين أو أكثر في أسبوع واحد",
    icon: "⚡",
    category: "consistency",
  },
  {
    id: "sessions_20",
    nameEn: "Dedicated",
    nameAr: "مخلصة",
    descriptionEn: "Reach 20 total workouts",
    descriptionAr: "بلغي 20 تمريناً إجمالياً",
    icon: "🎯",
    category: "milestone",
  },
  {
    id: "volume_10k",
    nameEn: "Ten Tonnes",
    nameAr: "عشرة أطنان",
    descriptionEn: "Lift 10,000 kg total across all sessions",
    descriptionAr: "ارفعي 10,000 كغ إجمالاً عبر جميع التمارين",
    icon: "💎",
    category: "volume",
  },
  {
    id: "sessions_50",
    nameEn: "Iron Devotion",
    nameAr: "تفانٍ حديدي",
    descriptionEn: "Complete 50 total workouts",
    descriptionAr: "أتمّي 50 تمريناً",
    icon: "🌙",
    category: "milestone",
  },
  {
    id: "streak_7",
    nameEn: "Unstoppable",
    nameAr: "لا يُوقف",
    descriptionEn: "Train 7 days in a row",
    descriptionAr: "تدربي 7 أيام متتالية",
    icon: "🦁",
    category: "consistency",
  },
  {
    id: "cycle_phases_3",
    nameEn: "Cycle Master",
    nameAr: "سيدة الدورة",
    descriptionEn: "Train in 3 or more different cycle phases",
    descriptionAr: "تدربي في 3 مراحل مختلفة من الدورة",
    icon: "🌸",
    category: "cycle",
  },
  {
    id: "beast_week",
    nameEn: "Beast Week",
    nameAr: "أسبوع الوحش",
    descriptionEn: "Complete 5 or more sessions in a single week",
    descriptionAr: "أتمّي 5 تمارين أو أكثر في أسبوع واحد",
    icon: "👑",
    category: "consistency",
  },
  {
    id: "volume_50k",
    nameEn: "Iron Queen",
    nameAr: "ملكة الحديد",
    descriptionEn: "Lift 50,000 kg total — a true feat of strength",
    descriptionAr: "ارفعي 50,000 كغ إجمالاً — إنجاز قوة حقيقي",
    icon: "👸",
    category: "volume",
  },
];

async function loadUnlocked(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveUnlocked(map: Record<string, string>): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch {}
}

function getMaxSessionsInAnyWeek(completedDates: string[]): number {
  const buckets: Record<string, number> = {};
  for (const date of completedDates) {
    const d = new Date(date);
    const weekStart = new Date(d);
    const day = d.getDay();
    weekStart.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const key = weekStart.toISOString().split("T")[0];
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return Math.max(0, ...Object.values(buckets));
}

async function getCyclePhaseCount(): Promise<number> {
  const sessions = (await getAllWorkoutSessions()).filter((s) => s.status === "completed");
  const phases = new Set(sessions.map((s) => s.cyclePhase).filter(Boolean));
  return phases.size;
}

export async function checkAndUnlockAchievements(stats: WorkoutStats): Promise<Achievement[]> {
  const unlocked = await loadUnlocked();
  const newlyUnlocked: Achievement[] = [];

  const completedDates = (await getAllWorkoutSessions())
    .filter((s) => s.status === "completed")
    .map((s) => s.startedAt);

  const maxWeekSessions = getMaxSessionsInAnyWeek(completedDates);
  const cyclePhaseCount = await getCyclePhaseCount();

  const conditions: Record<string, boolean> = {
    first_workout:  stats.totalSessions >= 1,
    streak_3:       stats.currentStreakDays >= 3 || stats.longestStreakDays >= 3,
    streak_7:       stats.currentStreakDays >= 7 || stats.longestStreakDays >= 7,
    sessions_10:    stats.totalSessions >= 10,
    sessions_20:    stats.totalSessions >= 20,
    sessions_50:    stats.totalSessions >= 50,
    first_pr:       stats.totalPRs >= 1,
    power_week:     maxWeekSessions >= 4,
    beast_week:     maxWeekSessions >= 5,
    volume_10k:     stats.totalLiftedKg >= 10000,
    volume_50k:     stats.totalLiftedKg >= 50000,
    cycle_phases_3: cyclePhaseCount >= 3,
  };

  const now = new Date().toISOString();

  for (const [id, met] of Object.entries(conditions)) {
    if (met && !unlocked[id]) {
      unlocked[id] = now;
      const def = ACHIEVEMENT_CATALOG.find((a) => a.id === id);
      if (def) newlyUnlocked.push({ ...def, unlockedAt: now });
    }
  }

  if (newlyUnlocked.length > 0) {
    await saveUnlocked(unlocked);
  }

  return newlyUnlocked;
}

export async function getAllAchievements(): Promise<Achievement[]> {
  const unlocked = await loadUnlocked();
  return ACHIEVEMENT_CATALOG.map((a) => ({
    ...a,
    unlockedAt: unlocked[a.id] ?? null,
  }));
}
