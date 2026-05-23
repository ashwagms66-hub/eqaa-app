export type RhythmPhase =
  | "power"
  | "manifestation"
  | "secondPower"
  | "nurture";

export type RhythmOutput = {
  phase: ReturnType<
    typeof getPhaseData
  >;

  titleEn: string;
  titleAr: string;

  readiness: number;

  insight: string;
  movement: string;
  nourishment: string;
  reflection: string;

  emotionalState: string;
  recoveryScore: number;
  rhythmLabel: string;
  adaptiveIntensity: string;
  nourishmentFocus: string;
  nervousSystemState: string;
};

export function getPhase(
  day: number
): RhythmPhase {
  if (day <= 10) {
    return "power";
  }

  if (day <= 15) {
    return "manifestation";
  }

  if (day <= 19) {
    return "secondPower";
  }

  return "nurture";
}

export function getPhaseData(
  phase: RhythmPhase
) {
  if (phase === "power") {
    return {
      key: "power",
      titleEn: "Power Phase",
      titleAr: "مرحلة القوة",
      color: "#E7C95F",
      fasting:
        "Some people may feel comfortable with slightly longer fasting windows during this phase.",
      reflection:
        "A gentle phase for rebuilding rhythm and focus.",
    };
  }

  if (phase === "manifestation") {
    return {
      key: "manifestation",
      titleEn:
        "Manifestation Phase",
      titleAr:
        "مرحلة التجلي",
      color: "#C7A6FF",
      fasting:
        "Lighter fasting windows may feel more balanced during this phase.",
      reflection:
        "Expression and openness may feel more natural.",
    };
  }

  if (phase === "secondPower") {
    return {
      key: "secondPower",
      titleEn:
        "Second Power Phase",
      titleAr:
        "مرحلة القوة الثانية",
      color: "#76A7FF",
      fasting:
        "Balanced fasting and nourishment may support consistency.",
      reflection:
        "Outward energy and momentum may increase.",
    };
  }

  return {
    key: "nurture",
    titleEn: "Nurture Phase",
    titleAr: "مرحلة الاحتواء",
    color: "#F3A6C6",
    fasting:
      "Gentler nourishment and slower rhythms may feel more supportive.",
    reflection:
      "A softer phase for slowing down and protecting energy.",
  };
}

export function generateRhythm(
  cycleDay: number,
  lifeMode?: string,
  sleepHours?: number,
  stressLevel?: string,
  energyLevel?: number
): RhythmOutput {
  const phaseKey =
    getPhase(cycleDay);

  const phase =
    getPhaseData(phaseKey);

  const readiness =
    calculateAdaptiveReadiness(
      phase.key,
      cycleDay,
      sleepHours,
      stressLevel,
      energyLevel,
      lifeMode
    );

  const adjustedInsight =
    getAdaptiveInsight(
      phase.key,
      lifeMode,
      cycleDay,
      stressLevel,
      sleepHours,
      energyLevel
    );

  return {
    phase,

    titleEn: phase.titleEn,
    titleAr: phase.titleAr,

    readiness,

    insight: adjustedInsight,

    movement:
      getMovementSuggestion(
        phase.key,
        lifeMode
      ),

    nourishment:
      getFoodSuggestion(
        phase.key,
        lifeMode
      ),

    reflection:
      getReflection(
        phase.key
      ),

    emotionalState:
      getEmotionalState(
        readiness,
        stressLevel
      ),

    recoveryScore:
      getRecoveryScore(
        sleepHours,
        stressLevel
      ),

    rhythmLabel:
      getRhythmLabel(readiness),

    adaptiveIntensity:
      getAdaptiveIntensity(
        readiness,
        stressLevel,
        energyLevel,
        lifeMode
      ),

    nourishmentFocus:
      getNourishmentFocus(
        phase.key,
        lifeMode,
        energyLevel
      ),

    nervousSystemState:
      getNervousSystemState(
        stressLevel,
        sleepHours,
        readiness
      ),
  };
}

function calculateReadiness(
  phase: string,
  day: number
) {
  if (phase === "power") {
    if (day <= 3) {
      return 72;
    }

    if (day <= 7) {
      return 82;
    }

    return 90;
  }

  if (phase === "manifestation") {
    return 92;
  }

  if (phase === "secondPower") {
    return 95;
  }

  return 76;
}

