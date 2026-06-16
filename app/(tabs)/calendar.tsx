import {
  getCurrentPhase,
  getCycleDay,
} from "@/src/engine/cycleEngine";
import { useFocusEffect } from "expo-router";

import {
  generateAnalytics,
} from "@/src/engine/analyticsEngine";
import {
  getCyclePhase,
} from "@/src/engine/wellnessEngine";

import {
  getCycleLength,
  getLastPeriod,
  saveLastPeriod,
} from "@/src/storage/cycleStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useLanguage,
} from "@/src/context/LanguageContext";

import MonthCalendar from "@/components/calendar/MonthCalendar";

// ── Cycle phase definitions ───────────────────────────────────────────────────

type PhaseSegment = {
  key: string; ar: string; en: string;
  emoji: string; start: number; end: number; color: string;
};

const BAR_PHASES: PhaseSegment[] = [
  { key: "menstrual", ar: "الدورة",   en: "Menstrual", emoji: "❤️", start: 1,  end: 5,  color: "#FF6FAE" },
  { key: "renewal",   ar: "التجديد",  en: "Renewal",   emoji: "🌱", start: 6,  end: 10, color: "#5BBB85" },
  { key: "power",     ar: "القوة",    en: "Power",     emoji: "⚡", start: 11, end: 13, color: "#E9CF74" },
  { key: "fertile",   ar: "الخصوبة",  en: "Fertile",   emoji: "💜", start: 14, end: 15, color: "#A78BFA" },
  { key: "clarity",   ar: "الوضوح",   en: "Clarity",   emoji: "✨", start: 16, end: 19, color: "#C6A7FF" },
  { key: "calm",      ar: "الهدوء",   en: "Calm",      emoji: "🌙", start: 20, end: 28, color: "#89CFF0" },
];

// Include الإباضة as a pill-only entry (overlaps fertile at day 14)
const PHASE_PILLS: PhaseSegment[] = [
  BAR_PHASES[0],
  BAR_PHASES[1],
  BAR_PHASES[2],
  BAR_PHASES[3],
  { key: "ovulation", ar: "الإباضة", en: "Ovulation", emoji: "✨", start: 14, end: 14, color: "#F7D58D" },
  BAR_PHASES[4],
  BAR_PHASES[5],
];

