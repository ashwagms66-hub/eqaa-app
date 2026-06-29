import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Dumbbell, ChevronLeft } from "lucide-react-native";
import { machineMatcher } from "@/src/fitness/services/MachineMatcher";
import { MUSCLES } from "@/src/fitness/data/muscles";
import type { Exercise } from "@/src/fitness/models/Exercise";
import type { Machine } from "@/src/fitness/models/Machine";
import { scanToWorkoutBridge } from "../services/ScanToWorkoutBridge";
import { useLanguage } from "@/src/context/LanguageContext";

const muscleById = new Map(MUSCLES.map((m) => [m.id, m]));

const DIFFICULTY_LABEL: Record<string, { ar: string; en: string; color: string }> = {
  beginner: { ar: "مبتدئ", en: "Beginner", color: "#4CAF50" },
  intermediate: { ar: "متوسط", en: "Intermediate", color: "#FF9800" },
  advanced: { ar: "متقدم", en: "Advanced", color: "#F44336" },
};

interface Props {
  machineName: string;
  scanEntryId: string;
}

export function ExerciseSuggestionCard({ machineName, scanEntryId }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    machineMatcher.match(machineName).then((result) => {
      setMachine(result.machine);
      setExercise(result.exercises[0] ?? null);
      setLoading(false);
    });
  }, [machineName]);

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    setStartError(null);

    const errorMsg = isAr
      ? "تعذر بدء التمرين الآن. حاولي مرة أخرى."
      : "Could not start workout. Please try again.";

    const timeoutId = setTimeout(() => {
      setStarting(false);
      setStartError(errorMsg);
    }, 10000);

    try {
      const session = await scanToWorkoutBridge.createSessionFromScan(
        scanEntryId,
        machineName,
        exercise?.id
      );
      clearTimeout(timeoutId);
      setStarting(false); // reset so button works if user navigates back
      router.push({ pathname: "/workout-session", params: { id: session.id } });
    } catch {
      clearTimeout(timeoutId);
      setStarting(false);
      setStartError(errorMsg);
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#E2D4FF" />
      </View>
    );
  }

  if (!exercise) return null;

  const exName = isAr ? exercise.arabicName : exercise.englishName;
  const difficultyInfo = DIFFICULTY_LABEL[exercise.difficulty];
  const primaryMuscleNames = exercise.primaryMuscles
    .map((id) => {
      const m = muscleById.get(id);
      return m ? (isAr ? m.arabicName : m.englishName) : id;
    })
    .slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Dumbbell size={18} color="#E2D4FF" strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>{isAr ? "تمرين مقترح" : "Suggested Workout"}</Text>
          {machine && (
            <Text style={styles.machineName}>
              {isAr ? machine.arabicName : machine.englishName}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.exerciseName}>{exName}</Text>

      <View style={styles.meta}>
        <View style={[styles.diffBadge, { borderColor: difficultyInfo?.color ?? "#888" }]}>
          <Text style={[styles.diffText, { color: difficultyInfo?.color ?? "#888" }]}>
            {isAr ? (difficultyInfo?.ar ?? exercise.difficulty) : (difficultyInfo?.en ?? exercise.difficulty)}
          </Text>
        </View>
        <Text style={styles.setsReps}>
          {isAr
            ? `${exercise.defaultSets} جولات × ${exercise.defaultReps} تكرار`
            : `${exercise.defaultSets} sets × ${exercise.defaultReps} reps`}
        </Text>
        <Text style={styles.rest}>
          {isAr ? `${exercise.defaultRest}ث راحة` : `${exercise.defaultRest}s rest`}
        </Text>
      </View>

      {primaryMuscleNames.length > 0 && (
        <View style={styles.muscles}>
          {primaryMuscleNames.map((name) => (
            <View key={name} style={styles.muscleChip}>
              <Text style={styles.muscleText}>{name}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.startBtn, starting && styles.startBtnDisabled]}
        onPress={handleStart}
        activeOpacity={0.8}
        disabled={starting}
      >
        {starting ? (
          <ActivityIndicator size="small" color="#08080F" />
        ) : (
          <>
            <Text style={styles.startText}>{isAr ? "ابدئي التمرين" : "Start Workout"}</Text>
            <ChevronLeft size={18} color="#08080F" strokeWidth={2.5} />
          </>
        )}
      </TouchableOpacity>
      {startError && (
        <Text style={styles.errorText}>{startError}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: "rgba(226,212,255,0.07)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226,212,255,0.15)",
    gap: 12,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(226,212,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    alignItems: "flex-end",
  },
  cardTitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  machineName: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 1,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  meta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  diffBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  diffText: {
    fontSize: 11,
    fontWeight: "600",
  },
  setsReps: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  rest: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
  },
  muscles: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
  },
  muscleChip: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  muscleText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  startBtn: {
    backgroundColor: "#E2D4FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  startBtnDisabled: {
    opacity: 0.6,
  },
  startText: {
    color: "#08080F",
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    textAlign: "center",
    marginTop: -4,
  },
});
