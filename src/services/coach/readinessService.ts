export interface ReadinessInput {
  cycleDay: number | null;
  cyclePhase: string | null;
  sleepHours: number | null;
  hrv: number | null;                 // ms — higher = better recovery
  restingHeartRate: number | null;    // bpm — lower = better recovery
  activeCaloriesYesterday: number | null;
  symptoms: string[];                 // e.g. ["cramps", "fatigue"]
  energyLevel: number | null;         // 1–5 user-reported
  daysSinceLastWorkout: number | null;
}

export interface ReadinessOutput {
  score: number;              // 0–100
  intensityModifier: number;  // 0.5–1.2 multiplies on planned load
  label: string;
  labelAr: string;
  color: string;
  recommendedFocus: string;
  recommendedFocusAr: string;
  reasons: string[];
  reasonsAr: string[];
}

const PHASE_BASE_SCORES: Record<string, number> = {
  menstrual: 55,
  renewal: 75,
  power: 90,
  clarity: 85,
  calm: 65,
};

const TAXING_SYMPTOMS = new Set([
  "cramps", "heavy_bleeding", "headache", "fatigue", "nausea",
  "bloating", "backpain", "mood_swings",
]);

export function calculateReadiness(input: ReadinessInput): ReadinessOutput {
  let score = 70; // default baseline
  const reasons: string[] = [];
  const reasonsAr: string[] = [];

  // 1. Cycle phase alignment (0–20 pts)
  if (input.cyclePhase) {
    const phaseBase = PHASE_BASE_SCORES[input.cyclePhase] ?? 70;
    const phaseBonus = Math.round((phaseBase - 70) * 0.2);
    score += phaseBonus;
    if (phaseBonus < 0) {
      reasons.push("Luteal/menstrual phase reduces peak capacity");
      reasonsAr.push("مرحلة الحيض/الطور الأصفر تقلل الطاقة القصوى");
    } else if (phaseBonus > 0) {
      reasons.push("Follicular/ovulation phase boosts power output");
      reasonsAr.push("مرحلة الجريب/التبويض تعزز القدرة على الأداء");
    }
  }

  // 2. Sleep quality (0–20 pts)
  if (input.sleepHours !== null) {
    if (input.sleepHours >= 8) {
      score += 10;
      reasons.push("Excellent sleep — full recovery");
      reasonsAr.push("نوم ممتاز — تعافٍ كامل");
    } else if (input.sleepHours >= 7) {
      score += 5;
    } else if (input.sleepHours < 6) {
      score -= 15;
      reasons.push("Under 6h sleep — performance will be impaired");
      reasonsAr.push("أقل من 6 ساعات نوم — الأداء سيتأثر");
    } else {
      score -= 5;
    }
  }

  // 3. HRV (0–15 pts)
  if (input.hrv !== null) {
    if (input.hrv >= 60) {
      score += 10;
      reasons.push("Strong HRV — nervous system well-recovered");
      reasonsAr.push("HRV قوي — الجهاز العصبي متعافٍ جيداً");
    } else if (input.hrv >= 40) {
      score += 5;
    } else {
      score -= 10;
      reasons.push("Low HRV — prioritize recovery today");
      reasonsAr.push("HRV منخفض — أولوية التعافي اليوم");
    }
  }

  // 4. Resting heart rate (0–10 pts)
  if (input.restingHeartRate !== null) {
    if (input.restingHeartRate <= 60) {
      score += 5;
    } else if (input.restingHeartRate >= 75) {
      score -= 8;
      reasons.push("Elevated RHR — possible fatigue or illness");
      reasonsAr.push("معدل ضربات القلب في ارتفاع — إرهاق محتمل");
    }
  }

  // 5. Symptoms penalty (0–20 pts)
  const taxingCount = input.symptoms.filter((s) => TAXING_SYMPTOMS.has(s)).length;
  if (taxingCount > 0) {
    const penalty = Math.min(20, taxingCount * 7);
    score -= penalty;
    reasons.push(`${taxingCount} active symptom(s) detected`);
    reasonsAr.push(`تم الكشف عن ${taxingCount} أعراض نشطة`);
  }

  // 6. Self-reported energy level (0–10 pts)
  if (input.energyLevel !== null) {
    const energyBonus = (input.energyLevel - 3) * 3;
    score += energyBonus;
    if (input.energyLevel <= 1) {
      reasons.push("Very low self-reported energy");
      reasonsAr.push("مستوى طاقة ذاتي منخفض جداً");
    }
  }

  // 7. Rest days (recovery benefit vs. detraining)
  if (input.daysSinceLastWorkout !== null) {
    if (input.daysSinceLastWorkout === 1) {
      score += 5;
      reasons.push("Optimal rest since last workout");
      reasonsAr.push("راحة مثالية منذ آخر تمرين");
    } else if (input.daysSinceLastWorkout >= 4) {
      score -= 3;
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Intensity modifier
  let intensityModifier = 1.0;
  if (score >= 80) intensityModifier = 1.1;
  else if (score >= 65) intensityModifier = 1.0;
  else if (score >= 50) intensityModifier = 0.85;
  else intensityModifier = 0.65;

  // Labels
  let label = "";
  let labelAr = "";
  let color = "";
  let recommendedFocus = "";
  let recommendedFocusAr = "";

  if (score >= 80) {
    label = "Peak Ready";
    labelAr = "جاهزة للذروة";
    color = "#22C55E";
    recommendedFocus = "Strength & high intensity";
    recommendedFocusAr = "قوة وكثافة عالية";
  } else if (score >= 65) {
    label = "Good to Train";
    labelAr = "جيدة للتدريب";
    color = "#3B82F6";
    recommendedFocus = "Moderate intensity training";
    recommendedFocusAr = "تدريب بكثافة معتدلة";
  } else if (score >= 50) {
    label = "Train Light";
    labelAr = "تدريب خفيف";
    color = "#F59E0B";
    recommendedFocus = "Mobility, light cardio, or yoga";
    recommendedFocusAr = "حركة، كارديو خفيف، أو يوغا";
  } else {
    label = "Rest & Recover";
    labelAr = "راحة وتعافٍ";
    color = "#EF4444";
    recommendedFocus = "Active recovery, stretching, or full rest";
    recommendedFocusAr = "تعافٍ نشط، تمدد، أو راحة كاملة";
  }

  return {
    score,
    intensityModifier,
    label,
    labelAr,
    color,
    recommendedFocus,
    recommendedFocusAr,
    reasons,
    reasonsAr,
  };
}
