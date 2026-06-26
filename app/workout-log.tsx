import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useLanguage } from "@/src/context/LanguageContext";
import { getCycleDay, getCurrentPhase } from "@/src/engine/cycleEngine";
import { getLastPeriod } from "@/src/storage/cycleStorage";
import {
  createWorkoutSession,
  completeWorkoutSession,
  abandonWorkoutSession,
} from "@/src/services/workouts/workoutService";
import {
  saveWorkoutSession,
  saveActiveSession,
  loadActiveSession,
} from "@/src/services/workouts/workoutStorage";
import { checkAndUpdatePR } from "@/src/services/pr";
import { getExerciseLastSession, getExercisePreviousSessions } from "@/src/services/workouts/exerciseHistory";
import { suggestOverload } from "@/src/services/workouts/progressiveOverload";
import {
  EXERCISE_DATABASE,
  searchExercises,
  addToExerciseHistory,
  type ExerciseCategory,
} from "@/src/services/exercise-library";
import { getWorkoutStats } from "@/src/services/workouts/statsService";
import { checkAndUnlockAchievements } from "@/src/services/achievements";
import type { WorkoutSession, LoggedExercise, LoggedSet } from "@/src/services/workouts/types";
import type { ExerciseLastSession } from "@/src/services/workouts/exerciseHistory";
import type { OverloadSuggestion } from "@/src/services/workouts/progressiveOverload";
import type { Achievement } from "@/src/services/achievements";

// ── helpers ────────────────────────────────────────────────────────────────────

function makeSet(n: number): LoggedSet {
  return {
    setNumber: n,
    reps: null,
    weightKg: null,
    durationSec: null,
    rpe: null,
    completed: false,
    restTimeSec: null,
    notes: "",
  };
}

