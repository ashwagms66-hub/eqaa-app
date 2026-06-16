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

type Ingredient = {
  emoji: string;
  nameAr: string;
  nameEn: string;
  grams: string;
};

function computeKcal(macros: string[]): number {
  let p = 0, c = 0, f = 0;
  macros.forEach((m) => {
    const n = parseInt(m, 10);
    if (isNaN(n)) return;
    if (/بروتين|Protein/.test(m)) p = n;
    else if (/كارب|Carbs/.test(m)) c = n;
    else if (/دهون|Fat/.test(m)) f = n;
  });
  return Math.round((p * 4 + c * 4 + f * 9) / 10) * 10;
}

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
        ingredients: [
          { emoji: "🐟", nameAr: "سلمون مشوي",     nameEn: "Grilled Salmon",   grams: "160g" },
          { emoji: "🌾", nameAr: "أرز مطبوخ",       nameEn: "Cooked Rice",      grams: "140g" },
          { emoji: "🥦", nameAr: "خضار متنوعة",     nameEn: "Vegetables",       grams: "80g"  },
          { emoji: "🫒", nameAr: "زيت زيتون",       nameEn: "Olive Oil",        grams: "15g"  },
        ] as Ingredient[],
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
        ingredients: [
          { emoji: "🍗", nameAr: "دجاج مشوي",      nameEn: "Grilled Chicken",  grams: "150g" },
          { emoji: "🥔", nameAr: "بطاطس مطبوخة",   nameEn: "Cooked Potatoes",  grams: "120g" },
          { emoji: "🥦", nameAr: "خضار متنوعة",     nameEn: "Vegetables",       grams: "90g"  },
          { emoji: "🫒", nameAr: "زيت زيتون",       nameEn: "Olive Oil",        grams: "10g"  },
        ] as Ingredient[],
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
        ingredients: [
          { emoji: "🐟", nameAr: "سمك خفيف",       nameEn: "Light Fish",       grams: "140g" },
          { emoji: "🌾", nameAr: "أرز مطبوخ",       nameEn: "Cooked Rice",      grams: "110g" },
          { emoji: "🥦", nameAr: "خضار متنوعة",     nameEn: "Vegetables",       grams: "90g"  },
          { emoji: "🫖", nameAr: "شاي أعشاب دافئ",  nameEn: "Warm Herbal Tea",  grams: ""     },
        ] as Ingredient[],
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
        ingredients: [
          { emoji: "🍗", nameAr: "دجاج مشوي",      nameEn: "Grilled Chicken",  grams: "160g" },
          { emoji: "🌾", nameAr: "أرز مطبوخ",       nameEn: "Cooked Rice",      grams: "90g"  },
          { emoji: "🥦", nameAr: "خضار متنوعة",     nameEn: "Vegetables",       grams: "120g" },
          { emoji: "🥑", nameAr: "أفوكادو",          nameEn: "Avocado",          grams: "15g"  },
        ] as Ingredient[],
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
        ingredients: [
          { emoji: "🍗", nameAr: "دجاج مشوي",      nameEn: "Grilled Chicken",  grams: "150g" },
          { emoji: "🌾", nameAr: "أرز مطبوخ",       nameEn: "Cooked Rice",      grams: "120g" },
          { emoji: "🥦", nameAr: "خضار طازجة",      nameEn: "Fresh Vegetables", grams: "80g"  },
          { emoji: "🫒", nameAr: "زيت زيتون",       nameEn: "Olive Oil",        grams: "10g"  },
        ] as Ingredient[],
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
        ingredients: [
          { emoji: "🍗", nameAr: "دجاج مشوي",      nameEn: "Grilled Chicken",  grams: "140g" },
          { emoji: "🍝", nameAr: "مكرونة مطبوخة",   nameEn: "Cooked Pasta",     grams: "110g" },
          { emoji: "🥦", nameAr: "خضار متنوعة",     nameEn: "Vegetables",       grams: "90g"  },
          { emoji: "🫒", nameAr: "زيت زيتون",       nameEn: "Olive Oil",        grams: "12g"  },
        ] as Ingredient[],
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
        ingredients: [
          { emoji: "🥩", nameAr: "لحم مشوي",       nameEn: "Grilled Beef",     grams: "130g" },
          { emoji: "🥔", nameAr: "بطاطس مشوية",    nameEn: "Roasted Potatoes", grams: "160g" },
          { emoji: "🥗", nameAr: "خضار مشكلة",     nameEn: "Mixed Vegetables", grams: "70g"  },
          { emoji: "🫒", nameAr: "زيت زيتون",       nameEn: "Olive Oil",        grams: "10g"  },
        ] as Ingredient[],
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
      ingredients: [
        { emoji: "🐟", nameAr: "سمك خفيف",       nameEn: "Light Fish",     grams: "120g" },
        { emoji: "🌾", nameAr: "أرز مطبوخ",       nameEn: "Cooked Rice",    grams: "100g" },
        { emoji: "🥬", nameAr: "خضار متنوعة",     nameEn: "Vegetables",     grams: "100g" },
        { emoji: "🥑", nameAr: "أفوكادو",          nameEn: "Avocado",        grams: "15g"  },
      ] as Ingredient[],
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

          <View style={styles.mealKcalBlock}>
            <Text style={styles.mealKcalText}>
              {"🔥 "}
              {computeKcal(nutritionData.macros)}
              {language === "ar" ? " سعرة حرارية" : " kcal"}
            </Text>
          </View>

          <View style={styles.ingredientsDivider} />

          <View style={styles.ingredientList}>
            {nutritionData.ingredients.map((ing, i) => (
              <View
                key={i}
                style={[
                  styles.ingredientRow,
                  language === "ar" && styles.rowReverse,
                ]}
              >
                <Text style={styles.ingredientEmoji}>{ing.emoji}</Text>
                <Text
                  style={[
                    styles.ingredientName,
                    language === "ar" && styles.rtlText,
                  ]}
                >
                  {language === "ar" ? ing.nameAr : ing.nameEn}
                </Text>
                <View style={styles.ingredientSpacer} />
                {ing.grams ? (
                  <Text style={styles.ingredientGrams}>
                    {ing.grams}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

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

  rowReverse: { flexDirection: "row-reverse" },

  mealKcalBlock: {
    marginTop: 20,
    alignItems: "center",
  },
  mealKcalText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 18,
    fontWeight: "700",
  },
  ingredientsDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 14,
  },
  ingredientList: {
    gap: 2,
  },
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
    color: "rgba(255,255,255,0.90)",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    flexShrink: 1,
  },
  ingredientSpacer: {
    flex: 1,
  },
  ingredientGrams: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    fontWeight: "500",
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