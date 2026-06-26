import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import {
  router,
  useFocusEffect,
} from "expo-router";

import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";

import { Heart, Sparkles, Zap } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFastingPhase, FASTING_PHASES } from "@/src/data/fastingData";

import { useHealthData } from "@/src/services/health/useHealthData";
import { formatLastSynced } from "@/src/services/health/healthService";
import { calculateEqaaScore } from "@/src/services/scoring/scoringService";
import { getWorkoutRecommendation } from "@/src/services/recommendations/recommendationService";

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

import { getLastPeriod, saveLastPeriod } from "@/src/storage/cycleStorage";

import {
  getAverageReadiness,
  getRecentMoodTrend,
  saveDailyRhythm,
} from "@/src/storage/rhythmMemory";

import {
  getEnergy,
  getSleep,
  getStress,
  getDailyCheckIn,
  type DailyCheckIn,
} from "@/src/storage/checkinStorage";

import {
  getCalories,
  getGoals,
  getLifeMode,
  getName,
} from "@/src/storage/profileStorage";

import { getCycleLength } from "@/src/storage/cycleStorage";

const PERIOD_DISMISS_KEY = "@eqaa_period_prompt_dismissed";

async function wasDismissedToday(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(PERIOD_DISMISS_KEY);
    if (!val) return false;
    return val === new Date().toISOString().split("T")[0];
  } catch {
    return false;
  }
}

