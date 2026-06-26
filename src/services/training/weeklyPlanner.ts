export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface PlannedDay {
  day: DayOfWeek;
  focusEn: string;
  focusAr: string;
  intensity: "high" | "moderate" | "low" | "rest";
  exerciseCategories: string[];
  durationMinutes: number;
  isRest: boolean;
  adjustedForPeriod?: boolean;
}

export interface WeeklyPlan {
  cyclePhase: string;
  days: PlannedDay[];
  generatedAt: string;
}

const DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PHASE_TEMPLATES: Record<string, Omit<PlannedDay, "day">[]> = {
  menstrual: [
    { focusEn: "Gentle Yoga", focusAr: "يوغا لطيفة", intensity: "low", exerciseCategories: ["mobility", "recovery"], durationMinutes: 30, isRest: false },
    { focusEn: "Rest", focusAr: "راحة", intensity: "rest", exerciseCategories: [], durationMinutes: 0, isRest: true },
    { focusEn: "Walk / Light Cardio", focusAr: "مشي / كارديو خفيف", intensity: "low", exerciseCategories: ["cardio", "mobility"], durationMinutes: 30, isRest: false },
    { focusEn: "Rest", focusAr: "راحة", intensity: "rest", exerciseCategories: [], durationMinutes: 0, isRest: true },
    { focusEn: "Core & Mobility", focusAr: "جوهر وحركة", intensity: "low", exerciseCategories: ["core", "mobility"], durationMinutes: 35, isRest: false },
    { focusEn: "Rest", focusAr: "راحة", intensity: "rest", exerciseCategories: [], durationMinutes: 0, isRest: true },
    { focusEn: "Restorative Stretch", focusAr: "تمدد تعافٍ", intensity: "low", exerciseCategories: ["recovery", "mobility"], durationMinutes: 25, isRest: false },
  ],
  renewal: [
    { focusEn: "Lower Body Strength", focusAr: "قوة الجزء السفلي", intensity: "moderate", exerciseCategories: ["legs", "glutes"], durationMinutes: 50, isRest: false },
    { focusEn: "Upper Body Push", focusAr: "ضغط الجزء العلوي", intensity: "moderate", exerciseCategories: ["chest", "shoulders", "arms"], durationMinutes: 45, isRest: false },
    { focusEn: "Active Recovery", focusAr: "تعافٍ نشط", intensity: "low", exerciseCategories: ["mobility", "cardio"], durationMinutes: 30, isRest: false },
    { focusEn: "Upper Body Pull", focusAr: "سحب الجزء العلوي", intensity: "moderate", exerciseCategories: ["back", "arms"], durationMinutes: 45, isRest: false },
    { focusEn: "Glutes & Core", focusAr: "ألية وجوهر", intensity: "moderate", exerciseCategories: ["glutes", "core"], durationMinutes: 45, isRest: false },
    { focusEn: "Cardio", focusAr: "كارديو", intensity: "moderate", exerciseCategories: ["cardio"], durationMinutes: 40, isRest: false },
    { focusEn: "Rest", focusAr: "راحة", intensity: "rest", exerciseCategories: [], durationMinutes: 0, isRest: true },
  ],
  power: [
    { focusEn: "Heavy Lower Body", focusAr: "جزء سفلي ثقيل", intensity: "high", exerciseCategories: ["legs", "glutes"], durationMinutes: 60, isRest: false },
    { focusEn: "Heavy Upper Body Push", focusAr: "ضغط الجزء العلوي الثقيل", intensity: "high", exerciseCategories: ["chest", "shoulders"], durationMinutes: 55, isRest: false },
    { focusEn: "HIIT Cardio", focusAr: "كارديو HIIT", intensity: "high", exerciseCategories: ["cardio"], durationMinutes: 35, isRest: false },
    { focusEn: "Heavy Back & Arms", focusAr: "ظهر وذراعان ثقيل", intensity: "high", exerciseCategories: ["back", "arms"], durationMinutes: 55, isRest: false },
    { focusEn: "Glutes & Power", focusAr: "ألية وقوة", intensity: "high", exerciseCategories: ["glutes", "core"], durationMinutes: 55, isRest: false },
    { focusEn: "Active Recovery", focusAr: "تعافٍ نشط", intensity: "low", exerciseCategories: ["mobility", "recovery"], durationMinutes: 30, isRest: false },
    { focusEn: "Rest", focusAr: "راحة", intensity: "rest", exerciseCategories: [], durationMinutes: 0, isRest: true },
  ],
  clarity: [
    { focusEn: "Lower Body Strength", focusAr: "قوة الجزء السفلي", intensity: "moderate", exerciseCategories: ["legs", "glutes"], durationMinutes: 55, isRest: false },
    { focusEn: "Upper Body Push", focusAr: "ضغط الجزء العلوي", intensity: "moderate", exerciseCategories: ["chest", "shoulders", "arms"], durationMinutes: 50, isRest: false },
    { focusEn: "Steady State Cardio", focusAr: "كارديو ثابت", intensity: "moderate", exerciseCategories: ["cardio"], durationMinutes: 40, isRest: false },
    { focusEn: "Back & Core", focusAr: "ظهر وجوهر", intensity: "moderate", exerciseCategories: ["back", "core"], durationMinutes: 50, isRest: false },
    { focusEn: "Full Body Circuit", focusAr: "دائرة كامل الجسم", intensity: "moderate", exerciseCategories: ["legs", "chest", "back", "core"], durationMinutes: 50, isRest: false },
    { focusEn: "Yoga & Mobility", focusAr: "يوغا وحركة", intensity: "low", exerciseCategories: ["mobility"], durationMinutes: 35, isRest: false },
    { focusEn: "Rest", focusAr: "راحة", intensity: "rest", exerciseCategories: [], durationMinutes: 0, isRest: true },
  ],
  calm: [
    { focusEn: "Light Lower Body", focusAr: "جزء سفلي خفيف", intensity: "low", exerciseCategories: ["legs", "glutes"], durationMinutes: 40, isRest: false },
    { focusEn: "Upper Body Toning", focusAr: "تنشيط الجزء العلوي", intensity: "low", exerciseCategories: ["chest", "back", "shoulders"], durationMinutes: 40, isRest: false },
    { focusEn: "Rest or Walk", focusAr: "راحة أو مشي", intensity: "rest", exerciseCategories: ["cardio"], durationMinutes: 20, isRest: true },
    { focusEn: "Core & Mobility", focusAr: "جوهر وحركة", intensity: "low", exerciseCategories: ["core", "mobility"], durationMinutes: 35, isRest: false },
    { focusEn: "Light Cardio", focusAr: "كارديو خفيف", intensity: "low", exerciseCategories: ["cardio"], durationMinutes: 30, isRest: false },
    { focusEn: "Rest", focusAr: "راحة", intensity: "rest", exerciseCategories: [], durationMinutes: 0, isRest: true },
    { focusEn: "Restorative Yoga", focusAr: "يوغا تعافٍ", intensity: "low", exerciseCategories: ["recovery", "mobility"], durationMinutes: 30, isRest: false },
  ],
};

export function generateWeeklyPlan(
  cyclePhase: string,
  periodStartsThisWeek = false
): WeeklyPlan {
  const template = PHASE_TEMPLATES[cyclePhase] ?? PHASE_TEMPLATES["renewal"];
  const days: PlannedDay[] = template.map((t, i) => {
    const planned: PlannedDay = { ...t, day: DAYS[i] };
    // If period is expected mid-week, downgrade intensity from day 3 onward
    if (periodStartsThisWeek && i >= 3 && planned.intensity === "high") {
      planned.intensity = "moderate";
      planned.adjustedForPeriod = true;
    }
    return planned;
  });

  return {
    cyclePhase,
    days,
    generatedAt: new Date().toISOString(),
  };
}

export function getTodaysPlan(plan: WeeklyPlan): PlannedDay | null {
  const dayIndex = new Date().getDay(); // 0 = Sun
  // Map JS Sunday=0 to our Mon=0 index
  const mapped = dayIndex === 0 ? 6 : dayIndex - 1;
  return plan.days[mapped] ?? null;
}
