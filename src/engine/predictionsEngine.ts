export interface PredictionBundle {
  energyForecast: string;
  cycleForecast: string;
  fastingForecast: string;
  weightForecast: string;
  recommendationForecast: string;
}

const ND = {
  ar: "لا توجد بيانات كافية بعد",
  en: "Insufficient data yet",
};

export function generatePredictions(
  cycleDay: number,
  cycleLength: number,
  hasCycleData: boolean,
  goal: "lose" | "maintain" | "gain",
  fastingStats: {
    sessions: number;
    adherence: number;
    weekAvgHours: number;
    fastingHoursMin: number;
    fastingHoursMax: number;
  },
  weightData: {
    weight: number | null;
    goalWeight: number | null;
  },
  language: "ar" | "en" = "ar"
): PredictionBundle {
  const ar = language === "ar";
  const nd = ar ? ND.ar : ND.en;

  // ── Energy Forecast ───────────────────────────────────────────────────────────
  // Derived from cycle phase trajectory — where energy is heading in 48–72h
  let energyForecast: string;
  if (!hasCycleData) {
    energyForecast = nd;
  } else if (cycleDay >= 1 && cycleDay <= 7) {
    energyForecast = ar
      ? "طاقتك سترتفع تدريجياً خلال الأيام القادمة مع انتهاء فترة التعافي."
      : "Your energy will rise gradually over the next few days as recovery completes.";
  } else if (cycleDay >= 8 && cycleDay <= 12) {
    energyForecast = ar
      ? "نافذة تركيز قوية خلال 48 ساعة — استعدي لمهامك الأهم."
      : "A strong focus window opens in 48 hours — prepare for your most important tasks.";
  } else if (cycleDay >= 13 && cycleDay <= 15) {
    energyForecast = ar
      ? "ذروة طاقتك الآن. استغلي هذه النافذة قبل أن تبدأ بالانخفاض."
      : "You are at peak energy now. Use this window before it begins to taper.";
  } else if (cycleDay >= 16 && cycleDay <= 19) {
    energyForecast = ar
      ? "طاقتك ستنخفض تدريجياً خلال 3 أيام — خففي التمارين الشديدة."
      : "Energy will gradually dip over the next 3 days — ease back on intense workouts.";
  } else {
    energyForecast = ar
      ? "جسمك في وضع الاسترجاع. الطاقة ستعود بعد بداية الدورة الجديدة."
      : "Your body is in restoration mode. Energy returns with the next cycle start.";
  }

  // ── Cycle Forecast ────────────────────────────────────────────────────────────
  // Predict the next cycle event and days until it arrives
  let cycleForecast: string;
  if (!hasCycleData) {
    cycleForecast = nd;
  } else {
    const daysToManifestation = Math.max(0, 11 - cycleDay);
    const daysToSecondPower   = Math.max(0, 16 - cycleDay);
    const daysToReset         = Math.max(0, 20 - cycleDay);
    const daysToNewCycle      = Math.max(0, cycleLength - cycleDay + 1);

    if (cycleDay <= 10) {
      if (daysToManifestation <= 1) {
        cycleForecast = ar
          ? "مرحلة الإبداع والذروة تبدأ غداً — استعدي."
          : "Your peak creativity phase begins tomorrow — get ready.";
      } else {
        cycleForecast = ar
          ? `نافذة الخصوبة والإبداع خلال ${daysToManifestation} أيام.`
          : `Fertility and creativity window in ${daysToManifestation} days.`;
      }
    } else if (cycleDay <= 15) {
      if (daysToSecondPower <= 1) {
        cycleForecast = ar
          ? "مرحلة التوازن الداخلي تبدأ غداً."
          : "Your inner balance phase begins tomorrow.";
      } else {
        cycleForecast = ar
          ? `مرحلة التوازن الداخلي خلال ${daysToSecondPower} أيام.`
          : `Inner balance phase in ${daysToSecondPower} days.`;
      }
    } else if (cycleDay <= 19) {
      if (daysToReset <= 1) {
        cycleForecast = ar
          ? "مرحلة الراحة والتجديد تبدأ غداً."
          : "Your rest and renewal phase begins tomorrow.";
      } else {
        cycleForecast = ar
          ? `بداية مرحلة الراحة والتجديد خلال ${daysToReset} أيام.`
          : `Rest and renewal phase begins in ${daysToReset} days.`;
      }
    } else {
      if (daysToNewCycle <= 1) {
        cycleForecast = ar
          ? "دورتك الجديدة تبدأ غداً أو بعد يومين."
          : "Your new cycle begins tomorrow or the day after.";
      } else {
        cycleForecast = ar
          ? `بداية دورتك الجديدة بعد ${daysToNewCycle} أيام.`
          : `New cycle begins in ${daysToNewCycle} days.`;
      }
    }
  }

  // ── Fasting Forecast ──────────────────────────────────────────────────────────
  // Best fasting window this week based on current phase recommendation
  let fastingForecast: string;
  const { fastingHoursMin, fastingHoursMax, sessions, weekAvgHours } = fastingStats;

  if (sessions === 0) {
    fastingForecast = ar
      ? `ابدئي بنافذة ${fastingHoursMin}–${fastingHoursMax} ساعة هذا الأسبوع لتبدأ رحلتك.`
      : `Start with a ${fastingHoursMin}–${fastingHoursMax}h window this week to begin your journey.`;
  } else if (weekAvgHours > 0 && weekAvgHours < fastingHoursMin) {
    fastingForecast = ar
      ? `أفضل نافذة صيام هذا الأسبوع ${fastingHoursMin}–${fastingHoursMax} ساعة — زيدي ${Math.round(fastingHoursMin - weekAvgHours)} ساعة عن متوسطك الحالي.`
      : `Best fasting window this week is ${fastingHoursMin}–${fastingHoursMax}h — add ${Math.round(fastingHoursMin - weekAvgHours)}h to your current average.`;
  } else {
    fastingForecast = ar
      ? `أفضل نافذة صيام هذا الأسبوع ${fastingHoursMin}–${fastingHoursMax} ساعة — تتوافق مع مرحلتك الحالية.`
      : `Best fasting window this week is ${fastingHoursMin}–${fastingHoursMax}h — aligned with your current phase.`;
  }

  // ── Weight Forecast ───────────────────────────────────────────────────────────
  // Based on weight gap + goal + fasting adherence — no invented numbers
  let weightForecast: string;
  const { weight, goalWeight } = weightData;

  if (weight === null || goalWeight === null) {
    weightForecast = nd;
  } else {
    const diff = Math.abs(weight - goalWeight);

    if (diff < 0.5) {
      weightForecast = ar
        ? "أنتِ قريبة جداً من هدفك. الحفاظ على إيقاعك الحالي كافٍ."
        : "You are very close to your goal. Maintaining your current rhythm is enough.";
    } else if (goal === "maintain") {
      weightForecast = ar
        ? "خطة تغذيتك ومستوى الصيام الحالي يدعمان الحفاظ على وزنك."
        : "Your nutrition plan and current fasting level support maintaining your weight.";
    } else {
      // Estimate weekly rate from adherence
      // 70%+ adherence ≈ 0.4 kg/week, 50-69% ≈ 0.25 kg/week, <50% ≈ 0.15 kg/week
      const { adherence } = fastingStats;
      const weeklyRate =
        adherence >= 70 ? 0.4 :
        adherence >= 50 ? 0.25 : 0.15;

      const weeksEst = adherence > 0
        ? Math.ceil(diff / weeklyRate)
        : null;

      if (adherence === 0 || weeksEst === null) {
        weightForecast = ar
          ? "ابدئي بتسجيل جلسات الصيام لتحصلي على توقع مخصص لوزنك."
          : "Start logging fasting sessions to get a personalised weight prediction.";
      } else {
        const direction = goal === "lose" ? (ar ? "خسارة" : "lose") : (ar ? "اكتساب" : "gain");
        weightForecast = ar
          ? `إذا استمر الالتزام الحالي (${adherence}%) ستقتربين من هدفك بمقدار ${diff.toFixed(1)} كجم خلال ~${weeksEst} أسبوع.`
          : `At your current ${adherence}% adherence, you could reach your goal of ${diff.toFixed(1)}kg ${direction} in ~${weeksEst} weeks.`;
      }
    }
  }

  // ── Recommendation Forecast ───────────────────────────────────────────────────
  // Single forward-looking recommendation from phase context
  let recommendationForecast: string;
  if (!hasCycleData) {
    recommendationForecast = ar
      ? "سجلي تاريخ آخر دورة للحصول على توصيات مخصصة."
      : "Log your last period date to receive personalised recommendations.";
  } else if (cycleDay <= 5) {
    recommendationForecast = ar
      ? "خلال الأيام القادمة ركزي على النوم المبكر لدعم التعافي الهرموني."
      : "In the coming days focus on early sleep to support hormonal recovery.";
  } else if (cycleDay <= 12) {
    recommendationForecast = ar
      ? "استفيدي من طاقتك المتصاعدة — ضعي أهدافاً واضحة للأسبوع القادم."
      : "Harness your rising energy — set clear goals for the week ahead.";
  } else if (cycleDay <= 15) {
    recommendationForecast = ar
      ? "هذه نافذتك الذهنية الأقوى — خططي لمهامك الكبيرة خلال 48 ساعة القادمة."
      : "This is your strongest mental window — plan big tasks in the next 48 hours.";
  } else if (cycleDay <= 19) {
    recommendationForecast = ar
      ? "استعدي لفترة استرجاع — خففي التمارين وزيدي البروتين والمغنيسيوم."
      : "Prepare for recovery — ease workouts and increase protein and magnesium.";
  } else {
    recommendationForecast = ar
      ? "جسمك في وضع التجديد — الراحة والتغذية الداعمة ستسرعان التعافي."
      : "Your body is in renewal mode — rest and nourishing food will speed recovery.";
  }

  return {
    energyForecast,
    cycleForecast,
    fastingForecast,
    weightForecast,
    recommendationForecast,
  };
}
