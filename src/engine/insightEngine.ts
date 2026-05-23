export type SmartInsightInput = {
  readiness: number;

  emotionalState: string;
  cyclePhase?:
    | "menstrual"
    | "follicular"
    | "ovulation"
    | "luteal";

  symptoms?: string[];

  moodTrend: string;

  sleepHours: number;
  stressLevel: string;

  energyLevel: number;

  language?: "ar" | "en";
};

export function generateSmartInsight(
  input: SmartInsightInput
) {
  const {
    readiness,
    emotionalState,
    cyclePhase,
    symptoms = [],
    moodTrend,
    sleepHours,
    stressLevel,
    energyLevel,
    language = "en",
  } = input;

  const hasFatigue = symptoms.includes(
    "Fatigue"
  );

  const hasMoodSwing = symptoms.includes(
    "Mood Swing"
  );

  const hasCramps = symptoms.includes(
    "Cramps"
  );

  const isLowReadiness =
    readiness <= 45;

  const isHighReadiness =
    readiness >= 88;

  const isLowEnergy =
    energyLevel <= 35;

  const isHighEnergy =
    energyLevel >= 85;

  // EXTREME OVERWHELM
  if (
    stressLevel === "High" &&
    sleepHours <= 5
  ) {
    return language === "ar"
      ? "قد يكون جهازك العصبي بحاجة إلى هدوء أعمق اليوم. التباطؤ والراحة قد يكونان أكثر دعمًا لكِ الآن."
      : "Your nervous system may need deeper calm today. Slowing down and resting may feel more supportive right now.";
  }

  // LOW READINESS + LOW ENERGY
  if (
    isLowReadiness &&
    isLowEnergy
  ) {
    return language === "ar"
      ? "قد يحاول جسدك طلب مساحة أهدأ لإعادة شحن الطاقة واستعادة التوازن الداخلي."
      : "Your body may be asking for a softer space to restore energy and rebalance gently.";
  }

  // HIGH ENERGY + GOOD SLEEP
  if (
    isHighEnergy &&
    sleepHours >= 7
  ) {
    return language === "ar"
      ? "يبدو أن طاقتك أكثر استقرارًا اليوم، وقد يكون هذا وقتًا مناسبًا للحركة أو الإنجاز أو الإبداع."
      : "Your energy appears more stable today — this may be a supportive time for movement, creativity, or progress.";
  }

  // EMOTIONAL SENSITIVITY
  if (
    cyclePhase === "luteal" &&
    stressLevel === "Medium"
  ) {
    return language === "ar"
      ? "قد تكون مشاعرك أكثر حساسية خلال هذه المرحلة، لذلك قد يفيدك التعامل مع نفسك بلطف أكبر اليوم."
      : "Your emotions may feel more sensitive during this phase, so gentler self-support may feel more helpful today.";
  }

  // MENSTRUAL REST
  if (
    cyclePhase === "menstrual" &&
    sleepHours <= 6
  ) {
    return language === "ar"
      ? "قد يكون هذا الوقت أكثر ملاءمة للراحة والبطء وتقليل التحفيز الخارجي."
      : "This phase may feel more supportive for deeper rest, slower movement, and reduced stimulation.";
  }

  // HIGH STRESS
  if (stressLevel === "High") {
    return language === "ar"
      ? "يبدو أن الضغط لديكِ أعلى مؤخرًا. قد يكون التمهل وتقليل الحمل اليومي أكثر دعمًا لجسدك الآن."
      : "Your stress levels appear higher recently. Slowing down and reducing pressure may feel more supportive right now.";
  }

  // FATIGUE PATTERN
  if (hasFatigue && sleepHours <= 6) {
    return language === "ar"
      ? "إيقاعك يلاحظ تكرار الإرهاق مع قلة النوم. قد يكون التباطؤ والراحة العميقة أكثر دعمًا لكِ الآن."
      : "Eqa’a noticed fatigue repeating alongside lower sleep. Slowing down and deeper recovery may feel more supportive now.";
  }

  // LOW SLEEP
  if (sleepHours <= 5) {
    return language === "ar"
      ? "قد يحتاج جسدك إلى نوم أعمق وهدوء أكبر لاستعادة توازنك الداخلي."
      : "Your body may benefit from deeper sleep and gentler recovery to restore balance.";
  }

  // LUTEAL PHASE INSIGHT
  if (
    cyclePhase === "luteal" &&
    hasMoodSwing
  ) {
    return language === "ar"
      ? "قد تكون حساسية المشاعر أو التقلّبات أكثر وضوحًا خلال هذه المرحلة من إيقاعك."
      : "Emotional sensitivity may feel stronger during this phase of your rhythm.";
  }

  // MOMENTUM
  if (
    emotionalState === "Momentum" ||
    isHighReadiness
  ) {
    return language === "ar"
      ? "طاقتك الحالية قد تدعم الإنجاز والتركيز والحركة بثقة أكبر اليوم."
      : "Your current energy may support momentum, focus, and confident movement today.";
  }

  // OVULATION GLOW
  if (
    cyclePhase === "ovulation" &&
    energyLevel >= 75
  ) {
    return language === "ar"
      ? "طاقتك تبدو أكثر إشراقًا وتدفقًا اليوم، وكأن إيقاعك في حالة انسجام أقوى."
      : "Your energy feels brighter and more expressive today, as if your rhythm is moving in stronger alignment.";
  }

  // LOW ENERGY TREND
  if (moodTrend === "low_energy") {
    return language === "ar"
      ? "إيقاعك يشير إلى حاجة أعمق للراحة وإعادة شحن الطاقة خلال هذه الفترة."
      : "Your rhythm suggests a deeper need for rest and energy restoration lately.";
  }

  // HIGH STRESS TREND
  if (moodTrend === "stress_high") {
    return language === "ar"
      ? "لاحظ إيقاع تكرارًا في الضغط مؤخرًا. المساحات الهادئة قد تساعدكِ على العودة للتوازن."
      : "Eqa’a noticed repeated stress patterns recently. Quieter moments may help restore balance.";
  }

  // HIGH ENERGY
  if (isHighEnergy) {
    return language === "ar"
      ? "تبدو طاقتك أكثر وضوحًا اليوم، وقد يكون هذا وقتًا مناسبًا للحركة أو الإبداع أو الإنجاز."
      : "Your energy feels brighter today — this may be a supportive moment for movement, creativity, or progress.";
  }

  // MENSTRUAL RECOVERY
  if (
    cyclePhase === "menstrual" &&
    hasCramps
  ) {
    return language === "ar"
      ? "قد يحتاج جسدك اليوم إلى احتواء أهدأ ومساحة أكبر للراحة خلال هذه المرحلة."
      : "Your body may benefit from softer care and deeper rest during this phase.";
  }

  // RECOVERY
  if (emotionalState === "Recovery") {
    return language === "ar"
      ? "الاستعادة ليست تراجعًا… بل طريقة ذكية يعود بها جسدك إلى اتزانه الطبيعي."
      : "Recovery is not falling behind — it is your body returning wisely to balance.";
  }

  // BALANCED
  if (readiness >= 75) {
    return language === "ar"
      ? "إيقاعك يبدو أكثر توازنًا وهدوءًا اليوم. استمري بلطف مع نفسك."
      : "Your rhythm feels steadier and calmer today. Continue gently with yourself.";
  }

  // FOLLICULAR RESET
  if (cyclePhase === "follicular") {
    return language === "ar"
      ? "يبدو أن إيقاعك يدخل مرحلة أخف وأكثر مرونة، وقد تشعرين برغبة تدريجية في الحركة والبدايات الجديدة."
      : "Your rhythm appears to be entering a lighter and more flexible phase, with a gradual return of movement and fresh energy.";
  }

  // GENTLE RESET
  if (
    readiness >= 55 &&
    readiness <= 74
  ) {
    return language === "ar"
      ? "إيقاعك يبدو أكثر هدوءًا وتوازنًا اليوم، وقد يفيدك الاستمرار بوتيرة ألطف بدون ضغط زائد."
      : "Your rhythm feels steadier today, and a softer pace may support you better than pressure right now.";
  }

  // LOW MOTIVATION
  if (
    emotionalState === "Low" ||
    energyLevel <= 40
  ) {
    return language === "ar"
      ? "قد لا يحتاج يومك إلى إنجاز كبير… أحيانًا يكفي أن تمنحي نفسك احتواءً وهدوءًا أكثر."
      : "Your day may not need major productivity — sometimes softer care and calm are already enough.";
  }

  // DEFAULT
  return language === "ar"
    ? "حتى الإيقاع الهادئ يحمل داخله تقدمًا ونموًا صغيرًا كل يوم."
    : "Even softer rhythms still carry quiet progress every day.";
}