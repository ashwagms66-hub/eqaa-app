

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type RhythmNotificationInput = {
  language?: "ar" | "en";

  lifeMode?: string;

  stressLevel?:
    | "Low"
    | "Medium"
    | "High";

  energyLevel?: number;

  readiness?: number;
};

function getMorningMessage(
  language: "ar" | "en",
  input: RhythmNotificationInput
) {
  const {
    stressLevel,
    energyLevel,
    lifeMode,
  } = input;

  // Pregnancy
  if (lifeMode === "pregnancy") {
    return language === "ar"
      ? {
          title: "🌙 صباح هادئ",
          body: "قد يكون اللطف مع نفسكِ أهم شيء اليوم.",
        }
      : {
          title: "🌙 Gentle Morning",
          body: "Softness and calm may support you most today.",
        };
  }

  // Postpartum
  if (lifeMode === "postpartum") {
    return language === "ar"
      ? {
          title: "🤍 تذكير لطيف",
          body: "التعافي البطيء أيضًا شكل من أشكال القوة.",
        }
      : {
          title: "🤍 Gentle Reminder",
          body: "Slow recovery is also a form of strength.",
        };
  }

  // High stress
  if (stressLevel === "High") {
    return language === "ar"
      ? {
          title: "🌿 خذي نفسًا أعمق",
          body: "قد يكون التمهل وتقليل الضغط أكثر دعمًا لكِ اليوم.",
        }
      : {
          title: "🌿 Breathe Softer",
          body: "A slower pace may feel more supportive today.",
        };
  }

  // High energy
  if ((energyLevel || 0) >= 90) {
    return language === "ar"
      ? {
          title: "✨ طاقة مرتفعة",
          body: "قد يكون هذا وقتًا مناسبًا للحركة والتركيز والإنجاز.",
        }
      : {
          title: "✨ Bright Energy",
          body: "This may be a beautiful moment for focus and momentum.",
        };
  }

  // Default
  return language === "ar"
    ? {
        title: "🌙 صباحك هادئ",
        body: "إيقاعك اليوم يبدأ بخطوات صغيرة ولطيفة.",
      }
    : {
        title: "🌙 A Softer Morning",
        body: "Your rhythm begins gently today.",
      };
}

function getNightMessage(
  language: "ar" | "en"
) {
  return language === "ar"
    ? {
        title: "🌌 وقت التهدئة",
        body: "قد يكون النوم المبكر واستعادة الهدوء مفيدًا الليلة.",
      }
    : {
        title: "🌌 Time To Slow Down",
        body: "Gentler rest and slower moments may support you tonight.",
      };
}

function getBreathingReminder(
  language: "ar" | "en"
) {
  return language === "ar"
    ? {
        title: "🫧 مساحة للتنفس",
        body: "دقيقة واحدة من التنفس الهادئ قد تغيّر شعورك بالكامل.",
      }
    : {
        title: "🫧 Breathing Space",
        body: "One calm minute of breathing may shift your entire rhythm.",
      };
}

export async function requestNotificationPermissions() {
  const settings =
    await Notifications.getPermissionsAsync();

  if (!settings.granted) {
    const permission =
      await Notifications.requestPermissionsAsync();

    return permission.granted;
  }

  return true;
}

export async function scheduleMorningReflection(
  input: RhythmNotificationInput
) {
  const granted =
    await requestNotificationPermissions();

  if (!granted) {
    return;
  }

  const language =
    input.language || "ar";

  const message = getMorningMessage(
    language,
    input
  );

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
    },

    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    },
  });
}

export async function scheduleNightReminder(
  language: "ar" | "en" = "ar"
) {
  const granted =
    await requestNotificationPermissions();

  if (!granted) {
    return;
  }

  const message =
    getNightMessage(language);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
    },

    trigger: {
      hour: 22,
      minute: 30,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    },
  });
}

export async function scheduleBreathingReminder(
  language: "ar" | "en" = "ar"
) {
  const granted =
    await requestNotificationPermissions();

  if (!granted) {
    return;
  }

  const message =
    getBreathingReminder(language);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
    },

    trigger: {
      hour: 17,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    },
  });
}

export async function clearAllRhythmNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}