function calculateAdaptiveReadiness(
  phase: string,
  day: number,
  sleepHours?: number,
  stressLevel?: string,
  energyLevel?: number,
  lifeMode?: string
) {
  let score =
    calculateReadiness(
      phase,
      day
    );

  if (sleepHours !== undefined) {
    if (sleepHours >= 8.5) {
      score += 8;
    } else if (sleepHours >= 7) {
      score += 4;
    } else if (sleepHours <= 5) {
      score -= 14;
    } else if (sleepHours <= 6) {
      score -= 8;
    }
  }

  if (energyLevel !== undefined) {
    if (energyLevel >= 90) {
      score += 8;
    } else if (energyLevel >= 75) {
      score += 4;
    } else if (energyLevel <= 40) {
      score -= 12;
    } else if (energyLevel <= 55) {
      score -= 6;
    }
  }

  if (stressLevel === "High") {
    score -= 15;
  }

  if (stressLevel === "Medium") {
    score -= 5;
  }

  if (stressLevel === "Low") {
    score += 4;
  }

  if (lifeMode === "pregnancy") {
    score -= 8;

    if (
      sleepHours !== undefined &&
      sleepHours >= 8
    ) {
      score += 5;
    }
  }

  if (lifeMode === "postpartum") {
    score -= 14;

    if (stressLevel === "High") {
      score -= 6;
    }

    if (
      sleepHours !== undefined &&
      sleepHours <= 5
    ) {
      score -= 8;
    }
  }

  if (lifeMode === "pcos") {
    score -= 4;
  }

  if (
    phase === "nurture" &&
    stressLevel === "High"
  ) {
    score -= 5;
  }

  return Math.max(
    28,
    Math.min(score, 100)
  );
}

function getDynamicInsight(
  phase: string,
  day: number
) {
  if (phase === "power") {
    if (day <= 3) {
      return "A quieter reset may help support energy rebuilding.";
    }

    if (day <= 7) {
      return "Momentum may begin returning gradually.";
    }

    return "Focus and structure may feel more supportive now.";
  }

  if (phase === "manifestation") {
    return "Creativity and expression may feel more natural.";
  }

  if (phase === "secondPower") {
    return "Confidence and outward energy may feel elevated.";
  }

  return "Softer routines and slower evenings may feel grounding.";
}

function getAdaptiveInsight(
  phase: string,
  lifeMode?: string,
  cycleDay?: number,
  stressLevel?: string,
  sleepHours?: number,
  energyLevel?: number
) {
  if (stressLevel === "High") {
    return "A gentler pace and quieter recovery may feel more supportive today.";
  }

  if (
    sleepHours !== undefined &&
    sleepHours <= 5
  ) {
    return "Earlier rest and slower evenings may help restore emotional balance.";
  }

  if (
    energyLevel !== undefined &&
    energyLevel >= 90
  ) {
    return "Higher energy may support clarity, movement, and momentum today.";
  }

  return getLifeModeInsight(
    phase,
    lifeMode,
    cycleDay
  );
}

function getMovementSuggestion(
  phase: string,
  lifeMode?: string
) {
  if (lifeMode === "pregnancy") {
    return "Walking, stretching, pelvic mobility, and softer movement may feel more supportive.";
  }

  if (lifeMode === "postpartum") {
    return "Gentle recovery movement and slower routines may feel more supportive.";
  }

  if (lifeMode === "breastfeeding") {
    return "Lower intensity movement and recovery-focused sessions may support energy balance.";
  }

  if (phase === "power") {
    return "Walking, strength training, and gradual movement may feel supportive.";
  }

  if (phase === "manifestation") {
    return "Pilates, social movement, and creative workouts may feel energizing.";
  }

  if (phase === "secondPower") {
    return "Higher intensity movement may feel more natural.";
  }

  return "Stretching, yoga, and slower movement may support recovery.";
}

