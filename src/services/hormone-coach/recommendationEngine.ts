import type { CoachInput, CyclePhaseKey, DailyScores, Recommendation } from "./types";

// ── Category accent colours ────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  workout:    "#C6A7FF",
  nutrition:  "#22C55E",
  fasting:    "#F59E0B",
  hydration:  "#3B82F6",
  sleep:      "#8FD3FF",
  mood:       "#EC4899",
  focus:      "#FBBF24",
  supplement: "#6B7280",
};

// ── Rule tables (all copy lives here — no logic anywhere else) ────────────────

interface RuleSet {
  workout:    Record<CyclePhaseKey, Recommendation>;
  nutrition:  Record<CyclePhaseKey, Recommendation>;
  fasting:    Record<CyclePhaseKey, Recommendation>;
  hydration:  Record<CyclePhaseKey, Recommendation>;
  sleep:      Record<CyclePhaseKey, Recommendation>;
  mood:       Record<CyclePhaseKey, Recommendation>;
  focus:      Record<CyclePhaseKey, Recommendation>;
}

const PHASE_RULES: RuleSet = {
  // ── Workout ─────────────────────────────────────────────────────────────────
  workout: {
    menstrual: {
      id: "workout_menstrual", category: "workout", priority: "high",
      icon: "🧘‍♀️", accentColor: CAT_COLORS.workout,
      titleEn: "Gentle Movement Only",
      titleAr: "حركة لطيفة فقط",
      bodyEn:  "Yoga, walking, or light stretching. Skip weights and HIIT today.",
      bodyAr:  "يوغا أو المشي أو تمدد خفيف. تجنبي الأوزان وHIIT اليوم.",
      whyEn:   "Estrogen and progesterone are at their lowest. Prostaglandins driving menstruation elevate inflammation markers — high-intensity training now prolongs recovery and can worsen cramps.",
      whyAr:   "الإستروجين والبروجستيرون في أدنى مستوياتهما. البروستاغلاندينات ترفع علامات الالتهاب — التدريب عالي الكثافة الآن يطيل التعافي وقد يزيد التشنجات.",
    },
    power: {
      id: "workout_power", category: "workout", priority: "high",
      icon: "🏋️‍♀️", accentColor: CAT_COLORS.workout,
      titleEn: "Build Strength Now",
      titleAr: "ابني قوتكِ الآن",
      bodyEn:  "Compound lifts, progressive overload. Your body is ready to adapt and grow.",
      bodyAr:  "الحركات المركبة والحمل التدريجي. جسمكِ جاهز للتكيف والنمو.",
      whyEn:   "Rising estrogen improves muscle protein synthesis, pain tolerance, and insulin sensitivity. This is your anabolic window — tissue responds better to resistance training now than at any other phase.",
      whyAr:   "ارتفاع الإستروجين يحسن تخليق بروتين العضلات وتحمل الألم وحساسية الأنسولين. هذه نافذتكِ الابتنائية — الأنسجة تستجيب بشكل أفضل لتدريب المقاومة الآن أكثر من أي مرحلة أخرى.",
    },
    manifestation: {
      id: "workout_manifestation", category: "workout", priority: "high",
      icon: "🔥", accentColor: CAT_COLORS.workout,
      titleEn: "Chase Personal Records",
      titleAr: "استهدفي الأرقام القياسية",
      bodyEn:  "Max strength, HIIT, sprints. Your performance ceiling is at its highest.",
      bodyAr:  "أقصى قوة و HIIT وسباقات. سقف أدائكِ في أعلاه.",
      whyEn:   "Peak estrogen coincides with your highest VO2max potential, fastest reaction time, and greatest neuromuscular coordination. Multiple studies show PRs are most achievable in this window.",
      whyAr:   "ذروة الإستروجين تتزامن مع أعلى إمكانات VO2max وأسرع وقت رد فعل وأكبر تنسيق عصبي عضلي. دراسات متعددة تُظهر أن الأرقام القياسية أكثر قابلية للتحقيق في هذه النافذة.",
    },
    secondPower: {
      id: "workout_secondpower", category: "workout", priority: "medium",
      icon: "💪", accentColor: CAT_COLORS.workout,
      titleEn: "Moderate Intensity — Stay Consistent",
      titleAr: "كثافة معتدلة — حافظي على الثبات",
      bodyEn:  "Moderate weights or steady cardio. Avoid HIIT as body temperature is elevated.",
      bodyAr:  "أوزان معتدلة أو كارديو ثابت. تجنبي HIIT لأن درجة حرارة الجسم مرتفعة.",
      whyEn:   "Rising progesterone raises core body temperature by ~0.5°C, reducing heat dissipation efficiency. HIIT under this condition risks overheating. Moderate training still builds fitness without the thermal stress.",
      whyAr:   "ارتفاع البروجستيرون يرفع درجة حرارة الجسم الأساسية بـ ~0.5°C، مما يقلل كفاءة تبديد الحرارة. HIIT في هذه الحالة يُخاطر بالإفراط في السخونة. التدريب المعتدل لا يزال يبني اللياقة دون الإجهاد الحراري.",
    },
    reset: {
      id: "workout_reset", category: "workout", priority: "medium",
      icon: "🌿", accentColor: CAT_COLORS.workout,
      titleEn: "Low Impact & Restorative",
      titleAr: "منخفض التأثير وتصالحي",
      bodyEn:  "Walking, yoga, Pilates, or light mobility work. Honour the energy dip.",
      bodyAr:  "المشي أو اليوغا أو البيلاتس أو عمل الحركة الخفيف. أحترمي انخفاض الطاقة.",
      whyEn:   "Both estrogen and progesterone are withdrawing. This hormonal decline is a true biological signal to slow down. Over-training now blunts adaptation and increases cortisol — which worsens PMS symptoms.",
      whyAr:   "كل من الإستروجين والبروجستيرون ينسحبان. هذا الانخفاض الهرموني إشارة بيولوجية حقيقية للتباطؤ. الإفراط في التدريب الآن يضعف التكيف ويزيد الكورتيزول — مما يزيد أعراض PMS سوءاً.",
    },
  },

  // ── Nutrition ────────────────────────────────────────────────────────────────
  nutrition: {
    menstrual: {
      id: "nutrition_menstrual", category: "nutrition", priority: "high",
      icon: "🍖", accentColor: CAT_COLORS.nutrition,
      titleEn: "Iron-Rich Foods & Anti-Inflammatory Diet",
      titleAr: "أطعمة غنية بالحديد ونظام مضاد للالتهاب",
      bodyEn:  "Red meat, lentils, spinach, salmon, turmeric, ginger. Limit sugar and processed foods.",
      bodyAr:  "اللحم الأحمر والعدس والسبانخ والسلمون والكركم والزنجبيل. قللي السكر والأطعمة المعالجة.",
      whyEn:   "Menstrual blood loss depletes iron — replenishing it prevents fatigue and cognitive fog. Omega-3s and antioxidants directly counteract prostaglandin-driven inflammation, reducing cramp severity.",
      whyAr:   "فقدان دم الحيض يستنزف الحديد — إعادة تعبئته تمنع الإعياء والضباب الإدراكي. أوميغا-3 ومضادات الأكسدة تواجه التهاب البروستاغلاندين مباشرة، مما يقلل شدة التشنجات.",
    },
    power: {
      id: "nutrition_power", category: "nutrition", priority: "medium",
      icon: "🥩", accentColor: CAT_COLORS.nutrition,
      titleEn: "High Protein for Muscle Synthesis",
      titleAr: "بروتين عالٍ لتخليق العضلات",
      bodyEn:  "Target 1.8–2.2g protein per kg bodyweight. Eggs, chicken, Greek yogurt, legumes.",
      bodyAr:  "استهدفي 1.8–2.2غ بروتين لكل كغ وزن الجسم. بيض ودجاج وزبادي يوناني وبقوليات.",
      whyEn:   "Estrogen enhances muscle protein synthesis — a high-protein diet during this phase amplifies this effect. Your body literally builds muscle more efficiently now. Don't undereat protein.",
      whyAr:   "الإستروجين يعزز تخليق بروتين العضلات — نظام غذائي عالي البروتين خلال هذه المرحلة يُضاعف هذا التأثير. جسمكِ يبني العضلات بكفاءة أكبر الآن حرفياً. لا تقللي البروتين.",
    },
    manifestation: {
      id: "nutrition_manifestation", category: "nutrition", priority: "medium",
      icon: "🥗", accentColor: CAT_COLORS.nutrition,
      titleEn: "Clean Carbs + Lean Protein for Peak Output",
      titleAr: "كربوهيدرات نظيفة + بروتين نقي للأداء الأقصى",
      bodyEn:  "Complex carbs before training, lean protein after. Appetite may be naturally lower.",
      bodyAr:  "كربوهيدرات معقدة قبل التدريب وبروتين نقي بعده. الشهية قد تكون منخفضة بشكل طبيعي.",
      whyEn:   "Peak estrogen suppresses appetite slightly and improves insulin sensitivity, meaning your body processes carbohydrates more efficiently. Fuel your peak-performance workouts with quality carbs, not sugar.",
      whyAr:   "ذروة الإستروجين تثبط الشهية قليلاً وتحسن حساسية الأنسولين، مما يعني أن جسمكِ يعالج الكربوهيدرات بكفاءة أكبر. أمدي تمارين الأداء الأقصى بكربوهيدرات عالية الجودة، وليس سكراً.",
    },
    secondPower: {
      id: "nutrition_secondpower", category: "nutrition", priority: "medium",
      icon: "🫘", accentColor: CAT_COLORS.nutrition,
      titleEn: "Fibre + Magnesium to Support Progesterone",
      titleAr: "ألياف + ماغنيسيوم لدعم البروجستيرون",
      bodyEn:  "Sweet potato, oats, dark chocolate, almonds, leafy greens. Support progesterone metabolism.",
      bodyAr:  "بطاطا حلوة وشوفان وشوكولاتة داكنة ولوز وخضار ورقية. ادعمي استقلاب البروجستيرون.",
      whyEn:   "Progesterone increases appetite and carb cravings — fibre helps manage blood sugar spikes. Magnesium deficiency worsens PMS symptoms; it also supports the progesterone-to-calm neurotransmitter pathway.",
      whyAr:   "البروجستيرون يزيد الشهية وشهوة الكربوهيدرات — الألياف تساعد في إدارة ارتفاع سكر الدم. نقص المغنيسيوم يزيد أعراض PMS سوءاً؛ كما يدعم مسار البروجستيرون إلى الناقل العصبي المهدئ.",
    },
    reset: {
      id: "nutrition_reset", category: "nutrition", priority: "high",
      icon: "🍫", accentColor: CAT_COLORS.nutrition,
      titleEn: "Complex Carbs + Serotonin-Boosting Foods",
      titleAr: "كربوهيدرات معقدة + أطعمة معززة للسيروتونين",
      bodyEn:  "Oats, banana, dark chocolate, turkey, walnuts, pumpkin seeds. Don't fight the cravings — redirect them.",
      bodyAr:  "شوفان وموز وشوكولاتة داكنة وديك رومي وجوز وبذور اليقطين. لا تقاومي الرغبات — وجّهيها.",
      whyEn:   "Declining estrogen lowers serotonin, directly causing carb cravings — your brain is trying to self-medicate. Complex carbs trigger serotonin release without blood sugar spikes. Tryptophan-rich foods provide the raw material.",
      whyAr:   "انخفاض الإستروجين يخفض السيروتونين، مما يسبب مباشرة الرغبة في الكربوهيدرات — دماغكِ يحاول العلاج الذاتي. الكربوهيدرات المعقدة تطلق السيروتونين دون ارتفاع سكر الدم. الأطعمة الغنية بالتريبتوفان توفر المادة الخام.",
    },
  },

  // ── Fasting ──────────────────────────────────────────────────────────────────
  fasting: {
    menstrual: {
      id: "fasting_menstrual", category: "fasting", priority: "medium",
      icon: "⏰", accentColor: CAT_COLORS.fasting,
      titleEn: "Short Fast: 12–13 Hours",
      titleAr: "صيام قصير: 12–13 ساعة",
      bodyEn:  "Keep fasting windows gentle this week. Prioritise nourishment over restriction.",
      bodyAr:  "أبقي نوافذ الصيام لطيفة هذا الأسبوع. أعطي الأولوية للتغذية على القيود.",
      whyEn:   "Extended fasting during menstruation activates cortisol stress response, which amplifies prostaglandin activity and worsens cramps. A 12-hour overnight fast is enough to maintain metabolic benefits.",
      whyAr:   "الصيام الممتد أثناء الحيض ينشط استجابة إجهاد الكورتيزول، مما يضخم نشاط البروستاغلاندين ويزيد التشنجات سوءاً. صيام 12 ساعة بين عشية وضحاها كافٍ للحفاظ على الفوائد الأيضية.",
    },
    power: {
      id: "fasting_power", category: "fasting", priority: "medium",
      icon: "⚡", accentColor: CAT_COLORS.fasting,
      titleEn: "13–16 Hour Fast for Autophagy",
      titleAr: "صيام 13–16 ساعة لتفعيل الالتهام الذاتي",
      bodyEn:  "Aim for 14:10 or 16:8. Your body tolerates fasting better as estrogen rises.",
      bodyAr:  "استهدفي 14:10 أو 16:8. جسمكِ يتحمل الصيام بشكل أفضل مع ارتفاع الإستروجين.",
      whyEn:   "Rising estrogen improves insulin sensitivity and stabilises blood glucose during fasting periods — fewer hunger pangs, better fat oxidation, and easier metabolic switching than during the luteal phase.",
      whyAr:   "ارتفاع الإستروجين يحسن حساسية الأنسولين ويستقر جلوكوز الدم خلال فترات الصيام — نوبات جوع أقل وأكسدة دهون أفضل وتحويل أيضي أسهل مقارنة بالمرحلة الأصفرية.",
    },
    manifestation: {
      id: "fasting_manifestation", category: "fasting", priority: "medium",
      icon: "🌟", accentColor: CAT_COLORS.fasting,
      titleEn: "16–18 Hours for Peak Metabolic Effect",
      titleAr: "16–18 ساعة للتأثير الأيضي الأقصى",
      bodyEn:  "Your peak fasting window. Insulin sensitivity is at its best — maximise autophagy.",
      bodyAr:  "نافذة الصيام الأقصى لديكِ. حساسية الأنسولين في أفضلها — عظّمي الالتهام الذاتي.",
      whyEn:   "Peak estrogen maximises insulin sensitivity, meaning your cells respond exceptionally well to fasting. Blood glucose remains stable without strong hunger signals — an ideal metabolic state for fat oxidation and cellular cleanup.",
      whyAr:   "ذروة الإستروجين تُعظم حساسية الأنسولين، مما يعني أن خلاياكِ تستجيب بشكل استثنائي للصيام. يبقى جلوكوز الدم مستقراً دون إشارات جوع قوية — حالة أيضية مثالية لأكسدة الدهون والتنظيف الخلوي.",
    },
    secondPower: {
      id: "fasting_secondpower", category: "fasting", priority: "medium",
      icon: "⏱️", accentColor: CAT_COLORS.fasting,
      titleEn: "14–16 Hours — Listen to Hunger",
      titleAr: "14–16 ساعة — استمعي للجوع",
      bodyEn:  "Standard 16:8 works but extend if hunger is strong. Don't force it this week.",
      bodyAr:  "16:8 القياسي يعمل لكن مدّيه إذا كان الجوع قوياً. لا تجبري الأمر هذا الأسبوع.",
      whyEn:   "Progesterone increases appetite and slightly reduces the blood glucose benefits of fasting compared to the follicular phase. Forcing extreme fasts here increases cortisol, worsening mood and energy.",
      whyAr:   "البروجستيرون يزيد الشهية ويقلل قليلاً من فوائد جلوكوز الدم للصيام مقارنة بالمرحلة الجريبية. إجبار الصيام الشديد هنا يزيد الكورتيزول، مما يزيد المزاج والطاقة سوءاً.",
    },
    reset: {
      id: "fasting_reset", category: "fasting", priority: "high",
      icon: "🍽️", accentColor: CAT_COLORS.fasting,
      titleEn: "12–14 Hours — Nourish Over Restrict",
      titleAr: "12–14 ساعة — أعطي الأولوية للتغذية",
      bodyEn:  "Cravings are highest now. A gentle fast prevents metabolic stress while satisfying hunger.",
      bodyAr:  "الرغبات في أعلاها الآن. الصيام اللطيف يمنع الإجهاد الأيضي مع إشباع الجوع.",
      whyEn:   "Declining estrogen and progesterone reduce the body's ability to handle extended fasting. Cortisol rises faster when food-deprived this week, amplifying PMS. A 12-14 hour overnight fast maintains rhythm without hormonal disruption.",
      whyAr:   "انخفاض الإستروجين والبروجستيرون يقلل قدرة الجسم على تحمل الصيام الممتد. يرتفع الكورتيزول بشكل أسرع عند الحرمان من الطعام هذا الأسبوع، مما يضخم PMS. الصيام 12–14 ساعة بين عشية وضحاها يحافظ على الإيقاع دون اضطراب هرموني.",
    },
  },

  // ── Hydration ─────────────────────────────────────────────────────────────────
  hydration: {
    menstrual: {
      id: "hydration_menstrual", category: "hydration", priority: "medium",
      icon: "💧", accentColor: CAT_COLORS.hydration,
      titleEn: "2.5–3L Daily — Add Electrolytes",
      titleAr: "2.5–3 ليتر يومياً — أضيفي الإلكتروليتات",
      bodyEn:  "Add a pinch of sea salt or electrolyte supplement to water. Warm herbal teas count.",
      bodyAr:  "أضيفي قرصة ملح البحر أو مكمل إلكتروليت للماء. شاي الأعشاب الدافئ يُحسب.",
      whyEn:   "Prostaglandins affect the kidneys' sodium balance. Iron loss through bleeding also requires electrolyte support. Dehydration worsens cramps by increasing prostaglandin concentration in uterine tissue.",
      whyAr:   "البروستاغلاندينات تؤثر على توازن الصوديوم في الكلى. فقدان الحديد من خلال النزيف يتطلب أيضاً دعم الإلكتروليت. الجفاف يزيد التشنجات بزيادة تركيز البروستاغلاندين في أنسجة الرحم.",
    },
    power: {
      id: "hydration_power", category: "hydration", priority: "low",
      icon: "🥤", accentColor: CAT_COLORS.hydration,
      titleEn: "2–2.5L — Standard Hydration",
      titleAr: "2–2.5 ليتر — ترطيب قياسي",
      bodyEn:  "Standard 8-glass target. Extra if training hard. Coffee and green tea count partially.",
      bodyAr:  "هدف 8 أكواب القياسي. إضافي إذا كان التدريب مكثفاً. القهوة والشاي الأخضر تُحسب جزئياً.",
      whyEn:   "Estrogen has a mild fluid-retaining effect and body temperature is closer to baseline. Normal hydration is sufficient, with increases on training days to support performance and protein synthesis.",
      whyAr:   "الإستروجين له تأثير طفيف في الاحتفاظ بالسوائل ودرجة حرارة الجسم أقرب إلى الخط الأساسي. الترطيب الطبيعي كافٍ، مع زيادات في أيام التدريب لدعم الأداء وتخليق البروتين.",
    },
    manifestation: {
      id: "hydration_manifestation", category: "hydration", priority: "low",
      icon: "💧", accentColor: CAT_COLORS.hydration,
      titleEn: "2–2.5L — Maintain Performance Hydration",
      titleAr: "2–2.5 ليتر — حافظي على ترطيب الأداء",
      bodyEn:  "Sip water consistently during peak-intensity workouts. Cold water helps performance in heat.",
      bodyAr:  "اشربي الماء باستمرار خلال التمارين عالية الكثافة. الماء البارد يساعد الأداء في الحرارة.",
      whyEn:   "During peak estrogen, cardiac output is highest and you sweat more during intense sessions. Consistent hydration prevents a performance decline of up to 3% caused by even mild dehydration.",
      whyAr:   "خلال ذروة الإستروجين، يكون الناتج القلبي في أعلاه وتتعرقين أكثر خلال الجلسات المكثفة. الترطيب المستمر يمنع انخفاض الأداء بنسبة تصل إلى 3٪ الناتج عن حتى الجفاف الخفيف.",
    },
    secondPower: {
      id: "hydration_secondpower", category: "hydration", priority: "high",
      icon: "🚰", accentColor: CAT_COLORS.hydration,
      titleEn: "3L+ — Critical for Temperature Control",
      titleAr: "3 ليتر+ — حاسم للتحكم في درجة الحرارة",
      bodyEn:  "Increase intake by 20–30%. Carry a water bottle everywhere. Hydrate before you feel thirsty.",
      bodyAr:  "زيدي المدخول بنسبة 20–30٪. احملي زجاجة ماء في كل مكان. اشربي قبل أن تشعري بالعطش.",
      whyEn:   "Progesterone elevates core body temperature, increasing sweat rate and fluid requirements. Thirst sensation can be blunted during this phase — you are likely already dehydrated when you feel thirsty.",
      whyAr:   "البروجستيرون يرفع درجة حرارة الجسم الأساسية، مما يزيد معدل التعرق ومتطلبات السوائل. يمكن أن يكون الإحساس بالعطش مثبطاً خلال هذه المرحلة — من المحتمل أنكِ تعانين بالفعل من جفاف خفيف عندما تشعرين بالعطش.",
    },
    reset: {
      id: "hydration_reset", category: "hydration", priority: "medium",
      icon: "🫗", accentColor: CAT_COLORS.hydration,
      titleEn: "2.5–3L — Combat Bloating with Consistent Sipping",
      titleAr: "2.5–3 ليتر — قاومي الانتفاخ بالشرب المستمر",
      bodyEn:  "Reduce salt. Increase herbal teas (dandelion, ginger, chamomile) to reduce bloating.',",
      bodyAr:  "قللي الملح. زيدي شاي الأعشاب (الهندباء والزنجبيل والبابونج) لتقليل الانتفاخ.",
      whyEn:   "Declining hormones cause water retention and bloating. Paradoxically, drinking more water signals the kidneys to flush excess sodium. Dandelion tea is a natural diuretic that relieves PMS bloating.",
      whyAr:   "انخفاض الهرمونات يسبب احتباس الماء والانتفاخ. على العكس من ذلك، شرب المزيد من الماء يشير للكلى بطرد الصوديوم الزائد. شاي الهندباء مدر بولي طبيعي يخفف انتفاخ PMS.",
    },
  },

  // ── Sleep ─────────────────────────────────────────────────────────────────────
  sleep: {
    menstrual: {
      id: "sleep_menstrual", category: "sleep", priority: "high",
      icon: "😴", accentColor: CAT_COLORS.sleep,
      titleEn: "8–9 Hours — Deep Restorative Sleep",
      titleAr: "8–9 ساعات — نوم تصالحي عميق",
      bodyEn:  "Sleep is the most important recovery tool this week. Don't fight early sleepiness.",
      bodyAr:  "النوم هو أهم أداة تعافٍ هذا الأسبوع. لا تقاومي النعاس المبكر.",
      whyEn:   "Low estrogen shortens deep sleep stages (SWS and REM). The body compensates by increasing total sleep duration. Respecting this biological drive accelerates tissue repair and immune function during menstruation.",
      whyAr:   "انخفاض الإستروجين يقصّر مراحل النوم العميق (SWS وREM). يعوّض الجسم بزيادة مدة النوم الإجمالية. احترام هذا الدافع البيولوجي يُسرّع إصلاح الأنسجة ووظيفة المناعة أثناء الحيض.",
    },
    power: {
      id: "sleep_power", category: "sleep", priority: "low",
      icon: "🌙", accentColor: CAT_COLORS.sleep,
      titleEn: "7–8 Hours — Protect Deep Sleep",
      titleAr: "7–8 ساعات — احمي النوم العميق",
      bodyEn:  "Consistent bedtime matters more than duration. Rise at the same time daily.',",
      bodyAr:  "الثبات في وقت النوم أهم من المدة. استيقظي في نفس الوقت يومياً.",
      whyEn:   "Rising estrogen increases slow-wave sleep quality — you get more restorative sleep per hour. This phase naturally shortens sleep need slightly. Maintain consistent timing to anchor your circadian rhythm.",
      whyAr:   "ارتفاع الإستروجين يحسن جودة نوم موجة بطيئة — تحصلين على نوم تصالحي أكثر في الساعة. هذه المرحلة تُقصّر الحاجة للنوم طفيفاً بشكل طبيعي. حافظي على توقيت ثابت لتأصيل إيقاعكِ اليومي.",
    },
    manifestation: {
      id: "sleep_manifestation", category: "sleep", priority: "low",
      icon: "✨", accentColor: CAT_COLORS.sleep,
      titleEn: "7 Hours — Quality Over Quantity",
      titleAr: "7 ساعات — الجودة على الكمية",
      bodyEn:  "You may feel you need less sleep this week — that's normal. Don't force more.',",
      bodyAr:  "قد تشعرين أنكِ تحتاجين نوماً أقل هذا الأسبوع — هذا طبيعي. لا تجبري أكثر.",
      whyEn:   "Peak estrogen reduces the sleep debt accumulated per hour awake — meaning you need fewer hours to feel fully rested. This is an evolutionary advantage for high-output activity. Enjoy the energy.",
      whyAr:   "ذروة الإستروجين تقلل ديون النوم المتراكمة في الساعة اليقظة — مما يعني أنكِ تحتاجين ساعات أقل للشعور بالراحة الكاملة. هذه ميزة تطورية للنشاط عالي الإنتاج. استمتعي بالطاقة.",
    },
    secondPower: {
      id: "sleep_secondpower", category: "sleep", priority: "medium",
      icon: "🌙", accentColor: CAT_COLORS.sleep,
      titleEn: "7.5–8 Hours — Watch for Sleep Disruption",
      titleAr: "7.5–8 ساعات — انتبهي لاضطرابات النوم",
      bodyEn:  "Rising body temperature may cause night waking. Keep the room cool (18–20°C).',",
      bodyAr:  "ارتفاع درجة حرارة الجسم قد يسبب الاستيقاظ ليلاً. أبقي الغرفة باردة (18–20°C).",
      whyEn:   "Elevated progesterone raises core temperature, disrupting thermoregulation during sleep. A cool room compensates by accelerating heat dissipation, improving sleep architecture and reducing nighttime waking.",
      whyAr:   "البروجستيرون المرتفع يرفع درجة الحرارة الأساسية، مما يعطل تنظيم الحرارة أثناء النوم. تعوّض الغرفة الباردة بتسريع تبديد الحرارة، محسّنةً بنية النوم ومقللةً الاستيقاظ الليلي.",
    },
    reset: {
      id: "sleep_reset", category: "sleep", priority: "high",
      icon: "💤", accentColor: CAT_COLORS.sleep,
      titleEn: "8–9 Hours — PMS Sleep Support",
      titleAr: "8–9 ساعات — دعم نوم PMS",
      bodyEn:  "Avoid screens 1 hour before bed. Magnesium glycinate before sleep helps profoundly.',",
      bodyAr:  "تجنبي الشاشات ساعة قبل النوم. الجليسينات المغنيسيوم قبل النوم يساعد بعمق.",
      whyEn:   "Declining progesterone reduces GABA activity (the brain's calm neurotransmitter), causing lighter, more fragmented sleep. Magnesium glycinate restores GABA activity, dramatically improving sleep depth and PMS mood symptoms.",
      whyAr:   "انخفاض البروجستيرون يقلل نشاط GABA (الناقل العصبي المهدئ للدماغ)، مسبباً نوماً أخف وأكثر تقطعاً. جليسينات المغنيسيوم يستعيد نشاط GABA، محسّناً بشكل درامي عمق النوم وأعراض PMS المزاجية.",
    },
  },

  // ── Mood ─────────────────────────────────────────────────────────────────────
  mood: {
    menstrual: {
      id: "mood_menstrual", category: "mood", priority: "high",
      icon: "🌸", accentColor: CAT_COLORS.mood,
      titleEn: "Honour Introspection — Set Gentle Boundaries",
      titleAr: "احترمي التأمل الداخلي — ضعي حدوداً لطيفة",
      bodyEn:  "Reduce social obligations. Journaling, warm baths, creative rest.",
      bodyAr:  "قللي الالتزامات الاجتماعية. التدوين والحمام الدافئ والراحة الإبداعية.",
      whyEn:   "Low estrogen and progesterone reduce serotonin, dopamine, and GABA — the trifecta of mood regulation. This is a biological signal for inward reflection, not a character flaw. Protect your energy.",
      whyAr:   "انخفاض الإستروجين والبروجستيرون يقلل السيروتونين والدوبامين وGABA — ثلاثي تنظيم المزاج. هذه إشارة بيولوجية للتأمل الداخلي، وليست عيباً في الشخصية. احمي طاقتكِ.",
    },
    power: {
      id: "mood_power", category: "mood", priority: "low",
      icon: "😊", accentColor: CAT_COLORS.mood,
      titleEn: "Embrace the Rising Social Drive",
      titleAr: "احتضني الدافع الاجتماعي المتصاعد",
      bodyEn:  "Great time for connection, new projects, and building on momentum.',",
      bodyAr:  "وقت رائع للتواصل والمشاريع الجديدة والبناء على الزخم.",
      whyEn:   "Rising estrogen increases dopamine and serotonin, making you naturally more sociable, optimistic, and motivated. Harness this biological boost for relationship-building and goal-setting.",
      whyAr:   "ارتفاع الإستروجين يزيد الدوبامين والسيروتونين، مما يجعلكِ بشكل طبيعي أكثر اجتماعية وتفاؤلاً وتحفزاً. استغلي هذه الدفعة البيولوجية لبناء العلاقات وتحديد الأهداف.",
    },
    manifestation: {
      id: "mood_manifestation", category: "mood", priority: "low",
      icon: "🌟", accentColor: CAT_COLORS.mood,
      titleEn: "Confidence is at Its Peak — Own It",
      titleAr: "الثقة في ذروتها — امتلكيها",
      bodyEn:  "Initiate difficult conversations, make decisions, network. This is your power window.',",
      bodyAr:  "ابدئي المحادثات الصعبة واتخذي القرارات وابني شبكتكِ. هذه نافذة قوتكِ.",
      whyEn:   "Peak estrogen boosts dopamine receptors and oxytocin sensitivity. Research confirms communication skills, empathy, and emotional intelligence are measurably heightened around ovulation.",
      whyAr:   "ذروة الإستروجين تعزز مستقبلات الدوبامين وحساسية الأوكسيتوسين. تؤكد الأبحاث أن مهارات التواصل والتعاطف والذكاء العاطفي ترتفع بشكل ملحوظ حول التبويض.",
    },
    secondPower: {
      id: "mood_secondpower", category: "mood", priority: "medium",
      icon: "🧘‍♀️", accentColor: CAT_COLORS.mood,
      titleEn: "Settle Into Focused Calm",
      titleAr: "استقري في الهدوء المركّز",
      bodyEn:  "Productive solo work, creativity, and depth over breadth.',",
      bodyAr:  "عمل منفرد منتج وإبداع والعمق على الاتساع.",
      whyEn:   "Progesterone has mild sedating properties via GABA pathways, which reduces external social drive while enhancing focus. Many women find their most productive deep-work periods here.",
      whyAr:   "البروجستيرون له خصائص تخدير خفيفة عبر مسارات GABA، مما يقلل الدافع الاجتماعي الخارجي مع تعزيز التركيز. تجد كثير من النساء أكثر فترات العمل العميق إنتاجاً هنا.",
    },
    reset: {
      id: "mood_reset", category: "mood", priority: "high",
      icon: "💙", accentColor: CAT_COLORS.mood,
      titleEn: "Protect Emotional Space — Limit Stressors",
      titleAr: "احمي الفضاء العاطفي — قللي المسببات",
      bodyEn:  "Reduce commitments. Avoid major decisions if possible. Self-compassion over productivity.',",
      bodyAr:  "قللي الالتزامات. تجنبي القرارات الكبرى إن أمكن. الرحمة الذاتية على الإنتاجية.",
      whyEn:   "PMS-related mood sensitivity is driven by GABA withdrawal as progesterone falls. The amygdala (emotional alarm centre) becomes hyperreactive. This is not emotional weakness — it is measurable neurochemistry. Reduce inputs, not yourself.",
      whyAr:   "حساسية المزاج المرتبطة بـPMS مدفوعة بانسحاب GABA مع انخفاض البروجستيرون. تصبح اللوزة الدماغية (مركز الإنذار العاطفي) مفرطة التفاعل. هذا ليس ضعفاً عاطفياً — بل كيمياء عصبية قابلة للقياس. قللي المدخلات، وليس نفسكِ.",
    },
  },

  // ── Focus ─────────────────────────────────────────────────────────────────────
  focus: {
    menstrual: {
      id: "focus_menstrual", category: "focus", priority: "medium",
      icon: "🧠", accentColor: CAT_COLORS.focus,
      titleEn: "Light Cognitive Work Only",
      titleAr: "عمل إدراكي خفيف فقط",
      bodyEn:  "Reading, reflection, planning. Avoid deadline-heavy tasks if you can.',",
      bodyAr:  "القراءة والتأمل والتخطيط. تجنبي المهام ذات المواعيد النهائية الثقيلة إن أمكن.",
      whyEn:   "Low estrogen reduces the availability of acetylcholine and dopamine in the prefrontal cortex, impairing working memory and executive function. Intuitive and creative thinking remains intact — use that instead.",
      whyAr:   "انخفاض الإستروجين يقلل توافر الأستيلكولين والدوبامين في قشرة الفص الجبهي، مما يضعف ذاكرة العمل والوظيفة التنفيذية. التفكير الحدسي والإبداعي لا يزال سليماً — استخدميه بدلاً من ذلك.",
    },
    power: {
      id: "focus_power", category: "focus", priority: "medium",
      icon: "⚡", accentColor: CAT_COLORS.focus,
      titleEn: "Tackle Learning & Complex Projects",
      titleAr: "تعاملي مع التعلم والمشاريع المعقدة",
      bodyEn:  "Schedule your hardest cognitive tasks in the morning. Memory consolidation is strong.',",
      bodyAr:  "جدولي أصعب مهامكِ الإدراكية في الصباح. تعزيز الذاكرة قوي.",
      whyEn:   "Rising estrogen increases brain-derived neurotrophic factor (BDNF), literally growing new neural connections. Verbal fluency and declarative memory improve measurably this week.",
      whyAr:   "ارتفاع الإستروجين يزيد العامل العصبي التغذوي المشتق من الدماغ (BDNF)، مما يُنمّي حرفياً توصيلات عصبية جديدة. تتحسن الطلاقة اللفظية والذاكرة التصريحية بشكل ملحوظ هذا الأسبوع.",
    },
    manifestation: {
      id: "focus_manifestation", category: "focus", priority: "high",
      icon: "🎯", accentColor: CAT_COLORS.focus,
      titleEn: "Peak Cognitive Week — Schedule Your Best Work',",
      titleAr: "أسبوع الإدراك الأقصى — جدولي أفضل أعمالكِ',",
      bodyEn:  "Presentations, negotiations, exams, launches. Your verbal and spatial memory peak here.',",
      bodyAr:  "العروض والمفاوضات والامتحانات والإطلاقات. ذاكرتكِ اللفظية والمكانية في ذروتها هنا.",
      whyEn:   "Simultaneous peak of estrogen, dopamine, serotonin, and testosterone (yes, women produce testosterone too) creates the optimal neurochemical state for high-stakes performance. Use it.",
      whyAr:   "ذروة متزامنة للإستروجين والدوبامين والسيروتونين والتستوستيرون (نعم، النساء ينتجن التستوستيرون أيضاً) تخلق الحالة الكيميائية العصبية المثلى للأداء عالي المخاطر. استخدميها.",
    },
    secondPower: {
      id: "focus_secondpower", category: "focus", priority: "medium",
      icon: "🔍", accentColor: CAT_COLORS.focus,
      titleEn: "Detail-Oriented Deep Work',",
      titleAr: "عمل عميق موجّه للتفاصيل',",
      bodyEn:  "Analysis, editing, refinement. Your focus narrows inward — use it for precision work.',",
      bodyAr:  "التحليل والتحرير والتنقيح. تركيزكِ يضيق للداخل — استخدميه للعمل الدقيق.",
      whyEn:   "Progesterone's GABA effect reduces distractibility and supports sustained, narrow attention. This is less ideal for big-picture brainstorming but excellent for detailed editing, coding, or analysis.",
      whyAr:   "تأثير GABA للبروجستيرون يقلل قابلية الإلهاء ويدعم الانتباه الضيق المستدام. هذا أقل مثالية للعصف الذهني الشامل لكنه ممتاز للتحرير التفصيلي أو البرمجة أو التحليل.",
    },
    reset: {
      id: "focus_reset", category: "focus", priority: "medium",
      icon: "📝", accentColor: CAT_COLORS.focus,
      titleEn: "Intuition & Reflection — Not Execution',",
      titleAr: "الحدس والتأمل — وليس التنفيذ',",
      bodyEn:  "Journal, plan the next cycle, reflect. Inner wisdom is strongest now.',",
      bodyAr:  "دوّني، خططي للدورة القادمة، تأملي. الحكمة الداخلية في أقوى حالاتها الآن.",
      whyEn:   "As the cycle completes, the brain shifts from analytical left-hemisphere dominance toward right-hemisphere integration. This boosts intuition, pattern recognition, and self-awareness — valuable cognitive modes that analytical thinking often suppresses.",
      whyAr:   "مع اكتمال الدورة، ينتقل الدماغ من هيمنة نصف الكرة الأيسر التحليلي نحو تكامل نصف الكرة الأيمن. هذا يعزز الحدس والتعرف على الأنماط والوعي الذاتي — أوضاع معرفية قيّمة كثيراً ما يكبتها التفكير التحليلي.",
    },
  },
};