function fmtElapsed(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function fmtRest(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const RPE_COLORS = ["#666","#777","#888","#9CA3AF","#F59E0B","#F59E0B","#FB923C","#FB923C","#EF4444","#DC2626"];

const CATEGORY_CHIPS: Array<{ key: ExerciseCategory | "all"; labelEn: string; labelAr: string }> = [
  { key: "all",       labelEn: "All",       labelAr: "الكل" },
  { key: "glutes",    labelEn: "Glutes",    labelAr: "ألية" },
  { key: "legs",      labelEn: "Legs",      labelAr: "ساقين" },
  { key: "chest",     labelEn: "Chest",     labelAr: "صدر" },
  { key: "back",      labelEn: "Back",      labelAr: "ظهر" },
  { key: "shoulders", labelEn: "Shoulders", labelAr: "كتف" },
  { key: "arms",      labelEn: "Arms",      labelAr: "ذراعين" },
  { key: "core",      labelEn: "Core",      labelAr: "جوهر" },
  { key: "mobility",   labelEn: "Mobility",   labelAr: "مرونة" },
  { key: "stretching", labelEn: "Stretching", labelAr: "تمدد" },
  { key: "cardio",     labelEn: "Cardio",     labelAr: "كارديو" },
  { key: "recovery",   labelEn: "Recovery",   labelAr: "تعافٍ" },
];

// ── Swipeable set row ──────────────────────────────────────────────────────────

function SwipeableSetRow({
  completed,
  onComplete,
  children,
}: {
  completed: boolean;
  onComplete: () => void;
  children: React.ReactNode;
}) {
  const tx = useRef(new Animated.Value(0)).current;
  const bgOp = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dx > 12 && Math.abs(gs.dy) < Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        const x = Math.max(0, Math.min(gs.dx, 110));
        tx.setValue(x);
        bgOp.setValue(x / 80);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx >= 75) {
          Animated.timing(tx, { toValue: 0, duration: 180, useNativeDriver: true }).start();
          Animated.timing(bgOp, { toValue: 0, duration: 180, useNativeDriver: true }).start();
          onComplete();
        } else {
          Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start();
          Animated.timing(bgOp, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ position: "relative", marginBottom: 8 }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 14,
            backgroundColor: "#22C55E",
            opacity: bgOp,
            justifyContent: "center",
            paddingLeft: 18,
          },
        ]}
        pointerEvents="none"
      >
        <Text style={{ color: "#000", fontSize: 18, fontWeight: "900" }}>✓</Text>
      </Animated.View>
      <Animated.View
        {...pan.panHandlers}
        style={[
          completed && { opacity: 0.55 },
          { transform: [{ translateX: tx }] },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

// ── Rest timer ring ────────────────────────────────────────────────────────────

function RestRing({ remaining, total, color }: { remaining: number; total: number; color: string }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? Math.max(0, remaining / total) : 0;
  const offset = circ * (1 - progress);
  return (
    <Svg width={108} height={108}>
      <Circle cx={54} cy={54} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={6} fill="none" />
      <Circle
        cx={54}
        cy={54}
        r={r}
        stroke={color}
        strokeWidth={6}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 54 54)"
      />
    </Svg>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

interface RestTimerState {
  active: boolean;
  remaining: number;
  total: number;
}

export default function WorkoutLogScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [cycleDay, setCycleDay] = useState<number | null>(null);
  const [cyclePhase, setCyclePhase] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Per-exercise history & suggestions
  const [histories, setHistories] = useState<Record<string, ExerciseLastSession | null>>({});
  const [suggestions, setSuggestions] = useState<Record<string, OverloadSuggestion | null>>({});

  // Rest timer
  const [restTimer, setRestTimer] = useState<RestTimerState>({ active: false, remaining: 90, total: 90 });
  const [restDuration, setRestDuration] = useState(90);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Exercise picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerCategory, setPickerCategory] = useState<ExerciseCategory | "all">("all");

  // Timer intervals
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── init ──────────────────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function init() {
        const [lastPeriod, active] = await Promise.all([getLastPeriod(), loadActiveSession()]);
        if (cancelled) return;

        const day = lastPeriod ? getCycleDay(lastPeriod) : null;
        const phase = day ? getCurrentPhase(day).key : null;
        setCycleDay(day);
        setCyclePhase(phase);

        if (active?.status === "in_progress") {
          setSession(active);
          const elapsed = Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000);
          setElapsed(elapsed);
          loadHistoriesForSession(active, phase);
        } else {
          const s = createWorkoutSession(day, phase);
          setSession(s);
          setElapsed(0);
        }
      }
      init();

      sessionTimerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);

      return () => {
        cancelled = true;
        if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        stopRestTimer();
      };
    }, [])
  );

  async function loadHistoriesForSession(s: WorkoutSession, phase: string | null) {
    const ids = s.exercises.map((e) => e.exerciseId);
    const entries = await Promise.all(ids.map((id) => getExerciseLastSession(id)));
    const hMap: Record<string, ExerciseLastSession | null> = {};
    const sMap: Record<string, OverloadSuggestion | null> = {};
    ids.forEach((id, i) => {
      hMap[id] = entries[i];
      sMap[id] = suggestOverload(entries[i], phase);
    });
    setHistories(hMap);
    setSuggestions(sMap);
  }

  async function loadHistoryForExercise(exerciseId: string) {
    const hist = await getExerciseLastSession(exerciseId);
    const sug = suggestOverload(hist, cyclePhase);
    setHistories((prev) => ({ ...prev, [exerciseId]: hist }));
    setSuggestions((prev) => ({ ...prev, [exerciseId]: sug }));
  }

  // ── rest timer ────────────────────────────────────────────────────────────────
  function startRestTimer(duration?: number) {
    const dur = duration ?? restDuration;
    stopRestTimer();
    setRestTimer({ active: true, remaining: dur, total: dur });
    restRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (prev.remaining <= 1) {
          stopRestTimer();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return { ...prev, remaining: 0, active: false };
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
  }

  function stopRestTimer() {
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
  }

  function skipRestTimer() {
    stopRestTimer();
    setRestTimer((prev) => ({ ...prev, active: false }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function addRestTime(seconds: number) {
    stopRestTimer();
    setRestTimer((prev) => {
      const newRem = prev.remaining + seconds;
      const newTotal = prev.total + seconds;
      // restart interval
      restRef.current = setInterval(() => {
        setRestTimer((p) => {
          if (p.remaining <= 1) {
            stopRestTimer();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { ...p, remaining: 0, active: false };
          }
          return { ...p, remaining: p.remaining - 1 };
        });
      }, 1000);
      return { active: true, remaining: newRem, total: newTotal };
    });
  }

  // ── session mutations ─────────────────────────────────────────────────────────
  function updateSession(updated: WorkoutSession) {
    setSession(updated);
    saveActiveSession(updated);
  }

  function addExerciseFromLibrary(
    exerciseId: string,
    nameEn: string,
    nameAr: string,
    defaultSets: number,
    defaultReps: number
  ) {
    if (!session) return;
    const sets: LoggedSet[] = Array.from({ length: defaultSets }, (_, i) => makeSet(i + 1));
    const exercise: LoggedExercise = {
      exerciseId,
      exerciseNameEn: nameEn,
      exerciseNameAr: nameAr,
      sets,
      notes: "",
      orderIndex: session.exercises.length,
    };
    const updated: WorkoutSession = {
      ...session,
      exercises: [...session.exercises, exercise],
    };
    updateSession(updated);
    loadHistoryForExercise(exerciseId);
    addToExerciseHistory(exerciseId);
    setShowPicker(false);
    setPickerQuery("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function addSet(exIdx: number) {
    if (!session) return;
    const ex = session.exercises[exIdx];
    const updated: WorkoutSession = {
      ...session,
      exercises: session.exercises.map((e, i) =>
        i === exIdx ? { ...e, sets: [...e.sets, makeSet(e.sets.length + 1)] } : e
      ),
    };
    updateSession(updated);
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof LoggedSet, value: any) {
    if (!session) return;
    const updated: WorkoutSession = {
      ...session,
      exercises: session.exercises.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, si) => (si !== setIdx ? s : { ...s, [field]: value })),
            }
      ),
    };
    updateSession(updated);
  }

  function completeSet(exIdx: number, setIdx: number) {
    if (!session) return;
    const ex = session.exercises[exIdx];
    const set = ex.sets[setIdx];
    const nowDone = !set.completed;
    updateSet(exIdx, setIdx, "completed", nowDone);

    if (nowDone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startRestTimer();
      if (set.reps && set.weightKg) {
        checkAndUpdatePR(
          ex.exerciseId,
          ex.exerciseNameEn,
          ex.exerciseNameAr,
          set.weightKg,
          set.reps,
          session.id
        );
      }
    }
  }

  function updateExerciseNotes(exIdx: number, notes: string) {
    if (!session) return;
    const updated: WorkoutSession = {
      ...session,
      exercises: session.exercises.map((ex, i) => (i !== exIdx ? ex : { ...ex, notes })),
    };
    updateSession(updated);
  }

  // ── finish ────────────────────────────────────────────────────────────────────
  async function finish(energyLevel: number | null = null, notes = "") {
    if (!session) return;
    setSaving(true);
    stopRestTimer();
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);

    const completed = await completeWorkoutSession(session, energyLevel, null, notes);

    // Check achievements
    try {
      const stats = await getWorkoutStats();
      const newAch = await checkAndUnlockAchievements(stats);
      if (newAch.length > 0) {
        setNewAchievements(newAch);
      }
    } catch {}

    setSaving(false);
    setShowComplete(false);
    router.back();
  }

  function cancelWorkout() {
    Alert.alert(
      isAr ? "إنهاء التمرين" : "End Workout",
      isAr ? "ماذا تريدين؟" : "What would you like to do?",
      [
        {
          text: isAr ? "حفظ وإنهاء" : "Save & Finish",
          onPress: () => setShowComplete(true),
        },
        {
          text: isAr ? "تجاهل" : "Discard",
          style: "destructive",
          onPress: async () => {
            if (session) await abandonWorkoutSession(session);
            router.back();
          },
        },
        { text: isAr ? "متابعة" : "Keep Going", style: "cancel" },
      ]
    );
  }

  // ── picker data ───────────────────────────────────────────────────────────────
  const pickerData = useMemo(() => {
    if (pickerQuery.trim().length > 0) return searchExercises(pickerQuery).slice(0, 20);
    if (pickerCategory === "all") return EXERCISE_DATABASE.slice(0, 30);
    return EXERCISE_DATABASE.filter((e) => e.category === pickerCategory).slice(0, 30);
  }, [pickerQuery, pickerCategory]);

  // ── rest timer color ──────────────────────────────────────────────────────────
  const restColor = useMemo(() => {
    if (!restTimer.active) return "#22C55E";
    const ratio = restTimer.total > 0 ? restTimer.remaining / restTimer.total : 0;
    if (ratio > 0.5) return "#22C55E";
    if (ratio > 0.25) return "#F59E0B";
    return "#EF4444";
  }, [restTimer]);

  if (!session) return null;

  const completedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <LinearGradient colors={["#05050A", "#121225"]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* ── Header ───────────────────────────────────────────────────── */}
          <View style={[s.header, isAr && { flexDirection: "row-reverse" }]}>
            <TouchableOpacity onPress={cancelWorkout} style={s.headerBtn}>
              <Text style={s.headerBtnTxt}>✕</Text>
            </TouchableOpacity>

            <View style={s.headerCenter}>
              <Text style={s.timerTxt}>{fmtElapsed(elapsed)}</Text>
              <Text style={s.headerSub}>
                {completedSets} {isAr ? "مجموعة مكتملة" : "sets done"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowComplete(true)}
              style={s.finishBtn}
              disabled={saving}
            >
              <Text style={s.finishBtnTxt}>{isAr ? "انتهاء" : "Finish"}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Main scroll ───────────────────────────────────────────────── */}
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Exercise blocks */}
            {session.exercises.map((ex, exIdx) => {
              const hist = histories[ex.exerciseId];
              const sug = suggestions[ex.exerciseId];
              return (
                <View key={`${ex.exerciseId}_${exIdx}`} style={s.exBlock}>
                  {/* Exercise name */}
                  <Text style={[s.exTitle, isAr && { textAlign: "right" }]}>
                    {isAr ? ex.exerciseNameAr : ex.exerciseNameEn}
                  </Text>

                  {/* AI hint row */}
                  {(hist || sug) && (
                    <View style={[s.hintRow, isAr && { flexDirection: "row-reverse" }]}>
                      {hist && (
                        <View style={s.hintPill}>
                          <Text style={s.hintTxt}>
                            {isAr ? hist.bestSet.rpe !== null ? `${hist.bestSet.weightKg}كغ × ${hist.bestSet.reps}` : `السابق: ${hist.bestSet.weightKg}كغ × ${hist.bestSet.reps}` : `Last: ${hist.bestSet.weightKg}kg × ${hist.bestSet.reps}`}
                          </Text>
                        </View>
                      )}
                      {sug && (
                        <View style={[s.sugPill, {
                          backgroundColor:
                            sug.type === "increase_weight" ? "rgba(34,197,94,0.12)"
                            : sug.type === "deload" ? "rgba(239,68,68,0.12)"
                            : "rgba(198,167,255,0.12)",
                        }]}>
                          <Text style={[s.sugTxt, {
                            color:
                              sug.type === "increase_weight" ? "#22C55E"
                              : sug.type === "deload" ? "#EF4444"
                              : "#C6A7FF",
                          }]}>
                            {isAr ? sug.hintAr : sug.hintEn}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Set header */}
                  <View style={[s.setHeader, isAr && { flexDirection: "row-reverse" }]}>
                    {["Set", "kg", "Reps", "RPE", "✓"].map((h, i) => (
                      <Text key={i} style={[s.setHeaderCell, i === 4 && { flex: 0.7, textAlign: "center" }]}>
                        {isAr && h === "Set" ? "مج" : isAr && h === "Reps" ? "تك" : h}
                      </Text>
                    ))}
                  </View>

                  {/* Set rows */}
                  {ex.sets.map((set, setIdx) => (
                    <SwipeableSetRow
                      key={setIdx}
                      completed={set.completed}
                      onComplete={() => completeSet(exIdx, setIdx)}
                    >
                      <View
                        style={[
                          s.setRow,
                          set.completed && s.setRowDone,
                          isAr && { flexDirection: "row-reverse" },
                        ]}
                      >
                        <Text style={s.setNum}>{set.setNumber}</Text>
                        <TextInput
                          style={s.setInput}
                          value={set.weightKg !== null ? String(set.weightKg) : ""}
                          onChangeText={(v) =>
                            updateSet(exIdx, setIdx, "weightKg", v ? parseFloat(v) : null)
                          }
                          keyboardType="decimal-pad"
                          placeholder={hist ? String(hist.bestSet.weightKg) : "—"}
                          placeholderTextColor="rgba(255,255,255,0.18)"
                          editable={!set.completed}
                        />
                        <TextInput
                          style={s.setInput}
                          value={set.reps !== null ? String(set.reps) : ""}
                          onChangeText={(v) =>
                            updateSet(exIdx, setIdx, "reps", v ? parseInt(v) : null)
                          }
                          keyboardType="number-pad"
                          placeholder={hist ? String(hist.bestSet.reps) : "—"}
                          placeholderTextColor="rgba(255,255,255,0.18)"
                          editable={!set.completed}
                        />
                        <TextInput
                          style={[
                            s.setInput,
                            set.rpe !== null && {
                              color: RPE_COLORS[Math.max(0, Math.min(9, (set.rpe ?? 5) - 1))],
                              fontWeight: "800",
                            },
                          ]}
                          value={set.rpe !== null ? String(set.rpe) : ""}
                          onChangeText={(v) => {
                            const n = v ? parseInt(v) : null;
                            updateSet(exIdx, setIdx, "rpe", n && n >= 1 && n <= 10 ? n : null);
                          }}
                          keyboardType="number-pad"
                          placeholder="—"
                          placeholderTextColor="rgba(255,255,255,0.18)"
                          maxLength={2}
                          editable={!set.completed}
                        />
                        <TouchableOpacity
                          style={[s.checkBtn, set.completed && s.checkBtnDone]}
                          onPress={() => completeSet(exIdx, setIdx)}
                        >
                          <Text style={[s.checkBtnTxt, set.completed && { color: "#000" }]}>✓</Text>
                        </TouchableOpacity>
                      </View>
                    </SwipeableSetRow>
                  ))}

                  {/* Notes */}
                  <TextInput
                    style={[s.notesInput, isAr && { textAlign: "right" }]}
                    value={ex.notes}
                    onChangeText={(v) => updateExerciseNotes(exIdx, v)}
                    placeholder={isAr ? "ملاحظات (اختياري)..." : "Notes (optional)..."}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    multiline
                  />

                  {/* Add set */}
                  <TouchableOpacity style={s.addSetBtn} onPress={() => addSet(exIdx)}>
                    <Text style={s.addSetTxt}>
                      {isAr ? "+ مجموعة" : "+ Add Set"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Add Exercise */}
            <TouchableOpacity
              style={s.addExBtn}
              onPress={() => { setShowPicker(true); setPickerQuery(""); setPickerCategory("all"); }}
            >
              <Text style={s.addExBtnTxt}>
                {isAr ? "＋ إضافة تمرين" : "＋ Add Exercise"}
              </Text>
            </TouchableOpacity>

            {session.exercises.length === 0 && (
              <View style={s.emptyHint}>
                <Text style={s.emptyHintEmoji}>💪</Text>
                <Text style={s.emptyHintTxt}>
                  {isAr ? "أضيفي تمريناً للبدء" : "Add an exercise to start"}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* ── Rest timer overlay ────────────────────────────────────────── */}
          {restTimer.active && (
            <View style={s.restOverlay} pointerEvents="box-none">
              <View style={s.restCard}>
                <View style={s.restRingWrap}>
                  <RestRing remaining={restTimer.remaining} total={restTimer.total} color={restColor} />
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <Text style={[s.restTime, { color: restColor }]}>
                        {fmtRest(restTimer.remaining)}
                      </Text>
                      <Text style={s.restLabel}>
                        {isAr ? "استراحة" : "Rest"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[s.restBtns, isAr && { flexDirection: "row-reverse" }]}>
                  <TouchableOpacity style={s.restBtn} onPress={() => addRestTime(-15)}>
                    <Text style={s.restBtnTxt}>−15s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.restBtn, s.restBtnSkip]} onPress={skipRestTimer}>
                    <Text style={[s.restBtnTxt, { color: "#000" }]}>
                      {isAr ? "تخطي" : "Skip"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.restBtn} onPress={() => addRestTime(30)}>
                    <Text style={s.restBtnTxt}>+30s</Text>
                  </TouchableOpacity>
                </View>
                {/* Duration presets */}
                <View style={[s.restPresets, isAr && { flexDirection: "row-reverse" }]}>
                  {[60, 90, 120, 180].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[s.presetBtn, restDuration === d && s.presetBtnActive]}
                      onPress={() => {
                        setRestDuration(d);
                        startRestTimer(d);
                      }}
                    >
                      <Text style={[s.presetTxt, restDuration === d && { color: "#000" }]}>
                        {d < 60 ? `${d}s` : `${d / 60}m`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ── Exercise picker overlay ───────────────────────────────────── */}
          {showPicker && (
            <View style={s.pickerOverlay}>
              <View style={s.pickerSheet}>
                <View style={[s.pickerHeader, isAr && { flexDirection: "row-reverse" }]}>
                  <Text style={s.pickerTitle}>
                    {isAr ? "اختاري تمريناً" : "Choose Exercise"}
                  </Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={s.pickerClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[s.pickerSearch, isAr && { textAlign: "right" }]}
                  value={pickerQuery}
                  onChangeText={setPickerQuery}
                  placeholder={isAr ? "ابحثي..." : "Search..."}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoFocus
                />

                <FlatList
                  horizontal
                  data={CATEGORY_CHIPS}
                  keyExtractor={(c) => c.key}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.pickerChips}
                  style={{ maxHeight: 44, marginBottom: 10 }}
                  renderItem={({ item: cat }) => {
                    const active = pickerCategory === cat.key;
                    return (
                      <TouchableOpacity
                        onPress={() => { setPickerCategory(cat.key); setPickerQuery(""); }}
                        style={[s.pickerChip, active && s.pickerChipActive]}
                      >
                        <Text style={[s.pickerChipTxt, active && { color: "#C6A7FF" }]}>
                          {isAr ? cat.labelAr : cat.labelEn}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />

                <FlatList
                  data={pickerData}
                  keyExtractor={(e) => e.id}
                  style={{ maxHeight: 280 }}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item: ex }) => (
                    <TouchableOpacity
                      style={[s.pickerRow, isAr && { flexDirection: "row-reverse" }]}
                      onPress={() =>
                        addExerciseFromLibrary(
                          ex.id,
                          ex.nameEn,
                          ex.nameAr,
                          ex.defaultSets,
                          ex.defaultReps
                        )
                      }
                    >
                      <Text style={s.pickerEmoji}>{ex.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.pickerExName, isAr && { textAlign: "right" }]}>
                          {isAr ? ex.nameAr : ex.nameEn}
                        </Text>
                        <Text style={[s.pickerExMeta, isAr && { textAlign: "right" }]}>
                          {ex.primaryMuscles.join(", ")} · {ex.defaultSets}×{ex.defaultReps}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          )}

          {/* ── Finish / summary overlay ──────────────────────────────────── */}
          {showComplete && (
            <View style={s.summaryOverlay}>
              <View style={s.summaryCard}>
                <Text style={s.summaryTitle}>
                  {isAr ? "أتقنتِ هذا التمرين! 💪" : "Crushed it! 💪"}
                </Text>
                <View style={[s.summaryStats, isAr && { flexDirection: "row-reverse" }]}>
                  <View style={s.summaryStat}>
                    <Text style={s.summaryStatVal}>{fmtElapsed(elapsed)}</Text>
                    <Text style={s.summaryStatLabel}>{isAr ? "مدة" : "Duration"}</Text>
                  </View>
                  <View style={s.summaryStat}>
                    <Text style={s.summaryStatVal}>{session.exercises.length}</Text>
                    <Text style={s.summaryStatLabel}>{isAr ? "تمرين" : "Exercises"}</Text>
                  </View>
                  <View style={s.summaryStat}>
                    <Text style={s.summaryStatVal}>{completedSets}</Text>
                    <Text style={s.summaryStatLabel}>{isAr ? "مجموعات" : "Sets"}</Text>
                  </View>
                </View>

                {/* Energy rating */}
                <Text style={[s.summaryLabel, isAr && { textAlign: "right" }]}>
                  {isAr ? "كيف شعرتِ؟" : "How do you feel?"}
                </Text>
                <View style={[s.energyRow, isAr && { flexDirection: "row-reverse" }]}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity key={n} onPress={() => finish(n)}>
                      <Text style={s.energyStar}>{"⭐"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={s.saveBtn} onPress={() => finish(null)}>
                  <Text style={s.saveBtnTxt}>
                    {isAr ? "حفظ التمرين" : "Save Workout"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowComplete(false)} style={s.keepGoingBtn}>
                  <Text style={s.keepGoingTxt}>{isAr ? "متابعة التمرين" : "Keep Going"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── New achievement toast ─────────────────────────────────────── */}
          {newAchievements.length > 0 && (
            <View style={s.achToast}>
              <Text style={s.achToastEmoji}>{newAchievements[0].icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.achToastTitle}>
                  {isAr ? "إنجاز جديد!" : "Achievement Unlocked!"}
                </Text>
                <Text style={s.achToastName}>
                  {isAr ? newAchievements[0].nameAr : newAchievements[0].nameEn}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setNewAchievements([])}>
                <Text style={s.achToastClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  headerCenter: { alignItems: "center" },
  timerTxt: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", letterSpacing: 1 },
  headerSub: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", marginTop: 1 },
  finishBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: "#22C55E" },
  finishBtnTxt: { color: "#000", fontSize: 14, fontWeight: "900" },

  scroll: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 160 },

  exBlock: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  exTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900", marginBottom: 10 },

  hintRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  hintPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  hintTxt: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700" },
  sugPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flex: 1,
  },
  sugTxt: { fontSize: 12, fontWeight: "700" },

  setHeader: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  setHeaderCell: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },

  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 14,
  },
  setRowDone: { backgroundColor: "rgba(34,197,94,0.06)" },
  setNum: { color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: "700", flex: 1, textAlign: "center" },
  setInput: {
    flex: 1,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 11,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  checkBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.7,
  },
  checkBtnDone: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  checkBtnTxt: { color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: "900" },

  notesInput: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    minHeight: 36,
  },
  addSetBtn: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderStyle: "dashed",
  },
  addSetTxt: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700" },

  addExBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(198,167,255,0.35)",
    borderStyle: "dashed",
    alignItems: "center",
    marginBottom: 14,
  },
  addExBtnTxt: { color: "#C6A7FF", fontSize: 16, fontWeight: "800" },

  emptyHint: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyHintEmoji: { fontSize: 40 },
  emptyHintTxt: { color: "rgba(255,255,255,0.35)", fontSize: 16, fontWeight: "700" },

  // Rest timer
  restOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  restCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
  },
  restRingWrap: { width: 108, height: 108, marginBottom: 16 },
  restTime: { fontSize: 28, fontWeight: "900" },
  restLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700" },
  restBtns: { flexDirection: "row", gap: 12, marginBottom: 14 },
  restBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  restBtnSkip: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  restBtnTxt: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  restPresets: { flexDirection: "row", gap: 8 },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  presetBtnActive: { backgroundColor: "#C6A7FF", borderColor: "#C6A7FF" },
  presetTxt: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700" },

  // Exercise picker
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#0E0E1A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "75%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  pickerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  pickerClose: { color: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: "700" },
  pickerSearch: {
    height: 44,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    color: "#FFFFFF",
    fontSize: 15,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 10,
  },
  pickerChips: { paddingRight: 12, gap: 8 },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  pickerChipActive: { borderColor: "#C6A7FF40", backgroundColor: "#C6A7FF15" },
  pickerChipTxt: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700" },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  pickerEmoji: { fontSize: 22, width: 34, textAlign: "center" },
  pickerExName: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  pickerExMeta: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600", marginTop: 2 },

  // Finish / summary
  summaryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.80)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  summaryCard: {
    backgroundColor: "#0E0E1A",
    borderRadius: 28,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 16,
  },
  summaryTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", textAlign: "center" },
  summaryStats: { flexDirection: "row", justifyContent: "space-around" },
  summaryStat: { alignItems: "center", gap: 4 },
  summaryStatVal: { color: "#C6A7FF", fontSize: 24, fontWeight: "900" },
  summaryStatLabel: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "700" },
  summaryLabel: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: "700" },
  energyRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  energyStar: { fontSize: 32 },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: "#22C55E",
    alignItems: "center",
  },
  saveBtnTxt: { color: "#000", fontSize: 16, fontWeight: "900" },
  keepGoingBtn: { alignItems: "center" },
  keepGoingTxt: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "700" },

  // Achievement toast
  achToast: {
    position: "absolute",
    bottom: 120,
    left: 18,
    right: 18,
    backgroundColor: "#1A1A2E",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.3)",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  achToastEmoji: { fontSize: 28 },
  achToastTitle: { color: "#C6A7FF", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  achToastName: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginTop: 2 },
  achToastClose: { color: "rgba(255,255,255,0.4)", fontSize: 16, fontWeight: "700" },
});
