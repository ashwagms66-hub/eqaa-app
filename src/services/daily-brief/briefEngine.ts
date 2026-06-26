import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DailyBrief, DailyBriefInput, DailyWidget } from "./types";
import { generateMealPlan } from "./mealPlanner";
import { generateProductivitySchedule } from "./productivityCoach";
import { generateEmotionPlan } from "./emotionCoach";
import { generateCyclePredictions } from "./cyclePredictions";
import { generateInsightsTimeline } from "./insightsTimeline";
import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";

const CACHE_KEY = "@eqaa_daily_brief_cache";
const CACHE_TTL_MS = 23 * 60 * 60 * 1000; // 23h — refresh once per day

// ── Motivational sentences ─────────────────────────────────────────────────────

const MOTIVATIONAL: Record<CyclePhaseKey, Array<{ en: string; ar: string }>> = {
  menstrual: [
    { en: "Stillness is not absence — it is the quiet from which your next cycle will bloom.",
      ar: "الصمت ليس غياباً — إنه الهدوء الذي ستتفتح منه دورتكِ القادمة." },
    { en: "Your body is not failing you. It is completing something.",
      ar: "جسمكِ لا يخذلكِ. إنه يكمل شيئاً." },
    { en: "Rest today so you can rise fully tomorrow.",
      ar: "ارتاحي اليوم لتنهضي بكامل طاقتكِ غداً." },
  ],
  power: [
    { en: "You are in the part of your cycle where new things love to be born. Plant one seed today.",
      ar: "أنتِ في الجزء من دورتكِ الذي تحب الأشياء الجديدة أن تُولد فيه. ازرعي بذرة واحدة اليوم." },
    { en: "Energy is rising — give it direction and it becomes momentum.",
      ar: "الطاقة في تصاعد — أعطيها اتجاهاً وستصبح زخماً." },
    { en: "Small and consistent beats big and occasional. Show up today.",
      ar: "الصغير والمتسق يتفوق على الكبير والعرضي. احضري اليوم." },
  ],
  manifestation: [
    { en: "This is your biological prime. Let the world hear from you.",
      ar: "هذه ذروتكِ البيولوجية. دعي العالم يسمع منكِ." },
    { en: "Right now your brain is firing on every cylinder. Use it.",
      ar: "عقلكِ الآن يعمل بكامل طاقته. استخدميه." },
    { en: "You didn't come this far in your cycle to stay quiet.",
      ar: "لم تصلي إلى هنا في دورتكِ لتبقي صامتة." },
  ],
  secondPower: [
    { en: "Your eye for detail right now is a precision instrument. Trust it.",
      ar: "عينكِ على التفاصيل الآن هي أداة دقيقة. ثقي بها." },
    { en: "Depth over breadth today. One thing done really well is enough.",
      ar: "العمق على الاتساع اليوم. شيء واحد مكتمل بشكل جيد حقاً يكفي." },
    { en: "Quiet confidence is still confidence. You know what you know.",
      ar: "الثقة الهادئة لا تزال ثقة. أنتِ تعرفين ما تعرفينه." },
  ],
  reset: [
    { en: "The most radical thing you can do right now is be kind to yourself.",
      ar: "أكثر شيء جذري يمكنكِ فعله الآن هو أن تكوني لطيفة مع نفسكِ." },
    { en: "Your nervous system is asking for gentleness. Give it generously.",
      ar: "جهازكِ العصبي يطلب اللطف. أعطيه بسخاء." },
    { en: "You are allowed to do less today. It's not failure. It's wisdom.",
      ar: "يُسمح لكِ بأن تفعلي أقل اليوم. إنها ليست فشلاً. إنها حكمة." },
  ],
};

// ── Widgets ───────────────────────────────────────────────────────────────────

