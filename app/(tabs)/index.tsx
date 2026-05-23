import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";

import {
  router,
  useFocusEffect,
} from "expo-router";

import { StatusBar } from "expo-status-bar";

import { Heart } from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";

import { generateRhythm } from "@/src/engine/rhythmEngine";

import { generateSmartInsight } from "@/src/engine/insightEngine";

import {
  getCurrentPhase,
  getCycleDay,
  getCycleInsight,
  getPhaseTheme,
} from "@/src/engine/cycleEngine";

import { getCyclePhase } from "@/src/engine/wellnessEngine";

import { getLastPeriod } from "@/src/storage/cycleStorage";

import {
  getAverageReadiness,
  getRecentMoodTrend,
  saveDailyRhythm,
} from "@/src/storage/rhythmMemory";

import {
  getEnergy,
  getSleep,
  getStress,
} from "@/src/storage/checkinStorage";

import {
  getCalories,
  getGoals,
} from "@/src/storage/profileStorage";

const moods = [
  {
    key: "calm",
    emoji: "🌙",
    ar: "هدوء",
    en: "Calm",
  },
  {
    key: "focus",
    emoji: "⚡",
    ar: "طاقة",
    en: "Focus",
  },
  {
    key: "soft",
    emoji: "💜",
    ar: "مشاعري",
    en: "Reflect",
  },
  {
    key: "slow",
    emoji: "🥗",
    ar: "أكلي",
    en: "Food",
  },
];

