import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLanguage } from "@/src/context/LanguageContext";
import { getVolumeByWeek } from "@/src/services/progress";
import { getExercisePreviousSessions } from "@/src/services/workouts/exerciseHistory";
import { getWorkoutStats } from "@/src/services/workouts/statsService";
import { getAllPRs } from "@/src/services/pr";
import { getWeeklyMuscleMap } from "@/src/services/workouts/muscleTracker";
import { EXERCISE_DATABASE } from "@/src/services/exercise-library";
import {
  getAllWorkoutSessions,
  deleteWorkoutSession,
  duplicateWorkoutSession,
} from "@/src/services/workouts/workoutStorage";
import type { WeeklyVolume } from "@/src/services/progress/progressService";
import type { ExerciseLastSession } from "@/src/services/workouts/exerciseHistory";
import type { WorkoutStats } from "@/src/services/workouts/statsService";
import type { PersonalRecord } from "@/src/services/pr/prService";
import type { MuscleStatus } from "@/src/services/workouts/muscleTracker";
import type { WorkoutSession } from "@/src/services/workouts/types";

const SCREEN_W = Dimensions.get("window").width;
const CHART_W = SCREEN_W - 40;
const CHART_H = 180;

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function LineChart({
  data,
  color = "#C6A7FF",
  yLabel = "",
}: {
  data: { x: string; y: number }[];
  color?: string;
  yLabel?: string;
}) {
  if (data.length < 2) {
    return (
      <View style={{ width: CHART_W, height: CHART_H, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "rgba(255,255,255,0.28)", fontSize: 13, fontWeight: "600" }}>
          Log more sessions to see progress
        </Text>
      </View>
    );
  }
  const pad = { top: 20, right: 14, bottom: 34, left: 38 };
  const cW = CHART_W - pad.left - pad.right;
  const cH = CHART_H - pad.top - pad.bottom;
  const vals = data.map((d) => d.y);
  const maxV = Math.max(...vals);
  const minV = Math.min(...vals);
  const range = maxV - minV || 1;

  const pts = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * cW,
    y: pad.top + (1 - (d.y - minV) / range) * cH,
  }));

  const curvePath = pts.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cpX = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C ${cpX} ${prev.y.toFixed(1)} ${cpX} ${p.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");

  const areaPath = `${curvePath} L ${pts[pts.length - 1].x} ${pad.top + cH} L ${pad.left} ${pad.top + cH} Z`;

  const ticks = [0, 0.5, 1];

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {ticks.map((t, i) => (
        <Line
          key={i}
          x1={pad.left}
          y1={pad.top + t * cH}
          x2={CHART_W - pad.right}
          y2={pad.top + t * cH}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}
      <Path d={areaPath} fill={color} fillOpacity={0.07} />
      <Path d={curvePath} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
      ))}
      {data.map((d, i) =>
        i % Math.max(1, Math.floor(data.length / 5)) === 0 ? (
          <SvgText key={i} x={pts[i].x} y={CHART_H - 6} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">
            {d.x}
          </SvgText>
        ) : null
      )}
      <SvgText x={pad.left - 4} y={pad.top + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">
        {maxV >= 1000 ? `${(maxV / 1000).toFixed(1)}k` : Math.round(maxV)}
      </SvgText>
      <SvgText x={pad.left - 4} y={pad.top + cH} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">
        {minV >= 1000 ? `${(minV / 1000).toFixed(1)}k` : Math.round(minV)}
      </SvgText>
    </Svg>
  );
}

