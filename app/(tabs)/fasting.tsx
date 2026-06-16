import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useLanguage } from "@/src/context/LanguageContext";
import { getLastPeriod, getCycleLength } from "@/src/storage/cycleStorage";
import { getLifeMode, getCalories } from "@/src/storage/profileStorage";
import {
  FASTING_PHASES,
  DAILY_INSIGHTS,
  RHYTHM_PLAN,
  MOTIVATIONAL_MESSAGES,
  getFastingPhase,
  type FastingPhaseKey,
} from "@/src/data/fastingData";

import {
  type FastingRecord,
  FASTING_HISTORY_KEY,
  getFastingHistory,
} from "@/src/utils/fastingAnalytics";

const STORAGE_KEY   = "fasting_start_time";
const TIMER_SIZE    = 240;
const ARC_R         = 106;
const CIRCUMFERENCE = 2 * Math.PI * ARC_R;

async function appendHistory(record: FastingRecord): Promise<FastingRecord[]> {
  const existing = await getFastingHistory();
  const updated  = [...existing, record];
  await AsyncStorage.setItem(FASTING_HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

function formatDurationSec(secs: number, isAr: boolean): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (isAr) return h > 0 ? `${h} س ${m} د` : `${m} دقيقة`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTimestamp(ts: number, isAr: boolean): string {
  const d   = new Date(ts);
  const h   = d.getHours();
  const min = d.getMinutes().toString().padStart(2, "0");
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const hh  = String(h12).padStart(2, "0");
  if (isAr) return `${hh}:${min} ${h < 12 ? "ص" : "م"}`;
  return `${hh}:${min} ${h < 12 ? "AM" : "PM"}`;
}

function formatTimeRange(startTs: number, endTs: number, isAr: boolean): string {
  const s = formatTimestamp(startTs, isAr);
  const e = formatTimestamp(endTs, isAr);
  return isAr ? `من ${s} إلى ${e}` : `${s} → ${e}`;
}

const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

function formatDateShort(dateStr: string, isAr: boolean): string {
  const d   = new Date(dateStr + "T12:00:00");
  const day = d.getDate();
  const mon = isAr ? MONTHS_AR[d.getMonth()] : MONTHS_EN[d.getMonth()];
  return isAr ? `${day} ${mon}` : `${mon} ${day}`;
}

const PHASE_THEME: Record<FastingPhaseKey, { color: string; glow: string; bg: string }> = {
  power:   { color: "#C9A84C", glow: "rgba(201,168,76,0.26)",  bg: "rgba(201,168,76,0.09)"  },
  balance: { color: "#B8A4E8", glow: "rgba(184,164,232,0.25)", bg: "rgba(184,164,232,0.09)" },
  clarity: { color: "#E8A878", glow: "rgba(232,168,120,0.25)", bg: "rgba(232,168,120,0.09)" },
  rest:    { color: "#7EB8E0", glow: "rgba(126,184,224,0.25)", bg: "rgba(126,184,224,0.09)" },
};

type Ingredient = {
  emoji: string;
  nameAr: string;
  nameEn: string;
  gramsAr?: string;
  gramsEn?: string;
};

type MealData = {
  emoji: string;
  titleAr: string;
  titleEn: string;
  ingredients: Ingredient[];
  nutrition: { proteinG: number; carbG: number; fatG: number; kcal: number };
};

const FIRST_MEAL: Record<FastingPhaseKey, MealData> = {
  power: {
    emoji: "🥚",
    titleAr: "وجبة غنية بالبروتين",
    titleEn: "Protein-Focused Breakfast",
    ingredients: [
      { emoji: "🥚", nameAr: "بيض", nameEn: "Eggs", gramsAr: "120 جم", gramsEn: "120g" },
      { emoji: "🌰", nameAr: "مكسرات", nameEn: "Nuts", gramsAr: "30 جم", gramsEn: "30g" },
      { emoji: "🧴", nameAr: "زبادي يوناني", nameEn: "Greek Yogurt", gramsAr: "150 جم", gramsEn: "150g" },
    ],
    nutrition: { proteinG: 35, carbG: 20, fatG: 18, kcal: 380 },
  },
  balance: {
    emoji: "🥗",
    titleAr: "وجبة متوازنة",
    titleEn: "Balanced Breakfast",
    ingredients: [
      { emoji: "🍓", nameAr: "فاكهة طازجة", nameEn: "Fresh Fruit", gramsAr: "100 جم", gramsEn: "100g" },
      { emoji: "🥚", nameAr: "بيض", nameEn: "Eggs", gramsAr: "100 جم", gramsEn: "100g" },
      { emoji: "🌾", nameAr: "حبوب كاملة", nameEn: "Whole Grains", gramsAr: "60 جم", gramsEn: "60g" },
    ],
    nutrition: { proteinG: 18, carbG: 50, fatG: 10, kcal: 365 },
  },
  clarity: {
    emoji: "✨",
    titleAr: "وجبة غنية بالمعادن",
    titleEn: "Mineral-Rich Breakfast",
    ingredients: [
      { emoji: "🥬", nameAr: "خضروات ورقية", nameEn: "Leafy Greens", gramsAr: "80 جم", gramsEn: "80g" },
      { emoji: "🌰", nameAr: "مكسرات", nameEn: "Nuts", gramsAr: "30 جم", gramsEn: "30g" },
      { emoji: "🫘", nameAr: "بذور متنوعة", nameEn: "Mixed Seeds", gramsAr: "20 جم", gramsEn: "20g" },
      { emoji: "🥑", nameAr: "أفوكادو", nameEn: "Avocado", gramsAr: "60 جم", gramsEn: "60g" },
    ],
    nutrition: { proteinG: 10, carbG: 18, fatG: 20, kcal: 295 },
  },
  rest: {
    emoji: "🍵",
    titleAr: "وجبة دافئة ومغذية",
    titleEn: "Comforting Nourishing Breakfast",
    ingredients: [
      { emoji: "🌾", nameAr: "شوفان", nameEn: "Oatmeal", gramsAr: "80 جم", gramsEn: "80g" },
      { emoji: "🍌", nameAr: "موز", nameEn: "Banana", gramsAr: "100 جم", gramsEn: "100g" },
      { emoji: "🍯", nameAr: "عسل", nameEn: "Honey", gramsAr: "15 جم", gramsEn: "15g" },
    ],
    nutrition: { proteinG: 8, carbG: 65, fatG: 4, kcal: 330 },
  },
};

const LAST_MEAL: Record<FastingPhaseKey, MealData> = {
  power: {
    emoji: "🥙",
    titleAr: "عشاء خفيف ومشبع",
    titleEn: "Light & Satisfying Dinner",
    ingredients: [
      { emoji: "🥗", nameAr: "خضار طازجة", nameEn: "Fresh Salad", gramsAr: "100 جم", gramsEn: "100g" },
      { emoji: "🍗", nameAr: "دجاج مشوي", nameEn: "Grilled Chicken", gramsAr: "120 جم", gramsEn: "120g" },
      { emoji: "🫒", nameAr: "زيت زيتون", nameEn: "Olive Oil", gramsAr: "10 جم", gramsEn: "10g" },
    ],
    nutrition: { proteinG: 34, carbG: 10, fatG: 14, kcal: 300 },
  },
  balance: {
    emoji: "🫙",
    titleAr: "عشاء لطيف ومتوازن",
    titleEn: "Gentle Balanced Dinner",
    ingredients: [
      { emoji: "🥦", nameAr: "خضروات مطبوخة", nameEn: "Cooked Vegetables", gramsAr: "150 جم", gramsEn: "150g" },
      { emoji: "🐟", nameAr: "سمك خفيف", nameEn: "Light Fish", gramsAr: "100 جم", gramsEn: "100g" },
      { emoji: "🫒", nameAr: "زيت زيتون", nameEn: "Olive Oil", gramsAr: "8 جم", gramsEn: "8g" },
    ],
    nutrition: { proteinG: 26, carbG: 18, fatG: 10, kcal: 275 },
  },
  clarity: {
    emoji: "🐟",
    titleAr: "عشاء غني بالمغذيات",
    titleEn: "Nutrient-Rich Dinner",
    ingredients: [
      { emoji: "🐟", nameAr: "سمك", nameEn: "Fish", gramsAr: "130 جم", gramsEn: "130g" },
      { emoji: "🫘", nameAr: "بذور متنوعة", nameEn: "Mixed Seeds", gramsAr: "15 جم", gramsEn: "15g" },
      { emoji: "🌈", nameAr: "خضروات ملونة", nameEn: "Colorful Vegetables", gramsAr: "120 جم", gramsEn: "120g" },
    ],
    nutrition: { proteinG: 30, carbG: 14, fatG: 12, kcal: 285 },
  },
  rest: {
    emoji: "🫖",
    titleAr: "عشاء مريح ودافئ",
    titleEn: "Comforting Warm Dinner",
    ingredients: [
      { emoji: "🍲", nameAr: "حساء دافئ", nameEn: "Warm Soup", gramsAr: "250 جم", gramsEn: "250g" },
      { emoji: "🥕", nameAr: "خضروات مطبوخة", nameEn: "Cooked Vegetables", gramsAr: "100 جم", gramsEn: "100g" },
      { emoji: "🌾", nameAr: "خبز", nameEn: "Bread", gramsAr: "40 جم", gramsEn: "40g" },
    ],
    nutrition: { proteinG: 10, carbG: 42, fatG: 6, kcal: 265 },
  },
};

export default function FastingScreen() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [cycleDay,      setCycleDay]      = useState(1);
  const [phaseKey,      setPhaseKey]      = useState<FastingPhaseKey>("power");
  const [lifeMode,      setLifeMode]      = useState<
    "regular" | "pregnancy" | "postpartum" | "pcos" | "moon"
  >("regular");
  const [dailyCalories, setDailyCalories] = useState<number | null>(null);

  const [fastingStart, setFastingStart] = useState<number | null>(null);
  const [elapsed,      setElapsed]      = useState(0);
  const [msgIndex,     setMsgIndex]     = useState(0);

  const [lastFast, setLastFast] = useState<FastingRecord | null>(null);
  const [history,  setHistory]  = useState<FastingRecord[]>([]);

  const phase      = FASTING_PHASES[phaseKey];
  const insight    = DAILY_INSIGHTS[phaseKey];
  const rhythmPlan = RHYTHM_PLAN[phaseKey];
  const isActive   = fastingStart !== null;
  const targetSecs = phase.fastingHoursMax * 3600;
  const progress   = Math.min(elapsed / targetSecs, 1);
  const isComplete = isActive && elapsed >= targetSecs;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const phaseColor = PHASE_THEME[phaseKey].color;
  const phaseGlow  = PHASE_THEME[phaseKey].glow;
  const phaseBg    = PHASE_THEME[phaseKey].bg;

  const weeklyAvgHours = history.length > 0
    ? history.reduce((s, r) => s + r.durationSec, 0) / history.length / 3600
    : 0;

  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      const [lastStr, cycleLen, savedMode, savedCals] = await Promise.all([
        getLastPeriod(),
        getCycleLength(),
        getLifeMode(),
        getCalories(),
      ]);

      if (
        savedMode === "regular"    ||
        savedMode === "pregnancy"  ||
        savedMode === "postpartum" ||
        savedMode === "pcos"       ||
        savedMode === "moon"
      ) {
        setLifeMode(savedMode);
      }

      if (savedCals) setDailyCalories(savedCals);

      if (lastStr) {
        const last     = new Date(lastStr);
        const diffDays = Math.floor((Date.now() - last.getTime()) / 86400000);
        const day      = Math.max(1, (diffDays % cycleLen) + 1);
        setCycleDay(day);
        setPhaseKey(getFastingPhase(day));
      }

      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const start = Number(saved);
        setFastingStart(start);
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }

      const hist = await getFastingHistory();
      if (hist.length > 0) {
        setLastFast(hist[hist.length - 1]);
        setHistory(hist.slice(-7));
      }
    }
    load();

    setMsgIndex(Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length));
    Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!fastingStart) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - fastingStart) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [fastingStart]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1,   duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0.5);
      Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();
    }
  }, [isActive]);

  const handleStart = async () => {
    const now = Date.now();
    await AsyncStorage.setItem(STORAGE_KEY, String(now));
    setFastingStart(now);
    setElapsed(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleStop = async () => {
    if (fastingStart === null) return;
    const now    = Date.now();
    const record: FastingRecord = {
      date:        new Date().toISOString().split("T")[0],
      startTime:   fastingStart,
      endTime:     now,
      durationSec: Math.floor((now - fastingStart) / 1000),
    };
    const updated = await appendHistory(record);
    setLastFast(record);
    setHistory(updated.slice(-7));

    await AsyncStorage.removeItem(STORAGE_KEY);
    setFastingStart(null);
    setElapsed(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatElapsed = () => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const progressPct  = Math.round(progress * 100);
  const arcColor     = isComplete ? "#FFD700" : phaseColor;
  const glowColor    = isComplete ? "rgba(255,215,0,0.35)" : phaseGlow;

  const lifeModeLabel = (() => {
    const map = {
      regular:   { ar: "دورة منتظمة",       en: "Regular Cycle"    },
      pcos:      { ar: "غير منتظمة / تكيس",  en: "Irregular / PCOS" },
      moon:      { ar: "مزامنة القمر",       en: "Moon Sync"        },
      pregnancy: { ar: "حامل",              en: "Pregnancy"        },
      postpartum:{ ar: "بعد الولادة",        en: "Postpartum"       },
    };
    return isArabic ? map[lifeMode].ar : map[lifeMode].en;
  })();

  const firstMeal = FIRST_MEAL[phaseKey];
  const lastMeal  = LAST_MEAL[phaseKey];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#03020C", "#0A0818", "#130B22"]} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.aurora1, { backgroundColor: phaseBg }]} />
        <View style={[styles.aurora2, { backgroundColor: "rgba(80,30,180,0.10)" }]} />
        <View style={[styles.aurora3, { backgroundColor: phaseBg }]} />
      </View>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeIn }}>

          <View style={styles.header}>
            <View style={[styles.phaseBadge, { borderColor: phaseColor + "55", backgroundColor: phaseColor + "18" }]}>
              <Text style={[styles.phaseBadgeText, { color: phaseColor }]}>
                {isArabic ? phase.nameAr : phase.nameEn}
              </Text>
            </View>
            <View />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            <Text style={[styles.pageTitle, isArabic && styles.rtl]}>
              {isArabic ? "الصيام الذكي" : "Smart Fasting"}
            </Text>
            <Text style={[styles.pageSubtitle, isArabic && styles.rtl]}>
              {isArabic
                ? "اقتراحات لطيفة للصيام وفق مرحلتك الحالية."
                : "Gentle fasting suggestions based on your current phase."}
            </Text>

            <View style={[styles.phaseCard, { borderColor: phaseColor + "30" }]}>
              <View style={styles.phaseCardRow}>
                <View style={styles.phaseCardLeft}>
                  <Text style={styles.phaseCardMeta}>
                    {isArabic ? "المرحلة الحالية" : "Current Phase"}
                  </Text>
                  <Text style={[styles.phaseCardName, { color: phaseColor }]}>
                    {isArabic ? phase.nameAr : phase.nameEn}
                  </Text>
                  <Text style={styles.phaseCardDay}>
                    {isArabic ? `يوم ${cycleDay} من الدورة` : `Day ${cycleDay} of cycle`}
                  </Text>
                </View>
                <View style={[styles.lifeModeTag, { borderColor: phaseColor + "40", backgroundColor: phaseColor + "14" }]}>
                  <Text style={[styles.lifeModeText, { color: phaseColor }]}>
                    {lifeModeLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.phaseWindowRow}>
                <Text style={styles.phaseWindowLabel}>
                  {isArabic ? "النافذة المقترحة" : "Suggested Window"}
                </Text>
                <Text style={[styles.phaseWindowValue, { color: phaseColor }]}>
                  {isArabic
                    ? `${phase.fastingHoursMin}–${phase.fastingHoursMax} ساعة`
                    : `${phase.fastingHoursMin}–${phase.fastingHoursMax}h`}
                </Text>
              </View>
            </View>

            <View style={[styles.respondsCard, { borderColor: phaseColor + "28" }]}>
              <Text style={[styles.respondsHeader, isArabic && styles.rtl]}>
                {isArabic ? "ما يناسب جسمكِ اليوم" : "Your body responds best today to"}
              </Text>
              <View style={[styles.respondsRangeRow, isArabic && styles.rowRev]}>
                <Text style={styles.respondsRangeLabel}>
                  {isArabic ? "الصيام المقترح" : "Recommended fasting"}
                </Text>
                <Text style={[styles.respondsRangeValue, { color: phaseColor }]}>
                  {phase.fastingHoursMin}–{phase.fastingHoursMax}h
                </Text>
              </View>
              <View style={styles.supportList}>
                {phase.bodySupport.map((item, idx) => (
                  <View key={idx} style={[styles.supportRow, isArabic && styles.rowRev]}>
                    <Text style={[styles.supportCheck, { color: phaseColor }]}>✓</Text>
                    <Text style={[styles.supportText, isArabic && styles.rtl]}>
                      {isArabic ? item.ar : item.en}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={[styles.supportMeta, isArabic && styles.rowRev]}>
                <View style={[styles.supportMetaItem, { borderColor: phaseColor + "30" }]}>
                  <Text style={styles.supportMetaIcon}>🏃‍♀️</Text>
                  <Text style={[styles.supportMetaText, isArabic && styles.rtl]}>
                    {isArabic ? phase.movement.ar : phase.movement.en}
                  </Text>
                </View>
                <View style={[styles.supportMetaItem, { borderColor: phaseColor + "30" }]}>
                  <Text style={styles.supportMetaIcon}>🌙</Text>
                  <Text style={[styles.supportMetaText, isArabic && styles.rtl]}>
                    {isArabic ? phase.recovery.ar : phase.recovery.en}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.timerSection}>
              <Animated.View
                pointerEvents="none"
                style={[styles.timerHalo, { backgroundColor: glowColor, opacity: pulseAnim }]}
              />
              <View style={styles.timerArcWrapper} pointerEvents="none">
                <Svg width={TIMER_SIZE + 30} height={TIMER_SIZE + 30} style={{ transform: [{ rotate: "-90deg" }] }}>
                  <Circle
                    cx={(TIMER_SIZE + 30) / 2} cy={(TIMER_SIZE + 30) / 2}
                    r={ARC_R}
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={3}
                    fill="none"
                  />
                  {isActive && (
                    <Circle
                      cx={(TIMER_SIZE + 30) / 2} cy={(TIMER_SIZE + 30) / 2}
                      r={ARC_R}
                      stroke={arcColor}
                      strokeWidth={3.5}
                      fill="none"
                      strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  )}
                </Svg>
              </View>
              <View style={[styles.timerOrb, { shadowColor: phaseColor }]}>
                <LinearGradient
                  colors={[phaseBg, "rgba(255,255,255,0.03)", "transparent"]}
                  start={{ x: 0.15, y: 0.05 }}
                  end={{ x: 0.85, y: 0.95 }}
                  style={StyleSheet.absoluteFill}
                />
                {isActive ? (
                  <>
                    <Text style={[styles.timerPhaseLabel, { color: phaseColor + "CC" }]}>
                      {isArabic ? phase.nameAr : phase.nameEn}
                    </Text>
                    <Text style={styles.timerDisplay}>{formatElapsed()}</Text>
                    <Text style={[styles.timerSub, { color: phaseColor + "AA" }]}>
                      {progressPct < 1
                        ? (isArabic ? "بدأ الآن" : "Just started")
                        : (isArabic ? `${progressPct}٪ مكتمل` : `${progressPct}% complete`)}
                    </Text>
                    {isComplete && (
                      <Text style={styles.timerComplete}>
                        {isArabic ? "اكتمل ✨" : "Complete ✨"}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={[styles.timerIdleLabel, { color: phaseColor + "99" }]}>
                      {isArabic ? "الهدف المقترح" : "Suggested Goal"}
                    </Text>
                    <Text style={[styles.timerIdleHours, { color: phaseColor }]}>
                      {phase.fastingHoursMin}–{phase.fastingHoursMax}h
                    </Text>
                    <Text style={styles.timerIdleSub}>
                      {isArabic ? phase.fastingLabelAr : phase.fastingLabelEn}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={isActive ? handleStop : handleStart}
              style={styles.ctaWrapper}
            >
              <LinearGradient
                colors={
                  isActive
                    ? ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.05)"]
                    : [phaseColor + "55", phaseColor + "25"]
                }
                style={[styles.ctaButton, { borderColor: phaseColor + "44" }]}
              >
                <Text style={styles.ctaIcon}>{isActive ? "⬜" : "▶"}</Text>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaText}>
                    {isActive
                      ? (isArabic ? "أنهي الصيام" : "End Fast")
                      : (isArabic ? "ابدئي الصيام اللطيف" : "Begin Gentle Fast")}
                  </Text>
                  {isActive && (
                    <Text style={styles.ctaSub}>
                      {isArabic
                        ? "إيقاف المؤقت وتسجيل جلسة الصيام الحالية"
                        : "Stop timer and log this fasting session"}
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={[styles.intensityCard, { borderColor: phaseColor + "22" }]}>
              <Text style={[styles.intensityTitle, isArabic && styles.rtl]}>
                {isArabic ? "أنماط الصيام اليوم" : "Fasting Modes Today"}
              </Text>
              {([
                { labelAr: "الصيام المتقطع",    labelEn: "Intermittent Fasting", score: phase.intensity.intermittentIF  },
                { labelAr: "الاستشفاء الخلوي",  labelEn: "Autophagy",            score: phase.intensity.autophagy       },
                { labelAr: "حرق الدهون",         labelEn: "Fat Burning",          score: phase.intensity.fatBurning      },
                { labelAr: "التعافي",            labelEn: "Recovery",             score: phase.intensity.recoveryScore   },
              ] as const).map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.intensityRow,
                    idx > 0 && styles.intensityRowBorder,
                    isArabic && styles.rowRev,
                  ]}
                >
                  <Text style={[styles.intensityLabel, isArabic && styles.rtl]}>
                    {isArabic ? item.labelAr : item.labelEn}
                  </Text>
                  <Text style={[styles.intensityStars, { color: phaseColor }]}>
                    {Array.from({ length: 5 }, (_, j) => (j < item.score ? "★" : "☆")).join("")}
                  </Text>
                </View>
              ))}
            </View>

            {lastFast && (
              <View style={[styles.lastFastCard, { borderColor: phaseColor + "28" }]}>
                <Text style={styles.lastFastTag}>
                  {isArabic ? "آخر صيام" : "Last Fast"}
                </Text>
                <Text style={[styles.lastFastDuration, { color: phaseColor }]}>
                  {formatDurationSec(lastFast.durationSec, isArabic)}
                </Text>
                <View style={[styles.lastFastMeta, isArabic && styles.rowRev]}>
                  <Text style={styles.lastFastMetaText}>
                    {formatDateShort(lastFast.date, isArabic)}
                  </Text>
                  <Text style={styles.lastFastMetaDot}>·</Text>
                  <Text style={styles.lastFastMetaText}>
                    {formatTimeRange(lastFast.startTime, lastFast.endTime, isArabic)}
                  </Text>
                </View>
              </View>
            )}

            {history.length > 0 && (
              <View style={[styles.historyCard, { borderColor: phaseColor + "22" }]}>
                <View style={[styles.historyHeader, isArabic && styles.rowRev]}>
                  <Text style={styles.historyTitle}>
                    {isArabic ? "سجل الصيام" : "Fasting History"}
                  </Text>
                  <Text style={[styles.historyAvg, { color: phaseColor }]}>
                    {isArabic
                      ? `متوسط ${weeklyAvgHours.toFixed(1)} ساعة`
                      : `~${weeklyAvgHours.toFixed(1)}h avg`}
                  </Text>
                </View>
                {history.slice().reverse().map((rec, i) => (
                  <View
                    key={i}
                    style={[styles.historyRow, i > 0 && styles.historyRowBorder]}
                  >
                    <View style={styles.historyRowLeft}>
                      <Text style={[styles.historyDate, isArabic && styles.rtl]}>
                        {formatDateShort(rec.date, isArabic)}
                      </Text>
                      <Text style={[styles.historyTimeRange, isArabic && styles.rtl]}>
                        {formatTimeRange(rec.startTime, rec.endTime, isArabic)}
                      </Text>
                    </View>
                    <Text style={[styles.historyDuration, { color: phaseColor }]}>
                      {formatDurationSec(rec.durationSec, isArabic)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {dailyCalories !== null && (
              <View style={[styles.caloriesCard, { borderColor: phaseColor + "28" }]}>
                <Text style={styles.caloriesLabel}>
                  {isArabic ? "السعرات المقترحة اليوم" : "Recommended Calories Today"}
                </Text>
                <Text style={[styles.caloriesValue, { color: phaseColor }]}>
                  {dailyCalories.toLocaleString()} kcal
                </Text>
                <Text style={[styles.caloriesNote, isArabic && styles.rtl]}>
                  {isArabic
                    ? "مبنية على بياناتك الصحية المحفوظة في الإعدادات."
                    : "Based on your health profile saved in Settings."}
                </Text>
              </View>
            )}

            <View style={[styles.mealCard, { borderColor: phaseColor + "28" }]}>
              <Text style={[styles.mealCardTag, isArabic && styles.rtl]}>
                {isArabic ? "أول وجبة" : "First Meal"}
              </Text>
              <Text style={[styles.mealCardTitle, { color: phaseColor }, isArabic && styles.rtl]}>
                {isArabic ? firstMeal.titleAr : firstMeal.titleEn}
              </Text>
              <View style={styles.ingredientList}>
                {firstMeal.ingredients.map((ing, i) => (
                  <View key={i} style={[styles.ingredientRow, isArabic && styles.rowRev]}>
                    <Text style={styles.ingredientEmoji}>{ing.emoji}</Text>
                    <Text style={[styles.ingredientName, isArabic && styles.rtl]}>
                      {isArabic ? ing.nameAr : ing.nameEn}
                    </Text>
                    {(ing.gramsAr || ing.gramsEn) && (
                      <Text style={styles.ingredientGrams}>
                        {isArabic ? `— ${ing.gramsAr}` : `— ${ing.gramsEn}`}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.mealDivider} />
              <View style={[styles.nutritionRow, isArabic && styles.rowRev]}>
                <View style={styles.nutritionChip}>
                  <Text style={styles.nutritionChipText}>
                    {"🔥 "}{firstMeal.nutrition.kcal}{isArabic ? " سعرة" : " kcal"}
                  </Text>
                </View>
                <View style={styles.nutritionChip}>
                  <Text style={styles.nutritionChipText}>
                    {"💪 "}{firstMeal.nutrition.proteinG}{isArabic ? " جم بروتين" : "g prot"}
                  </Text>
                </View>
                <View style={styles.nutritionChip}>
                  <Text style={styles.nutritionChipText}>
                    {"🍚 "}{firstMeal.nutrition.carbG}{isArabic ? " جم كارب" : "g carb"}
                  </Text>
                </View>
                <View style={styles.nutritionChip}>
                  <Text style={styles.nutritionChipText}>
                    {"🥑 "}{firstMeal.nutrition.fatG}{isArabic ? " جم دهون" : "g fat"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.mealCard, { borderColor: phaseColor + "28" }]}>
              <Text style={[styles.mealCardTag, isArabic && styles.rtl]}>
                {isArabic ? "آخر وجبة" : "Last Meal"}
              </Text>
              <Text style={[styles.mealCardTitle, { color: phaseColor }, isArabic && styles.rtl]}>
                {isArabic ? lastMeal.titleAr : lastMeal.titleEn}
              </Text>
              <View style={styles.ingredientList}>
                {lastMeal.ingredients.map((ing, i) => (
                  <View key={i} style={[styles.ingredientRow, isArabic && styles.rowRev]}>
                    <Text style={styles.ingredientEmoji}>{ing.emoji}</Text>
                    <Text style={[styles.ingredientName, isArabic && styles.rtl]}>
                      {isArabic ? ing.nameAr : ing.nameEn}
                    </Text>
                    {(ing.gramsAr || ing.gramsEn) && (
                      <Text style={styles.ingredientGrams}>
                        {isArabic ? `— ${ing.gramsAr}` : `— ${ing.gramsEn}`}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.mealDivider} />
              <View style={[styles.nutritionRow, isArabic && styles.rowRev]}>
                <View style={styles.nutritionChip}>
                  <Text style={styles.nutritionChipText}>
                    {"🔥 "}{lastMeal.nutrition.kcal}{isArabic ? " سعرة" : " kcal"}
                  </Text>
                </View>
                <View style={styles.nutritionChip}>
                  <Text style={styles.nutritionChipText}>
                    {"💪 "}{lastMeal.nutrition.proteinG}{isArabic ? " جم بروتين" : "g prot"}
                  </Text>
                </View>
                <View style={styles.nutritionChip}>
                  <Text style={styles.nutritionChipText}>
                    {"🍚 "}{lastMeal.nutrition.carbG}{isArabic ? " جم كارب" : "g carb"}
                  </Text>
                </View>
                <View style={styles.nutritionChip}>
                  <Text style={styles.nutritionChipText}>
                    {"🥑 "}{lastMeal.nutrition.fatG}{isArabic ? " جم دهون" : "g fat"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.hydrationCard, { borderColor: phaseColor + "22" }]}>
              <View style={[styles.hydrationRow, isArabic && styles.rowRev]}>
                <Text style={styles.hydrationEmoji}>💧</Text>
                <Text style={[styles.hydrationText, isArabic && styles.rtl]}>
                  {isArabic
                    ? "اشربي الماء بانتظام اليوم."
                    : "Remember to hydrate throughout the day."}
                </Text>
              </View>
            </View>

            <View style={[styles.insightCard, { borderColor: phaseColor + "30" }]}>
              <View style={styles.insightHeader}>
                <Text style={[styles.insightDot, { backgroundColor: phaseColor }]} />
                <Text style={styles.insightLabel}>
                  {isArabic ? "بصيرة اليوم" : "Today's Insight"}
                </Text>
              </View>
              <Text style={[styles.insightText, isArabic && styles.rtl]}>
                {isArabic ? insight.ar : insight.en}
              </Text>
            </View>

            <View style={styles.descCard}>
              <Text style={[styles.descTitle, { color: phaseColor }, isArabic && styles.rtl]}>
                {isArabic ? phase.nameAr : phase.nameEn}
              </Text>
              <Text style={[styles.descText, isArabic && styles.rtl]}>
                {isArabic ? phase.descAr : phase.descEn}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, isArabic && styles.rtl]}>
              {isArabic ? "أفضل الأطعمة لهذه المرحلة" : "Best Foods for This Phase"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.foodsRow, isArabic && { flexDirection: "row-reverse" }]}
            >
              {phase.foods.map((food, i) => (
                <View key={i} style={[styles.foodChip, { borderColor: phaseColor + "35" }]}>
                  <Text style={styles.foodEmoji}>{food.emoji}</Text>
                  <Text style={styles.foodName}>
                    {isArabic ? food.nameAr : food.nameEn}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, isArabic && styles.rtl]}>
              {isArabic ? "خطة إيقاع اليوم" : "Daily Rhythm Plan"}
            </Text>
            <View style={styles.rhythmGrid}>
              {rhythmPlan.map((item, i) => (
                <View key={i} style={[styles.rhythmCard, { borderColor: phaseColor + "28" }]}>
                  <Text style={styles.rhythmIcon}>{item.icon}</Text>
                  <Text style={[styles.rhythmTitle, isArabic && styles.rtl]}>
                    {isArabic ? item.titleAr : item.titleEn}
                  </Text>
                  <Text style={[styles.rhythmDesc, isArabic && styles.rtl]}>
                    {isArabic ? item.descAr : item.descEn}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.motivCard}>
              <Text style={styles.motivQuote}>"</Text>
              <Text style={[styles.motivText, isArabic && styles.rtl]}>
                {isArabic
                  ? MOTIVATIONAL_MESSAGES[msgIndex].ar
                  : MOTIVATIONAL_MESSAGES[msgIndex].en}
              </Text>
              <Text style={[styles.motivPhase, { color: phaseColor }]}>
                — {isArabic ? phase.nameAr : phase.nameEn}
              </Text>
            </View>

            <View style={styles.disclaimerCard}>
              <Text style={[styles.disclaimerText, isArabic && styles.rtl]}>
                {isArabic
                  ? "المحتوى للتوعية العامة وليس نصيحة طبية. استشيري طبيبكِ دائماً."
                  : "This content is for general wellness education and not medical advice. Always consult your healthcare provider."}
              </Text>
            </View>

          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#03020C" },

  aurora1: { position: "absolute", width: 460, height: 460, borderRadius: 999, top: -160, left: -140 },
  aurora2: { position: "absolute", width: 400, height: 400, borderRadius: 999, top: -80,  right: -150 },
  aurora3: { position: "absolute", width: 380, height: 380, borderRadius: 999, bottom: -120, right: -100 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 4,
    paddingTop: 10,
  },
  phaseBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  phaseBadgeText: { fontSize: 13, fontWeight: "700" },

  scroll: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 120 },

  pageTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  pageSubtitle: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 32,
  },
  rtl:    { textAlign: "right", writingDirection: "rtl" },
  rowRev: { flexDirection: "row-reverse" },

  phaseCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  phaseCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  phaseCardLeft: { flex: 1 },
  phaseCardMeta: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  phaseCardName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  phaseCardDay: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    fontWeight: "600",
  },
  lifeModeTag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
    alignSelf: "flex-start",
  },
  lifeModeText: { fontSize: 12, fontWeight: "800" },
  phaseWindowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  phaseWindowLabel: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 13,
    fontWeight: "700",
  },
  phaseWindowValue: { fontSize: 15, fontWeight: "900", letterSpacing: -0.3 },

  respondsCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  respondsHeader: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  respondsRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  respondsRangeLabel: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 16,
    fontWeight: "700",
  },
  respondsRangeValue: {
    fontSize: 34,
    fontWeight: "200",
    letterSpacing: -1,
  },
  supportList: { gap: 9 },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  supportCheck: { fontSize: 13, fontWeight: "800" },
  supportText: {
    flex: 1,
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: "500",
  },
  supportMeta: {
    flexDirection: "row",
    gap: 10,
  },
  supportMetaItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  supportMetaIcon: { fontSize: 18 },
  supportMetaText: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },

  intensityCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    gap: 4,
  },
  intensityTitle: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
  },
  intensityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
  },
  intensityRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  intensityLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "600",
  },
  intensityStars: {
    fontSize: 16,
    letterSpacing: 2,
  },

  timerSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    height: TIMER_SIZE + 60,
  },
  timerHalo: {
    position: "absolute",
    width: TIMER_SIZE + 80,
    height: TIMER_SIZE + 80,
    borderRadius: 999,
  },
  timerArcWrapper: {
    position: "absolute",
    width: TIMER_SIZE + 30,
    height: TIMER_SIZE + 30,
  },
  timerOrb: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: 999,
    backgroundColor: "rgba(20,12,45,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.45,
    shadowRadius: 55,
    shadowOffset: { width: 0, height: 0 },
    overflow: "hidden",
  },
  timerPhaseLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
  },
  timerDisplay: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "200",
    letterSpacing: -1,
    lineHeight: 58,
  },
  timerSub: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
  },
  timerComplete: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  timerIdleLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
  },
  timerIdleHours: {
    fontSize: 46,
    fontWeight: "200",
    lineHeight: 52,
    letterSpacing: -1,
  },
  timerIdleSub: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },

  ctaWrapper: { marginBottom: 22 },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  ctaIcon:    { color: "#FFFFFF", fontSize: 14 },
  ctaContent: { alignItems: "center" },
  ctaText:    { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  ctaSub: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },

  lastFastCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    gap: 8,
  },
  lastFastTag: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontWeight: "800",
  },
  lastFastDuration: {
    fontSize: 32,
    fontWeight: "200",
    letterSpacing: -0.5,
  },
  lastFastMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  lastFastMetaText: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 13,
    fontWeight: "600",
  },
  lastFastMetaDot: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 14,
  },

  historyCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  historyTitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    fontWeight: "800",
  },
  historyAvg: {
    fontSize: 14,
    fontWeight: "700",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  historyRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  historyRowLeft: {
    flex: 1,
    gap: 3,
  },
  historyDate: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "700",
  },
  historyTimeRange: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 12,
    fontWeight: "500",
  },
  historyDuration: {
    fontSize: 15,
    fontWeight: "800",
  },

  caloriesCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    alignItems: "center",
    gap: 6,
  },
  caloriesLabel: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 12,
    fontWeight: "800",
  },
  caloriesValue: {
    fontSize: 44,
    fontWeight: "200",
    letterSpacing: -1,
  },
  caloriesNote: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  mealCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  mealCardTag: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontWeight: "800",
  },
  mealCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  ingredientList: { gap: 2 },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  ingredientEmoji: {
    fontSize: 19,
    width: 26,
    textAlign: "center",
  },
  ingredientName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  ingredientGrams: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 13,
    fontWeight: "500",
  },
  mealDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 2,
  },
  nutritionRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  nutritionChip: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  nutritionChipText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "700",
  },

  hydrationCard: {
    backgroundColor: "rgba(126,184,224,0.06)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  hydrationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hydrationEmoji: { fontSize: 22 },
  hydrationText: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },

  insightCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
  },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  insightDot:    { width: 7, height: 7, borderRadius: 999 },
  insightLabel:  { color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "800" },
  insightText:   { color: "rgba(255,255,255,0.82)", fontSize: 16, lineHeight: 26, fontWeight: "400" },

  descCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  descTitle: { fontSize: 14, fontWeight: "800", marginBottom: 8, letterSpacing: -0.2 },
  descText:  { color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 24 },

  sectionTitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 14,
  },

  foodsRow: { paddingRight: 8, gap: 10, marginBottom: 30 },
  foodChip: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 80,
    gap: 6,
  },
  foodEmoji: { fontSize: 26 },
  foodName:  { color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: "600" },

  rhythmGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  rhythmCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  rhythmIcon:  { fontSize: 24 },
  rhythmTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  rhythmDesc:  { color: "rgba(255,255,255,0.50)", fontSize: 12, lineHeight: 18 },

  motivCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  motivQuote: { color: "rgba(255,255,255,0.15)", fontSize: 48, fontWeight: "800", lineHeight: 48, marginBottom: 8 },
  motivText:  { color: "rgba(255,255,255,0.80)", fontSize: 18, fontWeight: "500", textAlign: "center", lineHeight: 30 },
  motivPhase: { fontSize: 12, fontWeight: "700", marginTop: 14 },

  disclaimerCard: {
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  disclaimerText: {
    color: "rgba(255,255,255,0.30)",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
  },
});
