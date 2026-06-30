import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@eqaa_workout_schedule";

// ── Types ──────────────────────────────────────────────────────────────────────

export type WorkoutDayType =
  | "rest"
  | "upper"
  | "lower"
  | "full_body"
  | "cardio"
  | "mobility"
  | "recovery"
  | "pilates"
  | "custom";

export type WorkoutDayKey = "sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri";

export type WorkoutScheduleRepeatMode = "continuous" | "one_month";

export interface WorkoutScheduleDay {
  dayKey: WorkoutDayKey;
  type: WorkoutDayType;
  customLabel?: string;
}

export interface WorkoutSchedule {
  days: WorkoutScheduleDay[];
  repeatMode: WorkoutScheduleRepeatMode;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

export const ORDERED_DAY_KEYS: WorkoutDayKey[] = [
  "sat", "sun", "mon", "tue", "wed", "thu", "fri",
];

export const DAY_LABELS: Record<WorkoutDayKey, { ar: string; en: string }> = {
  sat: { ar: "السبت",    en: "Saturday"  },
  sun: { ar: "الأحد",    en: "Sunday"    },
  mon: { ar: "الاثنين",  en: "Monday"    },
  tue: { ar: "الثلاثاء", en: "Tuesday"   },
  wed: { ar: "الأربعاء", en: "Wednesday" },
  thu: { ar: "الخميس",   en: "Thursday"  },
  fri: { ar: "الجمعة",   en: "Friday"    },
};

export const WORKOUT_TYPES: WorkoutDayType[] = [
  "rest", "upper", "lower", "full_body",
  "cardio", "mobility", "recovery", "pilates", "custom",
];

export const WORKOUT_TYPE_META: Record<WorkoutDayType, {
  labelAr: string;
  labelEn: string;
  emoji: string;
  accent: string;
  descAr: string;
  descEn: string;
}> = {
  rest:      { labelAr: "راحة",      labelEn: "Rest",        emoji: "😴", accent: "#64748B", descAr: "راحة واستشفاء بدون تمرين مجهد",              descEn: "Recovery day with no intense training"            },
  upper:     { labelAr: "علوي",      labelEn: "Upper Body",  emoji: "💪", accent: "#C6A7FF", descAr: "تركيز على الصدر، الظهر، الأكتاف والذراعين",   descEn: "Focus on chest, back, shoulders, and arms"        },
  lower:     { labelAr: "سفلي",      labelEn: "Lower Body",  emoji: "🦵", accent: "#FF6FAE", descAr: "تركيز على الأرجل، الألوية وأوتار الركبة",      descEn: "Focus on legs, glutes, and hamstrings"            },
  full_body: { labelAr: "جسم كامل",  labelEn: "Full Body",   emoji: "🏋️", accent: "#7FFFD4", descAr: "تمرين شامل لكل عضلات الجسم",                 descEn: "Full body compound training"                      },
  cardio:    { labelAr: "كارديو",    labelEn: "Cardio",      emoji: "🏃", accent: "#FF9640", descAr: "نشاط خفيف إلى متوسط لدعم اللياقة والحرق",     descEn: "Light to moderate activity for endurance"         },
  mobility:  { labelAr: "مرونة",     labelEn: "Mobility",    emoji: "🧘", accent: "#89CFF0", descAr: "تمارين مرونة وتمدد لتحسين الحركة",             descEn: "Stretching and flexibility training"              },
  recovery:  { labelAr: "تعافي",     labelEn: "Recovery",    emoji: "🌿", accent: "#34D399", descAr: "نشاط خفيف لمساعدة الجسم على التعافي",          descEn: "Light activity to aid muscle recovery"            },
  pilates:   { labelAr: "بيلاتس",    labelEn: "Pilates",     emoji: "🌸", accent: "#F0A7D0", descAr: "تمارين بيلاتس لتقوية العمق والتوازن",          descEn: "Core strength and balance through pilates"        },
  custom:    { labelAr: "مخصص",      labelEn: "Custom",      emoji: "✏️", accent: "#FFD700", descAr: "تمرين تختارينه بنفسك",                        descEn: "A workout you define yourself"                    },
};

// JS Date.getDay(): 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
const JS_DAY_TO_KEY: Record<number, WorkoutDayKey> = {
  6: "sat", 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri",
};

export const DEFAULT_SCHEDULE_DAYS: WorkoutScheduleDay[] = ORDERED_DAY_KEYS.map(
  (dayKey) => ({ dayKey, type: "rest" as WorkoutDayType })
);

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getTodayDayKey(date?: Date): WorkoutDayKey {
  const d = date ?? new Date();
  return JS_DAY_TO_KEY[d.getDay()] ?? "sat";
}

export function getTodayWorkoutFromSchedule(
  schedule: WorkoutSchedule,
  date?: Date
): WorkoutScheduleDay {
  const todayKey = getTodayDayKey(date);
  return (
    schedule.days.find((day) => day.dayKey === todayKey) ?? {
      dayKey: todayKey,
      type: "rest",
    }
  );
}

// ── Storage ────────────────────────────────────────────────────────────────────

export async function getWorkoutSchedule(): Promise<WorkoutSchedule | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkoutSchedule;
  } catch {
    return null;
  }
}

export async function saveWorkoutSchedule(schedule: WorkoutSchedule): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

export async function resetWorkoutSchedule(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
