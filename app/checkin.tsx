import React, {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
  Battery,
  Moon,
  Sparkles,
  Zap,
} from "lucide-react-native";

import {
  useLanguage,
} from "@/src/context/LanguageContext";

import {
  getEnergy,
  getSleep,
  getStress,
  saveEnergy,
  saveSleep,
  saveStress,
} from "@/src/storage/checkinStorage";

export default function CheckinScreen() {
  const { language } = useLanguage();

  const [sleepHours, setSleepHours] =
    useState(7);

  const [energyLevel, setEnergyLevel] =
    useState(80);

  const [stressLevel, setStressLevel] =
    useState<
      "Low" | "Medium" | "High"
    >("Low");

  const glowAnim = React.useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    async function loadData() {
      const savedSleep =
        await getSleep();

      const savedEnergy =
        await getEnergy();

      const savedStress =
        await getStress();

      if (savedSleep !== null) {
        setSleepHours(savedSleep);
      }

      if (savedEnergy !== null) {
        setEnergyLevel(savedEnergy);
      }

    if (
  savedStress === "Low" ||
  savedStress === "Medium" ||
  savedStress === "High"
) {
  setStressLevel(savedStress);
}
    }

    loadData();
  }, []);

  const dynamicGlow =
    stressLevel === "High"
      ? "#FF8EB8"
      : energyLevel >= 80
      ? "#FFD66B"
      : "#C6A7FF";

  const glowTranslate =
    glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-20, 20],
    });

  async function saveCheckin() {
    await saveSleep(sleepHours);

    await saveEnergy(energyLevel);

    await saveStress(stressLevel);

    Alert.alert(
      language === "ar"
        ? "تم حفظ تسجيلك ✨"
        : "Check-in Saved ✨"
    );
  }

  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#121225",
        "#241A3D",
      ]}
      style={styles.container}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ambientGlow,
          {
            backgroundColor:
              dynamicGlow,
            transform: [
              {
                translateX:
                  glowTranslate,
              },
            ],
          },
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>
          {language === "ar"
            ? "تسجيل إيقاع"
            : "Daily Check-in"}
        </Text>

        <Text style={styles.title}>
          {language === "ar"
            ? "كيف تشعرين اليوم؟"
            : "How do you feel today?"}
        </Text>

        <Text style={styles.subtitle}>
          {language === "ar"
            ? "كل تسجيل يساعد إيقاع على فهم طاقتك ومساعدتك بشكل ألطف."
            : "Each check-in helps Eqa’a understand your rhythm more gently."}
        </Text>

        <LinearGradient
          colors={[
            "rgba(198,167,255,0.14)",
            "rgba(255,255,255,0.05)",
          ]}
          style={styles.card}
        >
          <View style={styles.row}>
            <Moon
              size={24}
              color="#C6A7FF"
            />

            <Text style={styles.cardTitle}>
              {language === "ar"
                ? "كيف كان نومك؟"
                : "How was your sleep?"}
            </Text>
          </View>

          <View style={styles.moodGrid}>
            {[
              {
                value: 4,
                emoji: "😴",
                ar: "متعب",
                en: "Exhausted",
              },
              {
                value: 6,
                emoji: "🌙",
                ar: "متوسط",
                en: "Okay",
              },
              {
                value: 8,
                emoji: "✨",
                ar: "ممتاز",
                en: "Rested",
              },
            ].map((item) => {
              const active =
                sleepHours === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.9}
                  onPress={() =>
                    setSleepHours(
                      item.value
                    )
                  }
                  style={[
                    styles.moodCard,
                    active && {
                      backgroundColor:
                        "#C6A7FF",
                      borderColor:
                        "#C6A7FF",
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>
                    {item.emoji}
                  </Text>

                  <Text
                    style={[
                      styles.moodTitle,
                      active && {
                        color: "#111111",
                      },
                    ]}
                  >
                    {language === "ar"
                      ? item.ar
                      : item.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[
            "rgba(255,214,107,0.14)",
            "rgba(255,255,255,0.05)",
          ]}
          style={styles.card}
        >
          <View style={styles.row}>
            <Zap
              size={24}
              color="#FFD66B"
            />

            <Text style={styles.cardTitle}>
              {language === "ar"
                ? "كيف طاقتك اليوم؟"
                : "How is your energy today?"}
            </Text>
          </View>

          <View style={styles.moodGrid}>
            {[
              {
                value: 20,
                emoji: "🥺",
                ar: "منخفضة",
                en: "Low",
              },
              {
                value: 60,
                emoji: "🌤️",
                ar: "متوازنة",
                en: "Balanced",
              },
              {
                value: 100,
                emoji: "⚡",
                ar: "مرتفعة",
                en: "High",
              },
            ].map((item) => {
              const active =
                energyLevel === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.9}
                  onPress={() =>
                    setEnergyLevel(
                      item.value
                    )
                  }
                  style={[
                    styles.moodCard,
                    active && {
                      backgroundColor:
                        "#FFD66B",
                      borderColor:
                        "#FFD66B",
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>
                    {item.emoji}
                  </Text>

                  <Text
                    style={[
                      styles.moodTitle,
                      active && {
                        color: "#111111",
                      },
                    ]}
                  >
                    {language === "ar"
                      ? item.ar
                      : item.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[
            "rgba(255,142,184,0.14)",
            "rgba(255,255,255,0.05)",
          ]}
          style={styles.card}
        >
          <View style={styles.row}>
            <Battery
              size={24}
              color="#FF8EB8"
            />

            <Text style={styles.cardTitle}>
              {language === "ar"
                ? "كيف مستوى الضغط؟"
                : "How is your stress level?"}
            </Text>
          </View>

          <View style={styles.moodGrid}>
            {[
              {
                value: "Low",
                emoji: "🌸",
                ar: "هادئ",
                en: "Calm",
              },
              {
                value: "Medium",
                emoji: "🌧️",
                ar: "متوسط",
                en: "Moderate",
              },
              {
                value: "High",
                emoji: "🔥",
                ar: "مرتفع",
                en: "Overwhelmed",
              },
            ].map((item) => {
              const active =
                stressLevel === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.9}
                  onPress={() =>
                    setStressLevel(
                      item.value as
                        | "Low"
                        | "Medium"
                        | "High"
                    )
                  }
                  style={[
                    styles.moodCard,
                    active && {
                      backgroundColor:
                        "#FF8EB8",
                      borderColor:
                        "#FF8EB8",
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>
                    {item.emoji}
                  </Text>

                  <Text
                    style={[
                      styles.moodTitle,
                      active && {
                        color: "#111111",
                      },
                    ]}
                  >
                    {language === "ar"
                      ? item.ar
                      : item.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[
            "rgba(198,167,255,0.18)",
            "rgba(255,255,255,0.05)",
          ]}
          style={styles.summaryCard}
        >
          <View style={styles.summaryTop}>
            <Sparkles
              size={24}
              color="#C6A7FF"
            />

            <Text style={styles.summaryTitle}>
              {language === "ar"
                ? "ملخص إيقاع"
                : "Rhythm Summary"}
            </Text>
          </View>

          <Text style={styles.summaryText}>
            {stressLevel === "High"
              ? language === "ar"
                ? "إيقاع يقترح اليوم لحظات أهدأ، نوم أفضل، وتقليل الضغط الداخلي."
                : "Eqa’a suggests a slower and softer rhythm today."
              : energyLevel >= 80
              ? language === "ar"
                ? "طاقتك تبدو مرتفعة اليوم — وقت مناسب للحركة والتركيز."
                : "Your energy feels elevated today — a good time for focus and movement."
              : language === "ar"
              ? "إيقاعك يبدو متوازنًا نسبيًا اليوم."
              : "Your rhythm feels relatively balanced today."}
          </Text>
        </LinearGradient>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.saveButton}
          onPress={saveCheckin}
        >
          <Text style={styles.saveButtonText}>
            {language === "ar"
              ? "حفظ تسجيل اليوم"
              : "Save Check-in"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ambientGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    top: -100,
    alignSelf: "center",
    opacity: 0.22,
  },

  container: {
    flex: 1,
  },

  scroll: {
    paddingTop: 110,
    paddingHorizontal: 22,
    paddingBottom: 180,
  },

  label: {
    color: "#C6A7FF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 30,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 36,
    paddingHorizontal: 10,
  },

  card: {
    marginBottom: 22,
    borderRadius: 30,
    padding: 22,
    backgroundColor:
      "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.05)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  moodGrid: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
  },

  moodCard: {
    flex: 1,
    minHeight: 126,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
  },

  moodEmoji: {
    fontSize: 34,
    marginBottom: 14,
  },

  moodTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  summaryCard: {
    borderRadius: 32,
    padding: 24,
    marginTop: 10,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.05)",
  },

  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  summaryText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 16,
    lineHeight: 30,
    fontWeight: "600",
  },

  saveButton: {
    marginTop: 34,
    height: 62,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C6A7FF",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 14,
  },

  saveButtonText: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "900",
  },
});
