import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";
import type { BreathingExercise, EmotionSupportPlan } from "./types";

// ── Breathing exercises ───────────────────────────────────────────────────────

const BREATHING: BreathingExercise[] = [
  {
    nameEn: "Box Breathing",        nameAr: "التنفس المربع",
    instructionEn: "Inhale 4 · Hold 4 · Exhale 4 · Hold 4. Activates the parasympathetic system.",
    instructionAr: "شهيق 4 · توقف 4 · زفير 4 · توقف 4. ينشّط الجهاز السمبثاوي.",
    inSeconds: 4, holdSeconds: 4, outSeconds: 4, rounds: 6,
  },
  {
    nameEn: "4-7-8 Breathing",      nameAr: "تنفس 4-7-8",
    instructionEn: "Inhale 4 · Hold 7 · Exhale 8. Reduces cortisol and promotes calm.",
    instructionAr: "شهيق 4 · توقف 7 · زفير 8. يقلل الكورتيزول ويعزز الهدوء.",
    inSeconds: 4, holdSeconds: 7, outSeconds: 8, rounds: 4,
  },
  {
    nameEn: "Physiological Sigh",   nameAr: "التنهيدة الفسيولوجية",
    instructionEn: "Double inhale through the nose · Long slow exhale. Fastest stress reset.",
    instructionAr: "شهيقان مزدوجان من الأنف · زفير بطيء طويل. أسرع إعادة ضبط للإجهاد.",
    inSeconds: 2, holdSeconds: 0, outSeconds: 8, rounds: 5,
  },
  {
    nameEn: "Coherent Breathing",   nameAr: "التنفس المتوافق",
    instructionEn: "Inhale 5s · Exhale 5s. 6 breaths/min — heart rate variability training.",
    instructionAr: "شهيق 5 ثوانٍ · زفير 5 ثوانٍ. 6 أنفاس/دقيقة — تدريب HRV.",
    inSeconds: 5, holdSeconds: 0, outSeconds: 5, rounds: 8,
  },
  {
    nameEn: "Belly Breathing",      nameAr: "تنفس البطن",
    instructionEn: "Deep diaphragmatic breaths filling the belly. Grounding and calming.",
    instructionAr: "أنفاس حجابية عميقة تملأ البطن. تأريض ومهدئ.",
    inSeconds: 4, holdSeconds: 2, outSeconds: 6, rounds: 6,
  },
];

// ── Journal prompts ───────────────────────────────────────────────────────────

const JOURNAL_PROMPTS: Record<CyclePhaseKey, Array<{ en: string; ar: string }>> = {
  menstrual: [
    { en: "What does my body need most today, and how can I honour it without guilt?",
      ar: "ما الذي يحتاجه جسمي أكثر اليوم، وكيف أكرمه دون ذنب؟" },
    { en: "What am I ready to release from this past cycle?",
      ar: "ما الذي أنا مستعدة للتخلص منه من الدورة الماضية؟" },
    { en: "If rest were a form of success, what would I be proud of today?",
      ar: "لو كانت الراحة شكلاً من أشكال النجاح، بماذا سأفخر اليوم؟" },
  ],
  power: [
    { en: "What is one thing I want to build or start in this new cycle?",
      ar: "ما الشيء الواحد الذي أريد بناءه أو البدء به في هذه الدورة الجديدة؟" },
    { en: "Where am I feeling most alive right now, and how do I feed that energy?",
      ar: "أين أشعر بأكثر حيوية الآن، وكيف أغذي تلك الطاقة؟" },
    { en: "What does my best version of today look like?",
      ar: "كيف تبدو أفضل نسخة من يومي اليوم؟" },
  ],
  manifestation: [
    { en: "What am I most proud of in myself right now? Let it land fully.",
      ar: "ما الذي أفخر به في نفسي الآن أكثر؟ دعيه يستقر بالكامل." },
    { en: "Who needs my energy and insight today? How can I show up fully?",
      ar: "من يحتاج طاقتي وبصيرتي اليوم؟ كيف أحضر بالكامل؟" },
    { en: "What bold action have I been postponing that my body is ready for now?",
      ar: "ما الخطوة الجريئة التي أجّلتها وجسمي مستعد لها الآن؟" },
  ],
  secondPower: [
    { en: "What is truly important to me this week, beneath the noise?",
      ar: "ما الذي مهم حقاً لي هذا الأسبوع، تحت الضجيج؟" },
    { en: "What am I still holding onto that I could let go of today?",
      ar: "ما الذي لا أزال أتمسك به ويمكنني التخلي عنه اليوم؟" },
    { en: "Where do I feel most aligned between my inner world and outer actions?",
      ar: "أين أشعر بأكبر توافق بين عالمي الداخلي وأفعالي الخارجية؟" },
  ],
  reset: [
    { en: "What did this cycle teach me about what my body truly needs?",
      ar: "ماذا علّمتني هذه الدورة عما يحتاجه جسمي حقاً؟" },
    { en: "What negative self-talk visited me this week? What would I say to a friend instead?",
      ar: "ما حديث النفس السلبي الذي زارني هذا الأسبوع؟ ماذا سأقول لصديقة بدلاً من ذلك؟" },
    { en: "What small act of kindness can I give myself before bed tonight?",
      ar: "ما عمل الطيبة الصغير الذي يمكنني إعطاءه لنفسي قبل النوم الليلة؟" },
  ],
};