function BarChart({ data, color = "#C6A7FF" }: { data: { label: string; value: number }[]; color?: string }) {
  if (data.length === 0) return null;
  const pad = { top: 16, right: 12, bottom: 32, left: 38 };
  const cW = CHART_W - pad.left - pad.right;
  const cH = CHART_H - pad.top - pad.bottom;
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const bw = Math.max(8, (cW / data.length) * 0.55);
  const gap = (cW - bw * data.length) / (data.length + 1);

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {[0, 0.5, 1].map((t, i) => (
        <Line
          key={i}
          x1={pad.left}
          y1={pad.top + t * cH}
          x2={CHART_W - pad.right}
          y2={pad.top + t * cH}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}
      {data.map((d, i) => {
        const bh = Math.max((d.value / maxV) * cH, d.value > 0 ? 4 : 0);
        const x = pad.left + gap + i * (bw + gap);
        const y = pad.top + cH - bh;
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width={bw} height={bh} fill={color} rx={5} opacity={0.85} />
            <SvgText x={x + bw / 2} y={CHART_H - 6} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">
              {d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
      <SvgText x={pad.left - 4} y={pad.top + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">
        {maxV >= 1000 ? `${(maxV / 1000).toFixed(1)}k` : maxV}
      </SvgText>
    </Svg>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={cs.card}>
      <Text style={cs.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function ProgressChartsScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [weekVolume, setWeekVolume] = useState<WeeklyVolume[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [muscles, setMuscles] = useState<MuscleStatus[]>([]);
  const [selectedExId, setSelectedExId] = useState<string | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseLastSession[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  async function reload() {
    const [st, vol, allPRs, muscleMap, allSessions] = await Promise.all([
      getWorkoutStats(),
      getVolumeByWeek(8),
      getAllPRs(),
      getWeeklyMuscleMap(),
      getAllWorkoutSessions(),
    ]);
    setStats(st);
    setWeekVolume(vol);
    setPrs(allPRs.slice(0, 10));
    setMuscles(muscleMap);
    setSessions(
      allSessions
        .filter((s) => s.status === "completed")
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, 20)
    );
    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        setLoading(true);
        if (!cancelled) await reload();
      }
      load();
      return () => { cancelled = true; };
    }, [])
  );

  async function handleDelete(id: string) {
    Alert.alert(
      isAr ? "حذف التمرين" : "Delete Workout",
      isAr ? "هل أنتِ متأكدة من الحذف؟" : "Are you sure you want to delete this workout?",
      [
        { text: isAr ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: isAr ? "حذف" : "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteWorkoutSession(id);
            setSessions((prev) => prev.filter((s) => s.id !== id));
          },
        },
      ]
    );
  }

  async function handleDuplicate(id: string) {
    const copy = await duplicateWorkoutSession(id);
    if (copy) {
      router.push("/workout-log" as any);
    }
  }

  async function loadExerciseHistory(id: string) {
    setSelectedExId(id);
    const hist = await getExercisePreviousSessions(id, 12);
    setExerciseHistory(hist);
  }

  // Volume chart data
  const volumeChartData = weekVolume.map((w) => ({ x: w.weekLabel, y: w.totalKg }));

  // Frequency bar chart (sessions per week)
  const freqChartData = weekVolume.map((w) => ({ label: w.weekLabel, value: w.sessionCount }));

  // Strength chart for selected exercise
  const strengthChartData = exerciseHistory
    .map((h) => ({ x: h.date.slice(5), y: h.bestSet.weightKg }))
    .reverse();

  return (
    <LinearGradient colors={["#05050A", "#121225"]} style={cs.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[cs.header, isAr && { flexDirection: "row-reverse" }]}>
          <TouchableOpacity onPress={() => router.back()} style={cs.backBtn}>
            <Text style={cs.backBtnTxt}>{isAr ? "›" : "‹"}</Text>
          </TouchableOpacity>
          <Text style={cs.headerTitle}>{isAr ? "تحليل التقدم" : "Progress Analytics"}</Text>
          <View style={{ width: 36 }} />
        </View>

        {loading ? (
          <ActivityIndicator color="#C6A7FF" style={{ marginTop: 80 }} />
        ) : stats?.totalSessions === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🏋️</Text>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
              {isAr ? "لا توجد تمارين بعد" : "No Workouts Yet"}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, textAlign: "center", lineHeight: 20 }}>
              {isAr
                ? "سجّلي أول تمرين لكِ لبدء تتبع تقدمك"
                : "Log your first workout to start tracking your progress"}
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>

            {/* ── Stats row ── */}
            {stats && (
              <View style={cs.statsGrid}>
                {[
                  { label: isAr ? "إجمالي التمارين" : "Total Sessions", val: String(stats.totalSessions), icon: "🏋️" },
                  { label: isAr ? "هذا الأسبوع" : "This Week", val: String(stats.weekSessions), icon: "📅" },
                  { label: isAr ? "السلسلة الحالية" : "Current Streak", val: `${stats.currentStreakDays}d`, icon: "🔥" },
                  { label: isAr ? "أطول سلسلة" : "Best Streak", val: `${stats.longestStreakDays}d`, icon: "🏆" },
                  { label: isAr ? "حجم أسبوعي" : "Weekly Vol.", val: stats.weeklyVolumeKg > 1000 ? `${(stats.weeklyVolumeKg/1000).toFixed(1)}t` : `${stats.weeklyVolumeKg}kg`, icon: "📦" },
                  { label: isAr ? "حجم شهري" : "Monthly Vol.", val: stats.monthlyVolumeKg > 1000 ? `${(stats.monthlyVolumeKg/1000).toFixed(1)}t` : `${stats.monthlyVolumeKg}kg`, icon: "📊" },
                  { label: isAr ? "إجمالي مرفوع" : "Total Lifted", val: stats.totalLiftedKg > 1000 ? `${(stats.totalLiftedKg/1000).toFixed(1)}t` : `${stats.totalLiftedKg}kg`, icon: "💪" },
                  { label: isAr ? "الأرقام القياسية" : "PRs Set", val: String(stats.totalPRs), icon: "⭐" },
                ].map((item, i) => (
                  <View key={i} style={cs.statCard}>
                    <Text style={cs.statIcon}>{item.icon}</Text>
                    <Text style={cs.statVal}>{item.val}</Text>
                    <Text style={cs.statLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── Volume chart ── */}
            <ChartCard title={isAr ? "حجم التدريب الأسبوعي (كغ)" : "Weekly Training Volume (kg)"}>
              <LineChart data={volumeChartData} color="#C6A7FF" />
            </ChartCard>

            {/* ── Frequency chart ── */}
            <ChartCard title={isAr ? "تكرار التدريب الأسبوعي" : "Weekly Training Frequency"}>
              <BarChart data={freqChartData} color="#3B82F6" />
            </ChartCard>

            {/* ── Muscle coverage ── */}
            <ChartCard title={isAr ? "تغطية العضلات (آخر 7 أيام)" : "Muscle Coverage (Last 7 Days)"}>
              <View style={cs.muscleGrid}>
                {muscles.map((m) => (
                  <View key={m.key} style={[cs.muscleCard, { borderColor: m.color + "44" }]}>
                    <View style={[cs.muscleDot, { backgroundColor: m.color }]} />
                    <Text style={cs.muscleEmoji}>{m.emoji}</Text>
                    <Text style={cs.muscleName}>{isAr ? m.nameAr : m.nameEn}</Text>
                    <Text style={[cs.muscleDays, { color: m.color }]}>
                      {m.daysAgo === null
                        ? (isAr ? "لم يُتدرب" : "Not trained")
                        : m.daysAgo === 0
                        ? (isAr ? "اليوم" : "Today")
                        : `${m.daysAgo}d ${isAr ? "مضت" : "ago"}`}
                    </Text>
                  </View>
                ))}
              </View>
            </ChartCard>

            {/* ── Strength per exercise ── */}
            <ChartCard title={isAr ? "تقدم القوة" : "Strength Progression"}>
              {/* Exercise selector */}
              <FlatList
                horizontal
                data={prs.length > 0
                  ? prs.map((pr) => ({ id: pr.exerciseId, nameEn: pr.exerciseNameEn, nameAr: pr.exerciseNameAr }))
                  : EXERCISE_DATABASE.slice(0, 8).map((e) => ({ id: e.id, nameEn: e.nameEn, nameAr: e.nameAr }))}
                keyExtractor={(e) => e.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
                renderItem={({ item: ex }) => {
                  const active = selectedExId === ex.id;
                  return (
                    <TouchableOpacity
                      onPress={() => loadExerciseHistory(ex.id)}
                      style={[cs.exChip, active && cs.exChipActive]}
                    >
                      <Text style={[cs.exChipTxt, active && { color: "#C6A7FF" }]}>
                        {isAr ? ex.nameAr : ex.nameEn}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              {selectedExId ? (
                <LineChart
                  data={strengthChartData.length > 0 ? strengthChartData : []}
                  color="#22C55E"
                />
              ) : (
                <View style={{ height: CHART_H, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: "600" }}>
                    {isAr ? "اختاري تمريناً لعرض تقدم قوتك" : "Select an exercise to view strength progress"}
                  </Text>
                </View>
              )}
            </ChartCard>

            {/* ── PRs list ── */}
            {prs.length > 0 && (
              <ChartCard title={isAr ? "أرقامك القياسية الشخصية" : "Personal Records"}>
                {prs.map((pr) => (
                  <View key={pr.exerciseId} style={[cs.prRow, isAr && { flexDirection: "row-reverse" }]}>
                    <Text style={cs.prEmoji}>🏆</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[cs.prName, isAr && { textAlign: "right" }]}>
                        {isAr ? pr.exerciseNameAr : pr.exerciseNameEn}
                      </Text>
                      <Text style={[cs.prMeta, isAr && { textAlign: "right" }]}>
                        {pr.maxWeightKg}kg × {pr.maxReps} reps
                      </Text>
                    </View>
                    {pr.estimated1RMkg && (
                      <View style={cs.pr1RMBadge}>
                        <Text style={cs.pr1RMVal}>{pr.estimated1RMkg}</Text>
                        <Text style={cs.pr1RMLabel}>kg 1RM</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ChartCard>
            )}

            {/* ── Session history ── */}
            {sessions.length > 0 && (
              <ChartCard title={isAr ? "سجل التمارين" : "Session History"}>
                {sessions.map((session) => {
                  const date = new Date(session.startedAt).toLocaleDateString(
                    isAr ? "ar-SA" : "en-GB",
                    { day: "numeric", month: "short" }
                  );
                  const exNames = session.exercises.slice(0, 2).map((e) =>
                    isAr ? e.exerciseNameAr : e.exerciseNameEn
                  );
                  const label = exNames.length > 0
                    ? exNames.join(", ") + (session.exercises.length > 2 ? ` +${session.exercises.length - 2}` : "")
                    : (isAr ? "تمرين" : "Workout");
                  return (
                    <View key={session.id} style={[cs.sessionRow, isAr && { flexDirection: "row-reverse" }]}>
                      <View style={cs.sessionDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={[cs.sessionName, isAr && { textAlign: "right" }]} numberOfLines={1}>
                          {label}
                        </Text>
                        <Text style={[cs.sessionMeta, isAr && { textAlign: "right" }]}>
                          {date}
                          {session.durationMinutes ? ` · ${session.durationMinutes}min` : ""}
                          {session.perceivedEnergy ? ` · ${"⭐".repeat(session.perceivedEnergy)}` : ""}
                        </Text>
                      </View>
                      <View style={[cs.sessionActions, isAr && { flexDirection: "row-reverse" }]}>
                        <TouchableOpacity
                          style={cs.sessionActionBtn}
                          onPress={() => handleDuplicate(session.id)}
                        >
                          <Text style={cs.sessionActionTxt}>📋</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={cs.sessionActionBtn}
                          onPress={() => handleDelete(session.id)}
                        >
                          <Text style={cs.sessionActionTxt}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ChartCard>
            )}

          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const cs = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  backBtnTxt: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    width: "22%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    flexGrow: 1,
  },
  statIcon: { fontSize: 18 },
  statVal: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  statLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "700", textAlign: "center" },

  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 14,
  },

  muscleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  muscleCard: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    position: "relative",
  },
  muscleDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  muscleEmoji: { fontSize: 20 },
  muscleName: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", textAlign: "center" },
  muscleDays: { fontSize: 10, fontWeight: "700", textAlign: "center" },

  exChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  exChipActive: { borderColor: "#C6A7FF50", backgroundColor: "#C6A7FF12" },
  exChipTxt: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700" },

  prRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  prEmoji: { fontSize: 20 },
  prName: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  prMeta: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600", marginTop: 2 },
  pr1RMBadge: { alignItems: "center" },
  pr1RMVal: { color: "#FFD700", fontSize: 18, fontWeight: "900" },
  pr1RMLabel: { color: "rgba(255,215,0,0.5)", fontSize: 9, fontWeight: "700" },

  sessionRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  sessionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#C6A7FF", flexShrink: 0 },
  sessionName: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  sessionMeta: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600", marginTop: 2 },
  sessionActions: { flexDirection: "row", gap: 4 },
  sessionActionBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  sessionActionTxt: { fontSize: 16 },
});
