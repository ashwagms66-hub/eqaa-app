import React, {
  useEffect,
  useMemo,
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

import { LinearGradient } from "expo-linear-gradient";

import {
  ArrowLeft,
  Dumbbell,
  Flame,
  Moon,
  Timer,
} from "lucide-react-native";

import { router } from "expo-router";

import {
  getCurrentPhase,
  getCycleDay,
  getPhaseTheme,
} from "@/src/engine/cycleEngine";

import {
  getLastPeriod,
} from "@/src/storage/cycleStorage";

import {
  useLanguage,
} from "@/src/context/LanguageContext";
import {
  getLifeMode,
} from "@/src/storage/profileStorage";

export default function WorkoutScreen() {
  const { language } = useLanguage();
  const [cycleDay, setCycleDay] =
    useState(12);

  const [lifeMode, setLifeMode] =
    useState<
      | "regular"
      | "pregnancy"
      | "postpartum"
      | "pcos"
      | "moon"
    >("regular");

  const pulseAnim = React.useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
    async function loadCycle() {
      const lastPeriod =
        await getLastPeriod();

      const savedLifeMode =
        await getLifeMode();

      if (
        savedLifeMode === "regular" ||
        savedLifeMode === "pregnancy" ||
        savedLifeMode === "postpartum" ||
        savedLifeMode === "pcos" ||
        savedLifeMode === "moon"
      ) {
        setLifeMode(savedLifeMode);
      }

      if (lastPeriod) {
        const day = getCycleDay(
          lastPeriod
        );

        setCycleDay(day);
      }
    }

    loadCycle();
  }, []);

  const phase = useMemo(() => {
    return getCurrentPhase(
      cycleDay
    );
  }, [cycleDay]);

  const theme = useMemo(() => {
    return getPhaseTheme(
      cycleDay
    );
  }, [cycleDay]);

  const workoutData = useMemo(() => {
    if (lifeMode === "pregnancy") {
      return {
        calories: "220",
        duration: "30m",
        energy: "5/10",
        intensity:
          language === "ar"
            ? "لطيف"
            : "Gentle",
        title:
          language === "ar"
            ? "حركة الحمل"
            : "Pregnancy Flow",
        subtitle:
          language === "ar"
            ? "حركة لطيفة وتمدد وتنفس"
            : "Gentle movement and stretching",
        exercises:
          language === "ar"
            ? [
                "• مشي — 15 دقيقة",
                "• مرونة — 10 دقائق",
                "• تمدد — 10 دقائق",
                "• تنفس — 5 دقائق",
              ]
            : [
                "• Walking — 15 min",
                "• Mobility — 10 min",
                "• Stretching — 10 min",
                "• Breathing — 5 min",
              ],
        tip:
          language === "ar"
            ? "ركزي على الحركة اللطيفة والتنفس والراحة بدون إجهاد زائد."
            : "Focus on gentle movement, breathing and recovery.",
      };
    }

    if (lifeMode === "postpartum") {
      return {
        calories: "180",
        duration: "25m",
        energy: "4/10",
        intensity:
          language === "ar"
            ? "تعافي"
            : "Recovery",
        title:
          language === "ar"
            ? "حركة التعافي"
            : "Recovery Movement",
        subtitle:
          language === "ar"
            ? "تعافي واستعادة للطاقة"
            : "Recovery and energy restoration",
        exercises:
          language === "ar"
            ? [
                "• مشي — 15 دقيقة",
                "• تنفس عميق — 5 دقائق",
                "• تقوية خفيفة — 10 دقائق",
                "• تمدد — 10 دقائق",
              ]
            : [
                "• Walking — 15 min",
                "• Deep Breathing — 5 min",
                "• Core Recovery — 10 min",
                "• Stretching — 10 min",
              ],
        tip:
          language === "ar"
            ? "التعافي البطيء والثابت أفضل من الضغط العالي الآن."
            : "Slow and steady recovery is better right now.",
      };
    }

    if (phase.key === "power") {
      return {
        calories: "420",
        duration: "45m",
        energy: "8/10",
        intensity:
          language === "ar"
            ? "عالي"
            : "High",
        title:
          language === "ar"
            ? "قوة كاملة للجسم"
            : "Full Body Strength",
        subtitle:
          language === "ar"
            ? "مقاومة + كارديو خفيف"
            : "Strength + light cardio",
        exercises:
          language === "ar"
            ? [
                "• سكوات — 4 × 12",
                "• هيب ثرست — 4 × 10",
                "• مشي — 20 دقيقة",
                "• تمدد — 10 دقائق",
              ]
            : [
                "• Squats — 4 × 12",
                "• Hip Thrust — 4 × 10",
                "• Walking — 20 min",
                "• Stretching — 10 min",
              ],
        tip:
          language === "ar"
            ? "قد يكون هذا الوقت مناسبًا لرفع شدة التمرين قليلًا إذا كانت طاقتك جيدة."
            : "This may be a good time for stronger movement if your energy feels good.",
      };
    }

    if (phase.key === "manifestation") {
      return {
        calories: "360",
        duration: "40m",
        energy: "7/10",
        intensity:
          language === "ar"
            ? "متوازن"
            : "Moderate",
        title:
          language === "ar"
            ? "حركة متوازنة"
            : "Balanced Movement",
        subtitle:
          language === "ar"
            ? "توازن ومرونة وطاقة"
            : "Balance and flexibility",
        exercises:
          language === "ar"
            ? [
                "• بيلاتس — 20 دقيقة",
                "• مشي مرتفع — 20 دقيقة",
                "• كور — 10 دقائق",
                "• تمدد — 10 دقائق",
              ]
            : [
                "• Pilates — 20 min",
                "• Incline Walk — 20 min",
                "• Core Training — 10 min",
                "• Stretching — 10 min",
              ],
        tip:
          language === "ar"
            ? "مرحلة مناسبة للحركة المتوازنة والتركيز الذهني."
            : "A balanced phase for movement and focus.",
      };
    }

    if (phase.key === "secondPower") {
      return {
        calories: "390",
        duration: "42m",
        energy: "8/10",
        intensity:
          language === "ar"
            ? "عالي"
            : "High",
        title:
          language === "ar"
            ? "طاقة إبداعية"
            : "Creative Power",
        subtitle:
          language === "ar"
            ? "قوة + حركة مرنة"
            : "Strength and flexible movement",
        exercises:
          language === "ar"
            ? [
                "• مقاومة — 30 دقيقة",
                "• دراجة — 15 دقيقة",
                "• كور — 10 دقائق",
                "• تمدد — 10 دقائق",
              ]
            : [
                "• Strength — 30 min",
                "• Cycling — 15 min",
                "• Core — 10 min",
                "• Recovery Stretch — 10 min",
              ],
        tip:
          language === "ar"
            ? "قد تشعرين بطاقة جيدة للحركة والإنجاز خلال هذه المرحلة."
            : "Your body may respond well to stronger movement today.",
      };
    }

    return {
      calories: "240",
      duration: "30m",
      energy: "5/10",
      intensity:
        language === "ar"
          ? "هادئ"
          : "Soft",
      title:
        language === "ar"
          ? "هدوء واستعادة"
          : "Recovery Flow",
      subtitle:
        language === "ar"
          ? "حركة هادئة واستعادة للطاقة"
          : "Gentle recovery movement",
      exercises:
        language === "ar"
          ? [
              "• مشي — 20 دقيقة",
              "• يوجا — 15 دقيقة",
              "• مرونة — 10 دقائق",
              "• تمدد — 10 دقائق",
            ]
          : [
              "• Walking — 20 min",
              "• Yoga — 15 min",
              "• Mobility — 10 min",
              "• Stretching — 10 min",
            ],
      tip:
        language === "ar"
          ? "هذا الوقت قد يكون ألطف للحركة الهادئة واستعادة التوازن."
          : "Gentler movement may support recovery better today.",
    };
  }, [phase, lifeMode, language]);

  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#121225",
        `${theme.glow}22`,
      ]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>

        <Text style={styles.label}>
  {language === "ar"
    ? "حركة إيقاع"
    : "Eqa’a Movement"}
