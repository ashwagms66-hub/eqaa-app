import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSubscription } from "@/src/hooks/useSubscription";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCurrentPhase, getCycleDay, getPhaseTheme } from "@/src/engine/cycleEngine";
import { getLastPeriod } from "@/src/storage/cycleStorage";
import { useLanguage } from "@/src/context/LanguageContext";
import { getLifeMode } from "@/src/storage/profileStorage";
import { calculateReadiness } from "@/src/services/coach";
import { generateWeeklyPlan, getTodaysPlan } from "@/src/services/training";
import { getRecentWorkoutSessions } from "@/src/services/workouts";
import { getAllPRs } from "@/src/services/pr";
import { getFitnessInsights } from "@/src/services/fitness-ai";
import { getWorkoutStats } from "@/src/services/workouts/statsService";
import { getWeeklyMuscleMap } from "@/src/services/workouts/muscleTracker";
import { getAllAchievements } from "@/src/services/achievements";
import type { WorkoutSession } from "@/src/services/workouts/types";
import type { PersonalRecord } from "@/src/services/pr/prService";
import type { FitnessInsight } from "@/src/services/fitness-ai/fitnessInsightsService";
import type { PlannedDay } from "@/src/services/training/weeklyPlanner";
import type { ReadinessOutput } from "@/src/services/coach/readinessService";
import type { WorkoutStats } from "@/src/services/workouts/statsService";
import type { MuscleStatus } from "@/src/services/workouts/muscleTracker";
import type { Achievement } from "@/src/services/achievements";
import {
  getWorkoutSchedule,
  getTodayWorkoutFromSchedule,
  WORKOUT_TYPE_META,
  type WorkoutScheduleDay,
} from "@/src/storage/workoutScheduleStorage";

// ── helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string, language: string): string {
  return new Date(iso).toLocaleDateString(language === "ar" ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ── screen ─────────────────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { isPremium } = useSubscription();

  const [loading, setLoading] = useState(true);
  const [cycleDay, setCycleDay] = useState(12);
  const [readiness, setReadiness] = useState<ReadinessOutput | null>(null);
  const [todayPlan, setTodayPlan] = useState<PlannedDay | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [insights, setInsights] = useState<FitnessInsight[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [muscles, setMuscles] = useState<MuscleStatus[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [scheduledToday, setScheduledToday] = useState<WorkoutScheduleDay | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        setLoading(true);
        const [lastPeriod, savedMode] = await Promise.all([getLastPeriod(), getLifeMode()]);
        if (cancelled) return;

        const day = lastPeriod ? getCycleDay(lastPeriod) : 12;
        setCycleDay(day);

        const phase = getCurrentPhase(day);
        const r = calculateReadiness({
          cycleDay: day,
          cyclePhase: phase.key,
          sleepHours: null,
          hrv: null,
          restingHeartRate: null,
          activeCaloriesYesterday: null,
          symptoms: [],
          energyLevel: null,
          daysSinceLastWorkout: null,
        });

        const weekPlan = generateWeeklyPlan(phase.key);
        const today = getTodaysPlan(weekPlan);

        const [recent, allPRs, aiInsights, workoutStats, muscleMap, allAch, savedSchedule] = await Promise.all([
          getRecentWorkoutSessions(3),
          getAllPRs(),
          getFitnessInsights(),
          getWorkoutStats(),
          getWeeklyMuscleMap(),
          getAllAchievements(),
          getWorkoutSchedule(),
        ]);

        if (!cancelled) {
          setReadiness(r);
          setTodayPlan(today);
          setRecentSessions(recent);
          setPrs(allPRs.slice(0, 4));
          setInsights(aiInsights.slice(0, 2));
          setStats(workoutStats);
          setMuscles(muscleMap);
          setRecentAchievements(allAch.filter((a) => a.unlockedAt !== null).slice(-3).reverse());
          setScheduledToday(savedSchedule ? getTodayWorkoutFromSchedule(savedSchedule) : null);
          setLoading(false);
        }
      }
      load();
      return () => { cancelled = true; };
    }, [])
  );

  const phase = useMemo(() => getCurrentPhase(cycleDay), [cycleDay]);
  const theme = useMemo(() => getPhaseTheme(cycleDay), [cycleDay]);

  function handleStartScheduledWorkout() {
    if (!isPremium) {
      router.push("/paywall" as any);
      return;
    }
    if (!scheduledToday || scheduledToday.type === "rest") {
      Alert.alert(
        isAr ? "يوم راحة" : "Rest Day",
        isAr
          ? "اليوم يوم راحة. خذي وقتك للاستشفاء 🌿"
          : "Today is a rest day. Give your body time to recover 🌿",
        [{ text: isAr ? "حسناً" : "OK" }]
      );
      return;
    }
    router.push({
      pathname: "/exercise-library",
      params: {
        scheduleType: scheduledToday.type,
        customLabel: scheduledToday.customLabel ?? "",
      },
    } as any);
  }

  return (
    <LinearGradient colors={["#05050A", "#121225", `${theme.glow}22`]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Page header */}
          <Text style={s.pageLabel}>{isAr ? "الرياضة" : "Fitness"}</Text>
          <Text style={s.pageTitle}>{isAr ? "تدريبك اليوم" : "Your Training"}</Text>

          {loading ? (
            <ActivityIndicator color="#C6A7FF" style={{ marginTop: 60 }} />
          ) : (
            <>
              {/* ── Readiness score ─────────────────────────────────────── */}
              {readiness && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[s.readinessCard, { borderColor: `${readiness.color}40` }]}
                  onPress={() => router.push("/insights" as any)}
                >
                  <LinearGradient
                    colors={[`${readiness.color}18`, "rgba(0,0,0,0)"]}
                    style={s.readinessGrad}
                  >
                    <View style={[s.readinessRow, isAr && { flexDirection: "row-reverse" }]}>
                      <View style={[s.readinessOrb, { borderColor: readiness.color }]}>
                        <Text style={[s.readinessScore, { color: readiness.color }]}>
                          {readiness.score}
                        </Text>
                        <Text style={s.readinessOf}>/100</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.readinessLabel, { color: readiness.color }]}>
                          {isAr ? readiness.labelAr : readiness.label}
                        </Text>
                        <Text style={[s.readinessFocus, isAr && { textAlign: "right" }]}>
                          {isAr ? readiness.recommendedFocusAr : readiness.recommendedFocus}
                        </Text>
                        {readiness.reasons.length > 0 && (
                          <Text style={[s.readinessReason, isAr && { textAlign: "right" }]}>
                            {isAr ? readiness.reasonsAr[0] : readiness.reasons[0]}
                          </Text>
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* ── Workout Schedule Card ────────────────────────────────── */}
              {scheduledToday ? (() => {
                const meta = WORKOUT_TYPE_META[scheduledToday.type];
                const typeLabel = isAr ? meta.labelAr : meta.labelEn;
                const displayLabel =
                  scheduledToday.type === "custom" && scheduledToday.customLabel
                    ? scheduledToday.customLabel
                    : typeLabel;
                const isRest = scheduledToday.type === "rest";
                return (
                  <View style={[s.scheduleCard, { borderColor: `${meta.accent}40` }]}>
                    <LinearGradient
                      colors={[`${meta.accent}14`, "rgba(0,0,0,0)"]}
                      style={s.scheduleGrad}
                    >
                      <View style={[s.scheduleHeader, isAr && { flexDirection: "row-reverse" }]}>
                        <Text style={s.scheduleHeaderLabel}>{isAr ? "جدول التمرين" : "WORKOUT SCHEDULE"}</Text>
                        <TouchableOpacity onPress={() => router.push("/workout-schedule" as any)} activeOpacity={0.8}>
                          <Text style={s.scheduleEditLink}>{isAr ? "تعديل الجدول" : "Edit Schedule"}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={[s.scheduleBody, isAr && { flexDirection: "row-reverse" }]}>
                        <View style={[s.scheduleOrbWrap, { backgroundColor: `${meta.accent}22` }]}>
                          <Text style={s.scheduleEmoji}>{meta.emoji}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.scheduleTodaySmall, isAr && { textAlign: "right" }]}>
                            {isAr ? "تمرين اليوم" : "Today's workout"}
                          </Text>
                          <Text style={[s.scheduleTodayLabel, { color: isRest ? "rgba(255,255,255,0.55)" : meta.accent }, isAr && { textAlign: "right" }]}>
                            {isRest ? (isAr ? "يوم راحة" : "Rest Day") : displayLabel}
                          </Text>
                        </View>
                      </View>
                      {!isRest && (
                        <TouchableOpacity
                          style={[s.scheduleStartBtn, { backgroundColor: meta.accent }]}
                          onPress={handleStartScheduledWorkout}
                          activeOpacity={0.85}
                        >
                          <Text style={s.scheduleStartBtnText}>
                            {isAr ? "ابدئي تمرين اليوم" : "Start Today's Workout"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </LinearGradient>
                  </View>
                );
              })() : (
                <TouchableOpacity
                  style={s.scheduleEmptyCard}
                  onPress={() => isPremium ? router.push("/workout-schedule" as any) : router.push("/paywall" as any)}
                  activeOpacity={0.85}
                >
                  <Text style={s.scheduleEmptyEmoji}>📅</Text>
                  <Text style={[s.scheduleEmptyTitle, isAr && { textAlign: "right" }]}>
                    {isAr ? "جدول التمرين" : "Workout Schedule"}
                  </Text>
                  <Text style={[s.scheduleEmptySub, isAr && { textAlign: "right" }]}>
                    {isAr
                      ? "خططي أسبوعك وكرريه تلقائياً"
                      : "Plan your week and repeat it automatically"}
                  </Text>
                  <View style={s.scheduleEmptyBtn}>
                    <Text style={s.scheduleEmptyBtnText}>{isAr ? "إنشاء الجدول" : "Create Schedule"}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* ── Today's plan ─────────────────────────────────────────── */}
              {todayPlan && (
                <Section title={isAr ? "خطة اليوم" : "Today's Plan"}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[s.todayCard, { borderColor: theme.accent + "44" }]}
                    onPress={() => router.push("/workout-log" as any)}
                  >
                    <LinearGradient
                      colors={[`${theme.accent}18`, "rgba(0,0,0,0)"]}
                      style={s.todayGrad}
                    >
                      <View style={[s.todayRow, isAr && { flexDirection: "row-reverse" }]}>
                        <View style={[s.intensityOrb, { backgroundColor: todayPlan.isRest ? "#44444440" : `${theme.accent}30` }]}>
                          <Text style={s.intensityEmoji}>
                            {todayPlan.isRest ? "😴" : todayPlan.intensity === "high" ? "🔥" : todayPlan.intensity === "moderate" ? "💪" : "🌿"}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.todayFocus, isAr && { textAlign: "right" }]}>
                            {isAr ? todayPlan.focusAr : todayPlan.focusEn}
                          </Text>
                          <Text style={[s.todayMeta, isAr && { textAlign: "right" }]}>
                            {todayPlan.isRest
                              ? (isAr ? "يوم راحة 😴" : "Rest Day 😴")
                              : `${todayPlan.durationMinutes}min · ${todayPlan.exerciseCategories.join(", ")}`}
                          </Text>
                        </View>
                        {!todayPlan.isRest && (
                          <Text style={[s.todayArrow, { color: theme.accent }]}>›</Text>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Section>
              )}

              {/* ── Quick actions ────────────────────────────────────────── */}
              <View style={[s.quickRow, isAr && { flexDirection: "row-reverse" }]}>
                <TouchableOpacity
                  style={[s.quickBtnPrimary, { backgroundColor: theme.accent }]}
                  activeOpacity={0.85}
                  onPress={() => router.push("/workout-log" as any)}
                >
                  <Text style={s.quickEmoji}>🏋️‍♀️</Text>
                  <Text style={s.quickLabelDark}>{isAr ? "سجّلي تمريناً" : "Log Workout"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.quickBtnOutline}
                  activeOpacity={0.85}
                  onPress={() => router.push("/exercise-library" as any)}
                >
                  <Text style={s.quickEmoji}>📚</Text>
                  <Text style={s.quickLabelLight}>{isAr ? "مكتبة التمارين" : "Exercise Library"}</Text>
                </TouchableOpacity>
              </View>
              <View style={[s.quickRow, isAr && { flexDirection: "row-reverse" }]}>
                <TouchableOpacity
                  style={s.quickBtnOutline}
                  activeOpacity={0.85}
                  onPress={() => router.push("/progress-charts" as any)}
                >
                  <Text style={s.quickEmoji}>📈</Text>
                  <Text style={s.quickLabelLight}>{isAr ? "تحليل التقدم" : "Progress Charts"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.quickBtnOutline}
                  activeOpacity={0.85}
                  onPress={() => router.push("/achievements" as any)}
                >
                  <Text style={s.quickEmoji}>🏆</Text>
                  <Text style={s.quickLabelLight}>{isAr ? "الإنجازات" : "Achievements"}</Text>
                </TouchableOpacity>
              </View>
              <View style={[s.quickRow, isAr && { flexDirection: "row-reverse" }]}>
                <TouchableOpacity
                  style={s.quickBtnScanner}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/gym-scanner" as any)}
                >
                  <Text style={s.quickEmoji}>🔬</Text>
                  <Text style={s.quickLabelLight}>{isAr ? "ماسح النادي" : "Gym Scanner"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.quickBtnOutline}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/ai-coach" as any)}
                >
                  <Text style={s.quickEmoji}>🧠</Text>
                  <Text style={s.quickLabelLight}>{isAr ? "المدرب الذكي" : "Smart Coach"}</Text>
                </TouchableOpacity>
              </View>

              {/* ── Stats row ─────────────────────────────────────────────── */}
              {!isPremium && (
                <TouchableOpacity
                  style={s.premiumLock}
                  onPress={() => router.push("/paywall" as any)}
                  activeOpacity={0.85}
                >
                  <Text style={s.premiumLockIcon}>👑</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.premiumLockTitle, isAr && { textAlign: "right" }]}>
                      {isAr ? "إحصاءاتك وسجلك المتقدم" : "Advanced Stats & History"}
                    </Text>
                    <Text style={[s.premiumLockSub, isAr && { textAlign: "right" }]}>
                      {isAr ? "افتحي Premium لرؤية تحليلاتك الكاملة" : "Unlock Premium to see your full analytics"}
                    </Text>
                  </View>
                  <Text style={s.premiumLockArrow}>{isAr ? "←" : "→"}</Text>
                </TouchableOpacity>
              )}
              {isPremium && stats && (
                <Section title={isAr ? "إحصاءاتك" : "Your Stats"}>
                  <View style={s.statsGrid}>
                    {[
                      { icon: "🏋️", val: String(stats.totalSessions), label: isAr ? "تمارين" : "Sessions" },
                      { icon: "🔥", val: `${stats.currentStreakDays}`, label: isAr ? "أيام متتالية" : "Day streak" },
                      { icon: "📦", val: stats.weeklyVolumeKg > 999 ? `${(stats.weeklyVolumeKg/1000).toFixed(1)}t` : `${stats.weeklyVolumeKg}kg`, label: isAr ? "حجم أسبوعي" : "Week vol." },
                      { icon: "⭐", val: String(stats.totalPRs), label: isAr ? "أرقام قياسية" : "PRs" },
                    ].map((item, i) => (
                      <TouchableOpacity
                        key={i}
                        style={s.statCard}
                        onPress={() => router.push("/progress-charts" as any)}
                        activeOpacity={0.8}
                      >
                        <Text style={s.statIcon}>{item.icon}</Text>
                        <Text style={s.statVal}>{item.val}</Text>
                        <Text style={s.statLabel}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Section>
              )}

              {/* ── Weekly muscle coverage ──────────────────────────────── */}
              {muscles.length > 0 && (
                <Section title={isAr ? "تغطية العضلات — آخر 7 أيام" : "Muscle Coverage — Last 7 Days"}>
                  <View style={s.muscleGrid}>
                    {muscles.map((m) => (
                      <View key={m.key} style={[s.muscleChip, { borderColor: m.color + "50" }]}>
                        <View style={[s.muscleDot, { backgroundColor: m.color }]} />
                        <Text style={s.muscleEmoji}>{m.emoji}</Text>
                        <Text style={s.muscleName}>{isAr ? m.nameAr : m.nameEn}</Text>
                        {m.daysAgo !== null && (
                          <Text style={[s.muscleDays, { color: m.color }]}>
                            {m.daysAgo === 0 ? (isAr ? "اليوم" : "Today") : `${m.daysAgo}d`}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </Section>
              )}

              {/* ── AI Insights ──────────────────────────────────────────── */}
              {insights.length > 0 && (
                <Section title={isAr ? "رؤى الذكاء الاصطناعي" : "AI Insights"}>
                  {insights.map((insight) => (
                    <View key={insight.id} style={s.insightCard}>
                      <Text style={s.insightIcon}>{insight.icon}</Text>
                      <Text style={[s.insightText, isAr && { textAlign: "right" }]}>
                        {isAr ? insight.textAr : insight.textEn}
                      </Text>
                    </View>
                  ))}
                </Section>
              )}

              {/* ── Recent achievements ──────────────────────────────────── */}
              {recentAchievements.length > 0 && (
                <Section title={isAr ? "آخر الإنجازات" : "Recent Achievements"}>
                  <View style={s.achRow}>
                    {recentAchievements.map((ach) => (
                      <TouchableOpacity
                        key={ach.id}
                        style={s.achChip}
                        onPress={() => router.push("/achievements" as any)}
                        activeOpacity={0.8}
                      >
                        <Text style={s.achIcon}>{ach.icon}</Text>
                        <Text style={s.achName}>{isAr ? ach.nameAr : ach.nameEn}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={s.achMore}
                      onPress={() => router.push("/achievements" as any)}
                    >
                      <Text style={s.achMoreTxt}>{isAr ? "الكل ←" : "All →"}</Text>
                    </TouchableOpacity>
                  </View>
                </Section>
              )}

              {/* ── Personal records ─────────────────────────────────────── */}
              {isPremium && prs.length > 0 && (
                <Section title={isAr ? "أرقامك القياسية" : "Personal Records"}>
                  <View style={s.prGrid}>
                    {prs.map((pr) => (
                      <View key={pr.exerciseId} style={s.prCard}>
                        <Text style={s.prEmoji}>🏆</Text>
                        <Text style={s.prExName} numberOfLines={1}>
                          {isAr ? pr.exerciseNameAr : pr.exerciseNameEn}
                        </Text>
                        {pr.estimated1RMkg && (
                          <Text style={s.pr1RM}>{pr.estimated1RMkg}kg</Text>
                        )}
                        <Text style={s.prLabel}>{isAr ? "1RM تقديري" : "Est. 1RM"}</Text>
                      </View>
                    ))}
                  </View>
                </Section>
              )}

              {/* ── Recent workouts ──────────────────────────────────────── */}
              {isPremium && recentSessions.length > 0 && (
                <Section title={isAr ? "التمارين الأخيرة" : "Recent Workouts"}>
                  {recentSessions.map((session) => (
                    <View key={session.id} style={s.sessionCard}>
                      <View style={[s.sessionRow, isAr && { flexDirection: "row-reverse" }]}>
                        <View style={s.sessionIconWrap}>
                          <Text style={s.sessionIcon}>💪</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.sessionName, isAr && { textAlign: "right" }]}>
                            {session.exercises.length > 0
                              ? (isAr
                                  ? session.exercises[0].exerciseNameAr
                                  : session.exercises[0].exerciseNameEn) +
                                (session.exercises.length > 1 ? ` +${session.exercises.length - 1}` : "")
                              : (isAr ? "تمرين" : "Workout")}
                          </Text>
                          <Text style={[s.sessionMeta, isAr && { textAlign: "right" }]}>
                            {formatDate(session.startedAt, language)}
                            {session.durationMinutes ? ` · ${formatDuration(session.durationMinutes)}` : ""}
                            {session.cyclePhase ? ` · ${session.cyclePhase}` : ""}
                          </Text>
                        </View>
                        {session.perceivedEnergy && (
                          <Text style={s.sessionEnergy}>
                            {"⭐".repeat(session.perceivedEnergy)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={s.viewAllBtn}
                    onPress={() => router.push("/progress-charts" as any)}
                  >
                    <Text style={s.viewAllTxt}>
                      {isAr ? "عرض كل التحليلات →" : "View all analytics →"}
                    </Text>
                  </TouchableOpacity>
                </Section>
              )}

              {/* ── Empty state ──────────────────────────────────────────── */}
              {recentSessions.length === 0 && prs.length === 0 && (
                <View style={s.emptyState}>
                  <Text style={s.emptyEmoji}>🌱</Text>
                  <Text style={s.emptyTitle}>{isAr ? "ابدئي رحلتك التدريبية" : "Start Your Training Journey"}</Text>
                  <Text style={s.emptySub}>
                    {isAr
                      ? "سجّلي أول تمرين لتظهر بياناتك وتحليلاتك الشخصية."
                      : "Log your first workout and your personal analytics will appear here."}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Section helper ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.sectionBlock}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 140 },

  premiumLock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(198,167,255,0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.22)",
    padding: 16,
    marginBottom: 20,
  },
  premiumLockIcon: { fontSize: 22, flexShrink: 0 },
  premiumLockTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  premiumLockSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "500" },
  premiumLockArrow: { color: "#C6A7FF", fontSize: 18, flexShrink: 0 },

  pageLabel: {
    color: "#C6A7FF", fontSize: 11, fontWeight: "800", textAlign: "center",
    letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 6,
  },
  pageTitle: {
    color: "#FFFFFF", fontSize: 34, fontWeight: "900", textAlign: "center",
    letterSpacing: -0.5, marginBottom: 20,
  },

  sectionBlock: { marginBottom: 24 },
  sectionTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900", marginBottom: 12 },

  // Readiness
  readinessCard: { borderRadius: 28, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  readinessGrad: { padding: 20 },
  readinessRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  readinessOrb: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  readinessScore: { fontSize: 28, fontWeight: "900" },
  readinessOf: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700" },
  readinessLabel: { fontSize: 18, fontWeight: "900", marginBottom: 4 },
  readinessFocus: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  readinessReason: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600", marginTop: 4 },

  // Today
  todayCard: { borderRadius: 24, borderWidth: 1, overflow: "hidden" },
  todayGrad: { padding: 18 },
  todayRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  intensityOrb: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  intensityEmoji: { fontSize: 24 },
  todayFocus: { color: "#FFFFFF", fontSize: 17, fontWeight: "900", marginBottom: 4 },
  todayMeta: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" },
  todayArrow: { fontSize: 28, fontWeight: "900" },

  // Quick actions
  quickRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  quickBtnPrimary: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 20,
  },
  quickBtnOutline: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 20,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  quickBtnScanner: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 20,
    borderWidth: 1.5, borderColor: "rgba(198,167,255,0.30)",
    backgroundColor: "rgba(198,167,255,0.08)",
  },
  quickEmoji: { fontSize: 18 },
  quickLabelDark: { color: "#111", fontSize: 13, fontWeight: "800" },
  quickLabelLight: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

  // Stats
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18, padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", gap: 4,
  },
  statIcon: { fontSize: 18 },
  statVal: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  statLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "700", textAlign: "center" },

  // Muscle map
  muscleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  muscleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    position: "relative",
  },
  muscleDot: { width: 8, height: 8, borderRadius: 4 },
  muscleEmoji: { fontSize: 16 },
  muscleName: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  muscleDays: { fontSize: 11, fontWeight: "700" },

  // Insights
  insightCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  insightIcon: { fontSize: 22, flexShrink: 0 },
  insightText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600", lineHeight: 22, flex: 1 },

  // Achievements row
  achRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  achChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(198,167,255,0.08)", borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(198,167,255,0.20)",
  },
  achIcon: { fontSize: 18 },
  achName: { color: "#C6A7FF", fontSize: 12, fontWeight: "700" },
  achMore: { paddingHorizontal: 12, paddingVertical: 8, justifyContent: "center" },
  achMoreTxt: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },

  // PRs
  prGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  prCard: {
    width: "47%", flexGrow: 1, backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18, padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,215,0,0.20)", gap: 4,
  },
  prEmoji: { fontSize: 22 },
  prExName: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", textAlign: "center" },
  pr1RM: { color: "#FFD700", fontSize: 20, fontWeight: "900" },
  prLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700" },

  // Recent sessions
  sessionCard: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sessionIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(198,167,255,0.12)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  sessionIcon: { fontSize: 20 },
  sessionName: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  sessionMeta: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "600", marginTop: 2 },
  sessionEnergy: { fontSize: 12, flexShrink: 0 },

  viewAllBtn: { paddingVertical: 12, alignItems: "center" },
  viewAllTxt: { color: "#C6A7FF", fontSize: 14, fontWeight: "700" },

  // Schedule Card
  scheduleCard: {
    borderRadius: 24, borderWidth: 1, overflow: "hidden", marginBottom: 20,
  },
  scheduleGrad: { padding: 18 },
  scheduleHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  scheduleHeaderLabel: {
    color: "#C6A7FF", fontSize: 11, fontWeight: "800", letterSpacing: 0.8,
  },
  scheduleEditLink: {
    color: "rgba(198,167,255,0.70)", fontSize: 13, fontWeight: "700",
  },
  scheduleBody: {
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16,
  },
  scheduleOrbWrap: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  scheduleEmoji: { fontSize: 26 },
  scheduleTodaySmall: {
    color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: "700",
    marginBottom: 2, letterSpacing: 0.3,
  },
  scheduleTodayLabel: { fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  scheduleStartBtn: {
    borderRadius: 14, paddingVertical: 12, alignItems: "center",
  },
  scheduleStartBtnText: { color: "#111", fontSize: 14, fontWeight: "900" },

  // Schedule empty state
  scheduleEmptyCard: {
    backgroundColor: "rgba(198,167,255,0.06)",
    borderRadius: 24, borderWidth: 1,
    borderColor: "rgba(198,167,255,0.18)",
    padding: 22, alignItems: "center", marginBottom: 20, gap: 6,
  },
  scheduleEmptyEmoji: { fontSize: 32, marginBottom: 4 },
  scheduleEmptyTitle: {
    color: "#FFFFFF", fontSize: 18, fontWeight: "900",
  },
  scheduleEmptySub: {
    color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: "600",
    textAlign: "center", lineHeight: 20,
  },
  scheduleEmptyBtn: {
    marginTop: 10, backgroundColor: "rgba(198,167,255,0.18)",
    borderRadius: 14, paddingHorizontal: 24, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(198,167,255,0.35)",
  },
  scheduleEmptyBtnText: {
    color: "#C6A7FF", fontSize: 14, fontWeight: "800",
  },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 30, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  emptySub: { color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 24, fontWeight: "600", textAlign: "center" },
});