const WIDGETS: Record<CyclePhaseKey, DailyWidget[]> = {
  menstrual: [
    { type: "focus",     icon: "🕯️", accentColor: "#FF6FAE", titleEn: "Today's Focus",     titleAr: "تركيز اليوم",      contentEn: "Rest without guilt. Recovery is the work.",                                         contentAr: "ارتاحي بلا ذنب. التعافي هو العمل." },
    { type: "challenge", icon: "🌱", accentColor: "#FF6FAE", titleEn: "Gentle Challenge",   titleAr: "تحدٍّ لطيف",       contentEn: "Write three things your body did well today.",                                      contentAr: "اكتبي ثلاثة أشياء فعلها جسمكِ بشكل جيد اليوم." },
    { type: "win",       icon: "💎", accentColor: "#FF6FAE", titleEn: "Today's Win",        titleAr: "انتصار اليوم",     contentEn: "You showed up, even during the hardest phase.",                                    contentAr: "حضرتِ، حتى خلال أصعب مرحلة." },
    { type: "tomorrow",  icon: "🌅", accentColor: "#FF6FAE", titleEn: "Tomorrow",           titleAr: "غداً",             contentEn: "Energy will begin its first gentle rise. Meet it with one easy action.",            contentAr: "ستبدأ الطاقة بأول ارتفاع لطيف. قابليها بفعل سهل واحد." },
  ],
  power: [
    { type: "focus",     icon: "🎯", accentColor: "#5BBB85", titleEn: "Today's Focus",     titleAr: "تركيز اليوم",      contentEn: "Start the one thing you've been postponing.",                                       contentAr: "ابدئي الشيء الواحد الذي كنتِ تؤجلينه." },
    { type: "challenge", icon: "🏋️", accentColor: "#5BBB85", titleEn: "Power Challenge",   titleAr: "تحدي القوة",       contentEn: "Push 10% harder than you think you can in your workout.",                          contentAr: "اجتهدي 10٪ أكثر مما تعتقدين أنكِ قادرة عليه في تمرينكِ." },
    { type: "win",       icon: "🌿", accentColor: "#5BBB85", titleEn: "Today's Win",        titleAr: "انتصار اليوم",     contentEn: "Your hormones are backing you. That alignment is a superpower.",                    contentAr: "هرموناتكِ تدعمكِ. هذا التوافق قوة خارقة." },
    { type: "tomorrow",  icon: "🌅", accentColor: "#5BBB85", titleEn: "Tomorrow",           titleAr: "غداً",             contentEn: "Estrogen keeps climbing. Show up with the same intention.",                        contentAr: "يستمر الإستروجين في الارتفاع. احضري بنفس النية." },
  ],
  manifestation: [
    { type: "focus",     icon: "🌟", accentColor: "#F59E0B", titleEn: "Today's Focus",     titleAr: "تركيز اليوم",      contentEn: "Do the one thing that matters most. You have the biological fuel for it.",        contentAr: "افعلي الشيء الأكثر أهمية. لديكِ الوقود البيولوجي اللازم." },
    { type: "challenge", icon: "🗣️", accentColor: "#F59E0B", titleEn: "Visibility Challenge","titleAr": "تحدي الظهور",   contentEn: "Speak, pitch, lead, or connect with someone new today.",                           contentAr: "تحدثي أو قدّمي أو قودي أو تواصلي مع شخص جديد اليوم." },
    { type: "win",       icon: "🏆", accentColor: "#F59E0B", titleEn: "Today's Win",        titleAr: "انتصار اليوم",     contentEn: "Your peak exists for a reason. You used it.",                                      contentAr: "ذروتكِ موجودة لسبب. لقد استخدمتيها." },
    { type: "tomorrow",  icon: "🌅", accentColor: "#F59E0B", titleEn: "Tomorrow",           titleAr: "غداً",             contentEn: "You stay at peak for a few more days. Plan something bold.",                      contentAr: "تبقين في الذروة لأيام قليلة أخرى. خططي لشيء جريء." },
  ],
  secondPower: [
    { type: "focus",     icon: "🔬", accentColor: "#C6A7FF", titleEn: "Today's Focus",     titleAr: "تركيز اليوم",      contentEn: "Finish and refine. Your detail-eye is at its sharpest.",                           contentAr: "أنهي وصقّلي. عينكِ على التفاصيل في أقصى حدّتها." },
    { type: "challenge", icon: "✍️", accentColor: "#C6A7FF", titleEn: "Depth Challenge",   titleAr: "تحدي العمق",       contentEn: "Write, document, or plan something you've been meaning to complete.",            contentAr: "اكتبي أو وثّقي أو خططي لشيء كنتِ تنوين إتمامه." },
    { type: "win",       icon: "💜", accentColor: "#C6A7FF", titleEn: "Today's Win",        titleAr: "انتصار اليوم",     contentEn: "Your inner knowing is sharper now than at any other time. Trust it.",           contentAr: "معرفتكِ الداخلية أحدّ الآن من أي وقت مضى. ثقي بها." },
    { type: "tomorrow",  icon: "🌅", accentColor: "#C6A7FF", titleEn: "Tomorrow",           titleAr: "غداً",             contentEn: "Gentle fatigue may begin. Prepare extra nourishment and an earlier bedtime.",    contentAr: "قد يبدأ التعب اللطيف. جهّزي تغذية إضافية ووقت نوم أبكر." },
  ],
  reset: [
    { type: "focus",     icon: "🌊", accentColor: "#8FD3FF", titleEn: "Today's Focus",     titleAr: "تركيز اليوم",      contentEn: "Nourish first, produce second. Your body is completing a cycle.",                contentAr: "الغذاء أولاً، الإنتاج ثانياً. جسمكِ يكمل دورة." },
    { type: "challenge", icon: "🛁", accentColor: "#8FD3FF", titleEn: "Comfort Challenge",  titleAr: "تحدي الراحة",      contentEn: "Create one deeply nurturing ritual for yourself today.",                          contentAr: "أنشئي طقساً واحداً مغذياً بعمق لنفسكِ اليوم." },
    { type: "win",       icon: "🤍", accentColor: "#8FD3FF", titleEn: "Today's Win",        titleAr: "انتصار اليوم",     contentEn: "Choosing rest in a world that rewards hustle is an act of courage.",            contentAr: "اختيار الراحة في عالم يكافئ الصخب هو فعل شجاعة." },
    { type: "tomorrow",  icon: "🌅", accentColor: "#8FD3FF", titleEn: "Tomorrow",           titleAr: "غداً",             contentEn: "Your new cycle is just days away. This ending makes the next beginning possible.", contentAr: "دورتكِ الجديدة على بُعد أيام. هذا النهاية يجعل البداية التالية ممكنة." },
  ],
};

