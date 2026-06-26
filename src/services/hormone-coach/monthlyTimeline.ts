import type { CyclePhaseKey, MonthDay } from "./types";
import { phaseAccentColor } from "./dailyScoreEngine";

// ── Phase metadata table ──────────────────────────────────────────────────────

interface PhaseMeta {
  nameEn: string;
  nameAr: string;
  energy: number;
  moodEmoji: string;
  moodEn: string;
  moodAr: string;
  cravingsEn: string;
  cravingsAr: string;
}

const PHASE_META: Record<CyclePhaseKey, PhaseMeta> = {
  menstrual: {
    nameEn: "Menstrual", nameAr: "الحيض",
    energy: 28,
    moodEmoji: "🌸", moodEn: "Reflective", moodAr: "تأملية",
    cravingsEn: "Warm soups, iron-rich foods, dark chocolate",
    cravingsAr: "حساء دافئ، أطعمة غنية بالحديد، شوكولاتة داكنة",
  },
  power: {
    nameEn: "Follicular", nameAr: "الجريبية",
    energy: 70,
    moodEmoji: "😊", moodEn: "Optimistic", moodAr: "متفائلة",
    cravingsEn: "Light salads, protein, fresh fruits",
    cravingsAr: "سلطات خفيفة، بروتين، فواكه طازجة",
  },
  manifestation: {
    nameEn: "Ovulation", nameAr: "التبويض",
    energy: 95,
    moodEmoji: "🌟", moodEn: "Radiant", moodAr: "متألقة",
    cravingsEn: "Raw veggies, lean protein, minimal appetite",
    cravingsAr: "خضروات نيئة، بروتين نقي، شهية منخفضة",
  },
  secondPower: {
    nameEn: "Early Luteal", nameAr: "الأصفرية المبكرة",
    energy: 74,
    moodEmoji: "🧘", moodEn: "Calm", moodAr: "هادئة",
    cravingsEn: "Complex carbs, magnesium-rich foods",
    cravingsAr: "كربوهيدرات معقدة، أطعمة غنية بالمغنيسيوم",
  },
  reset: {
    nameEn: "Late Luteal", nameAr: "الأصفرية المتأخرة",
    energy: 40,
    moodEmoji: "🌙", moodEn: "Introspective", moodAr: "استبطانية",
    cravingsEn: "Comfort carbs, dark chocolate, salty snacks",
    cravingsAr: "كربوهيدرات مريحة، شوكولاتة داكنة، وجبات خفيفة مالحة",
  },
};

// ── Day classification ────────────────────────────────────────────────────────

function dayToPhase(cycleDay: number): CyclePhaseKey {
  const day = ((cycleDay - 1) % 28) + 1;
  if (day <= 5)  return "menstrual";
  if (day <= 10) return "power";
  if (day <= 15) return "manifestation";
  if (day <= 19) return "secondPower";
  return "reset";
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateMonthlyTimeline(todayCycleDay: number): MonthDay[] {
  const timeline: MonthDay[] = [];

  for (let cycleDay = 1; cycleDay <= 28; cycleDay++) {
    const phaseKey = dayToPhase(cycleDay);
    const meta = PHASE_META[phaseKey];

    timeline.push({
      cycleDay,
      phaseKey,
      phaseNameEn: meta.nameEn,
      phaseNameAr: meta.nameAr,
      energyLevel: meta.energy,
      moodEmoji: meta.moodEmoji,
      moodLabelEn: meta.moodEn,
      moodLabelAr: meta.moodAr,
      cravingsEn: meta.cravingsEn,
      cravingsAr: meta.cravingsAr,
      isPeriod: cycleDay <= 5,
      isOvulationWindow: cycleDay >= 12 && cycleDay <= 16,
      isToday: cycleDay === todayCycleDay,
      accentColor: phaseAccentColor(phaseKey),
    });
  }

  return timeline;
}