export default function CalendarScreen() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const insets = useSafeAreaInsets();

  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [showOvulationModal, setShowOvulationModal] = useState(false);
  const [showFertileModal, setShowFertileModal] = useState(false);

  const [lastPeriodDate, setLastPeriodDate] = React.useState("2026-05-08");
  const [cycleLength, setCycleLength] = React.useState(28);
  const [lifeMode, setLifeMode] = React.useState<
    "regular" | "pcos" | "moon" | "pregnancy" | "postpartum"
  >("regular");

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const loadCycle = React.useCallback(async () => {
    const saved = await getLastPeriod();
    const savedLength = await getCycleLength();
    const savedLifeMode = await AsyncStorage.getItem("@eqaa_life_mode");

    if (saved) setLastPeriodDate(saved);
    if (savedLength) setCycleLength(savedLength);

    if (
      savedLifeMode === "regular" ||
      savedLifeMode === "pcos" ||
      savedLifeMode === "moon" ||
      savedLifeMode === "pregnancy" ||
      savedLifeMode === "postpartum"
    ) {
      setLifeMode(savedLifeMode as any);
    }
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCycle();
    }, [loadCycle])
  );

  const today = new Date().toISOString().split("T")[0];
  const cycleDay = getCycleDay(lastPeriodDate || today);
  const phase = getCurrentPhase(cycleDay);
  const wellnessPhase = getCyclePhase(cycleDay);

  // Derive all cycle date sets from lastPeriodDate — no hardcoded day numbers
  const cycleDates = useMemo(() => {
    const empty = { periodSet: new Set<string>(), fertileSet: new Set<string>(), ovulationIso: "", nextPeriodIso: "", fertileStartIso: "", fertileEndIso: "" };
    if (!lastPeriodDate) return empty;
    const [py, pm, pd] = lastPeriodDate.split("-").map(Number);
    const start = new Date(py, pm - 1, pd); // local midnight — no UTC shift
    const shift = (base: Date, n: number) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    };
    const periodSet = new Set<string>();
    for (let i = 0; i < 5; i++) periodSet.add(shift(start, i));
    const fertileSet = new Set<string>();
    for (let i = 10; i <= 14; i++) fertileSet.add(shift(start, i));
    return {
      periodSet,
      fertileSet,
      ovulationIso: shift(start, 13),
      nextPeriodIso: shift(start, cycleLength),
      fertileStartIso: shift(start, 10),
      fertileEndIso: shift(start, 14),
    };
  }, [lastPeriodDate, cycleLength]);

  // 7 actual calendar dates starting today, colored from derived sets
  const compactCalDays = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0); // normalise to local midnight
    const skipLifeMode = lifeMode === "pregnancy" || lifeMode === "postpartum";
    const localISO = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const iso = localISO(d);
      return {
        id: i,
        iso,
        dayNum: d.getDate(),
        isToday: i === 0,
        isPeriod: !skipLifeMode && cycleDates.periodSet.has(iso),
        isFertile: !skipLifeMode && cycleDates.fertileSet.has(iso),
        isOvulation: !skipLifeMode && iso === cycleDates.ovulationIso,
      };
    });
  }, [cycleDates, lifeMode]);

  // Phase progress — current phase, days remaining
  const currentPhaseData = useMemo<PhaseSegment>(() => {
    if (cycleDay === 14) return PHASE_PILLS.find(p => p.key === "ovulation")!;
    return BAR_PHASES.find(p => cycleDay >= p.start && cycleDay <= p.end) ?? BAR_PHASES[BAR_PHASES.length - 1];
  }, [cycleDay]);

  const daysLeftInPhase = useMemo(() => Math.max(0, currentPhaseData.end - cycleDay + 1), [cycleDay, currentPhaseData]);

  const daysLeftText = useMemo(() => {
    if (lifeMode === "pregnancy" || lifeMode === "postpartum") return "";
    if (currentPhaseData.key === "ovulation") return isArabic ? "يوم الإباضة اليوم ✨" : "Ovulation day ✨";
    if (daysLeftInPhase <= 1) return isArabic ? `آخر يوم في ${currentPhaseData.ar}` : `Last day in ${currentPhaseData.en.toLowerCase()}`;
    const n = daysLeftInPhase;
    const nAr = n === 1 ? "يوم واحد" : n <= 10 ? `${n} أيام` : `${n} يوماً`;
    return isArabic
      ? `متبقي ${nAr} في ${currentPhaseData.ar}`
      : `${n} days left in ${currentPhaseData.en.toLowerCase()}`;
  }, [cycleDay, daysLeftInPhase, currentPhaseData, lifeMode, isArabic]);

  const remainingDays =
    lifeMode === "pregnancy" || lifeMode === "postpartum"
      ? null
      : Math.max(cycleLength - cycleDay, 0);

  const predictedPeriodSoon =
    lifeMode === "pregnancy" || lifeMode === "postpartum"
      ? false
      : remainingDays !== null && remainingDays <= 2;

  const analytics = generateAnalytics({
    moodHistory:
      phase.key === "reset"
        ? ["Calm", "Focused", "Mood Swing"]
        : ["Happy", "Focused", "Calm"],
    symptoms: phase.key === "reset" ? ["Fatigue", "Mood Swing"] : [],
    sleepHours: phase.key === "reset" ? 5.8 : 7.6,
    stressLevel: phase.key === "reset" ? "Medium" : "Low",
    cycleLength,
    completedCheckins: 6,
    consistencyScore: phase.key === "reset" ? 74 : 91,
  });

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = cycleDay + index;
    return { id: index, day, active: index === 0 };
  });

  const backgroundColors: readonly [string, string, string] =
    wellnessPhase.phase === "renewal"
      ? ["#050E08", "#0A1A10", "#101F14"]
      : wellnessPhase.phase === "power"
      ? ["#0A0A07", "#1A1A0A", "#2A2510"]
      : wellnessPhase.phase === "clarity"
      ? ["#090A12", "#1D1630", "#40265B"]
      : wellnessPhase.phase === "menstrual"
      ? ["#0E0508", "#1A0A10", "#2A1018"]
      : ["#05060B", "#111827", "#1A2340"];

  return (
    <LinearGradient
      colors={backgroundColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View pointerEvents="none" style={styles.backgroundOrbTop} />
      <View pointerEvents="none" style={styles.backgroundOrbBottom} />

      {/* Ovulation Explanation Modal */}
      <Modal
        visible={showOvulationModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowOvulationModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOvulationModal(false)}
        >
          <Pressable style={styles.explainCard} onPress={() => {}}>
            <Text style={styles.explainEmoji}>✨</Text>
            <Text style={[styles.explainTitle, isArabic && styles.rtlText]}>
              {isArabic ? "الإباضة" : "Ovulation"}
            </Text>
            <Text style={[styles.explainBody, isArabic && styles.rtlText]}>
              {isArabic
                ? "هي الفترة التي يطلق فيها الجسم البويضة، وقد تشعرين بطاقة أو وضوح أكثر."
                : "This is when your body releases an egg. You may feel a natural surge of energy or mental clarity during this time."}
            </Text>
            <Pressable
              style={styles.explainClose}
              onPress={() => setShowOvulationModal(false)}
            >
              <Text style={styles.explainCloseText}>
                {isArabic ? "حسنًا" : "Got it"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Fertile Window Explanation Modal */}
      <Modal
        visible={showFertileModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFertileModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFertileModal(false)}
        >
          <Pressable style={styles.explainCard} onPress={() => {}}>
            <Text style={styles.explainEmoji}>🌙</Text>
            <Text style={[styles.explainTitle, isArabic && styles.rtlText]}>
              {isArabic ? "النافذة الخصبة" : "Fertile Window"}
            </Text>
            <Text style={[styles.explainBody, isArabic && styles.rtlText]}>
              {isArabic
                ? "هي الأيام التي يكون فيها الجسم أكثر استعدادًا للحمل."
                : "These are the days when your body is most naturally receptive. A gentle reminder to tune into how you feel during this time."}
            </Text>
            <Pressable
              style={styles.explainClose}
              onPress={() => setShowFertileModal(false)}
            >
              <Text style={styles.explainCloseText}>
                {isArabic ? "حسنًا" : "Got it"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label, isArabic && styles.rtlText]}>
          {isArabic ? "إيقاعك" : "Your Rhythm"}
        </Text>

        <Text style={[styles.title, isArabic && styles.rtlText]}>
          {isArabic ? "الدورة" : "Cycle"}
        </Text>

        <Text style={[styles.subtitle, isArabic && styles.rtlText]}>
          {isArabic
            ? "طريقة أكثر هدوءًا لفهم طاقتك وإيقاعك اليومي."
            : "A softer way to reflect on your rhythm."}
        </Text>

        <LinearGradient
          colors={[
            `${wellnessPhase.color}22`,
            "rgba(255,255,255,0.03)",
          ]}
          style={styles.calendarHero}
        >
          <View
            style={[
              styles.calendarHeroTop,
              isArabic && { flexDirection: "row-reverse" },
            ]}
          >
            <View>
              <Text style={styles.heroSmall}>
                {lifeMode === "pregnancy"
                  ? isArabic ? "مرحلة الحمل" : "Pregnancy Mode"
                  : lifeMode === "postpartum"
                  ? isArabic ? "مرحلة التعافي" : "Recovery Mode"
                  : isArabic
                  ? `اليوم ${cycleDay} من الدورة`
                  : `Day ${cycleDay} of cycle`}
              </Text>

              <Text style={[styles.heroBig, isArabic && styles.rtlText]}>
                {lifeMode === "pregnancy"
                  ? isArabic
                    ? "احتواء وهدوء"
                    : "Gentle Support"
                  : lifeMode === "postpartum"
                  ? isArabic
                    ? "تعافي واستعادة"
                    : "Recovery Flow"
                  : isArabic
                  ? wellnessPhase.phaseArabic
                  : wellnessPhase.phaseEnglish || wellnessPhase.title}
              </Text>

              <Text style={styles.heroSub}>
                {lifeMode === "pregnancy"
                  ? isArabic ? "التركيز الآن على الراحة والتغذية والهدوء." : "Focused on nourishment, calm and gentle recovery."
                  : lifeMode === "postpartum"
                  ? isArabic ? "التعافي التدريجي والنوم والترطيب أهم أولوياتك الآن." : "Recovery, hydration and slower routines come first now."
                  : daysLeftText}
              </Text>
            </View>

            <Animated.View
              style={[
                styles.heroGlow,
                {
                  backgroundColor: wellnessPhase.color,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.heroGlowEmoji}>{wellnessPhase.emoji}</Text>
            </Animated.View>
          </View>

          <ScrollView
            horizontal
            style={{ marginHorizontal: -4 }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScroll}
          >
            {weekDays.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.dayBubble,
                  item.active && {
                    backgroundColor: wellnessPhase.color,
                    shadowColor: wellnessPhase.color,
                    shadowOpacity: 0.45,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 14,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayBubbleText,
                    item.active && { color: "#0A0A0A", fontWeight: "900" },
                  ]}
                >
                  {item.day}
                </Text>
              </View>
            ))}
          </ScrollView>

          {predictedPeriodSoon && (
            <View style={styles.periodConfirmCard}>
              <Text style={styles.periodConfirmTitle}>
                {isArabic ? "هل بدأت دورتك اليوم؟" : "Did your period start today?"}
              </Text>
              <View style={styles.periodButtons}>
                <Pressable
                  onPress={async () => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    await saveLastPeriod(todayStr);
                    setLastPeriodDate(todayStr);
                    Alert.alert(
                      isArabic ? "تم تسجيل الدورة 🌸" : "Period logged 🌸",
                      isArabic
                        ? "تم تحديث يوم الدورة بنجاح"
                        : "Cycle updated successfully"
                    );
                  }}
                  style={[styles.periodButton, { backgroundColor: "#FF6FAE" }]}
                >
                  <Text style={styles.periodButtonText}>
                    {isArabic ? "نعم بدأت" : "Yes"}
                  </Text>
                </Pressable>

                <Pressable style={styles.periodButtonSecondary}>
                  <Text style={styles.periodButtonSecondaryText}>
                    {isArabic ? "ليس بعد" : "Not Yet"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* ── Phase Progress Timeline ───────────────────────────────── */}
        {lifeMode !== "pregnancy" && lifeMode !== "postpartum" && (
          <View style={styles.timelineSection}>
            {/* Proportional bar — 5 non-overlapping segments */}
            <View style={styles.phaseBarWrapper}>
              <View style={styles.phaseBar}>
                {BAR_PHASES.map((phase) => {
                  const days = phase.end - phase.start + 1;
                  const isActive = cycleDay >= phase.start && cycleDay <= phase.end;
                  const isPast = phase.end < cycleDay;
                  return (
                    <View
                      key={phase.key}
                      style={[
                        styles.phaseBarSeg,
                        {
                          flex: days,
                          backgroundColor: isPast
                            ? `${phase.color}BB`
                            : isActive
                            ? phase.color
                            : "rgba(255,255,255,0.07)",
                          borderRightWidth: isActive ? 0 : 0,
                        },
                      ]}
                    />
                  );
                })}
              </View>
              {/* Day marker dot */}
              <View
                style={[
                  styles.phaseMarkerWrap,
                  { left: `${Math.max(1, Math.min(97, ((cycleDay - 0.5) / 28) * 100))}%` },
                ]}
              >
                <View style={[styles.phaseMarkerDot, { backgroundColor: currentPhaseData.color, shadowColor: currentPhaseData.color }]} />
                <Text style={styles.phaseMarkerNum}>{cycleDay}</Text>
              </View>
            </View>

            {/* Phase pills — 6 chips (including الإباضة) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.phasePillsRow, isArabic && { flexDirection: "row-reverse" }]}
            >
              {PHASE_PILLS.map((phase) => {
                const isActive = cycleDay === 14
                  ? phase.key === "ovulation"
                  : phase.key !== "ovulation" && cycleDay >= phase.start && cycleDay <= phase.end;
                const isPast = phase.key !== "ovulation" && phase.end < cycleDay && !(cycleDay === 14 && phase.key === "fertile");
                return (
                  <View
                    key={phase.key}
                    style={[
                      styles.phasePill,
                      isPast && styles.phasePillPast,
                      isActive && { backgroundColor: `${phase.color}22`, borderColor: phase.color },
                    ]}
                  >
                    <Text style={styles.pillEmoji}>{phase.emoji}</Text>
                    <Text style={[styles.pillLabel, isActive && { color: "#FFFFFF", fontWeight: "900" }, isPast && { opacity: 0.55 }]}>
                      {isArabic ? phase.ar : phase.en}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.compactStripContainer}>
          <View style={styles.compactStripHeader}>
            <Text style={[styles.compactStripTitle, isArabic && styles.rtlText]}>
              {isArabic ? "إيقاعك هذا الأسبوع" : "Your Rhythm This Week"}
            </Text>
            <Text style={styles.compactStripMonth}>
              {new Date().toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.compactDaysRow}
          >
            {compactCalDays.map((day) => (
              <Pressable key={day.id} style={styles.compactDayItem}>
                <Text style={styles.compactDayNumber}>{day.dayNum}</Text>
                <View
                  style={[
                    styles.compactDot,
                    day.isPeriod && { backgroundColor: "#FF6FAE" },
                    day.isFertile && { backgroundColor: "#C6A7FF" },
                    day.isOvulation && { backgroundColor: "#E9CF74" },
                    day.isToday && styles.compactTodayGlow,
                  ]}
                />
                {day.isToday && (
                  <Text style={styles.compactTodayText}>
                    {isArabic ? "اليوم" : "Today"}
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.compactButtonsRow}>
            <Pressable
              onPress={async () => {
                const todayStr = new Date().toISOString().split("T")[0];
                await saveLastPeriod(todayStr);
                setLastPeriodDate(todayStr);
                Alert.alert(
                  isArabic ? "تم تسجيل الدورة 🌸" : "Period logged 🌸"
                );
              }}
              style={styles.compactPrimaryButton}
            >
              <Text style={styles.compactPrimaryButtonText}>
                {isArabic ? "تسجيل بداية الدورة" : "Log Period Start"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowFullCalendar(true)}
              style={styles.compactSecondaryButton}
            >
              <Text style={styles.compactSecondaryButtonText}>
                {isArabic ? "عرض التقويم" : "View Calendar"}
              </Text>
            </Pressable>
          </View>
        </View>

        <LinearGradient
          colors={["rgba(198,167,255,0.14)", "rgba(255,255,255,0.04)"]}
          style={styles.insightCard}
        >
          <View style={styles.insightTopRow}>
            <Text style={styles.insightEmoji}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.insightTitle, isArabic && styles.rtlText]}>
                {isArabic ? "رسالة إيقاع" : "Today's Rhythm"}
              </Text>
              <Text style={[styles.insightText, isArabic && styles.rtlText]}>
                {isArabic
                  ? wellnessPhase.descriptionArabic || wellnessPhase.description
                  : wellnessPhase.descriptionEnglish || wellnessPhase.description}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.analyticsSection}>
          <View style={styles.analyticsHeader}>
            <Text style={[styles.analyticsTitle, isArabic && styles.rtlText]}>
              {isArabic ? "تحليلات الإيقاع" : "Rhythm Analytics"}
            </Text>
            <Text style={styles.analyticsSub}>
              {isArabic ? "آخر ٧ أيام" : "Last 7 days"}
            </Text>
          </View>

          <View
            style={[
              styles.analyticsGrid,
              isArabic && { flexDirection: "row-reverse" },
            ]}
          >
            <LinearGradient
              colors={["rgba(198,167,255,0.16)", "rgba(255,255,255,0.03)"]}
              style={styles.analyticsCard}
            >
              <Text style={styles.analyticsEmoji}>🌙</Text>
              <Text style={[styles.analyticsCardTitle, isArabic && styles.rtlText]}>
                {isArabic ? "توازن المشاعر" : "Emotional Balance"}
              </Text>
              <Text style={styles.analyticsValue}>
                {analytics.emotionalBalance}%
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={["rgba(255,111,174,0.14)", "rgba(255,255,255,0.03)"]}
              style={styles.analyticsCard}
            >
              <Text style={styles.analyticsEmoji}>✨</Text>
              <Text style={[styles.analyticsCardTitle, isArabic && styles.rtlText]}>
                {isArabic ? "مستوى الطاقة" : "Energy Rhythm"}
              </Text>
              <Text style={styles.analyticsValue}>
                {analytics.energyRhythm}%
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={["rgba(142,240,200,0.14)", "rgba(255,255,255,0.03)"]}
              style={styles.analyticsWideCard}
            >
              <View
                style={[
                  styles.analyticsWideTop,
                  isArabic && { flexDirection: "row-reverse" },
                ]}
              >
                <Text style={styles.analyticsWideEmoji}>🌿</Text>
                <Text style={[styles.analyticsWideTitle, isArabic && styles.rtlText]}>
                  {isArabic ? "مؤشر الانسجام" : "Rhythm Score"}
                </Text>
              </View>
              <Text style={styles.rhythmScore}>{analytics.rhythmScore}</Text>
              <Text style={[styles.analyticsWideText, isArabic && styles.rtlText]}>
                {isArabic
                  ? "إيقاعك يبدو أكثر استقرارًا وتوازنًا هذا الأسبوع."
                  : "Your rhythm appears steadier and more aligned this week."}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <Modal
          visible={showFullCalendar}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <LinearGradient
            colors={["#06070B", "#15162A", "#241B3D"]}
            style={styles.fullModalContainer}
          >
            <View style={styles.fullModalHeader}>
              <View>
                <Text style={styles.fullModalLabel}>
                  {isArabic ? "الدورة" : "Cycle"}
                </Text>
                <Text style={styles.fullModalTitle}>
                  {isArabic ? "التتبع الكامل" : "Full Tracking"}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowFullCalendar(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.fullModalContent,
                { paddingBottom: Math.max(insets.bottom + 40, 60) },
              ]}
            >
              <MonthCalendar lastPeriodDate={lastPeriodDate} cycleLength={cycleLength} />

              <LinearGradient
                colors={["rgba(255,111,174,0.16)", "rgba(255,255,255,0.04)"]}
                style={styles.fullTrackingCard}
              >
                <Text style={styles.fullTrackingEmoji}>🌸</Text>
                <Text style={styles.fullTrackingTitle}>
                  {isArabic ? "تعديل أيام الدورة" : "Edit Period Days"}
                </Text>
                <Text style={styles.fullTrackingText}>
                  {isArabic
                    ? "اضغطي على أي يوم داخل التقويم لتعديل وتتبع الدورة والأعراض والطاقة اليومية."
                    : "Tap any day to edit symptoms, period flow and daily energy."}
                </Text>
              </LinearGradient>

              {lifeMode !== "pregnancy" && lifeMode !== "postpartum" && (
                <View style={styles.predictionRow}>
                  <Pressable
                    onPress={() => setShowOvulationModal(true)}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(198,167,255,0.16)",
                        "rgba(255,255,255,0.03)",
                      ]}
                      style={styles.predictionCard}
                    >
                      <Text style={styles.predictionEmoji}>✨</Text>
                      <Text style={styles.predictionLabel}>
                        {isArabic ? "يوم الإباضة" : "Ovulation"}
                      </Text>
                      <Text style={styles.predictionValue}>
                        {cycleDates.ovulationIso
                          ? new Date(cycleDates.ovulationIso + "T12:00:00").toLocaleDateString(
                              isArabic ? "ar-SA" : "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : isArabic ? "اليوم ١٤" : "Day 14"}
                      </Text>
                      <Text style={styles.predictionTapHint}>
                        {isArabic ? "اضغطي للتفاصيل ›" : "Tap to learn ›"}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    onPress={() => setShowFertileModal(true)}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(233,207,116,0.16)",
                        "rgba(255,255,255,0.03)",
                      ]}
                      style={styles.predictionCard}
                    >
                      <Text style={styles.predictionEmoji}>🌙</Text>
                      <Text style={styles.predictionLabel}>
                        {isArabic ? "النافذة الخصبة" : "Fertile Window"}
                      </Text>
                      <Text style={styles.predictionValue}>
                        {cycleDates.fertileStartIso && cycleDates.fertileEndIso
                          ? `${new Date(cycleDates.fertileStartIso + "T12:00:00").toLocaleDateString(
                              isArabic ? "ar-SA" : "en-US",
                              { month: "short", day: "numeric" }
                            )} – ${new Date(cycleDates.fertileEndIso + "T12:00:00").toLocaleDateString(
                              isArabic ? "ar-SA" : "en-US",
                              { month: "short", day: "numeric" }
                            )}`
                          : isArabic ? "الأيام ١١ - ١٥" : "Days 11–15"}
                      </Text>
                      <Text style={styles.predictionTapHint}>
                        {isArabic ? "اضغطي للتفاصيل ›" : "Tap to learn ›"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07070A",
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  // ── Phase timeline ──────────────────────────────────────────────
  timelineSection: {
    marginTop: 24,
    marginBottom: 6,
  },
  phaseBarWrapper: {
    position: "relative",
    height: 28,
    justifyContent: "center",
    marginBottom: 4,
  },
  phaseBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  phaseBarSeg: {
    height: "100%",
  },
  phaseMarkerWrap: {
    position: "absolute",
    alignItems: "center",
    top: -3,
    marginLeft: -9,
  },
  phaseMarkerDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: "#0A0A0F",
    shadowOpacity: 0.65,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  phaseMarkerNum: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
    lineHeight: 13,
  },
  phasePillsRow: {
    gap: 8,
    paddingTop: 14,
    paddingBottom: 2,
    paddingHorizontal: 1,
  },
  phasePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  phasePillPast: {
    opacity: 0.6,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillLabel: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    fontWeight: "700",
  },

  backgroundOrbTop: {
    position: "absolute",
    top: -120,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 999,
    zIndex: -1,
    backgroundColor: "rgba(199,166,255,0.08)",
    opacity: 0.18,
  },

  backgroundOrbBottom: {
    position: "absolute",
    bottom: 120,
    left: -90,
    width: 180,
    height: 180,
    borderRadius: 999,
    zIndex: -1,
    backgroundColor: "rgba(255,255,255,0.03)",
    opacity: 0.08,
  },

  content: {
    paddingTop: 90,
    paddingHorizontal: 24,
  },

  label: {
    color: "#C6A7FF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 56,
    letterSpacing: -1.2,
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 30,
    marginTop: 20,
    marginBottom: 40,
  },

  calendarHero: {
    borderRadius: 34,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  calendarHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
  },

  heroSmall: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    fontWeight: "700",
  },

  heroBig: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 10,
    lineHeight: 42,
  },

  heroSub: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    marginTop: 12,
  },

  heroGlow: {
    width: 104,
    height: 104,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.55,
    shadowRadius: 26,
    shadowColor: "#FFFFFF",
    elevation: 20,
  },

  heroGlowEmoji: {
    fontSize: 42,
  },

  daysScroll: {
    gap: 12,
    marginTop: 28,
    paddingRight: 30,
  },

  dayBubble: {
    width: 54,
    height: 54,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  dayBubbleText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  periodConfirmCard: {
    marginTop: 28,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  periodConfirmTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  periodButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  periodButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowColor: "#FFFFFF",
    elevation: 10,
  },

  periodButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
  },

  periodButtonSecondary: {
    flex: 1,
    minHeight: 58,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  periodButtonSecondaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  compactStripContainer: {
    marginTop: 26,
    marginBottom: 8,
  },

  compactStripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  compactStripTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  compactStripMonth: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    fontWeight: "700",
  },

  compactDaysRow: {
    gap: 24,
    paddingHorizontal: 2,
  },

  compactDayItem: {
    alignItems: "center",
    minWidth: 56,
  },

  compactDayNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },

  compactDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  compactTodayGlow: {
    shadowColor: "#E9CF74",
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },

  compactTodayText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
  },

  compactButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
    marginBottom: 10,
  },

  compactPrimaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6FAE",
  },

  compactPrimaryButtonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "900",
  },

  compactSecondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minHeight: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  compactSecondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  insightCard: {
    marginTop: 28,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  insightTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
  },

  insightEmoji: {
    fontSize: 28,
    marginTop: 2,
  },

  insightTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
  },

  insightText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 16,
    lineHeight: 30,
    fontWeight: "600",
  },

  analyticsSection: {
    marginTop: 34,
  },

  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  analyticsTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  analyticsSub: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 14,
    fontWeight: "700",
  },

  analyticsGrid: {
    gap: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch",
  },

  analyticsCard: {
    width: "47%",
    minHeight: 200,
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    justifyContent: "space-between",
  },

  analyticsEmoji: {
    fontSize: 30,
    marginBottom: 20,
  },

  analyticsCardTitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 14,
  },

  analyticsValue: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 48,
  },

  analyticsWideCard: {
    width: "100%",
    borderRadius: 34,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginTop: 4,
  },

  analyticsWideTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  analyticsWideEmoji: {
    fontSize: 26,
  },

  analyticsWideTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  rhythmScore: {
    color: "#FFFFFF",
    fontSize: 72,
    fontWeight: "900",
    marginBottom: 18,
    lineHeight: 76,
  },

  analyticsWideText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 17,
    lineHeight: 32,
    fontWeight: "600",
  },

  fullModalContainer: {
    flex: 1,
  },

  fullModalHeader: {
    paddingTop: 84,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fullModalLabel: {
    color: "#C6A7FF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  fullModalTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },

  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  fullModalContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },

  fullTrackingCard: {
    borderRadius: 32,
    padding: 24,
    marginTop: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  fullTrackingEmoji: {
    fontSize: 32,
    marginBottom: 18,
  },

  fullTrackingTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 14,
  },

  fullTrackingText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    lineHeight: 30,
    fontWeight: "600",
  },

  predictionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 18,
  },

  predictionCard: {
    flex: 1,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  predictionEmoji: {
    fontSize: 28,
    marginBottom: 14,
  },

  predictionLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },

  predictionValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10,
  },

  predictionTapHint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  explainCard: {
    width: "100%",
    backgroundColor: "#16172A",
    borderRadius: 34,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "flex-start",
  },

  explainEmoji: {
    fontSize: 36,
    marginBottom: 18,
  },

  explainTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 16,
  },

  explainBody: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 17,
    lineHeight: 32,
    fontWeight: "500",
    marginBottom: 28,
  },

  explainClose: {
    alignSelf: "stretch",
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },

  explainCloseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
