export interface InsightBundle {
  dailyInsight: string;
  cycleInsight: string;
  fastingInsight: string;
  nutritionInsight: string;
  predictionInsight: string;
}

const NO_DATA = {
  ar: "لا توجد بيانات كافية بعد",
  en: "Insufficient data yet",
};

export function generateInsights(
  cycleDay: number,
  readiness: number,
  hasCycleData: boolean,
  goal: "lose" | "maintain" | "gain",
  fastingStats?: {
    adherence?: number;
    avgHours?: number;
    sessions?: number;
  },
  nutrition?: {
    protein?: number;
    targetCalories?: number;
  },
  language: "ar" | "en" = "ar"
): InsightBundle {
  const ar = language === "ar";
  const nd = ar ? NO_DATA.ar : NO_DATA.en;

  // ── Daily Insight ─────────────────────────────────────────────────────────────
  // readiness is derived from getCyclePhase(cycleDay); only meaningful when
  // the user has logged their cycle start date.
  let dailyInsight: string;
  if (!hasCycleData) {
    dailyInsight = nd;
  } else if (readiness >= 85) {
    dailyInsight = ar
      ? "جاهزيتك مرتفعة اليوم. وقت مناسب للتركيز واتخاذ قرارات مهمة."
      : "Your readiness is high today. A great time to focus and make important decisions.";
  } else if (readiness >= 70) {
    dailyInsight = ar
      ? "طاقة مستقرة. حافظي على التوازن بين الإنجاز والراحة."
      : "Stable energy. Balance between achievement and rest today.";
  } else {
    dailyInsight = ar
      ? "يبدو أن جسمك يحتاج إلى تعافٍ إضافي اليوم. خففي الضغط قدر الإمكان."
      : "Your body seems to need extra recovery today. Reduce pressure as much as possible.";
  }

  // ── Cycle Insight ─────────────────────────────────────────────────────────────
  let cycleInsight: string;
  if (!hasCycleData) {
    cycleInsight = nd;
  } else if (cycleDay <= 5) {
    cycleInsight = ar
      ? "ركزي على الراحة والتغذية الداعمة خلال هذه المرحلة."
      : "Focus on rest and supportive nutrition during this phase.";
  } else if (cycleDay <= 12) {
    cycleInsight = ar
      ? "طاقة الجسم في تحسن تدريجي. وقت جيد لبناء العادات."
      : "Body energy is gradually improving. A good time to build habits.";
  } else if (cycleDay <= 18) {
    cycleInsight = ar
      ? "مرحلة الوضوح. مناسبة للإبداع والتركيز والإنجاز."
      : "Clarity phase. Ideal for creativity, focus, and achievement.";
  } else {
    cycleInsight = ar
      ? "اقتربي من الهدوء والتعافي التدريجي استعداداً للدورة القادمة."
      : "Approach calm and gradual recovery in preparation for the next cycle.";
  }

  // ── Fasting Insight ───────────────────────────────────────────────────────────
  const sessions  = fastingStats?.sessions  ?? 0;
  const adherence = fastingStats?.adherence ?? 0;

  let fastingInsight: string;
  if (sessions === 0) {
    fastingInsight = ar
      ? "لم تُسجلي جلسات صيام بعد. ابدئي بنافذة 13 ساعة."
      : "No fasting sessions recorded yet. Start with a 13-hour window.";
  } else if (adherence >= 80) {
    fastingInsight = ar
      ? "التزامك بالصيام ممتاز. استمري على نفس الإيقاع."
      : "Your fasting commitment is excellent. Keep the same rhythm.";
  } else if (adherence >= 50) {
    fastingInsight = ar
      ? "هناك تقدم جيد. محاولة جلسة إضافية هذا الأسبوع قد تحسن النتائج."
      : "Good progress. Adding an extra session this week may improve results.";
  } else {
    fastingInsight = ar
      ? "الانتظام أهم من المدة. ركزي على بناء عادة ثابتة."
      : "Consistency matters more than duration. Focus on building a steady habit.";
  }

  // ── Nutrition Insight ─────────────────────────────────────────────────────────
  // Uses goal + protein target only. We never compare calories to themselves.
  const protein       = nutrition?.protein       ?? 0;
  const targetCalories = nutrition?.targetCalories ?? 0;
  const lowProtein    = protein > 0 && protein < 100;

  let nutritionInsight: string;
  if (!targetCalories) {
    nutritionInsight = nd;
  } else if (goal === "lose") {
    nutritionInsight = ar
      ? "خطة سعراتك تدعم هدف خسارة الوزن بشكل مدروس."
      : "Your calorie plan thoughtfully supports your weight loss goal.";
  } else if (goal === "gain") {
    nutritionInsight = ar
      ? "خطة سعراتك مصممة لدعم بناء العضلات. ركزي على الوجبات الغنية بالبروتين."
      : "Your calorie plan is designed to support muscle building. Focus on protein-rich meals.";
  } else {
    nutritionInsight = ar
      ? "خطة سعراتك متوازنة للمحافظة على وزنك ومستوى طاقتك."
      : "Your calorie plan is balanced to maintain your current weight and energy level.";
  }

  if (lowProtein) {
    nutritionInsight += ar
      ? " زيادة البروتين قد تساعد على الشبع والحفاظ على الكتلة العضلية."
      : " Increasing protein may help with satiety and preserving muscle mass.";
  }

  // ── Prediction Insight ────────────────────────────────────────────────────────
  // Always future-oriented: خلال / من المتوقع / اقتربي من
  let predictionInsight: string;
  if (!hasCycleData) {
    predictionInsight = nd;
  } else if (cycleDay <= 10) {
    predictionInsight = ar
      ? "خلال الأيام القادمة ستزداد طاقتك تدريجياً مع اقتراب مرحلة الذروة."
      : "In the coming days your energy will gradually rise toward peak phase.";
  } else if (cycleDay <= 18) {
    predictionInsight = ar
      ? "من المتوقع أن يستمر وضوحك الذهني خلال الأيام القادمة — خططي للمهام الكبيرة الآن."
      : "Mental clarity is expected to continue in the coming days — plan your most important tasks now.";
  } else {
    predictionInsight = ar
      ? "اقتربي من مرحلة الهدوء القادمة. جدولي وقتاً للتعافي مسبقاً."
      : "The calm recovery phase is approaching. Schedule rest time in advance.";
  }

  return { dailyInsight, cycleInsight, fastingInsight, nutritionInsight, predictionInsight };
}
