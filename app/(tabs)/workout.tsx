import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCurrentPhase, getCycleDay, getPhaseTheme } from "@/src/engine/cycleEngine";
import { getLastPeriod } from "@/src/storage/cycleStorage";
import { useLanguage } from "@/src/context/LanguageContext";
import { getLifeMode } from "@/src/storage/profileStorage";

type ExerciseCard = {
  emoji: string;
  nameAr: string;
  nameEn: string;
  durationAr: string;
  durationEn: string;
  difficulty: "beginner" | "easy" | "moderate" | "high";
};

const DIFFICULTY_COLOR: Record<ExerciseCard["difficulty"], string> = {
  beginner: "#5BBB85",
  easy:     "#89CFF0",
  moderate: "#E9CF74",
  high:     "#FF6FAE",
};

const DIFFICULTY_LABEL: Record<ExerciseCard["difficulty"], { ar: string; en: string }> = {
  beginner: { ar: "مبتدئ",   en: "Beginner" },
  easy:     { ar: "سهل",     en: "Easy"     },
  moderate: { ar: "متوسط",   en: "Moderate" },
  high:     { ar: "قوي",     en: "High"     },
};

// ── workout data per phase key (cycleEngine keys) ─────────────────────────────

type WorkoutPlan = {
  sessionTitleAr: string;
  sessionTitleEn: string;
  sessionSubAr: string;
  sessionSubEn: string;
  caloriesEst: string;
  durationMin: number;
  tipAr: string;
  tipEn: string;
  exercises: ExerciseCard[];
};