</Text>

        <Text style={styles.title}>
  {language === "ar"
    ? "رياضة تناسب\nطاقتك اليوم"
    : "Movement For\nYour Energy"}
</Text>

       <Text style={styles.subtitle}>
  {language === "ar"
    ? "اقتراحات حركة مبنية على مرحلتك الحالية وإيقاعك."
    : "Movement suggestions aligned with your current rhythm and phase."}
</Text>

        <LinearGradient
          colors={[
            `${theme.glow}24`,
            "rgba(255,255,255,0.04)",
          ]}
          style={styles.heroCard}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: pulseAnim,
                },
              ],
            }}
          >
            <View
              style={[
                styles.heroOrb,
                {
                  backgroundColor:
                    theme.accent,
                  shadowColor:
                    theme.accent,
                },
              ]}
            >
              <Text style={styles.heroEmojiLarge}>
                {lifeMode === "pregnancy"
                  ? "🤰"
                  : lifeMode === "postpartum"
                  ? "🌷"
                  : workoutData.intensity ===
                    (language === "ar"
                      ? "عالي"
                      : "High")
                  ? "🏃‍♀️"
                  : workoutData.intensity ===
                    (language === "ar"
                      ? "متوازن"
                      : "Moderate")
                  ? "🧘‍♀️"
                  : "🚶‍♀️"}
              </Text>
            </View>
          </Animated.View>

       <Text style={styles.heroTitle}>
  {language === "ar"
    ? phase.phaseArabic
    : phase.key === "power"
    ? "Power Phase"
    : phase.key === "manifestation"
    ? "Balance Phase"
    : phase.key === "secondPower"
    ? "Clarity Phase"
    : "Recovery Phase"}