// ── Affirmations ──────────────────────────────────────────────────────────────

const AFFIRMATIONS: Record<CyclePhaseKey, Array<{ en: string; ar: string }>> = {
  menstrual: [
    { en: "Rest is not laziness — it is the foundation that makes everything else possible.",
      ar: "الراحة ليست كسلاً — إنها الأساس الذي يجعل كل شيء آخر ممكناً." },
    { en: "My body is doing sacred, necessary work. I trust it completely.",
      ar: "جسمي يقوم بعمل مقدس وضروري. أثق به تماماً." },
    { en: "Slowing down is an act of intelligence, not defeat.",
      ar: "التباطؤ هو فعل ذكاء، وليس هزيمة." },
  ],
  power: [
    { en: "I am building momentum. Every small action is compounding into something powerful.",
      ar: "أبني زخماً. كل فعل صغير يتراكم في شيء قوي." },
    { en: "My energy is rising. I am ready to grow.",
      ar: "طاقتي في ارتفاع. أنا مستعدة للنمو." },
    { en: "I have everything I need to make this a remarkable day.",
      ar: "لدي كل ما أحتاجه لجعل هذا يوماً رائعاً." },
  ],
  manifestation: [
    { en: "I am at my biological prime. I trust this peak and channel it with intention.",
      ar: "أنا في ذروتي البيولوجية. أثق بهذه الذروة وأوجّهها بنيّة." },
    { en: "My confidence is not arrogance — it is alignment.",
      ar: "ثقتي ليست غطرسة — إنها توافق." },
    { en: "I am magnetic, focused, and unstoppable today.",
      ar: "أنا ساحرة ومركّزة ولا يمكن إيقافي اليوم." },
  ],
  secondPower: [
    { en: "My precision and depth are my superpowers right now.",
      ar: "دقتي وعمقي هما قوتي الخارقة الآن." },
    { en: "I honour the quiet confidence that comes from knowing my own mind.",
      ar: "أكرم الثقة الهادئة التي تأتي من معرفة عقلي." },
    { en: "I don't need to perform energy I don't have. What I have is enough.",
      ar: "لا أحتاج أداء طاقة لا أملكها. ما لدي يكفي." },
  ],
  reset: [
    { en: "My sensitivity right now is not a weakness — it is deep wisdom asking to be heard.",
      ar: "حساسيتي الآن ليست ضعفاً — إنها حكمة عميقة تطلب أن تُسمع." },
    { en: "I am allowed to take up space, to feel, and to need.",
      ar: "يحق لي أن أشغل مكاناً وأن أشعر وأن أحتاج." },
    { en: "This discomfort is not permanent — it is my body completing a cycle of renewal.",
      ar: "هذا الانزعاج ليس دائماً — إنه جسمي يكمل دورة التجديد." },
  ],
};

