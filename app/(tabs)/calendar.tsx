import {
  getCurrentPhase,
  getCycleDay,
} from "@/src/engine/cycleEngine";


import {
  generateAnalytics,
} from "@/src/engine/analyticsEngine";
import {
  getCyclePhase,
} from "@/src/engine/wellnessEngine";

import {
  getCycleLength,
  getLastPeriod,
} from "@/src/storage/cycleStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";


import { LinearGradient } from "expo-linear-gradient";

import React, {
  useEffect,
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
  View
} from "react-native";

import {
  useLanguage,
} from "@/src/context/LanguageContext";

import MonthCalendar from "@/components/calendar/MonthCalendar";


export default function CalendarScreen() {
  const { language } =
    useLanguage();

  const isArabic =
    language === "ar";

  const [showFullCalendar, setShowFullCalendar] =
    useState(false);

  const [lastPeriodDate, setLastPeriodDate] =
    React.useState("2026-05-08");

  const [cycleLength, setCycleLength] =
    React.useState(28);

  const [lifeMode, setLifeMode] =
    React.useState<
      | "regular"
      | "pcos"
      | "moon"
      | "pregnancy"
      | "postpartum"
    >("regular");

  const pulseAnim = useRef(
    new Animated.Value(1)
  ).current;

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

  React.useEffect(() => {
    async function loadCycle() {
      const saved =
        await getLastPeriod();

      const savedLength =
        await getCycleLength();

      const savedLifeMode =
        await AsyncStorage.getItem(
          "@eqaa_life_mode"
        );

      if (saved) {
        setLastPeriodDate(saved);
      }

      if (savedLength) {
        setCycleLength(savedLength);
      }

      if (
        savedLifeMode === "regular" ||
        savedLifeMode === "pcos" ||
        savedLifeMode === "moon" ||
        savedLifeMode === "pregnancy" ||
        savedLifeMode === "postpartum"
      ) {
        setLifeMode(savedLifeMode);
      }
    }

    loadCycle();
  }, []);

  const cycleDay =
    getCycleDay(lastPeriodDate);

 const phase =
  getCurrentPhase(cycleDay);

const wellnessPhase =
  getCyclePhase(cycleDay);

  const remainingDays =
    lifeMode === "pregnancy" ||
    lifeMode === "postpartum"
      ? null
      : Math.max(
          cycleLength - cycleDay,
          0
        );

  const predictedPeriodSoon =
    lifeMode === "pregnancy" ||
    lifeMode === "postpartum"
      ? false
      : remainingDays !== null &&
        remainingDays <= 2;

  const analytics =
    generateAnalytics({
      moodHistory:
        phase.key === "nurture"
          ? [
              "Calm",
              "Focused",
              "Mood Swing",
            ]
          : [
              "Happy",
              "Focused",
              "Calm",
            ],

      symptoms:
        phase.key === "nurture"
          ? ["Fatigue", "Mood Swing"]
          : [],

      sleepHours:
        phase.key === "nurture" ? 5.8 : 7.6,

      stressLevel:
        phase.key === "nurture"
          ? "Medium"
          : "Low",

      cycleLength,

      completedCheckins: 6,

      consistencyScore:
        phase.key === "nurture" ? 74 : 91,
    });

  const weekDays = Array.from(
    { length: 7 },
    (_, index) => {
      const day =
        cycleDay + index;

      return {
        id: index,
        day,
        active: index === 0,
      };
    }
  );

 const backgroundColors:
  readonly [
    string,
    string,
    string,
  ] =
  wellnessPhase.phase === "power"
    ? [
        "#07070A",
        "#15152A",
        "#2A2140",
      ]
    : wellnessPhase.phase ===
      "manifest"
    ? [
        "#0A0A10",
        "#2A1E12",
        "#5B3A1A",
      ]
    : wellnessPhase.phase ===
      "clarity"
    ? [
        "#090A12",
        "#1D1630",
        "#40265B",
      ]
    : [
        "#05060B",
        "#111827",
        "#1A2340",
      ];


  return (
    <LinearGradient
      colors={backgroundColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View
        pointerEvents="none"
        style={styles.backgroundOrbTop}
      />

      <View
        pointerEvents="none"
        style={styles.backgroundOrbBottom}
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={[
            styles.label,
            isArabic && styles.rtlText,
          ]}
        >
          {language === "ar"
            ? "إيقاعك"
            : "Your Rhythm"}
        </Text>

        <Text
          style={[
            styles.title,
            isArabic && styles.rtlText,
          ]}
        >
          {language === "ar"
           ? "الدورة"
: "Cycle"}
        </Text>

        <Text
          style={[
            styles.subtitle,
            isArabic && styles.rtlText,
          ]}
        >
          {language === "ar"
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
              isArabic && {
                flexDirection: "row-reverse",
              },
            ]}
          >
            <View>
              <Text style={styles.heroSmall}>
                {lifeMode === "pregnancy"
                  ? language === "ar"
                    ? "مرحلة الحمل"
                    : "Pregnancy Mode"
                  : lifeMode === "postpartum"
                  ? language === "ar"
                    ? "مرحلة التعافي"
                    : "Recovery Mode"
                  : language === "ar"
                  ? `اليوم ${cycleDay} من دورتك`
                  : `Day ${cycleDay}`}
              </Text>

              <Text
                style={[
                  styles.heroBig,
                  isArabic && styles.rtlText,
                ]}
              >
                {lifeMode === "pregnancy"
                  ? language === "ar"
                    ? "احتواء وهدوء"
                    : "Gentle Support"
                  : lifeMode === "postpartum"
                  ? language === "ar"
                    ? "تعافي واستعادة"
                    : "Recovery Flow"
                 : language === "ar"
  ? wellnessPhase.phaseArabic
  : wellnessPhase.phaseEnglish || wellnessPhase.title}
              </Text>
              <Text style={styles.heroSub}>
                {lifeMode === "pregnancy"
                  ? language === "ar"
                    ? "التركيز الآن على الراحة والتغذية والهدوء."
                    : "Focused on nourishment, calm and gentle recovery."
                  : lifeMode === "postpartum"
                  ? language === "ar"
                    ? "التعافي التدريجي والنوم والترطيب أهم أولوياتك الآن."
                    : "Recovery, hydration and slower routines come first now."
                  : remainingDays !== null &&
                    remainingDays > 0
                  ? language === "ar"
                    ? `متبقي ${remainingDays} يوم`
                    : `${remainingDays} days remaining`
                  : language === "ar"
                  ? "متوقع نزول الدورة اليوم"
                  : "Period expected today"}
              </Text>
            </View>

            <Animated.View
              style={[
                styles.heroGlow,
                {
                  backgroundColor:
                    wellnessPhase.color,
                  transform: [
                    {
                      scale: pulseAnim,
                    },
                  ],
                },
              ]}
            >
              <Text
                style={
                  styles.heroGlowEmoji
                }
              >
               {wellnessPhase.emoji}
              </Text>
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
                    backgroundColor:
                      wellnessPhase.color,
                    shadowColor:
                      wellnessPhase.color,
                    shadowOpacity: 0.45,
                    shadowRadius: 18,
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    elevation: 14,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayBubbleText,
                    item.active && {
                      color: "#0A0A0A",
                      fontWeight: "900",
                    },
                  ]}
                >
                  {item.day}
                </Text>
              </View>
            ))}
          </ScrollView>

          {predictedPeriodSoon && (
            <View
              style={
                styles.periodConfirmCard
              }
            >
              <Text
                style={
                  styles.periodConfirmTitle
                }
              >
                {language === "ar"
                  ? "هل بدأت دورتك اليوم؟"
                  : "Did your period start today?"}
              </Text>

              <View
                style={
                  styles.periodButtons
                }
              >
 <Pressable
  onPress={() => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setLastPeriodDate(today);

    Alert.alert(
      language === "ar"
        ? "تم تسجيل الدورة 🌸"
        : "Period logged 🌸",
      language === "ar"
        ? "تم تحديث يوم الدورة بنجاح"
        : "Cycle updated successfully"
    );
  }}
  style={[
    styles.periodButton,
    {
      backgroundColor: "#FF6FAE",
    },
  ]}
>        
                  <Text
                    style={
                      styles.periodButtonText
                    }
                  >
                    {language === "ar"
                      ? "نعم بدأت"
                      : "Yes"}
                  </Text>
                </Pressable>

                <Pressable
                  style={
                    styles.periodButtonSecondary
                  }
                >
                  <Text
                    style={
                      styles.periodButtonSecondaryText
                    }
                  >
                    {language === "ar"
                      ? "ليس بعد"
                      : "Not Yet"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </LinearGradient>


<View style={styles.compactStripContainer}>
  <View style={styles.compactStripHeader}>
    <Text
      style={[
        styles.compactStripTitle,
        isArabic && styles.rtlText,
      ]}
    >
      {language === "ar"
        ? "إيقاعك هذا الأسبوع"
        : "Your Rhythm This Week"}
    </Text>

  <Text style={styles.compactStripMonth}>
  {new Date().toLocaleDateString(
    language === "ar"
      ? "ar-SA"
      : "en-US",
    {
      month: "long",
      year: "numeric",
    }
  )}
</Text>
  </View>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.compactDaysRow}
  >
   {weekDays.map(
  (day) => {
    const active =
      day.day === cycleDay;

    const fertile =
      lifeMode === "pregnancy" ||
      lifeMode === "postpartum"
        ? false
        : day.day >= 14 &&
          day.day <= 18;

    const ovulation =
      lifeMode === "pregnancy" ||
      lifeMode === "postpartum"
        ? false
        : day.day === 16;

    return (
      <Pressable
        key={day.id}
        style={styles.compactDayItem}
      >
        <Text style={styles.compactDayNumber}>
          {day.day}
        </Text>

        <View
          style={[
            styles.compactDot,
            fertile && {
              backgroundColor: "#C6A7FF",
            },
            ovulation && {
              backgroundColor: "#E9CF74",
            },
            active && styles.compactTodayGlow,
          ]}
        />

        {active && (
          <Text style={styles.compactTodayText}>
            {language === "ar"
              ? "اليوم"
              : "Today"}
          </Text>
        )}
      </Pressable>
    );
  }
)}
  </ScrollView>

  <View style={styles.compactButtonsRow}>
    <Pressable
      onPress={() => {
        const today = new Date()
          .toISOString()
          .split("T")[0];

        setLastPeriodDate(today);

        Alert.alert(
          language === "ar"
            ? "تم تسجيل الدورة 🌸"
            : "Period logged 🌸"
        );
      }}
      style={styles.compactPrimaryButton}
    >
      <Text style={styles.compactPrimaryButtonText}>
        {language === "ar"
          ? "تسجيل بداية الدورة"
          : "Log Period Start"}
      </Text>
    </Pressable>

    <Pressable
      onPress={() => {
        setShowFullCalendar(true);
      }}
      style={styles.compactSecondaryButton}
    >
      <Text style={styles.compactSecondaryButtonText}>
        {language === "ar"
         ? "عرض التقويم"
: "View Calendar"}
      </Text>
    </Pressable>
  </View>
</View>

<LinearGradient
  colors={[
    "rgba(198,167,255,0.14)",
    "rgba(255,255,255,0.04)",
  ]}
  style={styles.insightCard}
>
  <View style={styles.insightTopRow}>
    <Text style={styles.insightEmoji}>
      ✨
    </Text>

    <View style={{ flex: 1 }}>
      <Text
        style={[
          styles.insightTitle,
          isArabic && styles.rtlText,
        ]}
      >
        {language === "ar"
          ? "رسالة إيقاع"
          : "Today's Rhythm"}
      </Text>

      <Text
        style={[
          styles.insightText,
          isArabic && styles.rtlText,
        ]}
      >
{language === "ar"
  ? wellnessPhase.descriptionArabic || wellnessPhase.description
  : wellnessPhase.descriptionEnglish || wellnessPhase.description}      </Text>
    </View>
  </View>
</LinearGradient>

<View style={styles.analyticsSection}>
  <View style={styles.analyticsHeader}>
    <Text
      style={[
        styles.analyticsTitle,
        isArabic && styles.rtlText,
      ]}
    >
      {language === "ar"
        ? "تحليلات الإيقاع"
        : "Rhythm Analytics"}
    </Text>

    <Text style={styles.analyticsSub}>
      {language === "ar"
        ? "آخر ٧ أيام"
        : "Last 7 days"}
    </Text>
  </View>

<View
  style={[
    styles.analyticsGrid,
    isArabic && {
      flexDirection: "row-reverse",
    },
  ]}
>
  <LinearGradient
    colors={[
      "rgba(198,167,255,0.16)",
      "rgba(255,255,255,0.03)",
    ]}
    style={styles.analyticsCard}
  >
      <Text style={styles.analyticsEmoji}>
        🌙
      </Text>

<Text
  style={[
    styles.analyticsCardTitle,
    isArabic && styles.rtlText,
  ]}
>        {language === "ar"
          ? "توازن المشاعر"
          : "Emotional Balance"}
      </Text>

      <Text style={styles.analyticsValue}>
        {analytics.emotionalBalance}%
      </Text>
    </LinearGradient>

    <LinearGradient
      colors={[
        "rgba(255,111,174,0.14)",
        "rgba(255,255,255,0.03)",
      ]}
      style={styles.analyticsCard}
    >
      <Text style={styles.analyticsEmoji}>
        ✨
      </Text>

<Text
  style={[
    styles.analyticsCardTitle,
    isArabic && styles.rtlText,
  ]}
>
  {language === "ar"
    ? "مستوى الطاقة"
    : "Energy Rhythm"}
</Text>

      <Text style={styles.analyticsValue}>
        {analytics.energyRhythm}%
      </Text>
    </LinearGradient>

    <LinearGradient
      colors={[
        "rgba(142,240,200,0.14)",
        "rgba(255,255,255,0.03)",
      ]}
      style={styles.analyticsWideCard}
    >
<View
  style={[
    styles.analyticsWideTop,
    isArabic && {
      flexDirection: "row-reverse",
    },
  ]}
>
  <Text style={styles.analyticsWideEmoji}>
          🌿
        </Text>

        <Text
          style={[
            styles.analyticsWideTitle,
            isArabic && styles.rtlText,
          ]}
        >
          {language === "ar"
            ? "مؤشر الانسجام"
            : "Rhythm Score"}
        </Text>
      </View>

      <Text style={styles.rhythmScore}>
        {analytics.rhythmScore}
      </Text>

      <Text
        style={[
          styles.analyticsWideText,
          isArabic && styles.rtlText,
        ]}
      >
        {language === "ar"
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
    colors={[
      "#06070B",
      "#15162A",
      "#241B3D",
    ]}
    style={styles.fullModalContainer}
  >
    <View style={styles.fullModalHeader}>
      <View>
        <Text
          style={styles.fullModalLabel}
        >
          {language === "ar"
            ? "الدورة"
: "Cycle"}
        </Text>

        <Text
          style={styles.fullModalTitle}
        >
          {language === "ar"
            ? "التتبع الكامل"
            : "Full Tracking"}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          setShowFullCalendar(false)
        }
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>
          ✕
        </Text>
      </Pressable>
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        styles.fullModalContent
      }
    >
      <MonthCalendar />

      <LinearGradient
        colors={[
          "rgba(255,111,174,0.16)",
          "rgba(255,255,255,0.04)",
        ]}
        style={styles.fullTrackingCard}
      >
        <Text style={styles.fullTrackingEmoji}>
          🌸
        </Text>

        <Text
          style={styles.fullTrackingTitle}
        >
          {language === "ar"
            ? "تعديل أيام الدورة"
            : "Edit Period Days"}
        </Text>

        <Text
          style={styles.fullTrackingText}
        >
          {language === "ar"
            ? "اضغطي على أي يوم داخل التقويم لتعديل وتتبع الدورة والأعراض والطاقة اليومية."
            : "Tap any day to edit symptoms, period flow and daily energy."}
        </Text>
      </LinearGradient>

      {lifeMode !== "pregnancy" &&
       lifeMode !== "postpartum" && (
        <View style={styles.predictionRow}>
          <LinearGradient
            colors={[
              "rgba(198,167,255,0.16)",
              "rgba(255,255,255,0.03)",
            ]}
            style={styles.predictionCard}
          >
            <Text style={styles.predictionEmoji}>
              ✨
            </Text>

            <Text style={styles.predictionLabel}>
              {language === "ar"
                ? "الإباضة"
                : "Ovulation"}
            </Text>

           <Text style={styles.predictionValue}>
  {language === "ar"
    ? "اليوم 16"
    : "Day 16"}
</Text>
          </LinearGradient>

          <LinearGradient
            colors={[
              "rgba(233,207,116,0.16)",
              "rgba(255,255,255,0.03)",
            ]}
            style={styles.predictionCard}
          >
            <Text style={styles.predictionEmoji}>
              🌙
            </Text>

            <Text style={styles.predictionLabel}>
              {language === "ar"
                ? "النافذة الخصبة"
                : "Fertile Window"}
            </Text>

           <Text style={styles.predictionValue}>
  {language === "ar"
    ? "14 - 18 يوم"
    : "Days 14 - 18"}
</Text>
          </LinearGradient>
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
    padding: 24,
paddingBottom: 260,  },

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
  },
  container: {
    flex: 1,
    backgroundColor: "#07070A",
  },

  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  insightCard: {
    marginTop: 28,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
    overflow: "hidden",
    backgroundColor:
      "rgba(255,255,255,0.03)",
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
    color:
      "rgba(255,255,255,0.82)",
    fontSize: 16,
    lineHeight: 30,
    fontWeight: "600",
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
    backgroundColor:
      "rgba(255,255,255,0.14)",
  },

  compactTodayGlow: {
    shadowColor: "#E9CF74",
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 0,
    },
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
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  compactSecondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
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

  backgroundOrbTop: {
    position: "absolute",
    top: -120,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 999,
    zIndex: -1,
    backgroundColor:
      "rgba(199,166,255,0.08)",
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
    backgroundColor:
      "rgba(255,255,255,0.03)",
    opacity: 0.08,
  },
content: {
  paddingTop: 90,
  paddingHorizontal: 24,
paddingBottom: 220,},

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
    color:
      "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 30,
    marginTop: 20,
    marginBottom: 40,
  },

  calendarHero: {
    borderRadius: 34,
    padding: 24,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
    overflow: "hidden",
    backgroundColor:
      "rgba(255,255,255,0.02)",
  },

  calendarHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
  },

  heroSmall: {
    color:
      "rgba(255,255,255,0.72)",
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
    color:
      "rgba(255,255,255,0.68)",
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
    backgroundColor:
      "rgba(255,255,255,0.06)",
  },

  dayBubbleText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  periodConfirmCard: {
    marginTop: 28,
    backgroundColor:
      "rgba(255,255,255,0.04)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.05)",
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
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  periodButtonSecondaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});