// ── Override rules based on biometrics ────────────────────────────────────────

function applyBiometricOverrides(
  recs: Recommendation[],
  input: CoachInput,
  scores: DailyScores
): Recommendation[] {
  return recs.map((rec) => {
    // If sleep is poor, escalate sleep rec priority
    if (rec.category === "sleep" && input.sleepHours !== null && input.sleepHours < 6) {
      return { ...rec, priority: "high" as const };
    }
    // If HRV is low, escalate recovery/workout to deload
    if (rec.category === "workout" && input.hrv !== null && input.hrv < 25 && rec.priority !== "high") {
      return {
        ...rec,
        priority: "high" as const,
        titleEn: "Deload Day — HRV Alert",
        titleAr: "يوم تخفيف — تنبيه HRV",
        bodyEn: "Your HRV is low, signaling under-recovery. Rest or light movement only.',",
        bodyAr: "HRV منخفض، يشير إلى نقص التعافي. راحة أو حركة خفيفة فقط.",
        whyEn: "Low HRV indicates your autonomic nervous system hasn't recovered from prior training stress. Training hard on a low-HRV day reduces gains and increases injury risk.",
        whyAr: "انخفاض HRV يشير إلى أن جهازكِ العصبي اللاإرادي لم يتعافَ من إجهاد التدريب السابق. التدريب الشاق في يوم انخفاض HRV يقلل المكاسب ويزيد خطر الإصابة.",
      };
    }
    return rec;
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateRecommendations(
  input: CoachInput,
  scores: DailyScores
): Recommendation[] {
  const phase = input.phaseKey;
  const base: Recommendation[] = [
    PHASE_RULES.workout[phase],
    PHASE_RULES.nutrition[phase],
    PHASE_RULES.fasting[phase],
    PHASE_RULES.hydration[phase],
    PHASE_RULES.sleep[phase],
    PHASE_RULES.mood[phase],
    PHASE_RULES.focus[phase],
  ];

  return applyBiometricOverrides(base, input, scores)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
}
