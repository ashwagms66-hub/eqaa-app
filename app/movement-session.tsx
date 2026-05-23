import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
  ArrowLeft,
  Dumbbell,
  Pause,
  Play,
  Timer,
} from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import { router, useLocalSearchParams } from "expo-router";

const exercisesByType = {
  recovery: [
    {
      emoji: "🚶‍♀️",
      ar: "مشي هادئ",
      en: "Gentle Walk",
      duration: "5 min",
    },
    {
      emoji: "🧘‍♀️",
      ar: "تمدد وتنفس",
      en: "Stretch & Breathe",
      duration: "4 min",
    },
    {
      emoji: "💪",
      ar: "حركة خفيفة",
      en: "Soft Movement",
      duration: "6 min",
    },
  ],

  focus: [
    {
      emoji: "⚡",
      ar: "تنشيط سريع",
      en: "Quick Activation",
      duration: "3 min",
    },
    {
      emoji: "🏃‍♀️",
      ar: "حركة مركزة",
      en: "Focused Motion",
      duration: "5 min",
    },
    {
      emoji: "🧠",
      ar: "تنفس التركيز",
      en: "Focus Breathing",
      duration: "2 min",
    },
  ],

  pms: [
    {
      emoji: "🌸",
      ar: "تمدد لطيف",
      en: "Gentle Stretch",
      duration: "4 min",
    },
    {
      emoji: "☁️",
      ar: "تنفس مهدئ",
      en: "Calming Breath",
      duration: "3 min",
    },
    {
      emoji: "🫶",
      ar: "استرخاء الجسم",
      en: "Body Relaxation",
      duration: "5 min",
    },
  ],
};