// ── Walk suggestions ──────────────────────────────────────────────────────────

const WALKS: Record<CyclePhaseKey, { en: string; ar: string }> = {
  menstrual:    { en: "A slow 15-min walk in nature — no destination, no pace.", ar: "مشي بطيء 15 دقيقة في الطبيعة — بلا وجهة ولا سرعة." },
  power:        { en: "A brisk 20-min morning walk to amplify rising energy.", ar: "مشي سريع 20 دقيقة صباحاً لتضخيم الطاقة المتصاعدة." },
  manifestation:{ en: "A confident 25-min walk — use it to process your best ideas.", ar: "مشي واثق 25 دقيقة — استخدميه لمعالجة أفضل أفكاركِ." },
  secondPower:  { en: "A gentle 20-min evening walk after dinner to lower cortisol.", ar: "مشي لطيف 20 دقيقة مساءً بعد العشاء لخفض الكورتيزول." },
  reset:        { en: "A mindful 15-min walk without headphones — just breathe and notice.", ar: "مشي واعٍ 15 دقيقة بدون سماعات — تنفسي فقط ولاحظي." },
};

// ── Music moods ───────────────────────────────────────────────────────────────

const MUSIC_MOODS: Record<CyclePhaseKey, { en: string; ar: string }> = {
  menstrual:    { en: "Acoustic, ambient, or soft classical — low stimulation.", ar: "أكوستيك أو محيطي أو كلاسيكي هادئ — تحفيز منخفض." },
  power:        { en: "Upbeat pop or motivational playlist — let the energy build.", ar: "بوب حيوي أو قائمة تحفيزية — دعي الطاقة تتصاعد." },
  manifestation:{ en: "Anything that makes you feel confident and unstoppable.", ar: "أي شيء يجعلكِ تشعرين بالثقة ولا يمكن إيقافكِ." },
  secondPower:  { en: "Instrumental, lo-fi, or jazz — supports focused deep work.", ar: "موسيقى آلية أو لو-فاي أو جاز — يدعم العمل العميق المركّز." },
  reset:        { en: "Calming, nature sounds, or binaural beats — lowers cortisol.", ar: "مهدئ أو أصوات طبيعية أو نبضات ثنائية الأذن — يخفض الكورتيزول." },
};

// ── Meditation durations ──────────────────────────────────────────────────────

const MEDITATION_MINUTES: Record<CyclePhaseKey, number> = {
  menstrual: 15, power: 10, manifestation: 7, secondPower: 12, reset: 18,
};

// ── Public API ────────────────────────────────────────────────────────────────

function pickByDate<T>(arr: T[], date: string): T {
  const seed = date.split("-").reduce((s, n) => s + parseInt(n, 10), 0);
  return arr[seed % arr.length];
}

export function generateEmotionPlan(
  phaseKey: CyclePhaseKey,
  date: string
): EmotionSupportPlan {
  return {
    breathingExercise: pickByDate(BREATHING, date),
    journalPromptEn:   pickByDate(JOURNAL_PROMPTS[phaseKey], date).en,
    journalPromptAr:   pickByDate(JOURNAL_PROMPTS[phaseKey], date).ar,
    walkSuggestionEn:  WALKS[phaseKey].en,
    walkSuggestionAr:  WALKS[phaseKey].ar,
    musicMoodEn:       MUSIC_MOODS[phaseKey].en,
    musicMoodAr:       MUSIC_MOODS[phaseKey].ar,
    affirmationEn:     pickByDate(AFFIRMATIONS[phaseKey], date).en,
    affirmationAr:     pickByDate(AFFIRMATIONS[phaseKey], date).ar,
    meditationMinutes: MEDITATION_MINUTES[phaseKey],
  };
}
