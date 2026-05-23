import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const sessions = [
  {
    title: {
      ar: "إعادة التوازن",
      en: "Emotional Reset",
    },
    subtitle: {
      ar: "إعادة تهدئة الجهاز العصبي",
      en: "Reset your nervous system gently",
    },
    duration: 120,
    theme: "default",
    color: ["#6D5BFF", "#8E7BFF"],
    glow: "rgba(142,123,255,0.35)",
    emoji: "🌙",
  },

  {
    title: {
      ar: "الاسترخاء للنوم",
      en: "Sleep Wind Down",
    },
    subtitle: {
      ar: "تهيئة الجسم للنوم العميق",
      en: "Prepare your body for deep sleep",
    },
    duration: 300,
    theme: "sleep",
    color: ["#244BFF", "#172554"],
    glow: "rgba(70,120,255,0.30)",
    emoji: "💤",
  },

  {
    title: {
      ar: "تركيز عميق",
      en: "Deep Focus",
    },
    subtitle: {
      ar: "تصفية الذهن واستعادة التركيز",
      en: "Clear mental noise and refocus",
    },
    duration: 180,
    theme: "focus",
    color: ["#0EA5E9", "#164E63"],
    glow: "rgba(14,165,233,0.28)",
    emoji: "🧠",
  },

  {
    title: {
      ar: "احتواء PMS",
      en: "PMS Relief",
    },
    subtitle: {
      ar: "تنظيم المشاعر بلطف",
      en: "Gentle emotional regulation",
    },
    duration: 240,
    theme: "pms",
    color: ["#EC4899", "#7E224F"],
    glow: "rgba(236,72,153,0.28)",
    emoji: "🌸",
  },
];

export default function BreathingSessions() {
  const { language } = useLanguage();
  const isArabic =
    language === "ar";
  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#171726",
        "#24182F",
      ]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>
            ←
          </Text>
          <Text style={styles.backText}>
            {isArabic ? "رجوع" : "Back"}
          </Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <Text style={styles.label}>
            {isArabic
              ? "جلسات التنفس"
              : "GUIDED SESSIONS"}
          </Text>

          <Text style={styles.title}>
            {isArabic
              ? "اختاري إيقاعك"
              : "Choose your rhythm"}
          </Text>

          <Text style={styles.subtitle}>
            {isArabic
              ? "اهدئي قليلًا وعودي إلى إيقاعك الداخلي"
              : "Slow down and reconnect with your inner rhythm."}
          </Text>

          {sessions.map((session) => (
            <TouchableOpacity
              key={session.title.en}
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname:
                    "/breathing",
                  params: {
                    title:
                      isArabic
                        ? session.title.ar
                        : session.title.en,
                    duration:
                      String(
                        session.duration
                      ),
                    theme:
                      session.theme,
                  },
                })
              }
            >
              <LinearGradient
                colors={
                  session.color as [
                    string,
                    string,
                  ]
                }
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={styles.card}
              >
                <View
                  style={[
                    styles.glow,
                    {
                      backgroundColor:
                        session.glow,
                    },
                  ]}
                />

                <View
                  style={
                    styles.cardTop
                  }
                >
                  <Text
                    style={
                      styles.emoji
                    }
                  >
                    {session.emoji}
                  </Text>

                  <View
                    style={
                      styles.durationBadge
                    }
                  >
                    <Text
                      style={
                        styles.durationText
                      }
                    >
                      {
                        Math.floor(
                          session.duration /
                            60
                        )
                      } {isArabic ? "د" : "min"}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    {isArabic
                      ? session.title.ar
                      : session.title.en}
                  </Text>

                  <Text
                    style={
                      styles.cardSubtitle
                    }
                  >
                    {isArabic
                      ? session.subtitle.ar
                      : session.subtitle.en}
                  </Text>
                </View>

                <View
                  style={
                    styles.button
                  }
                >
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    {isArabic
                      ? "ابدئي الجلسة"
                      : "Begin Session"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },

  label: {
    color:
      "rgba(255,255,255,0.55)",

    letterSpacing: 4,

    fontSize: 12,

    fontWeight: "700",

    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 38,

    fontWeight: "800",

    marginBottom: 10,

    letterSpacing: -1,
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.55)",

    fontSize: 17,

    lineHeight: 28,

    marginBottom: 34,
  },

  card: {
    borderRadius: 36,

    padding: 28,

    marginBottom: 22,

    minHeight: 260,

    overflow: "hidden",

    justifyContent:
      "space-between",
  },

  glow: {
    position: "absolute",

    width: 260,

    height: 260,

    borderRadius: 999,

    top: -40,

    right: -40,

    opacity: 0.9,
  },

  cardTop: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",
  },

  emoji: {
    fontSize: 30,
  },

  durationBadge: {
    backgroundColor:
      "rgba(255,255,255,0.12)",

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 999,
  },

  durationText: {
    color: "#FFFFFF",

    fontSize: 13,

    fontWeight: "700",
  },

  cardTitle: {
    color: "#FFFFFF",

    fontSize: 30,

    fontWeight: "800",

    marginTop: 24,

    marginBottom: 12,

    letterSpacing: -1,
  },

  cardSubtitle: {
    color:
      "rgba(255,255,255,0.82)",

    fontSize: 17,

    lineHeight: 28,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 2,
    marginBottom: 18,
    backgroundColor:
      "rgba(255,255,255,0.06)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },

  backArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginRight: 8,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  button: {
    marginTop: 26,

    backgroundColor:
      "rgba(255,255,255,0.18)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.12)",

    paddingVertical: 18,

    borderRadius: 999,

    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 17,

    fontWeight: "800",
  },
});