function getFoodSuggestion(
  phase: string,
  lifeMode?: string
) {
  if (lifeMode === "pregnancy") {
    return "Protein, iron, hydration, calcium, and softer balanced meals may feel supportive.";
  }

  if (lifeMode === "postpartum") {
    return "Hydration, recovery-focused nourishment, and balanced meals may support rebuilding energy.";
  }

  if (lifeMode === "breastfeeding") {
    return "Protein, hydration, omega-3, and energy-supportive meals may help maintain balance.";
  }

  if (phase === "power") {
    return "Protein, iron-rich meals, hydration, and balanced nourishment may support rebuilding.";
  }

  if (phase === "manifestation") {
    return "Fresh meals and lighter foods may feel supportive.";
  }

  if (phase === "secondPower") {
    return "Balanced carbs and protein may support energy consistency.";
  }

  return "Magnesium-rich foods and calming meals may feel grounding.";
}

function getReflection(
  phase: string
) {
  if (phase === "power") {
    return "A gentle phase for rebuilding rhythm and focus.";
  }

  if (phase === "manifestation") {
    return "Expression and openness may feel more natural.";
  }

  if (phase === "secondPower") {
    return "Outward energy and momentum may increase.";
  }

  return "A softer phase for slowing down and protecting energy.";
}

function getEmotionalState(
  readiness: number,
  stressLevel?: string
) {
  if (stressLevel === "High") {
    return "Recovery";
  }

  if (readiness >= 90) {
    return "Momentum";
  }

  if (readiness >= 75) {
    return "Balanced";
  }

  return "Softness";
}

function getRecoveryScore(
  sleepHours?: number,
  stressLevel?: string
) {
  let score = 78;

  if (sleepHours) {
    score += sleepHours;
  }

  if (stressLevel === "High") {
    score -= 12;
  }

  return Math.max(
    40,
    Math.min(score, 100)
  );
}

function getAdaptiveIntensity(
  readiness: number,
  stressLevel?: string,
  energyLevel?: number,
  lifeMode?: string
) {
  if (
    lifeMode === "pregnancy" ||
    lifeMode === "postpartum"
  ) {
    return "Gentle";
  }

  if (stressLevel === "High") {
    return "Slow";
  }

  if (
    energyLevel !== undefined &&
    energyLevel >= 85 &&
    readiness >= 88
  ) {
    return "High";
  }

  if (readiness >= 72) {
    return "Moderate";
  }

  return "Soft";
}

function getNourishmentFocus(
  phase: string,
  lifeMode?: string,
  energyLevel?: number
) {
  if (lifeMode === "pregnancy") {
    return "Protein • Iron • Hydration";
  }

  if (lifeMode === "postpartum") {
    return "Recovery • Minerals • Hydration";
  }

  if (
    energyLevel !== undefined &&
    energyLevel <= 45
  ) {
    return "Protein • Slow Carbs • Magnesium";
  }

  if (phase === "power") {
    return "Iron • Protein • Hydration";
  }

  if (phase === "manifestation") {
    return "Fresh Meals • Fiber • Water";
  }

  if (phase === "secondPower") {
    return "Balanced Carbs • Protein";
  }

  return "Magnesium • Warm Meals • Calm Nourishment";
}

function getNervousSystemState(
  stressLevel?: string,
  sleepHours?: number,
  readiness?: number
) {
  if (stressLevel === "High") {
    return "Overstimulated";
  }

  if (
    sleepHours !== undefined &&
    sleepHours <= 5
  ) {
    return "Depleted";
  }

  if (
    readiness !== undefined &&
    readiness >= 88
  ) {
    return "Regulated";
  }

  return "Balanced";
}

function getRhythmLabel(
  readiness: number
) {
  if (readiness >= 90) {
    return "Aligned";
  }

  if (readiness >= 75) {
    return "Balanced";
  }

  if (readiness >= 60) {
    return "Slower";
  }

  return "Recovery";
}

function getLifeModeInsight(
  phase: string,
  lifeMode?: string,
  cycleDay?: number
) {
  if (lifeMode === "pregnancy") {
    return "Rest, nourishment, and emotional softness may feel supportive during this phase.";
  }

  if (lifeMode === "postpartum") {
    return "Gentler routines, hydration, and slower recovery rhythms may feel supportive.";
  }

  if (lifeMode === "breastfeeding") {
    return "Balanced nourishment and softer pacing may support energy consistency.";
  }

  if (lifeMode === "flexible") {
    return "A softer rhythm and flexible routines may feel more supportive right now.";
  }

  return getDynamicInsight(
    phase,
    cycleDay || 1
  );
}