</Text>

<Text style={styles.heroText}>
  {language === "ar"
    ? phase.descriptionArabic
    : phase.key === "power"
    ? "Your body may respond well to strength and movement today."
    : phase.key === "manifestation"
    ? "A balanced phase focused on flow and flexibility."
    : phase.key === "secondPower"
    ? "A creative and energetic phase for movement."
    : "A softer phase focused on recovery and calm movement."}
</Text>

          <View style={styles.intensityRow}>
            <View
              style={[
                styles.intensityBadge,
                {
                  backgroundColor:
                    `${theme.accent}22`,
                },
              ]}
            >
              <Text style={styles.intensityText}>
                {workoutData.intensity}
              </Text>
            </View>

            <View style={styles.intensityDot} />

            <Text style={styles.intensityHint}>
              {lifeMode === "pregnancy"
  ? language === "ar"
    ? "دعم لطيف"
    : "Slow & Supportive"
  : lifeMode === "postpartum"
  ? language === "ar"
    ? "تركيز على التعافي"
    : "Recovery Focused"
  : workoutData.intensity === "High" ||
    workoutData.intensity === "عالي"
  ? language === "ar"
    ? "ذروة الطاقة"
    : "Energy Peak"
  : workoutData.intensity === "Moderate" ||
    workoutData.intensity === "متوازن"
  ? language === "ar"
    ? "توازن وانسيابية"
    : "Balanced Flow"
  : language === "ar"
  ? "استعادة وهدوء"
  : "Nervous System Recovery"}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Flame color="#FFB86B" size={22} />

            <Text style={styles.statValue}>
              {workoutData.calories}
            </Text>

            <Text style={styles.statLabel}>
  {language === "ar"
    ? "سعرة"
    : "Calories"}
</Text>
          </View>

          <View style={styles.statCard}>
            <Timer color="#C6A7FF" size={22} />

            <Text style={styles.statValue}>
              {workoutData.duration}
            </Text>

            <Text style={styles.statLabel}>
  {language === "ar"
    ? "مدة"
    : "Duration"}
</Text>
          </View>

          <View style={styles.statCard}>
            <Moon color="#89CFF0" size={22} />

            <Text style={styles.statValue}>
              {workoutData.energy}
            </Text>

            <Text style={styles.statLabel}>
  {language === "ar"
    ? "طاقة"
    : "Energy"}