// ── Water & sleep goals ───────────────────────────────────────────────────────

function waterGoal(input: DailyBriefInput): number {
  const base = input.waterGoalBase || 2.0;
  if (input.workoutToday) return +(base + 0.5).toFixed(1);
  if (["reset", "menstrual"].includes(input.phaseKey)) return +(base + 0.3).toFixed(1);
  return base;
}

function sleepGoal(phaseKey: CyclePhaseKey): number {
  return phaseKey === "menstrual" || phaseKey === "reset" ? 9 : phaseKey === "power" ? 8 : 7.5;
}

// ── Fasting window ────────────────────────────────────────────────────────────

function fastingWindow(phaseKey: CyclePhaseKey): { startHour: number; endHour: number; hoursTotal: number } {
  const windows: Record<CyclePhaseKey, { startHour: number; endHour: number; hoursTotal: number }> = {
    menstrual:     { startHour: 20, endHour: 11, hoursTotal: 15 },
    power:         { startHour: 20, endHour: 10, hoursTotal: 14 },
    manifestation: { startHour: 20, endHour: 8,  hoursTotal: 12 },
    secondPower:   { startHour: 20, endHour: 10, hoursTotal: 14 },
    reset:         { startHour: 19, endHour: 11, hoursTotal: 16 },
  };
  return windows[phaseKey];
}

// ── Motivational picker ────────────────────────────────────────────────────────

function pickMotivational(phaseKey: CyclePhaseKey, date: string): { en: string; ar: string } {
  const arr = MOTIVATIONAL[phaseKey];
  const seed = date.split("-").reduce((s, n) => s + parseInt(n, 10), 0);
  return arr[seed % arr.length];
}

// ── Readiness labels ──────────────────────────────────────────────────────────

function readinessLabel(score: number): { en: string; ar: string } {
  if (score >= 80) return { en: "Excellent", ar: "ممتاز" };
  if (score >= 60) return { en: "Good",      ar: "جيد" };
  if (score >= 40) return { en: "Moderate",  ar: "متوسط" };
  return                  { en: "Recovery",  ar: "تعافٍ" };
}

// ── Assembly ──────────────────────────────────────────────────────────────────

function assembleBrief(input: DailyBriefInput, date: string): DailyBrief {
  const { phaseKey, cycleDay, readinessScore, energyScore } = input;
  const schedule = generateProductivitySchedule(phaseKey);
  const motivational = pickMotivational(phaseKey, date);
  const label = readinessLabel(readinessScore);

  return {
    date,
    readinessScore,
    readinessLabelEn: label.en,
    readinessLabelAr: label.ar,
    hormoneStatusEn:  input.hormoneStatusEn,
    hormoneStatusAr:  input.hormoneStatusAr,
    energyScore,
    bestWorkWindow:    schedule.deepWork,
    bestStudyWindow:   schedule.learning,
    bestWorkoutWindow: schedule.workout,
    fastingWindow:     fastingWindow(phaseKey),
    meals:             generateMealPlan(phaseKey, date, input.workoutToday),
    waterGoalLiters:   waterGoal(input),
    sleepGoalHours:    sleepGoal(phaseKey),
    motivationalEn:    motivational.en,
    motivationalAr:    motivational.ar,
    productivitySchedule: schedule,
    emotionPlan:       generateEmotionPlan(phaseKey, date),
    widgets:           WIDGETS[phaseKey],
    predictions:       generateCyclePredictions(cycleDay, 28, new Date(date)),
    insightTimeline:   generateInsightsTimeline(input),
    generatedAt:       new Date().toISOString(),
  };
}

// ── Cache ─────────────────────────────────────────────────────────────────────

interface BriefCache {
  date:  string;
  brief: DailyBrief;
  ts:    number;
}

export async function getDailyBrief(input: DailyBriefInput): Promise<DailyBrief> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: BriefCache = JSON.parse(raw);
      if (cached.date === today && Date.now() - cached.ts < CACHE_TTL_MS) {
        return cached.brief;
      }
    }
  } catch { /* cache miss is fine */ }

  const brief = assembleBrief(input, today);
  try {
    const payload: BriefCache = { date: today, brief, ts: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch { /* storage failure is non-fatal */ }

  return brief;
}

export async function invalidateBriefCache(): Promise<void> {
  try { await AsyncStorage.removeItem(CACHE_KEY); } catch { /* noop */ }
}