export default function MovementSession() {
  const { language } =
    useLanguage();

  const params = useLocalSearchParams();

  const sessionType =
    String(params.type ?? "recovery");

  const exercises =
    exercisesByType[
      sessionType as keyof typeof exercisesByType
    ] || exercisesByType.recovery;

  const [isRunning, setIsRunning] =
    useState(false);

  const [seconds, setSeconds] =
    useState(0);

  const pulseAnim = useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
let interval:
  ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const formattedTime =
    useMemo(() => {
      const mins = Math.floor(
        seconds / 60
      )
        .toString()
        .padStart(2, "0");

      const secs = (seconds % 60)
        .toString()
        .padStart(2, "0");

      return `${mins}:${secs}`;
    }, [seconds]);

  return (
    <LinearGradient
      colors={
        sessionType === "focus"
          ? ["#06111F", "#0B2545", "#12355B"]
          : sessionType === "pms"
          ? ["#140A18", "#2D102C", "#4A1D44"]
          : ["#05050A", "#121225", "#24182F"]
      }
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          style={styles.closeButton}
        >
          <ArrowLeft
            color="#FFFFFF"
            size={20}
          />
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>
            {language === "ar"
              ? "جلسة الحركة"
              : "Movement Session"}
          </Text>

          <Text style={styles.title}>
            {params.title
              ? String(params.title)
              : language === "ar"
              ? "حركة تناسب\nإيقاعك"
              : "Movement For\nYour Rhythm"}
          </Text>

          <Text style={styles.subtitle}>
            {language === "ar"
              ? "جلسة ألطف تساعد على استعادة الطاقة والحركة بهدوء."
              : "A softer session designed to support energy and gentle movement."}
          </Text>

          <Animated.View
            style={{
              transform: [
                {
                  scale: pulseAnim,
                },
              ],
            }}
          >
            <LinearGradient
              colors={
                sessionType === "focus"
                  ? [
                      "rgba(14,165,233,0.28)",
                      "rgba(255,255,255,0.05)",
                    ]
                  : sessionType === "pms"
                  ? [
                      "rgba(236,72,153,0.24)",
                      "rgba(255,255,255,0.05)",
                    ]
                  : [
                      "rgba(198,167,255,0.24)",
                      "rgba(255,255,255,0.05)",
                    ]
              }
              style={styles.heroCard}
            >
              <Text style={styles.heroEmoji}>
                {sessionType === "focus"
                  ? "⚡"
                  : sessionType === "pms"
                  ? "🌸"
                  : "🧘‍♀️"}
              </Text>

              <Text style={styles.heroTitle}>
                {sessionType === "focus"
                  ? language === "ar"
                    ? "تنشيط التركيز"
                    : "Focus Activation"
                  : sessionType === "pms"
                  ? language === "ar"
                    ? "راحة واحتواء"
                    : "PMS Relief"
                  : language === "ar"
                  ? "جلسة هادئة"
                  : "Gentle Flow"}
              </Text>

              <Text style={styles.heroText}>
                {language === "ar"
                  ? "حركة بسيطة، تنفس، وتمدد خفيف لاستعادة التوازن الداخلي."
                  : "Soft movement, breathing and stretching to reconnect with your rhythm."}
              </Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.timerCard}>
            <Timer
              color="#C6A7FF"
              size={24}
            />

            <Text style={styles.timerValue}>
              {formattedTime}
            </Text>

            <Text style={styles.timerLabel}>
              {language === "ar"
                ? "مدة الجلسة"
                : "Session Duration"}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.startButton}
            onPress={() =>
              setIsRunning(!isRunning)
            }
          >
            {isRunning ? (
              <Pause
                color="#171726"
                size={22}
              />
            ) : (
              <Play
                color="#171726"
                size={22}
              />
            )}

            <Text
              style={styles.startButtonText}
            >
              {isRunning
                ? language === "ar"
                  ? "إيقاف الجلسة"
                  : "Pause Session"
                : language === "ar"
                ? "ابدئي الحركة"
                : "Start Movement"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>
            {language === "ar"
              ? "تمارين الجلسة"
              : "Session Exercises"}
          </Text>

          <View style={styles.exerciseWrap}>
            {exercises.map((item) => (
              <View
                key={item.en}
                style={styles.exerciseCard}
              >
                <View style={styles.exerciseTop}>
                  <Text style={styles.exerciseEmoji}>
                    {item.emoji}
                  </Text>

                  <Dumbbell
                    color="#C6A7FF"
                    size={22}
                  />
                </View>

                <Text style={styles.exerciseTitle}>
                  {language === "ar"
                    ? item.ar
                    : item.en}
                </Text>

                <Text style={styles.exerciseDuration}>
                  {item.duration}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05050A",
  },

  scroll: {
    paddingHorizontal: 22,
    paddingTop: 72,
    paddingBottom: 180,
  },

  closeButton: {
    position: "absolute",
    top: 18,
    left: 22,
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  label: {
    color: "#C6A7FF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  title: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 18,
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 30,
    textAlign: "center",
    paddingHorizontal: 12,
  },

  heroCard: {
    marginTop: 36,
    borderRadius: 34,
    padding: 30,
    alignItems: "center",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  heroEmoji: {
    fontSize: 64,
    marginBottom: 22,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },

  heroText: {
    marginTop: 16,
    color: "rgba(255,255,255,0.74)",
    fontSize: 16,
    lineHeight: 32,
    textAlign: "center",
  },

  timerCard: {
    marginTop: 26,
    borderRadius: 28,
    paddingVertical: 28,
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  timerValue: {
    marginTop: 14,
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "900",
  },

  timerLabel: {
    marginTop: 10,
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    fontWeight: "700",
  },

  startButton: {
    marginTop: 28,
    minHeight: 64,
    borderRadius: 999,
    backgroundColor: "#C6A7FF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  startButtonText: {
    color: "#171726",
    fontSize: 17,
    fontWeight: "900",
  },

  sectionTitle: {
    marginTop: 42,
    marginBottom: 18,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  exerciseWrap: {
    gap: 18,
  },

  exerciseCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor:
      "rgba(255,255,255,0.05)",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  exerciseTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  exerciseEmoji: {
    fontSize: 34,
  },

  exerciseTitle: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  exerciseDuration: {
    marginTop: 12,
    color: "rgba(255,255,255,0.68)",
    fontSize: 15,
    fontWeight: "700",
  },
});