const WORKOUT_PLANS: Record<string, WorkoutPlan> = {
  menstrual: {
    sessionTitleAr: "حركة لطيفة",
    sessionTitleEn: "Gentle Flow",
    sessionSubAr: "راحة واستعادة للطاقة",
    sessionSubEn: "Rest and energy restoration",
    caloriesEst: "160",
    durationMin: 25,
    tipAr: "الراحة هي الإنجاز الأكبر اليوم. استمعي لجسمكِ.",
    tipEn: "Rest is your greatest achievement today. Listen to your body.",
    exercises: [
      { emoji: "🚶", nameAr: "مشي هادئ",        nameEn: "Gentle Walk",       durationAr: "20 دقيقة", durationEn: "20 min", difficulty: "beginner" },
      { emoji: "🧘", nameAr: "تمدد لطيف",         nameEn: "Light Stretching",  durationAr: "10 دقائق", durationEn: "10 min", difficulty: "beginner" },
      { emoji: "🌬️", nameAr: "تنفس عميق",        nameEn: "Deep Breathing",    durationAr: "5 دقائق",  durationEn: "5 min",  difficulty: "beginner" },
    ],
  },
  power: {
    sessionTitleAr: "حركة التجديد",
    sessionTitleEn: "Renewal Session",
    sessionSubAr: "بناء تدريجي وطاقة متصاعدة",
    sessionSubEn: "Gradual building and rising energy",
    caloriesEst: "280",
    durationMin: 35,
    tipAr: "جسمك يعود للحياة — ابدئي بلطف وابني بثبات.",
    tipEn: "Your body is coming back to life — start gentle, build steady.",
    exercises: [
      { emoji: "🚶", nameAr: "مشي سريع",          nameEn: "Brisk Walk",        durationAr: "15 دقيقة", durationEn: "15 min", difficulty: "easy"     },
      { emoji: "🏋️", nameAr: "تمارين قوة خفيفة",  nameEn: "Light Strength",    durationAr: "15 دقيقة", durationEn: "15 min", difficulty: "easy"     },
      { emoji: "🧘", nameAr: "مرونة وتمدد",         nameEn: "Mobility Flow",     durationAr: "10 دقائق", durationEn: "10 min", difficulty: "beginner" },
    ],
  },
  manifestation: {
    sessionTitleAr: "قوة كاملة للجسم",
    sessionTitleEn: "Full Body Power",
    sessionSubAr: "ذروة الطاقة — وقت الإنجاز",
    sessionSubEn: "Peak energy — time to achieve",
    caloriesEst: "420",
    durationMin: 50,
    tipAr: "أنتِ في ذروة طاقتك — استثمري هذا الوقت بذكاء.",
    tipEn: "You're at peak energy — invest this window wisely.",
    exercises: [
      { emoji: "🏋️", nameAr: "سكوات بأثقال",       nameEn: "Weighted Squats",   durationAr: "4 × 12 تكرار", durationEn: "4 × 12 reps", difficulty: "high"     },
      { emoji: "💪", nameAr: "هيب ثرست",             nameEn: "Hip Thrust",        durationAr: "4 × 10 تكرار", durationEn: "4 × 10 reps", difficulty: "high"     },
      { emoji: "🏃", nameAr: "تمرين كارديو",          nameEn: "Cardio Intervals",  durationAr: "20 دقيقة",    durationEn: "20 min",       difficulty: "moderate" },
      { emoji: "🧘", nameAr: "تمدد بعد التمرين",      nameEn: "Cool-down Stretch", durationAr: "10 دقائق",    durationEn: "10 min",       difficulty: "easy"     },
    ],
  },
  secondPower: {
    sessionTitleAr: "وضوح وقوة",
    sessionTitleEn: "Clarity & Strength",
    sessionSubAr: "توازن وانسيابية",
    sessionSubEn: "Balance and flow",
    caloriesEst: "360",
    durationMin: 45,
    tipAr: "الجودة فوق الكمية — اختاري ما يستحق طاقتك.",
    tipEn: "Quality over quantity — choose what deserves your energy.",
    exercises: [
      { emoji: "🧘", nameAr: "بيلاتس",              nameEn: "Pilates",           durationAr: "20 دقيقة", durationEn: "20 min", difficulty: "moderate" },
      { emoji: "🏋️", nameAr: "قوة معتدلة",           nameEn: "Moderate Strength", durationAr: "20 دقيقة", durationEn: "20 min", difficulty: "moderate" },
      { emoji: "🚶", nameAr: "مشي تأمل",              nameEn: "Mindful Walk",      durationAr: "10 دقائق", durationEn: "10 min", difficulty: "easy"     },
      { emoji: "🌬️", nameAr: "تنفس وتمدد",           nameEn: "Breathwork",        durationAr: "5 دقائق",  durationEn: "5 min",  difficulty: "beginner" },
    ],
  },
  reset: {
    sessionTitleAr: "هدوء واستعادة",
    sessionTitleEn: "Recovery Flow",
    sessionSubAr: "حركة هادئة وجهاز عصبي متوازن",
    sessionSubEn: "Gentle movement and nervous system balance",
    caloriesEst: "200",
    durationMin: 30,
    tipAr: "الراحة إنجاز — جسمك يستعد للدورة القادمة.",
    tipEn: "Rest is achievement — your body is preparing for the next cycle.",
    exercises: [
      { emoji: "🚶", nameAr: "مشي",                  nameEn: "Walking",           durationAr: "20 دقيقة", durationEn: "20 min", difficulty: "easy"     },
      { emoji: "🧘", nameAr: "يوجا خفيفة",            nameEn: "Gentle Yoga",       durationAr: "15 دقيقة", durationEn: "15 min", difficulty: "easy"     },
      { emoji: "💆", nameAr: "مرونة عميقة",            nameEn: "Deep Mobility",     durationAr: "10 دقائق", durationEn: "10 min", difficulty: "beginner" },
    ],
  },
  pregnancy: {
    sessionTitleAr: "حركة الحمل",
    sessionTitleEn: "Pregnancy Flow",
    sessionSubAr: "حركة لطيفة وتنفس ودعم",
    sessionSubEn: "Gentle movement, breathing and support",
    caloriesEst: "180",
    durationMin: 30,
    tipAr: "ركزي على الحركة اللطيفة والتنفس — كل حركة تفيدكِ وطفلكِ.",
    tipEn: "Focus on gentle movement and breathing — every movement benefits you and baby.",
    exercises: [
      { emoji: "🚶", nameAr: "مشي",                  nameEn: "Walking",           durationAr: "15 دقيقة", durationEn: "15 min", difficulty: "easy"     },
      { emoji: "🧘", nameAr: "مرونة الجسم",           nameEn: "Prenatal Mobility", durationAr: "10 دقائق", durationEn: "10 min", difficulty: "beginner" },
      { emoji: "🌬️", nameAr: "تنفس عميق",            nameEn: "Breathing",         durationAr: "5 دقائق",  durationEn: "5 min",  difficulty: "beginner" },
    ],
  },
  postpartum: {
    sessionTitleAr: "حركة التعافي",
    sessionTitleEn: "Recovery Movement",
    sessionSubAr: "تعافي واستعادة للطاقة",
    sessionSubEn: "Recovery and energy restoration",
    caloriesEst: "150",
    durationMin: 25,
    tipAr: "التعافي البطيء والثابت أفضل — جسمك أنجز معجزة.",
    tipEn: "Slow and steady recovery is best — your body performed a miracle.",
    exercises: [
      { emoji: "🚶", nameAr: "مشي",                  nameEn: "Walking",           durationAr: "15 دقيقة", durationEn: "15 min", difficulty: "beginner" },
      { emoji: "🌬️", nameAr: "تنفس عميق",            nameEn: "Deep Breathing",    durationAr: "5 دقائق",  durationEn: "5 min",  difficulty: "beginner" },
      { emoji: "💆", nameAr: "تقوية تعافي",           nameEn: "Core Recovery",     durationAr: "10 دقائق", durationEn: "10 min", difficulty: "easy"     },
    ],
  },
};