export default function HomeScreen() {
  const { language } = useLanguage();

  const isRTL = language === "ar";

  const [cycleDay, setCycleDay] = useState(12);

  const [sleepHours, setSleepHours] = useState(7);

  const [stressLevel, setStressLevel] =
    useState<"Low" | "Medium" | "High">(
      "Low"
    );

  const [energyLevel, setEnergyLevel] =
    useState(82);

  const [userName, setUserName] =
    useState("");

  const [dailyCalories, setDailyCalories] =
    useState(1400);

  const [goal, setGoal] = useState<
    "loss" | "maintain" | "gain"
  >("loss");

  const [lifeMode, setLifeMode] =
    useState<
      | "regular"
      | "pregnancy"
      | "postpartum"
      | "pcos"
      | "moon"
    >("regular");

  const [
    averageReadiness,
    setAverageReadiness,
  ] = useState(0);

  const [
    moodTrend,
    setMoodTrend,
  ] = useState<
    "balanced" |
    "stress_high" |
    "low_energy"
  >("balanced");

  const [selectedMood, setSelectedMood] =
    useState("calm");

  const pulse = useRef(
    new Animated.Value(1)
  ).current;

  const floatAnim = useRef(
    new Animated.Value(0)
  ).current;

  const glowAnim = useRef(
    new Animated.Value(0)
  ).current;

  const loadData = useCallback(async () => {
    const lastPeriod =
      await getLastPeriod();

    const savedSleep =
      await getSleep();

    const savedStress =
      await getStress();

    const savedEnergy =
      await getEnergy();

    const savedName =
      await AsyncStorage.getItem(
        "@eqaa_name"
      );

    const savedLifeMode =
      await AsyncStorage.getItem(
        "@eqaa_life_mode"
      );

    const savedCalories =
      await getCalories();

    const savedGoal =
      await getGoals();

    if (lastPeriod) {
      const calculatedDay =
        getCycleDay(lastPeriod);

      setCycleDay(calculatedDay);
    }

    if (savedSleep !== null) {
      setSleepHours(savedSleep);
    }

    if (savedStress) {
      setStressLevel(
        savedStress as
          | "Low"
          | "Medium"
          | "High"
      );
    }

    if (savedEnergy !== null) {
      setEnergyLevel(savedEnergy);
    }

    if (savedName) {
      setUserName(savedName);
    }

    if (savedCalories) {
      setDailyCalories(savedCalories);
    }

    if (savedGoal) {
      setGoal(savedGoal);
    }

    if (
      savedLifeMode === "regular" ||
      savedLifeMode === "pregnancy" ||
      savedLifeMode === "postpartum" ||
      savedLifeMode === "pcos" ||
      savedLifeMode === "moon"
    ) {
      setLifeMode(savedLifeMode);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    floatLoop.start();

    return () => {
      pulseLoop.stop();
      floatLoop.stop();
    };
  }, [pulse, floatAnim]);

  const ambientTranslate =
    glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-25, 25],
    });

  const greeting = useMemo(() => {
    const firstName =
      userName?.split(" ")[0] || "";

    return language === "ar"
      ? `نورتي إيقاع ${firstName}`
      : `Welcome back ${firstName}`;
  }, [language, userName]);

  const rhythm = useMemo(() => {
    return generateRhythm(
      cycleDay,
      lifeMode,
      sleepHours,
      stressLevel,
      energyLevel
    );
  }, [
    cycleDay,
    lifeMode,
    sleepHours,
    stressLevel,
    energyLevel,
  ]);

  const smartInsight = useMemo(() => {
    return generateSmartInsight({
      readiness:
        rhythm.readiness,

      emotionalState:
        rhythm.emotionalState,

      moodTrend,

      sleepHours,
      stressLevel,
      energyLevel,

      language,
    });
  }, [
    rhythm,
    moodTrend,
    sleepHours,
    stressLevel,
    energyLevel,
    language,
  ]);

  const currentPhase = useMemo(() => {
    return getCurrentPhase(cycleDay);
  }, [cycleDay]);

  const phaseTheme = useMemo(() => {
    return getPhaseTheme(cycleDay);
  }, [cycleDay]);

  const wellnessPhase = useMemo(() => {
    return getCyclePhase(cycleDay);
  }, [cycleDay]);

  const phaseInsight = useMemo(() => {
    return getCycleInsight(
      cycleDay,
      language
    );
  }, [cycleDay, language]);

  useEffect(() => {
    async function syncMemory() {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      await saveDailyRhythm({
        date: today,
        readiness:
          rhythm.readiness,
        mood: selectedMood,
        sleepHours,
        stressLevel,
        energyLevel,
        emotionalState:
          rhythm.emotionalState,
        rhythmLabel:
          rhythm.rhythmLabel,
      });

      const avg =
        await getAverageReadiness();

      const trend =
        await getRecentMoodTrend();

      setAverageReadiness(avg);
      setMoodTrend(trend);
    }

    syncMemory();
  }, [
    rhythm,
    selectedMood,
    sleepHours,
    stressLevel,
    energyLevel,
  ]);

  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#171726",
        "#24182F",
      ]}
      style={styles.container}
    >
      <StatusBar style="light" />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.ambientGlow,
          {
            transform: [
              {
                translateX:
                  ambientTranslate,
              },
            ],
            backgroundColor:
              phaseTheme.glow,
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Text
            style={[
              styles.greeting,
              {
                writingDirection:
                  isRTL ? "rtl" : "ltr",
              },
            ]}
          >
            {greeting}
          </Text>

          <View style={styles.heroSection}>
            <Animated.View
              style={{
                transform: [
                  { scale: pulse },
                  {
                    translateY:
                      floatAnim,
                  },
                ],
              }}
            >
              <View style={styles.outerOrb}>
                <View style={styles.middleOrb}>
                  <View
                    style={[
                      styles.innerOrb,
                      {
                        backgroundColor:
                          phaseTheme.accent,
                      },
                    ]}
                  >
                    <Text style={styles.phaseEmoji}>
                      {currentPhase.icon}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Text style={styles.title}>
              {language === "ar"
                ? "إيقاع"
                : "Eqa’a"}
            </Text>

            <Text style={styles.subtitle}>
              {phaseInsight}
            </Text>
          </View>

          <View style={styles.mainCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.cardLabel}>
                  {language === "ar"
                    ? "مرحلتك الحالية"
                    : "CURRENT PHASE"}
                </Text>

                <Text style={styles.cardTitle}>
                  {language === "ar"
                    ? wellnessPhase.phaseArabic
                    : wellnessPhase.title}
                </Text>
              </View>

              <View
                style={[
                  styles.scoreBubble,
                  {
                    backgroundColor:
                      phaseTheme.accent,
                  },
                ]}
              >
                <Text style={styles.scoreText}>
                  {rhythm.readiness}
                </Text>
              </View>
            </View>

            <Text style={styles.cardText}>
              {phaseInsight}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            {language === "ar"
              ? "كيف تشعرين اليوم؟"
              : "How do you feel today?"}
          </Text>

          <View style={styles.moodsRow}>
            {moods.map((item) => {
              const active =
                selectedMood === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.92}
                  onPress={() => {
                    setSelectedMood(item.key);

                    if (item.key === "calm") {
                      router.push(
                        "/breathing-sessions"
                      );
                    }

                    if (item.key === "focus") {
                      router.push(
                        "/workout"
                      );
                    }

                    if (item.key === "soft") {
                      router.push(
                        "/reports"
                      );
                    }

                    if (item.key === "slow") {
                      router.push(
                        "/nutrition"
                      );
                    }
                  }}
                  style={[
                    styles.moodCard,
                    active && {
                      borderColor:
                        phaseTheme.accent,
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>
                    {item.emoji}
                  </Text>

                  <Text style={styles.moodText}>
                    {language === "ar"
                      ? item.ar
                      : item.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Heart
                size={20}
                color="#C7A6FF"
              />

              <Text style={styles.insightTitle}>
                {language === "ar"
                  ? "انعكاس اليوم"
                  : "Today Reflection"}
              </Text>
            </View>

            <Text style={styles.insightText}>
              {smartInsight}
            </Text>
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

  safeArea: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 160,
  },

  ambientGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    top: -120,
    alignSelf: "center",
    opacity: 0.2,
  },

  greeting: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },

  heroSection: {
    alignItems: "center",
    marginTop: 26,
  },

  outerOrb: {
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },

  middleOrb: {
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },

  innerOrb: {
    width: 120,
    height: 120,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  phaseEmoji: {
    fontSize: 38,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 56,
    fontWeight: "900",
    marginTop: 28,
  },

  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 32,
    marginTop: 18,
    paddingHorizontal: 26,
  },

  mainCard: {
    marginTop: 36,
    borderRadius: 34,
    padding: 24,
    backgroundColor:
      "rgba(255,255,255,0.06)",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardLabel: {
    color: "#C7A6FF",
    fontSize: 12,
    fontWeight: "800",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 10,
  },

  scoreBubble: {
    width: 70,
    height: 70,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  scoreText: {
    color: "#171726",
    fontSize: 26,
    fontWeight: "900",
  },

  cardText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 16,
    lineHeight: 30,
    marginTop: 20,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 34,
    marginBottom: 18,
  },

  moodsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  moodCard: {
    flex: 1,
    minHeight: 120,
    backgroundColor:
      "rgba(255,255,255,0.06)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  moodEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },

  moodText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  insightCard: {
    marginTop: 28,
    backgroundColor:
      "rgba(199,166,255,0.12)",
    borderRadius: 30,
    padding: 22,
  },

  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  insightTitle: {
    color: "#C7A6FF",
    fontSize: 18,
    fontWeight: "800",
  },

  insightText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 16,
    lineHeight: 32,
    marginTop: 18,
    fontWeight: "600",
  },
});