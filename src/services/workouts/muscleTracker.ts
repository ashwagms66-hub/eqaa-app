import { getAllWorkoutSessions } from "./workoutStorage";
import { getExerciseById } from "../exercise-library";

export interface MuscleStatus {
  key: string;
  nameEn: string;
  nameAr: string;
  emoji: string;
  color: string;           // indicator color
  daysAgo: number | null;  // null = not trained in past 7 days
  weekSessions: number;
  needsWork: boolean;
}

const MUSCLE_DEFS = [
  { key: "chest",     nameEn: "Chest",      nameAr: "صدر",      emoji: "💪", categories: ["chest"] },
  { key: "back",      nameEn: "Back",       nameAr: "ظهر",      emoji: "🦸", categories: ["back"] },
  { key: "shoulders", nameEn: "Shoulders",  nameAr: "كتف",      emoji: "🏋️", categories: ["shoulders"] },
  { key: "arms",      nameEn: "Arms",       nameAr: "ذراعين",   emoji: "💪", categories: ["arms"] },
  { key: "core",      nameEn: "Core",       nameAr: "جوهر",     emoji: "🔥", categories: ["core"] },
  { key: "glutes",    nameEn: "Glutes",     nameAr: "ألية",     emoji: "🍑", categories: ["glutes"] },
  { key: "legs",      nameEn: "Legs",       nameAr: "ساقين",    emoji: "🦵", categories: ["legs"] },
  { key: "cardio",    nameEn: "Cardio",     nameAr: "كارديو",   emoji: "🏃", categories: ["cardio"] },
  { key: "mobility",  nameEn: "Mobility",   nameAr: "مرونة",    emoji: "🌀", categories: ["mobility", "recovery", "stretching"] },
] as const;

function recencyColor(daysAgo: number | null): string {
  if (daysAgo === null) return "rgba(255,255,255,0.12)";
  if (daysAgo <= 1) return "#22C55E";
  if (daysAgo <= 3) return "#F59E0B";
  return "#EF4444";
}

export async function getWeeklyMuscleMap(): Promise<MuscleStatus[]> {
  const sessions = (await getAllWorkoutSessions()).filter((s) => s.status === "completed");
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recent = sessions.filter((s) => new Date(s.startedAt).getTime() >= sevenDaysAgo);

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  return MUSCLE_DEFS.map((mg) => {
    let bestDaysAgo: number | null = null;
    let weekCount = 0;

    for (const session of recent) {
      let hit = false;
      for (const ex of session.exercises) {
        const dbEx = getExerciseById(ex.exerciseId);
        const cat = dbEx?.category ?? "";
        if ((mg.categories as readonly string[]).includes(cat)) {
          hit = true;
          break;
        }
      }
      if (!hit) continue;

      weekCount++;
      const d = new Date(session.startedAt);
      d.setHours(0, 0, 0, 0);
      const ago = Math.floor((todayMidnight.getTime() - d.getTime()) / 86400000);
      if (bestDaysAgo === null || ago < bestDaysAgo) bestDaysAgo = ago;
    }

    return {
      key: mg.key,
      nameEn: mg.nameEn,
      nameAr: mg.nameAr,
      emoji: mg.emoji,
      color: recencyColor(bestDaysAgo),
      daysAgo: bestDaysAgo,
      weekSessions: weekCount,
      needsWork: bestDaysAgo === null || bestDaysAgo >= 5,
    };
  });
}