// ── component ─────────────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [cycleDay, setCycleDay]   = useState(12);
  const [lifeMode, setLifeMode]   = useState<
    "regular" | "pregnancy" | "postpartum" | "pcos" | "moon"
  >("regular");

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 2200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 2200, useNativeDriver: true }),
        ])
      ).start();

      async function load() {
        const [lastPeriod, savedMode] = await Promise.all([
          getLastPeriod(),
          getLifeMode(),
        ]);
        if (savedMode === "regular" || savedMode === "pregnancy" ||
            savedMode === "postpartum" || savedMode === "pcos" || savedMode === "moon") {
          setLifeMode(savedMode);
        }
        if (lastPeriod) setCycleDay(getCycleDay(lastPeriod));
      }
      load();
    }, [])
  );

  const phase = useMemo(() => getCurrentPhase(cycleDay), [cycleDay]);
  const theme = useMemo(() => getPhaseTheme(cycleDay),   [cycleDay]);

  const planKey = lifeMode === "pregnancy"  ? "pregnancy"
                : lifeMode === "postpartum" ? "postpartum"
                : phase.key;

  const plan = WORKOUT_PLANS[planKey] ?? WORKOUT_PLANS.reset;

  return (
    <LinearGradient colors={["#05050A", "#121225", `${theme.glow}22`]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <Text style={s.pageLabel}>{isAr ? "حركة إيقاع" : "Eqa'a Movement"}</Text>
          <Text style={s.pageTitle}>
            {isAr ? "رياضة تناسب\nطاقتك اليوم" : "Movement For\nYour Energy"}
          </Text>
          <Text style={[s.pageSub, isAr && { textAlign: "right" }]}>
            {isAr
              ? "اقتراحات حركة مبنية على مرحلتك وإيقاعك اليومي."
              : "Movement suggestions aligned with your current phase and rhythm."}
          </Text>

          {/* ── Phase hero card ── */}
          <LinearGradient colors={[`${theme.glow}30`, "rgba(255,255,255,0.04)"]} style={s.heroCard}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }], alignSelf: "center" }}>
              <View style={[s.heroOrb, { backgroundColor: theme.accent, shadowColor: theme.accent }]}>
                <Text style={s.heroEmoji}>{phase.icon}</Text>
              </View>
            </Animated.View>
            <Text style={s.heroPhase}>{isAr ? phase.phaseArabic : phase.title}</Text>
            <Text style={[s.heroDesc, isAr && { textAlign: "right" }]}>
              {isAr ? phase.descriptionArabic : phase.description}
            </Text>

            {/* Stats row */}
            <View style={[s.statsRow, isAr && { flexDirection: "row-reverse" }]}>
              <View style={s.statPill}>
                <Text style={s.statEmoji}>🔥</Text>
                <Text style={s.statVal}>~{plan.caloriesEst}</Text>
                <Text style={s.statUnit}>{isAr ? "سعرة" : "kcal"}</Text>
              </View>
              <View style={s.statPill}>
                <Text style={s.statEmoji}>⏱️</Text>
                <Text style={s.statVal}>{plan.durationMin}</Text>
                <Text style={s.statUnit}>{isAr ? "دقيقة" : "min"}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* ── Session info ── */}
          <View style={s.sessionHeader}>
            <Text style={[s.sessionTitle, isAr && { textAlign: "right" }]}>
              {isAr ? plan.sessionTitleAr : plan.sessionTitleEn}
            </Text>
            <Text style={[s.sessionSub, isAr && { textAlign: "right" }]}>
              {isAr ? plan.sessionSubAr : plan.sessionSubEn}
            </Text>
          </View>

          {/* ── Exercise cards ── */}
          <View style={s.exerciseSection}>
            {plan.exercises.map((ex, idx) => {
              const diffColor = DIFFICULTY_COLOR[ex.difficulty];
              const diffLabel = DIFFICULTY_LABEL[ex.difficulty];
              return (
                <View key={idx} style={s.exCard}>
                  <View style={[s.exLeft, isAr && { flexDirection: "row-reverse" }]}>
                    <View style={[s.exEmojiWrap, { backgroundColor: `${diffColor}18` }]}>
                      <Text style={s.exEmoji}>{ex.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.exName, isAr && { textAlign: "right" }]}>
                        {isAr ? ex.nameAr : ex.nameEn}
                      </Text>
                      <Text style={[s.exDuration, isAr && { textAlign: "right" }]}>
                        {isAr ? ex.durationAr : ex.durationEn}
                      </Text>
                    </View>
                  </View>
                  <View style={[s.diffBadge, { backgroundColor: `${diffColor}20`, borderColor: `${diffColor}50` }]}>
                    <Text style={[s.diffTxt, { color: diffColor }]}>
                      {isAr ? diffLabel.ar : diffLabel.en}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Today's tip ── */}
          <View style={[s.tipCard, { backgroundColor: `${theme.glow}15` }]}>
            <Text style={[s.tipTitle, isAr && { textAlign: "right" }]}>
              {isAr ? "💡 نصيحة اليوم" : "💡 Today's Insight"}
            </Text>
            <Text style={[s.tipText, isAr && { textAlign: "right" }]}>
              {isAr ? plan.tipAr : plan.tipEn}
            </Text>
          </View>

          {/* ── Start button ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/movement-session")}
            style={[s.startBtn, { backgroundColor: theme.accent }]}
          >
            <Text style={s.startBtnTxt}>
              {isAr ? "ابدئي الحركة" : "Start Session"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 140,
    gap: 0,
  },

  pageLabel: {
    color: "#C6A7FF",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  pageTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: -0.5,
  },

  pageSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 4,
  },

  heroCard: {
    marginTop: 28,
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  heroOrb: {
    width: 100,
    height: 100,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    marginBottom: 20,
  },

  heroEmoji:  { fontSize: 40 },
  heroPhase:  { color: "#FFFFFF", fontSize: 26, fontWeight: "900", textAlign: "center" },

  heroDesc: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 15,
    lineHeight: 26,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 10,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },

  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  statEmoji: { fontSize: 14 },
  statVal:   { color: "#FFFFFF",                  fontSize: 16, fontWeight: "900" },
  statUnit:  { color: "rgba(255,255,255,0.45)",   fontSize: 12, fontWeight: "700" },

  sessionHeader: { marginTop: 28, marginBottom: 16 },
  sessionTitle:  { color: "#FFFFFF",               fontSize: 26, fontWeight: "900" },
  sessionSub:    { color: "rgba(255,255,255,0.50)", fontSize: 14, fontWeight: "600", marginTop: 4 },

  exerciseSection: { gap: 12 },

  exCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },

  exLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },

  exEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  exEmoji:    { fontSize: 22 },
  exName:     { color: "#FFFFFF",                  fontSize: 16, fontWeight: "800" },
  exDuration: { color: "rgba(255,255,255,0.48)",   fontSize: 13, fontWeight: "600", marginTop: 3 },

  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
  },

  diffTxt: { fontSize: 12, fontWeight: "800" },

  tipCard: {
    marginTop: 24,
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },

  tipTitle: { color: "#FFFFFF",                  fontSize: 17, fontWeight: "900" },
  tipText:  { color: "rgba(255,255,255,0.72)",   fontSize: 15, lineHeight: 26, fontWeight: "600" },

  startBtn: {
    marginTop: 28,
    height: 62,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
  },

  startBtnTxt: { color: "#111111", fontSize: 17, fontWeight: "900" },
});
