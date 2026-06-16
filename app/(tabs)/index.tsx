import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

import { SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import {
  router,
  useFocusEffect,
} from "expo-router";

import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";

import { Heart, Zap } from "lucide-react-native";
import { getFastingPhase, FASTING_PHASES } from "@/src/data/fastingData";

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

  const [periodSaved, setPeriodSaved] =
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

  const handlePeriodStart = () => {
    Alert.alert(
      isRTL ? "تأكيد" : "Confirm",
      isRTL
        ? "هل أنتِ متأكدة أن الدورة بدأت اليوم؟"
        : "Are you sure your period started today?",
      [
        { text: isRTL ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: isRTL ? "نعم، بدأت" : "Yes, it started",
          onPress: async () => {
            const today = new Date().toISOString().split("T")[0];
            await saveLastPeriod(today);
            await loadData();
            setPeriodSaved(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(() => setPeriodSaved(false), 3200);
          },
        },
      ]
    );
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

          {/* ── Period Start Quick Action ── */}
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={handlePeriodStart}
            style={styles.periodBtn}
          >
            <LinearGradient
              colors={["rgba(244,63,94,0.26)", "rgba(180,30,60,0.13)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.periodBtnGrad}
            >
              <View style={[styles.periodBtnInner, isRTL && { flexDirection: "row-reverse" }]}>
                <View style={styles.periodDot} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.periodBtnText, isRTL && { textAlign: "right" }]}>
                    {isRTL ? "نزلت الدورة اليوم" : "Period Started Today"}
                  </Text>
                  <Text style={[styles.periodBtnSub, isRTL && { textAlign: "right" }]}>
                    {isRTL
                      ? "اضغطي هنا لإعادة ضبط الدورة"
                      : "Tap to reset cycle"}
                  </Text>
                </View>
                <Text style={styles.periodBtnArrow}>
                  {isRTL ? "←" : "→"}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Success banner ── */}
          {periodSaved && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                {isRTL ? "✓  تم تحديث الدورة بنجاح" : "✓  Cycle updated successfully"}
              </Text>
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

  // ── Period Start Quick Action ──────────────────────────────────────
  periodBtn: {
    marginTop: 20,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(244,63,94,0.28)",
    shadowColor: "#F43F5E",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
  },

  periodBtnGrad: {
    paddingVertical: 20,
    paddingHorizontal: 22,
  },

  periodBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  periodDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#F43F5E",
    shadowColor: "#F43F5E",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  periodBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  periodBtnSub: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 13,
    fontWeight: "500",
  },

  periodBtnArrow: {
    color: "rgba(244,63,94,0.70)",
    fontSize: 20,
    fontWeight: "700",
  },

  // ── Success banner ─────────────────────────────────────────────────
  successBanner: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "rgba(52,211,153,0.14)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.30)",
    alignItems: "center",
  },

  successText: {
    color: "#34D399",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
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
});