async function dismissPeriodPromptToday(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PERIOD_DISMISS_KEY,
      new Date().toISOString().split("T")[0]
    );
  } catch {}
}

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

  const { metrics, syncing, permissionStatus, isAvailable, requestAndSync, sync } =
    useHealthData();

  const [cycleDay, setCycleDay] = useState(1);

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

  const [periodPredicted, setPeriodPredicted] =
    useState(false);

  const [periodCardDismissed, setPeriodCardDismissed] =
    useState(false);

  const [todayCheckIn, setTodayCheckIn] =
    useState<DailyCheckIn | null>(null);

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

    const savedName = await getName();

    const savedLifeMode = await getLifeMode();

    const savedCalories =
      await getCalories();

    const savedGoal =
      await getGoals();

    if (lastPeriod) {
      const calculatedDay =
        getCycleDay(lastPeriod);

      setCycleDay(calculatedDay);

      // Compute whether today is on or past the predicted period date
      const cycleLen = await getCycleLength();
      const [ly, lm, ld] = lastPeriod.split("-").map(Number);
      const periodStart = new Date(ly, lm - 1, ld);
      const predicted = new Date(periodStart);
      predicted.setDate(predicted.getDate() + cycleLen);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const isPredicted = todayDate >= predicted && calculatedDay !== 1;
      const dismissed = await wasDismissedToday();
      const lifeModeSaved = await getLifeMode();
      const noTracking =
        lifeModeSaved === "pregnancy" || lifeModeSaved === "postpartum";
      setPeriodPredicted(isPredicted && !noTracking);
      setPeriodCardDismissed(dismissed);
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

    const firstGoal = Array.isArray(savedGoal) ? savedGoal[0] : savedGoal;
    if (firstGoal === "loss" || firstGoal === "maintain" || firstGoal === "gain") {
      setGoal(firstGoal);
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

    const ci = await getDailyCheckIn();
    setTodayCheckIn(ci);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handlePeriodConfirm = async () => {
    const today = new Date().toISOString().split("T")[0];
    await saveLastPeriod(today);
    await loadData();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePeriodNotYet = async () => {
    await dismissPeriodPromptToday();
    setPeriodCardDismissed(true);
  };

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
    const firstName = userName?.split(" ")[0]?.trim() || "";
    if (language === "ar") {
      return firstName ? `مرحباً ${firstName} 🌙` : "مرحباً بكِ في إيقاع 🌙";
    }
    return firstName ? `Hello ${firstName} 🌙` : "Welcome to Eqa'a 🌙";
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

  // Phase definitions matching wellnessEngine.ts boundaries
  const phaseProgress = useMemo(() => {
    const defs = [
      { start: 1,  end: 5,  emoji: "❤️", color: "#FF6FAE", arFrom: "من الدورة",         enPhase: "Menstrual", arSuffix: "على انتهاء الدورة" },
      { start: 6,  end: 10, emoji: "🌱", color: "#5BBB85", arFrom: "من مرحلة التجديد",  enPhase: "Renewal",   arSuffix: "على انتهاء المرحلة" },
      { start: 11, end: 15, emoji: "⚡", color: "#E9CF74", arFrom: "من مرحلة القوة",    enPhase: "Power",     arSuffix: "على انتهاء المرحلة" },
      { start: 16, end: 19, emoji: "✨", color: "#C6A7FF", arFrom: "من مرحلة الوضوح",   enPhase: "Clarity",   arSuffix: "على انتهاء المرحلة" },
      { start: 20, end: 28, emoji: "🌙", color: "#89CFF0", arFrom: "من مرحلة الهدوء",   enPhase: "Calm",      arSuffix: "على انتهاء المرحلة" },
    ] as const;
    const p = defs.find(d => cycleDay >= d.start && cycleDay <= d.end) ?? defs[defs.length - 1];
    const phaseDay = cycleDay - p.start + 1;
    const phaseTotalDays = p.end - p.start + 1;
    const remaining = p.end - cycleDay + 1;
    const phaseProgressPercentage = Math.round((phaseDay / phaseTotalDays) * 100);
    return { ...p, phaseDay, phaseTotalDays, remaining, phaseProgressPercentage };
  }, [cycleDay]);

  const phaseProgressTitle = useMemo(() => {
    if (lifeMode === "pregnancy" || lifeMode === "postpartum") {
      return language === "ar" ? wellnessPhase.phaseArabic : wellnessPhase.title;
    }
    if (cycleDay === 14) return language === "ar" ? "✨ يوم الإباضة" : "✨ Ovulation Day";
    const { phaseDay, emoji, arFrom, enPhase } = phaseProgress;
    return language === "ar"
      ? `${emoji} اليوم ${phaseDay} ${arFrom}`
      : `${emoji} Day ${phaseDay} of ${enPhase}`;
  }, [cycleDay, phaseProgress, wellnessPhase, language, lifeMode]);

  const phaseProgressSub = useMemo(() => {
    if (lifeMode === "pregnancy" || lifeMode === "postpartum") return phaseInsight;
    if (cycleDay === 14) return language === "ar" ? "اليوم الأخصب في دورتك" : "Your most fertile day";
    const { remaining, arSuffix, enPhase } = phaseProgress;
    if (language === "ar") {
      if (remaining <= 1) return `آخر يوم ${arSuffix}`;
      if (remaining === 2) return `يتبقى يومان ${arSuffix}`;
      if (remaining <= 10) return `يتبقى ${remaining} أيام ${arSuffix}`;
      return `يتبقى ${remaining} يوماً ${arSuffix}`;
    }
    if (remaining <= 1) return `Last day of ${enPhase.toLowerCase()}`;
    return `${remaining} days left in ${enPhase.toLowerCase()}`;
  }, [cycleDay, phaseProgress, phaseInsight, language, lifeMode]);

  const cyclePhaseKey = useMemo(() => {
    if (cycleDay <= 5)  return "menstrual";
    if (cycleDay <= 10) return "power";
    if (cycleDay <= 15) return "manifestation";
    if (cycleDay <= 19) return "secondPower";
    return "reset";
  }, [cycleDay]);

  const fastPhaseKey = useMemo(() => getFastingPhase(cycleDay), [cycleDay]);
  const fp = useMemo(() => FASTING_PHASES[fastPhaseKey], [fastPhaseKey]);

  const eqaaScore = useMemo(
    () =>
      calculateEqaaScore({
        sleepHours: metrics?.sleepHours ?? sleepHours,
        steps: metrics?.steps ?? null,
        activeEnergyBurned: metrics?.activeEnergyBurned ?? null,
        cycleDay,
        symptoms: todayCheckIn?.symptoms ?? [],
        hrv: metrics?.hrv ?? null,
        restingHeartRate: metrics?.restingHeartRate ?? null,
        energyLevel: energyLevel,
      }),
    [metrics, cycleDay, sleepHours, energyLevel, todayCheckIn]
  );

  const workoutRec = useMemo(() => getWorkoutRecommendation(cycleDay), [cycleDay]);

  const dailyInsight = useMemo(() => {
    const high = energyLevel >= 70;
    const low  = energyLevel < 50;

    const phaseMsg: Record<string, { ar: string; en: string }> = {
      menstrual: {
        ar: "جسمك يستحق الراحة الكاملة الآن — هذا هو الإنجاز الأهم اليوم",
        en: "Your body deserves full rest now — that is the most important achievement today",
      },
      power: {
        ar: high ? "أنتِ في قمة الطاقة — الآن وقت البناء والإنجاز" : "طاقتك مرتفعة نسبياً — استثمريها في أولوياتك",
        en: high ? "You're at peak energy — now is the time to build and achieve" : "Your energy is rising — invest it in your priorities",
      },
      manifestation: {
        ar: "وضوح ذهني استثنائي — أفضل وقت للقرارات والإبداع",
        en: "Exceptional mental clarity — best time for decisions and creativity",
      },
      secondPower: {
        ar: low ? "جسمك يطلب عمقاً لا سرعة — الجودة فوق الكمية" : "مرحلة التعمق — اختاري ما يستحق طاقتك",
        en: low ? "Your body asks for depth, not speed — quality over quantity" : "Depth phase — choose what truly deserves your energy",
      },
      reset: {
        ar: "مرحلة الاسترجاع — الراحة إنجاز وليست تقصيراً",
        en: "Recovery phase — rest is achievement, not failure",
      },
    };

    const moodMsg: Record<string, { ar: string; en: string }> = {
      calm: {
        ar: `نافذة صيامك ${fp.fastingHoursMin}–${fp.fastingHoursMax} ساعة — ${fp.recovery.ar}`,
        en: `Your fasting window ${fp.fastingHoursMin}–${fp.fastingHoursMax}h — ${fp.recovery.en}`,
      },
      focus: {
        ar: `الصيام ${fp.fastingHoursMin}–${fp.fastingHoursMax}h يُعزز تركيزك — ${fp.movement.ar}`,
        en: `Fasting ${fp.fastingHoursMin}–${fp.fastingHoursMax}h amplifies your focus — ${fp.movement.en}`,
      },
      soft: {
        ar: "احتضني مشاعرك — هذا ذكاء عاطفي وليس ضعفاً",
        en: "Honor your feelings — this is emotional wisdom, not weakness",
      },
      slow: {
        ar: `غذي جسمك بوعي — ${fp.movement.ar}`,
        en: `Nourish mindfully — ${fp.movement.en}`,
      },
    };

    const base = phaseMsg[cyclePhaseKey] ?? phaseMsg.power;
    const mood = moodMsg[selectedMood]   ?? moodMsg.calm;

    return isRTL
      ? `${base.ar}. ${mood.ar}.`
      : `${base.en}. ${mood.en}.`;
  }, [cyclePhaseKey, fp, energyLevel, selectedMood, isRTL]);

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
              {language === "ar" ? "إيقاع" : "Eqa’a"}
            </Text>

            <Text style={[styles.subtitle, isRTL && { textAlign: "right" }]}>
              {phaseInsight}
            </Text>
          </View>

          <View style={styles.mainCard}>
            {/* Header: title on left, readiness score on right */}
            <View style={[styles.rowBetween, isRTL && { flexDirection: "row-reverse" }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardLabel, isRTL && { textAlign: "right" }]}>
                  {language === "ar" ? "مرحلتك الحالية" : "CURRENT PHASE"}
                </Text>

                <Text style={[styles.cardTitle, isRTL && { textAlign: "right" }]}>
                  {phaseProgressTitle}
                </Text>
              </View>

              <View
                style={[
                  styles.scoreBubble,
                  { backgroundColor: phaseTheme.accent, marginLeft: isRTL ? 0 : 14, marginRight: isRTL ? 14 : 0 },
                ]}
              >
                <Text style={styles.scoreText}>
                  {rhythm.readiness}
                </Text>
              </View>
            </View>

            {/* Progress dots — hidden for ovulation day and pregnancy/postpartum */}
            {lifeMode !== "pregnancy" && lifeMode !== "postpartum" && cycleDay !== 14 && (
              <View style={[styles.phaseDotsSection, isRTL && { alignItems: "flex-end" }]}>
                <View style={[styles.phaseDotsRow, isRTL && { flexDirection: "row-reverse" }]}>
                  {Array.from({ length: phaseProgress.phaseTotalDays }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.phaseDot,
                        {
                          backgroundColor:
                            i < phaseProgress.phaseDay
                              ? phaseProgress.color
                              : `${phaseProgress.color}30`,
                          width: phaseProgress.phaseTotalDays > 6 ? 8 : 11,
                          height: phaseProgress.phaseTotalDays > 6 ? 8 : 11,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.phaseDaysLabel, isRTL && { textAlign: "right" }]}>
                  {isRTL
                    ? `${phaseProgress.phaseDay} / ${phaseProgress.phaseTotalDays} أيام`
                    : `${phaseProgress.phaseDay} / ${phaseProgress.phaseTotalDays} days`}
                </Text>
              </View>
            )}

            {/* Remaining text */}
            <Text style={[styles.cardSubTitle, isRTL && { textAlign: "right" }]}>
              {phaseProgressSub}
            </Text>

            <Text style={[styles.cardText, isRTL && { textAlign: "right" }]}>
              {phaseInsight}
            </Text>
          </View>

          {/* ── Daily Insight ── */}
          <View style={styles.dailyInsightCard}>
            <View style={[styles.dailyInsightHeader, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={styles.dailyInsightBulb}>💡</Text>
              <Text style={styles.dailyInsightTitle}>
                {isRTL ? "لحظة ذكية" : "Daily Insight"}
              </Text>
            </View>
            <Text style={[styles.dailyInsightText, isRTL && { textAlign: "right" }]}>
              {dailyInsight}
            </Text>
          </View>

          {/* ── Eqa'a Score Card ── */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/insights" as any)}
            style={[styles.scoreHomeCard, { borderColor: `${eqaaScore.color}30` }]}
          >
            <View style={[styles.scoreHomeRow, isRTL && { flexDirection: "row-reverse" }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.scoreHomeLabel, isRTL && { textAlign: "right" }]}>
                  {isRTL ? "نقاط إيقاع اليومية" : "EQAA DAILY SCORE"}
                </Text>
                <View style={[styles.scoreHomeNumRow, isRTL && { flexDirection: "row-reverse" }]}>
                  <Text style={[styles.scoreHomeNum, { color: eqaaScore.color }]}>
                    {eqaaScore.total}
                  </Text>
                  <View style={styles.scoreHomeLabelPill}>
                    <Text style={[styles.scoreHomeLabelText, { color: eqaaScore.color }]}>
                      {isRTL ? eqaaScore.labelAr : eqaaScore.label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.scoreHomeDesc, isRTL && { textAlign: "right" }]}>
                  {isRTL ? eqaaScore.descriptionAr : eqaaScore.description}
                </Text>
              </View>
              <View
                style={[
                  styles.scoreHomeBubble,
                  { backgroundColor: `${eqaaScore.color}18`, borderColor: `${eqaaScore.color}50` },
                ]}
              >
                <Text style={[styles.scoreHomeBubbleNum, { color: eqaaScore.color }]}>
                  {eqaaScore.total}
                </Text>
              </View>
            </View>
            <Text style={[styles.scoreHomeTap, isRTL && { textAlign: "right" }]}>
              {isRTL ? "اضغطي لرؤية التفاصيل ←" : "Tap for full breakdown →"}
            </Text>
          </TouchableOpacity>

          {/* ── Health Summary Card ── */}
          <View style={styles.healthHomeCard}>
            <View style={[styles.healthHomeHeader, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={styles.healthHomeLabel}>
                {isRTL ? "ملخص الصحة" : "HEALTH SUMMARY"}
              </Text>
              {isAvailable && (
                <TouchableOpacity
                  onPress={permissionStatus === "granted" ? sync : requestAndSync}
                  style={styles.healthSyncBtn}
                  disabled={syncing}
                >
                  {syncing ? (
                    <ActivityIndicator size="small" color="#C6A7FF" />
                  ) : (
                    <Text style={styles.healthSyncText}>
                      {isRTL ? "مزامنة" : "Sync"}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {permissionStatus !== "granted" && isAvailable ? (
              <TouchableOpacity
                style={styles.healthConnectRow}
                onPress={requestAndSync}
                activeOpacity={0.86}
              >
                <Text style={styles.healthConnectIcon}>❤️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.healthConnectTitle, isRTL && { textAlign: "right" }]}>
                    {isRTL ? "ربط Apple Health" : "Connect Apple Health"}
                  </Text>
                  <Text style={[styles.healthConnectSub, isRTL && { textAlign: "right" }]}>
                    {isRTL ? "اضغطي للمتابعة" : "Tap to get started"}
                  </Text>
                </View>
                <Text style={{ color: "#C6A7FF", fontSize: 16 }}>{isRTL ? "←" : "→"}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={[styles.healthMetricsRow, isRTL && { flexDirection: "row-reverse" }]}>
                  <MiniMetric icon="👟" value={metrics?.steps?.toLocaleString() ?? "—"} label={isRTL ? "خطوة" : "steps"} />
                  <MiniMetric icon="🌙" value={metrics?.sleepHours != null ? `${metrics.sleepHours}h` : "—"} label={isRTL ? "نوم" : "sleep"} />
                  <MiniMetric icon="❤️" value={metrics?.heartRate != null ? `${metrics.heartRate}` : "—"} label={isRTL ? "نبض" : "bpm"} />
                  <MiniMetric icon="📉" value={metrics?.hrv != null ? `${metrics.hrv}` : "—"} label="HRV ms" />
                </View>
                <Text style={[styles.healthSyncedAt, isRTL && { textAlign: "right" }]}>
                  {formatLastSynced(metrics?.lastSynced ?? null, language)}
                </Text>
              </>
            )}
          </View>

          {/* ── Fitness Recommendation Card ── */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/(tabs)/workout" as any)}
            style={[styles.recCard, { borderColor: `${workoutRec.accentColor}28` }]}
          >
            <LinearGradient
              colors={[`${workoutRec.accentColor}14`, `${workoutRec.accentColor}06`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.recGrad}
            >
              <View style={[styles.recHeader, isRTL && { flexDirection: "row-reverse" }]}>
                <Text style={styles.recIcon}>{workoutRec.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recSectionLabel, isRTL && { textAlign: "right" }]}>
                    {isRTL ? "المدرب الذكي" : "AI COACH"}
                  </Text>
                  <Text style={[styles.recTitle, isRTL && { textAlign: "right" }]}>
                    {isRTL ? workoutRec.titleAr : workoutRec.title}
                  </Text>
                  <Text style={[styles.recSub, isRTL && { textAlign: "right" }]}>
                    {isRTL ? workoutRec.subtitleAr : workoutRec.subtitle}
                  </Text>
                </View>
              </View>
              <View style={[styles.recWorkoutsRow, isRTL && { flexDirection: "row-reverse" }]}>
                {workoutRec.workouts.slice(0, 3).map((w, i) => (
                  <View key={i} style={[styles.recWorkoutChip, { borderColor: `${workoutRec.accentColor}40` }]}>
                    <Text style={[styles.recWorkoutText, { color: workoutRec.accentColor }]}>
                      {isRTL ? w.nameAr : w.name}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.recTapHint, isRTL && { textAlign: "right" }]}>
                {isRTL ? "اضغطي لفتح المدرب الذكي ←" : "Tap to open AI Coach →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Smart Period Card — only when predicted/overdue ── */}
          {periodPredicted && !periodCardDismissed && (
            <View style={styles.periodSmartCard}>
              <View style={[styles.periodSmartTop, isRTL && { flexDirection: "row-reverse" }]}>
                <View style={styles.periodSmartDot} />
                <Text style={[styles.periodSmartTitle, isRTL && { textAlign: "right" }]}>
                  {isRTL
                    ? "🩸 هل بدأت دورتك اليوم؟"
                    : "🩸 Has your period started today?"}
                </Text>
              </View>
              <View style={[styles.periodSmartButtons, isRTL && { flexDirection: "row-reverse" }]}>
                <TouchableOpacity
                  activeOpacity={0.84}
                  onPress={handlePeriodConfirm}
                  style={styles.periodSmartYes}
                >
                  <Text style={styles.periodSmartYesText}>
                    {isRTL ? "نعم، بدأت" : "Yes, it started"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.84}
                  onPress={handlePeriodNotYet}
                  style={styles.periodSmartNo}
                >
                  <Text style={styles.periodSmartNoText}>
                    {isRTL ? "لم تبدأ بعد" : "Not yet"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Today's Check-In card ── */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/checkin")}
            style={styles.checkinCard}
          >
            <View style={[styles.checkinHeader, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={styles.checkinIcon}>📋</Text>
              <Text style={styles.checkinLabel}>
                {isRTL ? "تسجيل اليوم" : "Daily Check-In"}
              </Text>
              {todayCheckIn && (
                <View style={styles.checkinDonePill}>
                  <Text style={styles.checkinDoneTxt}>✓</Text>
                </View>
              )}
            </View>

            {todayCheckIn ? (
              <View style={[styles.checkinSummaryRow, isRTL && { flexDirection: "row-reverse" }]}>
                {todayCheckIn.mood && (
                  <View style={styles.checkinChip}>
                    <Text style={styles.checkinChipTxt}>
                      {todayCheckIn.mood === "calm"  ? "🌙 هدوء"    :
                       todayCheckIn.mood === "focus" ? "⚡ طاقة"    :
                       todayCheckIn.mood === "soft"  ? "💜 مشاعري" :
                       todayCheckIn.mood === "slow"  ? "🥗 أكلي"   : todayCheckIn.mood}
                    </Text>
                  </View>
                )}
                {typeof todayCheckIn.energy === "number" && (
                  <View style={styles.checkinChip}>
                    <Text style={styles.checkinChipTxt}>⚡ {todayCheckIn.energy}/10</Text>
                  </View>
                )}
                {typeof todayCheckIn.sleepHours === "number" && (
                  <View style={styles.checkinChip}>
                    <Text style={styles.checkinChipTxt}>💤 {todayCheckIn.sleepHours}h</Text>
                  </View>
                )}
                {todayCheckIn.fastingCompleted && (
                  <View style={[styles.checkinChip, { borderColor: "#7FFFD460" }]}>
                    <Text style={[styles.checkinChipTxt, { color: "#7FFFD4" }]}>⚡ صيام</Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={[styles.checkinSub, isRTL && { textAlign: "right" }]}>
                {isRTL
                  ? "سجّلي طاقتك ونومك وأعراضك اليوم ←"
                  : "Log today's energy, sleep & symptoms →"}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>
            {language === "ar" ? "كيف تشعرين اليوم؟" : "How do you feel today?"}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodsScroll}
          >
            {moods.map((item) => {
              const active =
                selectedMood === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.88}
                  onPress={() => {
                    setSelectedMood(item.key);

                    if (item.key === "calm") {
                      router.push("/breathing-sessions");
                    }
                    if (item.key === "focus") {
                      router.push("/workout");
                    }
                    if (item.key === "soft") {
                      router.push("/reports");
                    }
                    if (item.key === "slow") {
                      router.push("/nutrition");
                    }
                  }}
                  style={[
                    styles.moodCard,
                    active && {
                      borderColor: phaseTheme.accent,
                      backgroundColor: `${phaseTheme.accent}18`,
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>
                    {item.emoji}
                  </Text>
                  <Text style={styles.moodText}>
                    {language === "ar" ? item.ar : item.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.insightCard}>
            <View style={[styles.insightHeader, isRTL && { flexDirection: "row-reverse" }]}>
              <Heart size={20} color="#C7A6FF" />
              <Text style={styles.insightTitle}>
                {language === "ar" ? "انعكاس اليوم" : "Today's Reflection"}
              </Text>
            </View>
            <Text style={[styles.insightText, isRTL && { textAlign: "right" }]}>
              {smartInsight}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.fastingSummary}
            onPress={() => router.push("/(tabs)/fasting" as any)}
          >
            <LinearGradient
              colors={["rgba(120,60,255,0.12)", "rgba(80,30,200,0.06)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fastingSummaryGrad}
            >
              <View style={[styles.fastingSummaryHeader, isRTL && { flexDirection: "row-reverse" }]}>
                <Zap color="#C6A7FF" size={14} />
                <Text style={styles.fastingSummaryLabel}>
                  {language === "ar" ? "الصيام الذكي" : "Smart Fasting"}
                </Text>
              </View>
              <View style={[styles.fastingSummaryContent, isRTL && { flexDirection: "row-reverse" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fastingSummaryPhase, isRTL && { textAlign: "right" }]}>
                    {language === "ar"
                      ? wellnessPhase.phaseArabic
                      : wellnessPhase.title}
                  </Text>
                  <Text style={[styles.fastingSummaryRange, isRTL && { textAlign: "right" }]}>
                    {language === "ar"
                      ? `${FASTING_PHASES[getFastingPhase(cycleDay)].fastingHoursMin}–${FASTING_PHASES[getFastingPhase(cycleDay)].fastingHoursMax} ساعة`
                      : `${FASTING_PHASES[getFastingPhase(cycleDay)].fastingHoursMin}–${FASTING_PHASES[getFastingPhase(cycleDay)].fastingHoursMax}h`}
                  </Text>
                </View>
                <View style={styles.fastingSummaryBtn}>
                  <Text style={styles.fastingSummaryBtnText}>
                    {language === "ar" ? "افتحي" : "Open"}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MiniMetric({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={miniStyles.tile}>
      <Text style={miniStyles.icon}>{icon}</Text>
      <Text style={miniStyles.value}>{value}</Text>
      <Text style={miniStyles.label}>{label}</Text>
    </View>
  );
}

const miniStyles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 10,
    gap: 3,
  },
  icon: { fontSize: 16 },
  value: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", textAlign: "center" },
  label: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: "600" },
});

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
    marginTop: 18,
  },

  outerOrb: {
    width: 165,
    height: 165,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },

  middleOrb: {
    width: 128,
    height: 128,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },

  innerOrb: {
    width: 90,
    height: 90,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  phaseEmoji: {
    fontSize: 28,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 20,
  },

  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 28,
    marginTop: 14,
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

  phaseDotsSection: {
    marginTop: 18,
    alignItems: "flex-start",
  },

  phaseDotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  phaseDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
  },

  phaseDaysLabel: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 9,
    letterSpacing: 0.4,
  },

  cardSubTitle: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
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

  moodsScroll: {
    paddingRight: 4,
    gap: 12,
  },

  moodCard: {
    width: 106,
    height: 130,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.07)",
  },

  moodEmoji: {
    fontSize: 30,
    marginBottom: 12,
  },

  moodText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  dailyInsightCard: {
    marginTop: 18,
    borderRadius: 28,
    padding: 20,
    backgroundColor: "rgba(90,200,190,0.10)",
    borderWidth: 1,
    borderColor: "rgba(90,200,190,0.18)",
  },

  dailyInsightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  dailyInsightBulb: {
    fontSize: 20,
  },

  dailyInsightTitle: {
    color: "#7FFFD4",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  dailyInsightText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 15,
    lineHeight: 28,
    fontWeight: "600",
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

  fastingSummary: {
    marginTop: 24,
    borderRadius: 20,
    overflow: "hidden",
  },

  fastingSummaryGrad: {
    padding: 16,
  },

  fastingSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },

  fastingSummaryLabel: {
    color: "#C6A7FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  fastingSummaryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fastingSummaryPhase: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  fastingSummaryRange: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  fastingSummaryBtn: {
    backgroundColor: "rgba(198,167,255,0.18)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  fastingSummaryBtnText: {
    color: "#C6A7FF",
    fontSize: 14,
    fontWeight: "800",
  },

  // ── Smart Period Card ──────────────────────────────────────────────
  periodSmartCard: {
    marginTop: 20,
    borderRadius: 26,
    padding: 20,
    backgroundColor: "rgba(244,63,94,0.10)",
    borderWidth: 1,
    borderColor: "rgba(244,63,94,0.24)",
  },

  periodSmartTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  periodSmartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F43F5E",
    shadowColor: "#F43F5E",
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },

  periodSmartTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    lineHeight: 24,
  },

  periodSmartButtons: {
    flexDirection: "row",
    gap: 10,
  },

  periodSmartYes: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "#F43F5E",
    alignItems: "center",
  },

  periodSmartYesText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  periodSmartNo: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },

  periodSmartNoText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Today's Check-In card ───────────────────────────────────────────
  checkinCard: {
    marginTop: 20,
    borderRadius: 26,
    padding: 20,
    backgroundColor: "rgba(198,167,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.18)",
  },

  checkinHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  checkinIcon: {
    fontSize: 18,
  },

  checkinLabel: {
    color: "#C6A7FF",
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    letterSpacing: 0.3,
  },

  checkinDonePill: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#7FFFD4",
    alignItems: "center",
    justifyContent: "center",
  },

  checkinDoneTxt: {
    color: "#111",
    fontSize: 13,
    fontWeight: "900",
  },

  checkinSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  checkinChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  checkinChipTxt: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 12,
    fontWeight: "700",
  },

  checkinSub: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
  },

  // ── Eqa'a Score Home Card ─────────────────────────────────────────────
  scoreHomeCard: {
    marginTop: 20,
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
  },

  scoreHomeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },

  scoreHomeLabel: {
    color: "#C6A7FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  scoreHomeNumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  scoreHomeNum: {
    fontSize: 44,
    fontWeight: "900",
  },

  scoreHomeLabelPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  scoreHomeLabelText: {
    fontSize: 13,
    fontWeight: "800",
  },

  scoreHomeDesc: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 20,
  },

  scoreHomeBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  scoreHomeBubbleNum: {
    fontSize: 22,
    fontWeight: "900",
  },

  scoreHomeTap: {
    color: "rgba(255,255,255,0.30)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
  },

  // ── Health Summary Home Card ──────────────────────────────────────────
  healthHomeCard: {
    marginTop: 20,
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  healthHomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  healthHomeLabel: {
    color: "#7FFFD4",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  healthSyncBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(198,167,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
  },

  healthSyncText: {
    color: "#C6A7FF",
    fontSize: 12,
    fontWeight: "700",
  },

  healthConnectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(198,167,255,0.08)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.18)",
  },

  healthConnectIcon: { fontSize: 24 },

  healthConnectTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  healthConnectSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    marginTop: 2,
  },

  healthMetricsRow: {
    flexDirection: "row",
    gap: 8,
  },

  healthSyncedAt: {
    color: "rgba(255,255,255,0.30)",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 12,
  },

  // ── Fitness Recommendation Home Card ─────────────────────────────────
  recCard: {
    marginTop: 20,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
  },

  recGrad: {
    padding: 22,
  },

  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },

  recIcon: { fontSize: 32 },

  recSectionLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 4,
  },

  recTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  recSub: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    marginTop: 2,
  },

  recWorkoutsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  recWorkoutChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  recWorkoutText: {
    fontSize: 12,
    fontWeight: "700",
  },

  recTapHint: {
    color: "rgba(255,255,255,0.30)",
    fontSize: 12,
    fontWeight: "600",
  },
});