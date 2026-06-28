import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Target,
  BarChart2,
} from "lucide-react-native";
import { useLanguage } from "@/src/context/LanguageContext";
import { getScanEntryById } from "@/src/features/workout-ai/storage/scanHistoryStorage";
import { MuscleMapView } from "@/src/features/workout-ai/components/MuscleMapView";
import { DifficultyBadge } from "@/src/features/workout-ai/components/DifficultyBadge";
import type { ScanEntry, MachineType } from "@/src/features/workout-ai/models/types";
import { ExerciseSuggestionCard } from "@/src/workout/components/ExerciseSuggestionCard";

const MACHINE_TYPE_LABELS: Record<MachineType, { ar: string; en: string }> = {
  cable: { ar: "كابل", en: "Cable" },
  plate_loaded: { ar: "أوزان صحائح", en: "Plate Loaded" },
  selectorized: { ar: "انتقائي", en: "Selectorized" },
  smith_machine: { ar: "سميث ماشين", en: "Smith Machine" },
  functional: { ar: "وظيفي", en: "Functional" },
  cardio: { ar: "كارديو", en: "Cardio" },
  free_weights: { ar: "أوزان حرة", en: "Free Weights" },
  bodyweight: { ar: "وزن الجسم", en: "Bodyweight" },
  unknown: { ar: "غير معروف", en: "Unknown" },
};

const STRINGS = {
  ar: {
    exercise: "التمرين",
    muscles: "العضلات المستهدفة",
    instructions: "خطوات الأداء",
    tips: "نصائح",
    calsMin: "سعرة/د",
    sets: "مجموعات",
    reps: "تكرار",
    loading: "جاري التحميل...",
    notFound: "لم يُعثر على النتيجة",
  },
  en: {
    exercise: "Exercise",
    muscles: "Target Muscles",
    instructions: "How to Perform",
    tips: "Tips",
    calsMin: "Cal/min",
    sets: "Sets",
    reps: "Reps",
    loading: "Loading...",
    notFound: "Result not found",
  },
} as const;

export default function GymScanResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useLanguage();
  const t = STRINGS[language];

  const [entry, setEntry] = useState<ScanEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getScanEntryById(id).then((e) => {
      setEntry(e);
      setLoading(false);
    });
  }, [id]);

  const isRTL = language === "ar";
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator color="#E2D4FF" />
          <Text style={styles.centeredText}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <TouchableOpacity style={[styles.backBtn, styles.backBtnStandalone]} onPress={() => router.back()}>
          <BackIcon color="rgba(255,255,255,0.7)" size={22} strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.centeredText}>{t.notFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { result, imageUri } = entry;
  const typeLabel = MACHINE_TYPE_LABELS[result.machineType] ?? MACHINE_TYPE_LABELS.unknown;

  const displayInstructions =
    language === "ar" ? result.instructionsAr : result.instructions;
  const displayTips = language === "ar" ? result.tipsAr : result.tips;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <BackIcon color="rgba(255,255,255,0.7)" size={22} strokeWidth={2.2} />
          </TouchableOpacity>
          <DifficultyBadge difficulty={result.difficulty} language={language} />
        </View>

        {/* Image */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        {/* Machine header */}
        <View style={styles.machineHeader}>
          <Text style={styles.machineName}>
            {language === "ar" ? result.machineNameAr : result.machineName}
          </Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>
              {language === "ar" ? typeLabel.ar : typeLabel.en}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Flame color="#FF9F0A" size={18} strokeWidth={2} />
            <Text style={styles.statValue}>{result.caloriesPerMinute}</Text>
            <Text style={styles.statLabel}>{t.calsMin}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <BarChart2 color="#E2D4FF" size={18} strokeWidth={2} />
            <Text style={styles.statValue}>{result.setsRecommended}</Text>
            <Text style={styles.statLabel}>{t.sets}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Target color="#64D2FF" size={18} strokeWidth={2} />
            <Text style={styles.statValue}>{result.repsRecommended}</Text>
            <Text style={styles.statLabel}>{t.reps}</Text>
          </View>
        </View>

        {/* Exercise name */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Dumbbell color="#E2D4FF" size={16} strokeWidth={2} />
            <Text style={styles.sectionTitle}>{t.exercise}</Text>
          </View>
          <Text style={styles.exerciseName}>
            {language === "ar" ? result.exerciseNameAr : result.exerciseName}
          </Text>
        </View>

        {/* Muscle map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.muscles}</Text>
          <MuscleMapView
            primaryMuscles={result.primaryMuscles}
            secondaryMuscles={result.secondaryMuscles}
            language={language}
          />
        </View>

        {/* Instructions */}
        {displayInstructions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.instructions}</Text>
            <View style={styles.stepList}>
              {displayInstructions.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        {displayTips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.tips}</Text>
            <View style={styles.tipList}>
              {displayTips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipIcon}>💡</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <ExerciseSuggestionCard
          machineName={result.machineName}
          scanEntryId={entry.id}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#08080F",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 60,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  centeredText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
  },
  backBtnStandalone: {
    margin: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 240,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  machineHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  machineName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    flex: 1,
    minWidth: 0,
  },
  typeTag: {
    backgroundColor: "rgba(226,212,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 2,
  },
  typeTagText: {
    fontSize: 12,
    color: "#E2D4FF",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.42)",
    fontWeight: "500",
  },
  section: {
    marginHorizontal: 20,
    marginTop: 28,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E2D4FF",
  },
  stepList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(226,212,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E2D4FF",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 21,
  },
  tipList: {
    gap: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 14,
  },
  tipIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 21,
  },
});
