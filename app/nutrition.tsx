import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLanguage,
} from "@/src/context/LanguageContext";

import {
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import {
  getCurrentPhase,
  getCycleDay,
  getPhaseTheme,
} from "@/src/engine/cycleEngine";

import {
  getCyclePhase,
} from "@/src/engine/wellnessEngine";

import {
  getLastPeriod,
} from "@/src/storage/cycleStorage";

import {
  getCalories,
  getGoals,
  getLifeMode,
} from "@/src/storage/profileStorage";

import { ArrowLeft } from "lucide-react-native";

export default function NutritionScreen() {
    const { language } =
    useLanguage();
  const isRTL = I18nManager.isRTL;
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

  const [caloriesGoal, setCaloriesGoal] =
    useState(1900);

  const [goal, setGoal] =
    useState<string[]>([]);

  useEffect(() => {
    async function loadCycle() {
      const lastPeriod =
        await getLastPeriod();

      const savedLifeMode =
        await getLifeMode();
      const savedCalories =
        await getCalories();

      const savedGoal =
        await getGoals();

      if (
        savedLifeMode === "regular" ||
        savedLifeMode === "pregnancy" ||
        savedLifeMode === "postpartum" ||
        savedLifeMode === "pcos" ||
        savedLifeMode === "moon"
      ) {
        setLifeMode(savedLifeMode);
      }

      if (savedCalories) {
        setCaloriesGoal(savedCalories);
      }

      if (savedGoal) {
        setGoal(savedGoal);
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

  const wellnessPhase =
    useMemo(() => {
      return getCyclePhase(
        cycleDay
      );
    }, [cycleDay]);

  const nutritionData = useMemo(() => {
    if (lifeMode === "pregnancy") {
      return {
        calories: caloriesGoal.toString(),
        protein: "30%",
        carbs: "45%",
        fats: "25%",
        mealTitle:
          language === "ar"
            ? "وجبة دعم واحتواء"
            : "Supportive Nourishing Meal",
        meal:
          language === "ar"
            ? "160g سلمون + 140g أرز + 80g خضار + 15g زيت زيتون"
            : "160g salmon + 140g rice + 80g vegetables + 15g olive oil",
        macros:
          language === "ar"
            ? [
                "44g بروتين",
                "58g كارب",
                "18g دهون",
              ]
            : [
                "44g Protein",
                "58g Carbs",
                "18g Fat",
              ],
        insight:
          language === "ar"
            ? "التركيز الآن على الوجبات المشبعة، الترطيب، والطاقة المستقرة بدون ضغط أو حرمان."
            : "Focus on nourishing meals, hydration and steady energy without restriction.",
        insightArabic:
          "التركيز الآن على الوجبات المشبعة، الترطيب، والطاقة المستقرة بدون ضغط أو حرمان.",
        insightEnglish:
          "Focus on nourishing meals, hydration and steady energy without restriction.",
        phaseTitle:
          language === "ar"
            ? "احتواء وهدوء"
            : "Gentle Support",
        emoji: "♡",
      };
    }

    if (lifeMode === "postpartum") {
      return {
        calories: caloriesGoal.toString(),
        protein: "32%",
        carbs: "43%",
        fats: "25%",
        mealTitle:
          language === "ar"
            ? "وجبة التعافي"
            : "Recovery Meal",
        meal:
          language === "ar"
            ? "150g دجاج + 120g بطاطس + 90g خضار + 10g زيت زيتون"
            : "150g chicken + 120g potatoes + 90g vegetables + 10g olive oil",
        macros:
          language === "ar"
            ? [
                "42g بروتين",
                "54g كارب",
                "14g دهون",
              ]
            : [
                "42g Protein",
                "54g Carbs",
                "14g Fat",
              ],
        insight:
          language === "ar"
            ? "مرحلة تحتاج تغذية مشبعة، سوائل، وراحة أكثر من التركيز على القيود."
            : "This phase benefits from nourishing meals, hydration and recovery-focused routines.",
        insightArabic:
          "مرحلة تحتاج تغذية مشبعة، سوائل، وراحة أكثر من التركيز على القيود.",
        insightEnglish:
          "This phase benefits from nourishing meals, hydration and recovery-focused routines.",
        phaseTitle:
          language === "ar"
            ? "تعافي واستعادة"
            : "Recovery Flow",
        emoji: "☼",
      };
    }

    if (lifeMode === "moon") {
      return {
        calories: caloriesGoal.toString(),
        protein: "28%",
        carbs: "47%",
        fats: "25%",
        mealTitle:
          language === "ar"
            ? "وجبة القمر"
            : "Moon Meal",
        meal:
          language === "ar"
            ? "140g سمك + 110g أرز + 90g خضار + شاي دافئ"
            : "140g fish + 110g rice + 90g vegetables + warm tea",
        macros:
          language === "ar"
            ? [
                "36g بروتين",
                "52g كارب",
                "14g دهون",
              ]
            : [
                "36g Protein",
                "52g Carbs",
                "14g Fat",
              ],
        insight:
          language === "ar"
            ? "تغذية ألطف وأكثر هدوءًا مرتبطة بالطاقة الداخلية والراحة."
            : "Gentler nourishment aligned with calm energy and inner balance.",
        insightArabic:
          "تغذية ألطف وأكثر هدوءًا مرتبطة بالطاقة الداخلية والراحة.",
        insightEnglish:
          "Gentler nourishment aligned with calm energy and inner balance.",
        phaseTitle:
          language === "ar"
            ? "إيقاع القمر"
            : "Moon Rhythm",
        emoji: "🌙",
      };
    }

    if (lifeMode === "pcos") {
      return {
        calories: caloriesGoal.toString(),
        protein: "34%",
        carbs: "38%",
        fats: "28%",
        mealTitle:
          language === "ar"
            ? "وجبة التوازن"
            : "Balanced Meal",
        meal:
          language === "ar"
            ? "160g دجاج + 90g أرز + 120g خضار + 15g أفوكادو"
            : "160g chicken + 90g rice + 120g vegetables + 15g avocado",
        macros:
          language === "ar"
            ? [
                "48g بروتين",
                "38g كارب",
                "18g دهون",
              ]
            : [
                "48g Protein",
                "38g Carbs",
                "18g Fat",
              ],
        insight:
          language === "ar"
            ? "قد تساعدك الوجبات المستقرة والبروتين الجيد على الحفاظ على طاقة أكثر توازنًا."
            : "Balanced meals and steady protein may help support more stable energy.",
        insightArabic:
          "قد تساعدك الوجبات المستقرة والبروتين الجيد على الحفاظ على طاقة أكثر توازنًا.",
        insightEnglish:
          "Balanced meals and steady protein may help support more stable energy.",
        phaseTitle:
          language === "ar"
            ? "إيقاع متغير"
            : "Changing Rhythm",
        emoji: "〰️",
      };
    }

    if (phase.key === "power") {
      return {
        calories: caloriesGoal.toString(),
        protein: "30%",
        carbs: "45%",
        fats: "25%",
        mealTitle:
          language === "ar"
            ? "وجبة دعم للطاقة"
            : "Energy Support Meal",
        meal:
          language === "ar"
            ? "150g دجاج مشوي + 120g أرز مطبوخ + 80g خضار + 10g زيت زيتون"
            : "150g grilled chicken + 120g cooked rice + 80g vegetables + 10g olive oil",
        macros:
          language === "ar"
            ? [
                "42g بروتين",
                "58g كارب",
                "14g دهون",
              ]
            : [
                "42g Protein",
                "58g Carbs",
                "14g Fat",
              ],
        insight:
          language === "ar"
            ? "قد يستفيد جسمك من بروتين جيد وطاقة مستقرة لدعم التركيز والحركة."
            : "Your body may benefit from good protein and steady energy to support focus and movement.",
        insightArabic:
          "قد يستفيد جسمك من بروتين جيد وطاقة مستقرة لدعم التركيز والحركة.",
        insightEnglish:
          "Your body may benefit from good protein and steady energy to support focus and movement.",
        phaseTitle:
          wellnessPhase.phaseArabic,
        emoji:
          wellnessPhase.emoji,
      };
    }

    if (phase.key === "manifestation") {
      return {
        calories: caloriesGoal.toString(),
        protein: "28%",
        carbs: "47%",
        fats: "25%",
        mealTitle:
          language === "ar"
            ? "وجبة توازن"
            : "Balanced Meal",
        meal:
          language === "ar"
            ? "140g دجاج + 110g مكرونة + 90g خضار + 12g زيت زيتون"
            : "140g chicken + 110g pasta + 90g vegetables + 12g olive oil",
        macros:
          language === "ar"
            ? [
                "38g بروتين",
                "61g كارب",
                "15g دهون",
              ]
            : [
                "38g Protein",
                "61g Carbs",
                "15g Fat",
              ],
        insight:
          language === "ar"
            ? "مرحلة مناسبة للوجبات المتوازنة والطاقة المستقرة."
            : "A phase suitable for balanced meals and steady energy.",
        insightArabic:
          "مرحلة مناسبة للوجبات المتوازنة والطاقة المستقرة.",
        insightEnglish:
          "A phase suitable for balanced meals and steady energy.",
        phaseTitle:
          wellnessPhase.phaseArabic,
        emoji:
          wellnessPhase.emoji,
      };
    }

    if (phase.key === "secondPower") {
      return {
        calories: caloriesGoal.toString(),
        protein: "32%",
        carbs: "43%",
        fats: "25%",
        mealTitle:
          language === "ar"
            ? "وجبة دعم التركيز"
            : "Focus Support Meal",
        meal:
          language === "ar"
            ? "160g لحم + 130g بطاطس + 70g خضار + 10g زيت زيتون"
            : "160g beef + 130g potatoes + 70g vegetables + 10g olive oil",
        macros:
          language === "ar"
            ? [
                "46g بروتين",
                "50g كارب",
                "16g دهون",
              ]
            : [
                "46g Protein",
                "50g Carbs",
                "16g Fat",
              ],
        insight:
          language === "ar"
            ? "قد تدعمك الوجبات الغنية بالبروتين والطاقة المستقرة خلال هذه المرحلة."
            : "Protein-rich and steady energy meals may support you during this phase.",
        insightArabic:
          "قد تدعمك الوجبات الغنية بالبروتين والطاقة المستقرة خلال هذه المرحلة.",
        insightEnglish:
          "Protein-rich and steady energy meals may support you during this phase.",
        phaseTitle:
          wellnessPhase.phaseArabic,
        emoji:
          wellnessPhase.emoji,
      };
    }

    return {
      calories: caloriesGoal.toString(),
      protein: "30%",
      carbs: "40%",
      fats: "30%",
      mealTitle:
        language === "ar"
          ? "وجبة ألطف"
          : "Gentler Meal",
      meal:
        language === "ar"
          ? "120g سمك + 100g أرز + 100g خضار + 15g أفوكادو"
          : "120g fish + 100g rice + 100g vegetables + 15g avocado",
      macros:
        language === "ar"
          ? [
              "34g بروتين",
              "42g كارب",
              "18g دهون",
            ]
          : [
              "34g Protein",
              "42g Carbs",
              "18g Fat",
            ],
      insight:
        language === "ar"
          ? "قد يكون الوقت مناسبًا لوجبات ألطف وأكثر راحة واستقرارًا."
          : "This may be a supportive time for softer and more comforting meals.",
      insightArabic:
        "قد يكون الوقت مناسبًا لوجبات ألطف وأكثر راحة واستقرارًا.",
      insightEnglish:
        "This may be a supportive time for softer and more comforting meals.",
      phaseTitle:
        wellnessPhase.phaseArabic,
      emoji:
        wellnessPhase.emoji,
    };
  }, [
    phase,
    lifeMode,
    caloriesGoal,
    goal,
    wellnessPhase,
    language,
  ]);

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
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
<Text
  style={[
    styles.label,
    isRTL && styles.rtlText,
  ]}
>
  {language === "ar"
    ? "تغذية إيقاع"
    : "Eqa’a Nutrition"}
</Text>

    <Text
  style={[
    styles.title,
    isRTL && styles.rtlText,
  ]}
>
  {language === "ar"
    ? "تغذية تناسب\nيومك"
    : "Nutrition For\nYour Rhythm"}
</Text>
<Text
  style={[
    styles.subtitle,
    isRTL && styles.rtlText,
  ]}
>
  {language === "ar"
    ? "اقتراحات ألطف مرتبطة بالسعرات والطاقة ومرحلتك الحالية."
    : "Gentler nutrition suggestions aligned with your calories, energy and current phase."}
</Text>

        <View
          style={[
            styles.phaseCard,
            {
              backgroundColor: `${theme.glow}16`,
              borderColor: `${theme.glow}24`,
            },
          ]}
        >
          <Text style={styles.phaseEmoji}>
            {nutritionData.emoji}
          </Text>

          <Text
            style={[
              styles.phaseTitle,
              isRTL && styles.rtlText,
            ]}
          >
            {language === "ar"
              ? wellnessPhase.phaseArabic
              : wellnessPhase.title}
          </Text>

          <Text
            style={[
              styles.phaseText,
              isRTL && styles.rtlText,
            ]}
          >
            {language === "ar"
              ? nutritionData.insightArabic
              : nutritionData.insightEnglish}
          </Text>
        </View>

        <View
          style={[
            styles.caloriesCard,
            {
              borderColor: `${theme.glow}24`,
            },
          ]}
        >
          <Text style={styles.caloriesLabel}>
  {language === "ar"
    ? "السعرات المقترحة"
    : "Suggested Calories"}
</Text>

          <Text style={styles.caloriesValue}>
            {nutritionData.calories}
          </Text>

         <Text style={styles.caloriesSubtext}>
  {goal.includes("loss")
    ? language === "ar"
      ? "هدفك الحالي: خسارة وزن"
      : "Current Goal: Fat Loss"

    : goal.includes("gain")
    ? language === "ar"
      ? "هدفك الحالي: زيادة الوزن"
      : "Current Goal: Muscle Gain"

    : language === "ar"
    ? "هدفك الحالي: المحافظة على الوزن"
    : "Current Goal: Maintain Weight"}
</Text>
        </View>

        <View style={styles.macrosRow}>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>
  {language === "ar"
    ? "بروتين"
    : "Protein"}
</Text>

            <Text style={styles.macroValue}>
              {nutritionData.protein}
            </Text>
          </View>

          <View style={styles.macroCard}>
           <Text style={styles.macroLabel}>
  {language === "ar"
    ? "كارب"
    : "Carbs"}
</Text>

            <Text style={styles.macroValue}>
              {nutritionData.carbs}
            </Text>
          </View>

          <View style={styles.macroCard}>
           <Text style={styles.macroLabel}>
  {language === "ar"
    ? "دهون"
    : "Fats"}
</Text>

            <Text style={styles.macroValue}>
              {nutritionData.fats}
            </Text>
          </View>
        </View>

        <Text style={styles.mealSectionTitle}>
  {language === "ar"
    ? "وجبة مقترحة"
    : "Suggested Meal"}
</Text>

        <View
          style={[
            styles.mealCard,
            {
              borderColor: `${theme.glow}24`,
            },
          ]}
        >
          <Text style={styles.mealEmoji}>🍽️</Text>

          <Text style={styles.mealTitle}>
            {nutritionData.mealTitle}
          </Text>

          <Text style={styles.mealText}>
            {nutritionData.meal}
          </Text>

          <View style={styles.mealMacrosRow}>
            {nutritionData.macros.map(
              (item) => (
                <Text
                  key={item}
                  style={styles.mealMacro}
                >
                  {item}
                </Text>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  rtlText: {
    writingDirection: "rtl",
    textAlign: "right",
  },
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
    color: "#C7A6FF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  title: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 46,
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

  phaseCard: {
    marginTop: 38,
    borderRadius: 32,
    padding: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  phaseEmoji: {
    position: "absolute",
    top: 22,
    right: 24,
    fontSize: 28,
  },

  phaseTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 40,
    textAlign: "center",
  },

  phaseText: {
    marginTop: 18,
    color: "rgba(255,255,255,0.76)",
    fontSize: 18,
    lineHeight: 34,
    minHeight: 80,
    textAlign: "center",
    fontWeight: "600",
  },

  caloriesCard: {
    marginTop: 24,
    borderRadius: 28,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  caloriesLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 15,
    fontWeight: "700",
  },

  caloriesValue: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 72,
    fontWeight: "900",
  },
  caloriesSubtext: {
    marginTop: 12,
    color: "rgba(255,255,255,0.62)",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "700",
  },

  macrosRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  macroCard: {
    width: "31%",
    borderRadius: 24,
    paddingVertical: 26,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  macroLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    fontWeight: "700",
  },

  macroValue: {
    marginTop: 14,
    color: "#C7A6FF",
    fontSize: 30,
    fontWeight: "900",
  },

  mealSectionTitle: {
    marginTop: 34,
    marginBottom: 18,
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },

  mealCard: {
    borderRadius: 36,
    padding: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  mealEmoji: {
    position: "absolute",
    top: 22,
    left: 22,
    fontSize: 28,
  },

  mealTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },

  mealText: {
    marginTop: 20,
    color: "rgba(255,255,255,0.76)",
    fontSize: 18,
    lineHeight: 34,
    textAlign: "center",
    fontWeight: "600",
  },

  mealMacrosRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  mealMacro: {
    color: "#C7A6FF",
    fontSize: 16,
    fontWeight: "800",
  },
});