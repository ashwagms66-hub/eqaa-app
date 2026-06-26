import * as Notifications from "expo-notifications";
import type { ScheduledNotification, NotificationCategory } from "./types";
import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";
import { wasNotificationSent, markNotificationSent } from "./notificationStorage";

// ── Notification content templates ───────────────────────────────────────────

function buildSchedule(
  phaseKey: CyclePhaseKey,
  readinessScore: number,
  isAr: boolean,
): ScheduledNotification[] {
  const today = new Date().toISOString().split("T")[0];
  const label = isAr ? "ar" : "en";

  const templates: Omit<ScheduledNotification, "id">[] = [
    // Morning brief (7:00 AM)
    {
      category: "brief",
      titleEn: "Good morning ✨",
      titleAr: "صباح الخير ✨",
      bodyEn:  `Your AI Coach is ready — readiness ${readinessScore}%. Tap to see your full brief.`,
      bodyAr:  `مدربكِ الذكي جاهز — الجاهزية ${readinessScore}٪. اضغطي لرؤية ملخصكِ الكامل.`,
      fireHour: 7, fireMinute: 0, date: today,
    },
    // Hydration reminder (10:00 AM)
    {
      category: "hydration",
      titleEn: "Hydration check 💧",
      titleAr: "تذكير بالترطيب 💧",
      bodyEn:  "Have you had your second glass of water yet? Your hormones need it.",
      bodyAr:  "هل شربتِ كأسكِ الثانية من الماء؟ هرموناتكِ تحتاجه.",
      fireHour: 10, fireMinute: 0, date: today,
    },
    // Fasting window start (8:00 PM)
    {
      category: "fasting",
      titleEn: "Fasting window open ⏱️",
      titleAr: "نافذة الصيام مفتوحة ⏱️",
      bodyEn:  "Your metabolic window begins now. Finish your last meal before bed.",
      bodyAr:  "تبدأ نافذتكِ الاستقلابية الآن. أنهي وجبتكِ الأخيرة قبل النوم.",
      fireHour: 20, fireMinute: 0, date: today,
    },
    // Sleep wind-down (21:30 PM)
    {
      category: "sleep",
      titleEn: "Sleep preparation 🌙",
      titleAr: "التحضير للنوم 🌙",
      bodyEn:  "Dim your screens now — melatonin needs 90 min to build. Your body thanks you.",
      bodyAr:  "خففي شاشاتكِ الآن — الميلاتونين يحتاج 90 دقيقة ليتراكم. جسمكِ يشكركِ.",
      fireHour: 21, fireMinute: 30, date: today,
    },
  ];

  // Phase-specific midday reminder
  const phaseReminders: Record<CyclePhaseKey, Omit<ScheduledNotification, "id">> = {
    menstrual: {
      category: "emotion",
      titleEn: "Gentle check-in 🌸",    titleAr: "تحقق لطيف 🌸",
      bodyEn:  "How are you feeling? This phase calls for compassion, not performance.",
      bodyAr:  "كيف حالكِ؟ هذه المرحلة تتطلب التعاطف، لا الأداء.",
      fireHour: 13, fireMinute: 0, date: today,
    },
    power: {
      category: "workout",
      titleEn: "Time to move 💪",        titleAr: "حان وقت التحرك 💪",
      bodyEn:  "Your estrogen is rising — this is the best time to train this week.",
      bodyAr:  "الإستروجين في ارتفاع — هذا أفضل وقت للتدريب هذا الأسبوع.",
      fireHour: 13, fireMinute: 0, date: today,
    },
    manifestation: {
      category: "readiness",
      titleEn: "You're at your peak 🌟",  titleAr: "أنتِ في ذروتكِ 🌟",
      bodyEn:  "Estrogen peak — your best window for high-stakes work starts now.",
      bodyAr:  "ذروة الإستروجين — تبدأ الآن نافذتكِ الأفضل للعمل عالي المخاطر.",
      fireHour: 13, fireMinute: 0, date: today,
    },
    secondPower: {
      category: "readiness",
      titleEn: "Precision time 🔬",       titleAr: "وقت الدقة 🔬",
      bodyEn:  "Your detail focus is sharpest right now — a great time to audit or refine work.",
      bodyAr:  "تركيزكِ على التفاصيل في أحدّه الآن — وقت رائع للمراجعة أو صقل العمل.",
      fireHour: 13, fireMinute: 0, date: today,
    },
    reset: {
      category: "emotion",
      titleEn: "Rest reminder 🌊",        titleAr: "تذكير بالراحة 🌊",
      bodyEn:  "You are pre-menstrual. Saying no to something today is a health choice.",
      bodyAr:  "أنتِ في مرحلة ما قبل الحيض. قول 'لا' لشيء ما اليوم هو خيار صحي.",
      fireHour: 13, fireMinute: 0, date: today,
    },
  };

  templates.push(phaseReminders[phaseKey]);

  return templates.map((t, i) => ({
    ...t,
    id: `${today}_${t.category}_${i}`,
  }));
}

// ── Permissions ────────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ── Schedule notifications ─────────────────────────────────────────────────────

export async function scheduleDailyNotifications(
  phaseKey: CyclePhaseKey,
  readinessScore: number,
  isAr: boolean,
): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const schedule = buildSchedule(phaseKey, readinessScore, isAr);

  for (const notif of schedule) {
    const alreadySent = await wasNotificationSent(notif.id);
    if (alreadySent) continue;

    const now = new Date();
    const fireTime = new Date(now);
    fireTime.setHours(notif.fireHour, notif.fireMinute, 0, 0);

    if (fireTime <= now) continue; // past windows skipped

    await Notifications.scheduleNotificationAsync({
      content: {
        title: isAr ? notif.titleAr : notif.titleEn,
        body:  isAr ? notif.bodyAr  : notif.bodyEn,
        data:  { category: notif.category, notificationId: notif.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireTime,
      },
    });

    await markNotificationSent(notif.id);
  }
}

// ── Cancel all pending ─────────────────────────────────────────────────────────

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