</Text>
          </View>
        </View>

        <LinearGradient
          colors={[
            "rgba(255,255,255,0.05)",
            `${theme.glow}18`,
          ]}
          style={styles.rhythmInsightCard}
        >
          <Text style={styles.rhythmInsightLabel}>
            {language === "ar"
              ? "إيقاع متكيف"
              : "Adaptive Rhythm"}
          </Text>

          <Text style={styles.rhythmInsightTitle}>
            {workoutData.intensity === "High" ||
workoutData.intensity === "عالي"
              ? language === "ar"
                ? "قد يستجيب جسمك للحركة الأقوى بشكل جيد اليوم."
                : "Your body may respond well to stronger movement today."
              : workoutData.intensity === "Moderate" ||
                workoutData.intensity === "متوازن"
              ? language === "ar"
                ? "الحركة المتوازنة قد تكون الأنسب لك اليوم."
                : "A balanced workout may feel more aligned today."
              : language === "ar"
              ? "الحركة الهادئة قد تساعد جسمك على التعافي بشكل أفضل اليوم."
              : "Gentler movement may support your recovery better today."}
          </Text>

          <Text style={styles.rhythmInsightText}>
            {workoutData.tip}
          </Text>
        </LinearGradient>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push(
              "/movement-session"
            )
          }
          style={[
            styles.startButton,
            {
              backgroundColor:
                theme.accent,
            },
          ]}
        >
          <Text style={styles.startButtonText}>
  {language === "ar"
    ? "ابدئي الحركة"
    : "Start Session"}
</Text>
        </TouchableOpacity>

       <Text style={styles.sectionTitle}>
  {language === "ar"
    ? "تمارين مقترحة"
    : "Suggested Workouts"}
</Text>
        <View style={styles.workoutCard}>
          <View style={styles.workoutTop}>
            <View>
              <Text style={styles.workoutTitle}>
                {workoutData.title}
              </Text>

              <Text style={styles.workoutSubtitle}>
                {workoutData.subtitle}
              </Text>
            </View>

            <Dumbbell
              color="#C6A7FF"
              size={28}
            />
          </View>

          <View style={styles.exerciseList}>
            {workoutData.exercises.map(
              (exercise) => (
                <Text
                  key={exercise}
                  style={styles.exerciseItem}
                >
                  {exercise}
                </Text>
              )
            )}
          </View>
        </View>

        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: `${theme.glow}18`,
            },
          ]}
        >
         <Text style={styles.tipTitle}>
  {language === "ar"
    ? "نصيحة اليوم"
    : "Today’s Insight"}
</Text>

          <Text style={styles.tipText}>
            {workoutData.tip}
          </Text>
        </View>
      </ScrollView>
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
    paddingTop: 70,
    paddingBottom: 180,
  },

  backButton: {
    position: "absolute",
    top: 68,
    right: 22,
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    zIndex: 99,
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
    color: "rgba(255,255,255,0.62)",
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
  },

  heroOrb: {
    width: 110,
    height: 110,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    marginBottom: 26,
  },

  heroEmojiLarge: {
    fontSize: 44,
  },

  intensityRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  intensityBadge: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  intensityText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  intensityHint: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    fontWeight: "700",
  },

  rhythmInsightCard: {
    marginTop: 26,
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  rhythmInsightLabel: {
    color: "#C6A7FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  rhythmInsightTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 14,
  },

  rhythmInsightText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    lineHeight: 30,
    marginTop: 18,
    fontWeight: "600",
  },

  startButton: {
    marginTop: 28,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    minHeight: 62,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  startButtonText: {
    color: "#171726",
    fontSize: 17,
    fontWeight: "900",
  },

  heroCard: {
    marginTop: 34,
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  heroEmoji: {
    position: "absolute",
    top: 22,
    right: 24,
    fontSize: 28,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },

  heroText: {
    marginTop: 18,
    color: "rgba(255,255,255,0.76)",
    fontSize: 18,
    lineHeight: 34,
    textAlign: "center",
    fontWeight: "600",
  },

  statsRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    width: "31%",
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  statValue: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },

  statLabel: {
    marginTop: 8,
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 36,
    marginBottom: 18,
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },

  workoutCard: {
    borderRadius: 30,
    padding: 26,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  workoutTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  workoutTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },

  workoutSubtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.62)",
    fontSize: 15,
    fontWeight: "700",
  },

  exerciseList: {
    marginTop: 28,
    gap: 16,
  },

  exerciseItem: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
  },

  tipCard: {
    marginTop: 28,
    borderRadius: 28,
    padding: 24,
    backgroundColor: "rgba(198,167,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.14)",
  },

  tipTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14,
  },

  tipText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 17,
    lineHeight: 32,
    fontWeight: "600",
  },
});