export interface SmartNotification {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  priority: "low" | "medium" | "high";
  category: "cycle" | "fasting" | "nutrition" | "prediction";
}

const PRIORITY_ORDER: Record<SmartNotification["priority"], number> = {
  high: 0, medium: 1, low: 2,
};

export function generateNotifications(
  cycleDay: number,
  daysLeft: number,
  readiness: number,
  hasPeriod: boolean,
  fastTotal: number,
  fastRate: number,
  weekAvgHours: number,
  fastingHoursMin: number,
  fastingHoursMax: number,
  goals: string[],
  protein: number,
  weight: number | null,
  goalWeight: number | null
): SmartNotification[] {
  const notes: SmartNotification[] = [];

  // ── 1. Cycle approaching ──────────────────────────────────────────────────────
  if (hasPeriod && daysLeft <= 5) {
    notes.push({
      id: "cycle_approaching",
      priority: daysLeft <= 2 ? "high" : "medium",
      category: "cycle",
      titleAr: daysLeft <= 2 ? "الدورة تقترب جداً" : "الدورة القادمة قريباً",
      titleEn: daysLeft <= 2 ? "Period very soon" : "Period approaching",
      bodyAr:  daysLeft <= 2
        ? `الدورة القادمة خلال ${daysLeft} يوم أو أقل — استعدي وجهزي احتياجاتك.`
        : `الدورة القادمة خلال ${daysLeft} أيام — خططي لأسبوعك مسبقاً.`,
      bodyEn: daysLeft <= 2
        ? `Your period is ${daysLeft} day(s) away — prepare what you need.`
        : `Your period is ${daysLeft} days away — plan your week in advance.`,
    });
  }

  // ── 2. Readiness high — seize the day ────────────────────────────────────────
  if (hasPeriod && readiness >= 85) {
    notes.push({
      id: "readiness_high",
      priority: "high",
      category: "prediction",
      titleAr: "جاهزيتك مرتفعة اليوم",
      titleEn: "High readiness today",
      bodyAr:  `درجة جاهزيتك ${readiness}/100 — استغلي الوقت للإنجاز والتركيز.`,
      bodyEn:  `Your readiness is ${readiness}/100 — a great day to focus and achieve.`,
    });
  }

  // ── 3. Readiness low — ease off ───────────────────────────────────────────────
  if (hasPeriod && readiness > 0 && readiness < 60) {
    notes.push({
      id: "readiness_low",
      priority: "medium",
      category: "prediction",
      titleAr: "جسمك يحتاج راحة اليوم",
      titleEn: "Rest day recommended",
      bodyAr:  `جاهزيتك ${readiness}/100 — خففي الضغط وأعطي جسمك وقتاً للتعافي.`,
      bodyEn:  `Readiness at ${readiness}/100 — reduce pressure and give your body time to recover.`,
    });
  }

  // ── 4. No fasting sessions ever ───────────────────────────────────────────────
  if (fastTotal === 0) {
    notes.push({
      id: "fasting_no_sessions",
      priority: "high",
      category: "fasting",
      titleAr: "ابدئي رحلة الصيام",
      titleEn: "Start fasting",
      bodyAr:  `لم تُسجلي جلسات صيام بعد. ابدئي بنافذة ${fastingHoursMin}–${fastingHoursMax} ساعة هذا الأسبوع.`,
      bodyEn:  `No fasting sessions logged yet. Start with a ${fastingHoursMin}–${fastingHoursMax}h window this week.`,
    });
  }

  // ── 5. Fasting adherence low ──────────────────────────────────────────────────
  if (fastTotal > 0 && fastRate < 50) {
    notes.push({
      id: "fasting_low_adherence",
      priority: "medium",
      category: "fasting",
      titleAr: "زيدي انتظامك في الصيام",
      titleEn: "Improve fasting consistency",
      bodyAr:  `التزامك الحالي ${fastRate}%. جلسة إضافية هذا الأسبوع سترفع نتائجك بشكل ملحوظ.`,
      bodyEn:  `Current adherence ${fastRate}%. One extra session this week will noticeably improve results.`,
    });
  }

  // ── 6. Fasting: avg below recommended minimum ─────────────────────────────────
  if (fastTotal > 0 && weekAvgHours > 0 && weekAvgHours < fastingHoursMin) {
    const gap = (fastingHoursMin - weekAvgHours).toFixed(1);
    notes.push({
      id: "fasting_below_window",
      priority: "medium",
      category: "fasting",
      titleAr: "متوسط صيامك أقل من المثالي",
      titleEn: "Fasting avg below ideal",
      bodyAr:  `متوسطك ${weekAvgHours.toFixed(1)}h. زيدي ${gap} ساعة للوصول للنافذة الموصى بها ${fastingHoursMin}–${fastingHoursMax}h.`,
      bodyEn:  `Your avg is ${weekAvgHours.toFixed(1)}h. Add ${gap}h to reach the recommended ${fastingHoursMin}–${fastingHoursMax}h window.`,
    });
  }

  // ── 7. Fasting excellent streak ───────────────────────────────────────────────
  if (fastTotal > 0 && fastRate >= 80) {
    notes.push({
      id: "fasting_excellent",
      priority: "low",
      category: "fasting",
      titleAr: "التزام رائع بالصيام",
      titleEn: "Excellent fasting streak",
      bodyAr:  `التزامك ${fastRate}% — استمري على نفس الإيقاع لتحصلي على أفضل النتائج.`,
      bodyEn:  `Adherence at ${fastRate}% — keep the same rhythm for best results.`,
    });
  }

  // ── 8. Protein target low ─────────────────────────────────────────────────────
  if (protein > 0 && protein < 100) {
    notes.push({
      id: "nutrition_low_protein",
      priority: "medium",
      category: "nutrition",
      titleAr: "هدف بروتينك منخفض",
      titleEn: "Low protein target",
      bodyAr:  `هدف بروتينك ${protein}g يومياً. زيادته تدعم الشبع والحفاظ على الكتلة العضلية.`,
      bodyEn:  `Your protein target is ${protein}g/day. Increasing it supports satiety and muscle retention.`,
    });
  }

  // ── 9. Energy drop prediction ─────────────────────────────────────────────────
  if (hasPeriod && cycleDay >= 16 && cycleDay <= 19) {
    notes.push({
      id: "prediction_energy_drop",
      priority: "medium",
      category: "prediction",
      titleAr: "توقع انخفاض الطاقة",
      titleEn: "Energy dip predicted",
      bodyAr:  "من المتوقع انخفاض الطاقة خلال الأيام القادمة — خففي التمارين وأعطي الأولوية للنوم.",
      bodyEn:  "An energy dip is expected in the coming days — ease workouts and prioritise sleep.",
    });
  }

  // ── 10. Peak phase — use it ───────────────────────────────────────────────────
  if (hasPeriod && cycleDay >= 11 && cycleDay <= 15) {
    notes.push({
      id: "prediction_peak_phase",
      priority: "low",
      category: "prediction",
      titleAr: "نافذة ذروة الطاقة الآن",
      titleEn: "Peak energy window",
      bodyAr:  "أنتِ في أعلى مستويات طاقتك وتركيزك — استثمري هذه النافذة في مهامك الكبيرة.",
      bodyEn:  "You are at peak energy and focus — invest this window in your most important tasks.",
    });
  }

  // ── 11. Weight goal close ─────────────────────────────────────────────────────
  if (weight !== null && goalWeight !== null) {
    const diff = Math.abs(weight - goalWeight);
    if (diff > 0 && diff < 2 && goals.includes("loss")) {
      notes.push({
        id: "weight_close_to_goal",
        priority: "low",
        category: "nutrition",
        titleAr: "أنتِ قريبة من هدفك",
        titleEn: "Close to your goal",
        bodyAr:  `${diff.toFixed(1)} كجم فقط تفصلكِ عن هدفك. حافظي على إيقاعك.`,
        bodyEn:  `Only ${diff.toFixed(1)}kg from your goal. Keep your current rhythm.`,
      });
    }
  }

  // ── 12. Cycle phase change coming ────────────────────────────────────────────
  if (hasPeriod) {
    const daysToNextPhase =
      cycleDay <= 10 ? 11 - cycleDay :
      cycleDay <= 15 ? 16 - cycleDay :
      cycleDay <= 19 ? 20 - cycleDay : -1;

    if (daysToNextPhase >= 1 && daysToNextPhase <= 2) {
      notes.push({
        id: "cycle_phase_change",
        priority: "low",
        category: "cycle",
        titleAr: "مرحلة جديدة خلال يومين",
        titleEn: "New phase in 2 days",
        bodyAr:  `ستدخلين مرحلة جديدة من دورتك خلال ${daysToNextPhase} يوم — تابعي الشاشة الرئيسية للتفاصيل.`,
        bodyEn:  `A new cycle phase begins in ${daysToNextPhase} day(s) — check the home screen for details.`,
      });
    }
  }

  return notes.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}
