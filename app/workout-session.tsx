import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronRight, CheckCircle2, Dumbbell, X } from "lucide-react-native";
import { useLanguage } from "@/src/context/LanguageContext";
import { exerciseRepository } from "@/src/fitness/repository";
import { MUSCLES } from "@/src/fitness/data/muscles";
import type { Exercise } from "@/src/fitness/models/Exercise";
import {
  useWorkoutSession,
  RestTimer,
  WorkoutSetRow,
  formatDuration,
} from "@/src/workout";

const muscleById = new Map(MUSCLES.map((m) => [m.id, m]));

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "#4CAF50",
  intermediate: "#FF9800",
  advanced: "#F44336",
};

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const {
    session,
    exercise,
    currentSetNumber,
    targetSets,
    restSecondsLeft,
    phase,
    finishSet,
    skipRest,
    finishWorkout,
    abandonWorkout,
  } = useWorkoutSession(id ?? "");

  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [exerciseDetail, setExerciseDetail] = useState<Exercise | null>(null);

  useEffect(() => {
    if (exercise?.exerciseId && exercise.exerciseId !== "unknown") {
      exerciseRepository.getById(exercise.exerciseId).then(setExerciseDetail);
    }
  }, [exercise?.exerciseId]);

  // Reset inputs when set number advances
  useEffect(() => {
    setRepsInput("");
    setWeightInput("");
  }, [currentSetNumber]);

  const handleFinishSet = async () => {
    const reps = parseInt(repsInput, 10);
    if (isNaN(reps) || reps <= 0) return;
    const weight = weightInput ? parseFloat(weightInput) : null;
    await finishSet(reps, weight);
  };

  const handleFinishWorkout = async () => {
    if (completedSets.length === 0) {
      Alert.alert(
        isAr ? "لا توجد جولات" : "No Sets Logged",
        isAr
          ? "سجّلي جولة واحدة على الأقل قبل إنهاء التمرين"
          : "Log at least one set before finishing the workout"
      );
      return;
    }
    await finishWorkout();
  };

  const handleAbandon = async () => {
    await abandonWorkout();
    router.back();
  };

  if (phase === "loading") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color="#E2D4FF" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "error" || !session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {isAr ? "تعذّر تحميل الجلسة" : "Session could not be loaded"}
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>{isAr ? "رجوع" : "Back"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const exName = exerciseDetail
    ? isAr
      ? exerciseDetail.arabicName
      : exerciseDetail.englishName
    : isAr
    ? "تمرين"
    : "Exercise";

  const primaryMuscles = (exerciseDetail?.primaryMuscles ?? [])
    .map((id) => {
      const m = muscleById.get(id);
      return m ? (isAr ? m.arabicName : m.englishName) : id;
    })
    .slice(0, 4);

  const completedSets = exercise?.sets ?? [];
  const diffColor =
    exerciseDetail ? DIFFICULTY_COLOR[exerciseDetail.difficulty] ?? "#888" : "#888";

  if (phase === "done") {
    const duration = formatDuration(session.durationSeconds);
    const totalReps = completedSets.reduce((sum, s) => sum + s.reps, 0);

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.doneContent}>
          <View style={styles.doneIcon}>
            <CheckCircle2 size={64} color="#E2D4FF" strokeWidth={1.5} />
          </View>
          <Text style={styles.doneTitle}>{isAr ? "أحسنت!" : "Well done!"}</Text>
          <Text style={styles.doneSubtitle}>{isAr ? "اكتملت الجلسة" : "Session complete"}</Text>

          <View style={styles.doneSummary}>
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>{completedSets.length}</Text>
              <Text style={styles.doneStatLabel}>{isAr ? "جولات" : "Sets"}</Text>
            </View>
            <View style={styles.doneDivider} />
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>{totalReps}</Text>
              <Text style={styles.doneStatLabel}>{isAr ? "تكرار" : "Reps"}</Text>
            </View>
            <View style={styles.doneDivider} />
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>{duration}</Text>
              <Text style={styles.doneStatLabel}>{isAr ? "مدة" : "Duration"}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>{isAr ? "العودة للماسح" : "Back to Scanner"}</Text>
            <ChevronRight size={18} color="#08080F" strokeWidth={2.5} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleAbandon} style={styles.closeBtn} hitSlop={8}>
            <X size={20} color="rgba(255,255,255,0.5)" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.setCounter}>
            {currentSetNumber <= targetSets
              ? isAr
                ? `الجولة ${currentSetNumber} / ${targetSets}`
                : `Set ${currentSetNumber} / ${targetSets}`
              : isAr
              ? `الجولة ${currentSetNumber}`
              : `Set ${currentSetNumber}`}
          </Text>
          <View style={styles.iconWrap}>
            <Dumbbell size={18} color="#E2D4FF" strokeWidth={2} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Exercise header */}
          <View style={styles.exHeader}>
            <Text style={styles.exName}>{exName}</Text>
            {exerciseDetail && (
              <View style={[styles.diffBadge, { borderColor: diffColor }]}>
                <Text style={[styles.diffText, { color: diffColor }]}>
                  {exerciseDetail.difficulty === "beginner"
                    ? isAr ? "مبتدئ" : "Beginner"
                    : exerciseDetail.difficulty === "intermediate"
                    ? isAr ? "متوسط" : "Intermediate"
                    : isAr ? "متقدم" : "Advanced"}
                </Text>
              </View>
            )}
          </View>

          {/* Muscle chips */}
          {primaryMuscles.length > 0 && (
            <View style={styles.muscles}>
              {primaryMuscles.map((name) => (
                <View key={name} style={styles.muscleChip}>
                  <Text style={styles.muscleText}>{name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Target info */}
          <View style={styles.targetRow}>
            <Text style={styles.targetText}>
              {isAr
                ? `${exercise?.targetReps} تكرار · ${exercise?.targetRestSeconds}ث راحة`
                : `${exercise?.targetReps} reps · ${exercise?.targetRestSeconds}s rest`}
            </Text>
          </View>

          {/* Rest timer or input block */}
          {phase === "resting" && restSecondsLeft !== null ? (
            <RestTimer seconds={restSecondsLeft} onSkip={skipRest} language={language} />
          ) : (
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>
                {currentSetNumber <= targetSets
                  ? isAr ? `الجولة ${currentSetNumber}` : `Set ${currentSetNumber}`
                  : isAr ? "إضافة جولة" : "Add Set"}
              </Text>

              <View style={styles.inputRow}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder={isAr ? "تكرار" : "Reps"}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="number-pad"
                    value={repsInput}
                    onChangeText={setRepsInput}
                    returnKeyType="next"
                    textAlign="center"
                  />
                  <Text style={styles.inputUnit}>{isAr ? "تكرار" : "reps"}</Text>
                </View>

                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder={isAr ? "وزن" : "Weight"}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="decimal-pad"
                    value={weightInput}
                    onChangeText={setWeightInput}
                    returnKeyType="done"
                    textAlign="center"
                  />
                  <Text style={styles.inputUnit}>{isAr ? "كجم" : "kg"}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.finishSetBtn,
                  !repsInput && styles.finishSetBtnDisabled,
                ]}
                onPress={handleFinishSet}
                disabled={!repsInput}
                activeOpacity={0.8}
              >
                <Text style={styles.finishSetText}>
                  {isAr ? "إنهاء الجولة" : "Finish Set"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add Set button (visible during rest — skip rest and start next set) */}
          {phase === "resting" && (
            <TouchableOpacity
              style={styles.addSetBtn}
              onPress={skipRest}
              activeOpacity={0.8}
            >
              <Text style={styles.addSetText}>
                {isAr ? "+ إضافة جولة" : "+ Add Set"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Completed sets */}
          {completedSets.length > 0 && (
            <View style={styles.setsSection}>
              <Text style={styles.setsSectionTitle}>
                {isAr ? "الجولات المكتملة" : "Completed Sets"}
              </Text>
              {completedSets.map((s) => (
                <WorkoutSetRow
                  key={s.id}
                  setNumber={s.setNumber}
                  reps={s.reps}
                  weight={s.weight}
                  language={language}
                />
              ))}
            </View>
          )}

          {/* Finish workout */}
          <TouchableOpacity
            style={styles.finishWorkoutBtn}
            onPress={handleFinishWorkout}
            activeOpacity={0.8}
          >
            <CheckCircle2 size={18} color="rgba(255,255,255,0.7)" strokeWidth={2} />
            <Text style={styles.finishWorkoutText}>
              {isAr ? "إنهاء التمرين" : "Finish Workout"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#08080F",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    textAlign: "center",
  },
  backBtn: {
    backgroundColor: "rgba(226,212,255,0.12)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: "#E2D4FF",
    fontSize: 14,
    fontWeight: "600",
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  setCounter: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(226,212,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 0,
  },
  exHeader: {
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  exName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "right",
  },
  diffBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  diffText: {
    fontSize: 12,
    fontWeight: "600",
  },
  muscles: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
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
  targetRow: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  targetText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
  inputBlock: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  inputLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  inputWrap: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  inputUnit: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
  finishSetBtn: {
    backgroundColor: "#E2D4FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  finishSetBtnDisabled: {
    opacity: 0.4,
  },
  finishSetText: {
    color: "#08080F",
    fontSize: 16,
    fontWeight: "700",
  },
  setsSection: {
    marginBottom: 24,
    gap: 4,
  },
  setsSectionTitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    textAlign: "right",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  addSetBtn: {
    backgroundColor: "rgba(226,212,255,0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(226,212,255,0.2)",
    marginBottom: 16,
  },
  addSetText: {
    color: "#E2D4FF",
    fontSize: 15,
    fontWeight: "600",
  },
  finishWorkoutBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginTop: 8,
  },
  finishWorkoutText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontWeight: "600",
  },
  // Done screen
  doneContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  doneIcon: {
    marginBottom: 8,
  },
  doneTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  doneSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    marginBottom: 12,
  },
  doneSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 0,
    width: "100%",
    marginBottom: 8,
  },
  doneStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  doneStatValue: {
    color: "#E2D4FF",
    fontSize: 26,
    fontWeight: "700",
  },
  doneStatLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  doneDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  doneBtn: {
    backgroundColor: "#E2D4FF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  doneBtnText: {
    color: "#08080F",
    fontSize: 16,
    fontWeight: "700",
  },
});
