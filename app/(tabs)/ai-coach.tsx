import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brain, ChevronDown, ChevronRight, RefreshCw, Zap, Sun, Sparkles } from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import { getCycleDay } from "@/src/engine/cycleEngine";
import { getLastPeriod, getCycleLength } from "@/src/storage/cycleStorage";
import { getDailyCheckIn, getRecentCheckIns, getAllCheckIns } from "@/src/storage/checkinStorage";
import { getCachedHealthMetrics } from "@/src/services/health/healthService";
import { getRecentWorkoutSessions } from "@/src/services/workouts/workoutStorage";

// Hormone coach
import {
  computeDailyScores,
  generateRecommendations as genPhaseRecs,
  generateWeeklyForecast,
  generateMonthlyTimeline,
  phaseAccentColor,
} from "@/src/services/hormone-coach";
import type {
  CoachInput,
  CyclePhaseKey,
  DailyScores,
  DayForecast,
  MonthDay,
  Recommendation,
} from "@/src/services/hormone-coach";

// Readiness engine
import {
  computeUnifiedReadiness,
  generateExplanation,
  detectRisks,
  generateDynamicRecommendations,
  generateReadinessTimeline,
  generateWeeklyReport,
  getHabitInsights,
  recordHabitObservation,
} from "@/src/services/readiness";

// Life coach services
import { generateEmotionPlan } from "@/src/services/daily-brief/emotionCoach";
import { generateCyclePredictions } from "@/src/services/daily-brief/cyclePredictions";
import type { EmotionSupportPlan, CyclePrediction } from "@/src/services/daily-brief/types";
import type {
  DayReadiness,
  DynamicRecommendation,
  HabitInsight,
  ReadinessResult,
  ReadinessExplanation,
  RiskAlert,
  UnifiedReadinessInput,
  WeeklyReport,
} from "@/src/services/readiness";
import type { DailyCheckIn } from "@/src/storage/checkinStorage";

// ── Screen width ──────────────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get("window");

// ── Phase helpers ─────────────────────────────────────────────────────────────

function toCyclePhaseKey(cycleDay: number): CyclePhaseKey {
  const d = ((cycleDay - 1) % 28) + 1;
  if (d <= 5)  return "menstrual";
  if (d <= 10) return "power";
  if (d <= 15) return "manifestation";
  if (d <= 19) return "secondPower";
  return "reset";
}

function phaseNameEn(k: CyclePhaseKey): string {
  return ({ menstrual: "Menstrual", power: "Follicular", manifestation: "Ovulation", secondPower: "Early Luteal", reset: "Late Luteal" })[k];
}
function phaseNameAr(k: CyclePhaseKey): string {
  return ({ menstrual: "الحيض", power: "الجريبية", manifestation: "التبويض", secondPower: "الأصفرية المبكرة", reset: "الأصفرية المتأخرة" })[k];
}

// ── Trend helpers ─────────────────────────────────────────────────────────────

function mean(arr: number[]): number | null {
  if (!arr.length) return null;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function buildReadinessInput(
  cycleDay: number,
  phaseKey: CyclePhaseKey,
  checkIn: DailyCheckIn | null,
  health: Awaited<ReturnType<typeof getCachedHealthMetrics>>,
  recentCheckIns: DailyCheckIn[],
  workoutSessions: Awaited<ReturnType<typeof getRecentWorkoutSessions>>,
  expectedCycleLength: number
): UnifiedReadinessInput {
  // 7-day sleep and energy averages
  const sleeps   = recentCheckIns.map((c) => c.sleepHours).filter((v): v is number => v !== undefined);
  const energies = recentCheckIns.map((c) => c.energy).filter((v): v is number => v !== undefined);

  // Consecutive low energy days
  let consecutiveLowEnergy = 0;
  for (const c of [...recentCheckIns].reverse()) {
    if ((c.energy ?? 5) <= 4) consecutiveLowEnergy++;
    else break;
  }

  // Consecutive poor sleep days
  let consecutivePoorSleep = 0;
  for (const c of [...recentCheckIns].reverse()) {
    if ((c.sleepHours ?? 7) < 6) consecutivePoorSleep++;
    else break;
  }

  // Workout frequency last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const weekSessions = workoutSessions.filter(
    (s) => new Date(s.startedAt) >= sevenDaysAgo && s.status === "completed"
  );
  const workoutDaysLast7 = weekSessions.length;

  // Last workout intensity (rough proxy from duration)
  const lastSession = weekSessions[0];
  let lastWorkoutIntensity: UnifiedReadinessInput["lastWorkoutIntensity"] = "none";
  if (lastSession) {
    const dur = lastSession.durationMinutes ?? 0;
    if (dur >= 60) lastWorkoutIntensity = "heavy";
    else if (dur >= 30) lastWorkoutIntensity = "moderate";
    else lastWorkoutIntensity = "light";
  }

  // Days since last workout
  let daysSinceLastWorkout: number | null = null;
  if (lastSession) {
    daysSinceLastWorkout = Math.floor(
      (now.getTime() - new Date(lastSession.startedAt).getTime()) / 86400000
    );
  }

  return {
    cycleDay,
    phaseKey,
    expectedCycleLength,
    sleepHours:               checkIn?.sleepHours   ?? null,
    hrv:                      health?.hrv            ?? null,
    restingHeartRate:         health?.restingHeartRate ?? null,
    activeCalories:           health?.activeEnergyBurned ?? null,
    steps:                    health?.steps          ?? null,
    symptoms:                 checkIn?.symptoms      ?? [],
    userEnergyRating:         checkIn?.energy        ?? null,
    fastingHoursToday:        null,
    avgSleepLast7:            mean(sleeps),
    avgEnergyLast7:           mean(energies),
    workoutDaysLast7,
    lastWorkoutIntensity,
    consecutiveLowEnergyDays: consecutiveLowEnergy,
    consecutivePoorSleepDays: consecutivePoorSleep,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Readiness widget ──────────────────────────────────────────────────────────

const ReadinessWidget = React.memo(function ReadinessWidget({
  result, isAr,
}: { result: ReadinessResult; isAr: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 2400, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1.0,  duration: 2400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glow, { toValue: 0.75, duration: 2400, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.25, duration: 2400, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={rStyles.container}>
      <Animated.View style={[rStyles.glow, { backgroundColor: result.color, opacity: glow, transform: [{ scale: pulse }] }]} />
      <Animated.View style={[rStyles.ring, { borderColor: result.color, transform: [{ scale: pulse }] }]}>
        <Text style={[rStyles.score, { color: result.color }]}>{result.score}</Text>
        <Text style={rStyles.label}>{isAr ? "استعداد" : "Readiness"}</Text>
      </Animated.View>
      <View style={[rStyles.badge, { backgroundColor: result.color + "22", borderColor: result.color + "55" }]}>
        <Text style={rStyles.badgeEmoji}>{result.emoji}</Text>
        <Text style={[rStyles.badgeLabel, { color: result.color }]}>
          {isAr ? result.labelAr : result.labelEn}
        </Text>
        <Text style={[rStyles.modifier, { color: result.color }]}>
          {result.intensityModifier >= 1 ? "+" : ""}{Math.round((result.intensityModifier - 1) * 100)}% intensity
        </Text>
      </View>
    </View>
  );
});

const rStyles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 24, gap: 14 },
  glow:      { position: "absolute", width: 130, height: 130, borderRadius: 65, top: -10 },
  ring:      { width: 108, height: 108, borderRadius: 54, borderWidth: 3, backgroundColor: "rgba(255,255,255,0.03)", alignItems: "center", justifyContent: "center" },
  score:     { fontSize: 38, fontWeight: "900", lineHeight: 42 },
  label:     { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  badge:     { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  badgeEmoji:{ fontSize: 14 },
  badgeLabel:{ fontSize: 14, fontWeight: "800" },
  modifier:  { fontSize: 11, opacity: 0.8 },
});

// ── Explanation section ────────────────────────────────────────────────────────

const ExplanationSection = React.memo(function ExplanationSection({
  exp, isAr,
}: { exp: ReadinessExplanation; isAr: boolean }) {
  return (
    <View style={eStyles.container}>
      <Text style={[eStyles.headline, isAr && S.rtlText]}>
        {isAr ? exp.headlineAr : exp.headlineEn}
      </Text>
      <View style={eStyles.factors}>
        {exp.factors.map((f, i) => (
          <View key={i} style={[eStyles.factor, { borderLeftColor: f.impact === "positive" ? "#22C55E" : "#EF4444" }]}>
            <Text style={eStyles.factorIcon}>{f.icon}</Text>
            <Text style={[eStyles.factorLabel, isAr && S.rtlText, { color: f.impact === "positive" ? "#22C55E" : "#FB7185" }]}>
              {isAr ? f.labelAr : f.labelEn}
            </Text>
            <View style={[eStyles.magDot, { backgroundColor: f.magnitude === "strong" ? "#EF4444" : f.magnitude === "moderate" ? "#F59E0B" : "#6B7280" }]} />
          </View>
        ))}
      </View>
    </View>
  );
});

const eStyles = StyleSheet.create({
  container: { marginBottom: 20, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16 },
  headline:  { fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 22, marginBottom: 14 },
  factors:   { gap: 8 },
  factor:    { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 10, borderLeftWidth: 2 },
  factorIcon:{ fontSize: 16 },
  factorLabel:{ flex: 1, fontSize: 13, lineHeight: 18 },
  magDot:    { width: 7, height: 7, borderRadius: 4 },
});

// ── Risk alert card ────────────────────────────────────────────────────────────

const RiskCard = React.memo(function RiskCard({ alert, isAr }: { alert: RiskAlert; isAr: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, { toValue: expanded ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [expanded]);

  const severityColor = alert.severity === "warning" ? "#EF4444" : alert.severity === "caution" ? "#F59E0B" : "#3B82F6";

  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={[riStyles.card, { borderColor: severityColor + "44" }]}>
      <View style={riStyles.header}>
        <View style={[riStyles.iconWrap, { backgroundColor: severityColor + "18" }]}>
          <Text>{alert.icon}</Text>
        </View>
        <View style={riStyles.headerText}>
          <Text style={[riStyles.title, isAr && S.rtlText]}>{isAr ? alert.titleAr : alert.titleEn}</Text>
          <Text style={[riStyles.severity, { color: severityColor }]}>{alert.severity.toUpperCase()}</Text>
        </View>
        <ChevronDown size={16} color="rgba(255,255,255,0.4)"
          style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} />
      </View>
      <Animated.View style={{ overflow: "hidden", maxHeight: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }) }}>
        <Text style={[riStyles.body, isAr && S.rtlText]}>{isAr ? alert.bodyAr : alert.bodyEn}</Text>
        <View style={[riStyles.action, { borderColor: severityColor + "33" }]}>
          <Zap size={12} color={severityColor} />
          <Text style={[riStyles.actionText, { color: severityColor }, isAr && S.rtlText]}>
            {isAr ? alert.actionAr : alert.actionEn}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const riStyles = StyleSheet.create({
  card:       { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1 },
  header:     { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap:   { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  title:      { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  severity:   { fontSize: 10, fontWeight: "800", marginTop: 2, letterSpacing: 0.5 },
  body:       { fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 20, marginTop: 12, marginBottom: 8 },
  action:     { flexDirection: "row", alignItems: "flex-start", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10 },
  actionText: { fontSize: 12, lineHeight: 18, flex: 1 },
});

// ── Dynamic recommendation pill ────────────────────────────────────────────────

const DynRecPill = React.memo(function DynRecPill({ rec, isAr }: { rec: DynamicRecommendation; isAr: boolean }) {
  const priorityColor = rec.priority === "high" ? "#EF4444" : rec.priority === "medium" ? "#F59E0B" : "#6B7280";
  return (
    <View style={[dynStyles.pill, { borderColor: rec.accentColor + "44" }]}>
      <View style={dynStyles.pillTop}>
        <Text style={dynStyles.pillIcon}>{rec.icon}</Text>
        <View style={[dynStyles.priorityBadge, { backgroundColor: priorityColor + "22" }]}>
          <Text style={[dynStyles.priorityText, { color: priorityColor }]}>{rec.priority}</Text>
        </View>
      </View>
      <Text style={[dynStyles.pillText, isAr && S.rtlText]}>{isAr ? rec.titleAr : rec.titleEn}</Text>
    </View>
  );
});

const dynStyles = StyleSheet.create({
  pill:         { width: SCREEN_W * 0.66, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14, marginRight: 10, borderWidth: 1 },
  pillTop:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  pillIcon:     { fontSize: 20 },
  priorityBadge:{ borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  priorityText: { fontSize: 10, fontWeight: "700" },
  pillText:     { fontSize: 13, color: "#FFFFFF", lineHeight: 18 },
});

// ── Phase rec card (hormone coach) ─────────────────────────────────────────────

const PhaseRecCard = React.memo(function PhaseRecCard({
  rec, isAr, expanded, onToggle,
}: { rec: Recommendation; isAr: boolean; expanded: boolean; onToggle: () => void }) {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, { toValue: expanded ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [expanded]);

  return (
    <Pressable onPress={onToggle} style={[prStyles.card, { borderLeftColor: rec.accentColor }]}>
      <View style={prStyles.header}>
        <View style={[prStyles.iconWrap, { backgroundColor: rec.accentColor + "22" }]}>
          <Text style={prStyles.icon}>{rec.icon}</Text>
        </View>
        <Text style={[prStyles.title, isAr && S.rtlText]}>{isAr ? rec.titleAr : rec.titleEn}</Text>
        <ChevronRight size={15} color="rgba(255,255,255,0.35)"
          style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }} />
      </View>
      <Animated.View style={{ overflow: "hidden", maxHeight: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 350] }) }}>
        <Text style={[prStyles.body, isAr && S.rtlText]}>{isAr ? rec.bodyAr : rec.bodyEn}</Text>
        <View style={prStyles.whyRow}>
          <Zap size={11} color="#F59E0B" />
          <Text style={[prStyles.why, isAr && S.rtlText]}>{isAr ? rec.whyAr : rec.whyEn}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const prStyles = StyleSheet.create({
  card:    { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14, marginBottom: 10, borderLeftWidth: 3 },
  header:  { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap:{ width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  icon:    { fontSize: 17 },
  title:   { flex: 1, fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  body:    { fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 20, marginTop: 12, marginBottom: 8 },
  whyRow:  { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 10, padding: 10 },
  why:     { fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 18, flex: 1 },
});

// ── Score ring ────────────────────────────────────────────────────────────────

const ScoreRing = React.memo(function ScoreRing({ value, label, color, size = 64 }: {
  value: number; label: string; color: string; size?: number;
}) {
  return (
    <View style={[scStyles.wrap, { width: size, height: size + 18 }]}>
      <View style={[scStyles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color + "30" }]}>
        <View style={[scStyles.arc, { width: size, height: size, borderRadius: size / 2, borderColor: color, borderTopColor: "transparent" }]} />
        <Text style={[scStyles.value, { fontSize: size * 0.25, color }]}>{value}</Text>
      </View>
      <Text style={scStyles.label}>{label}</Text>
    </View>
  );
});

const scStyles = StyleSheet.create({
  wrap:  { alignItems: "center", justifyContent: "flex-start" },
  ring:  { borderWidth: 2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  arc:   { position: "absolute", borderWidth: 3 },
  value: { fontWeight: "800" },
  label: { fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: "600", marginTop: 4, textAlign: "center" },
});

// ── Readiness timeline strip ───────────────────────────────────────────────────

const TimelineDay = React.memo(function TimelineDay({ day, isAr, onPress }: {
  day: DayReadiness; isAr: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[tlStyles.day, day.isToday && { borderColor: day.color }]}>
      <Text style={[tlStyles.dayLabel, day.isToday && { color: day.color }]}>
        {isAr ? day.dayLabelAr : day.dayLabelEn}
      </Text>
      <View style={[tlStyles.bar, { height: Math.round((day.predictedScore / 100) * 48) + 6, backgroundColor: day.color }]} />
      <Text style={[tlStyles.score, { color: day.color }]}>{day.predictedScore}</Text>
      {day.isToday && <View style={[tlStyles.todayDot, { backgroundColor: day.color }]} />}
    </Pressable>
  );
});

const tlStyles = StyleSheet.create({
  day:      { width: 52, alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, paddingVertical: 12, borderWidth: 1.5, borderColor: "transparent" },
  dayLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.45)" },
  bar:      { width: 20, borderRadius: 10, minHeight: 4 },
  score:    { fontSize: 12, fontWeight: "800" },
  todayDot: { width: 6, height: 6, borderRadius: 3, position: "absolute", bottom: 5 },
});

// ── Weekly forecast day ────────────────────────────────────────────────────────

const ForecastDay = React.memo(function ForecastDay({ day, isAr }: { day: DayForecast; isAr: boolean }) {
  return (
    <View style={[fdStyles.day, day.isToday && { borderColor: day.accentColor }]}>
      <Text style={[fdStyles.label, day.isToday && { color: day.accentColor }]}>
        {isAr ? day.dayLabelAr : day.dayLabelEn}
      </Text>
      <Text style={fdStyles.emoji}>{day.moodEmoji}</Text>
      <View style={[fdStyles.energy, { height: Math.round((day.energyLevel / 100) * 28) + 4, backgroundColor: day.accentColor }]} />
      <Text style={fdStyles.fast}>{day.fastingHours}h</Text>
    </View>
  );
});

const fdStyles = StyleSheet.create({
  day:    { width: 60, alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, paddingVertical: 12, borderWidth: 1.5, borderColor: "transparent", marginRight: 10 },
  label:  { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.45)" },
  emoji:  { fontSize: 17 },
  energy: { width: 22, borderRadius: 4, minHeight: 4 },
  fast:   { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
});

// ── Monthly dot ───────────────────────────────────────────────────────────────

const MonthDot = React.memo(function MonthDot({ day, onPress }: { day: MonthDay; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[mdStyles.wrap, { borderColor: day.accentColor + "44" }]}>
      {day.isToday && <View style={[mdStyles.todayRing, { borderColor: day.accentColor }]} />}
      <View style={[mdStyles.inner, { backgroundColor: day.accentColor + (day.isToday ? "CC" : "55") }]}>
        <Text style={mdStyles.dayNum}>{day.cycleDay}</Text>
      </View>
      {day.isPeriod      && <View style={mdStyles.dotPeriod} />}
      {day.isOvulationWindow && !day.isPeriod && <View style={[mdStyles.dotPeriod, { backgroundColor: "#F59E0B" }]} />}
    </Pressable>
  );
});

const mdStyles = StyleSheet.create({
  wrap:      { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  todayRing: { position: "absolute", width: 36, height: 36, borderRadius: 18, borderWidth: 2 },
  inner:     { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayNum:    { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  dotPeriod: { position: "absolute", bottom: 1, right: 1, width: 7, height: 7, borderRadius: 4, backgroundColor: "#EF4444" },
});

// ── Weekly report widget ───────────────────────────────────────────────────────

function WeeklyReportSection({ report, isAr }: { report: WeeklyReport; isAr: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const trendEmoji = report.energyTrend === "improving" ? "📈" : report.energyTrend === "declining" ? "📉" : "➡️";
  const sleepColor = report.sleepQuality === "good" ? "#22C55E" : report.sleepQuality === "fair" ? "#F59E0B" : "#EF4444";

  return (
    <View style={wrStyles.container}>
      <Pressable onPress={() => setExpanded(!expanded)} style={wrStyles.header}>
        <Text style={[wrStyles.title, isAr && S.rtlText]}>
          {isAr ? "التقرير الأسبوعي" : "Weekly Report"}
        </Text>
        <View style={wrStyles.headerRight}>
          <Text style={wrStyles.overallScore}>{report.overallScore}/100</Text>
          <ChevronDown size={16} color="rgba(255,255,255,0.4)"
            style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} />
        </View>
      </Pressable>

      {/* Quick stats row always visible */}
      <View style={wrStyles.statsRow}>
        <View style={wrStyles.stat}>
          <Text style={wrStyles.statIcon}>🏋️</Text>
          <Text style={wrStyles.statValue}>{report.workoutDays}</Text>
          <Text style={wrStyles.statLabel}>{isAr ? "تمارين" : "workouts"}</Text>
        </View>
        <View style={wrStyles.stat}>
          <Text style={wrStyles.statIcon}>{trendEmoji}</Text>
          <Text style={wrStyles.statValue}>{isAr
            ? ({ improving: "صاعد", stable: "ثابت", declining: "هابط" })[report.energyTrend]
            : report.energyTrend}</Text>
          <Text style={wrStyles.statLabel}>{isAr ? "طاقة" : "energy"}</Text>
        </View>
        <View style={wrStyles.stat}>
          <Text style={wrStyles.statIcon}>😴</Text>
          <Text style={[wrStyles.statValue, { color: sleepColor }]}>{report.avgSleepHours ?? "—"}h</Text>
          <Text style={wrStyles.statLabel}>{isAr ? "نوم" : "sleep"}</Text>
        </View>
        <View style={wrStyles.stat}>
          <Text style={wrStyles.statIcon}>⏰</Text>
          <Text style={wrStyles.statValue}>–</Text>
          <Text style={wrStyles.statLabel}>{isAr ? "صيام" : "fasting"}</Text>
        </View>
      </View>

      {expanded && (
        <View style={wrStyles.detail}>
          <Row label={isAr ? "الإنجاز الأكبر" : "Biggest Achievement"}
               value={isAr ? report.biggestAchievementAr : report.biggestAchievementEn}
               icon="🏆" isAr={isAr} />
          <Row label={isAr ? "مجال التحسين" : "Area to Improve"}
               value={isAr ? report.improvementAreaAr : report.improvementAreaEn}
               icon="🎯" isAr={isAr} />
          <Row label={isAr ? "ملخص الهرمونات" : "Hormone Summary"}
               value={isAr ? report.hormoneSummaryAr : report.hormoneSummaryEn}
               icon="🌙" isAr={isAr} />
          <Row label={isAr ? "ملخص التعافي" : "Recovery Summary"}
               value={isAr ? report.recoverySummaryAr : report.recoverySummaryEn}
               icon="💚" isAr={isAr} />
          <Row label={isAr ? "ملخص المزاج" : "Mood Summary"}
               value={isAr ? report.moodSummaryAr : report.moodSummaryEn}
               icon="😊" isAr={isAr} />
        </View>
      )}
    </View>
  );
}

function Row({ label, value, icon, isAr }: { label: string; value: string; icon: string; isAr: boolean }) {
  return (
    <View style={wrStyles.row}>
      <Text>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[wrStyles.rowLabel, isAr && S.rtlText]}>{label}</Text>
        <Text style={[wrStyles.rowValue, isAr && S.rtlText]}>{value}</Text>
      </View>
    </View>
  );
}

const wrStyles = StyleSheet.create({
  container:   { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 16, marginBottom: 24 },
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title:       { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  overallScore:{ fontSize: 18, fontWeight: "900", color: "#C6A7FF" },
  statsRow:    { flexDirection: "row", justifyContent: "space-around", marginBottom: 4 },
  stat:        { alignItems: "center", gap: 3 },
  statIcon:    { fontSize: 18 },
  statValue:   { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  statLabel:   { fontSize: 10, color: "rgba(255,255,255,0.45)" },
  detail:      { marginTop: 14, gap: 10 },
  row:         { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  rowLabel:    { fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 2 },
  rowValue:    { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 19 },
});

// ── Habit insight chip ────────────────────────────────────────────────────────

const HabitChip = React.memo(function HabitChip({ insight, isAr }: { insight: HabitInsight; isAr: boolean }) {
  return (
    <View style={[habStyles.chip, { borderColor: insight.color + "44" }]}>
      <View style={habStyles.chipTop}>
        <Text style={habStyles.chipIcon}>{insight.icon}</Text>
        <View style={[habStyles.confBar, { width: `${insight.confidence}%` as `${number}%`, backgroundColor: insight.color }]} />
        <Text style={[habStyles.confText, { color: insight.color }]}>{insight.confidence}%</Text>
      </View>
      <Text style={[habStyles.chipText, isAr && S.rtlText]}>
        {isAr ? insight.patternAr : insight.patternEn}
      </Text>
      <Text style={habStyles.dataPoints}>{insight.dataPoints} data pts</Text>
    </View>
  );
});

const habStyles = StyleSheet.create({
  chip:      { width: SCREEN_W * 0.72, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, marginRight: 10, borderWidth: 1 },
  chipTop:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  chipIcon:  { fontSize: 18 },
  confBar:   { height: 3, borderRadius: 2, flex: 1 },
  confText:  { fontSize: 11, fontWeight: "800" },
  chipText:  { fontSize: 13, color: "#FFFFFF", lineHeight: 20, marginBottom: 6 },
  dataPoints:{ fontSize: 10, color: "rgba(255,255,255,0.35)" },
});

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, isAr }: { title: string; isAr: boolean }) {
  return (
    <Text style={[S.sectionTitle, isAr && S.rtlText]}>{title}</Text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export default function AICoachScreen() {
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAr = language === "ar";

  const [cycleDay,  setCycleDay]  = useState(14);
  const [phaseK,    setPhaseK]    = useState<CyclePhaseKey>("power");
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [explanation, setExplanation] = useState<ReadinessExplanation | null>(null);
  const [riskAlerts, setRiskAlerts]   = useState<RiskAlert[]>([]);
  const [dynRecs,   setDynRecs]   = useState<DynamicRecommendation[]>([]);
  const [phaseRecs, setPhaseRecs] = useState<Recommendation[]>([]);
  const [scores,    setScores]    = useState<DailyScores | null>(null);
  const [timeline,  setTimeline]  = useState<DayReadiness[]>([]);
  const [forecast,  setForecast]  = useState<DayForecast[]>([]);
  const [monthDays, setMonthDays] = useState<MonthDay[]>([]);
  const [weekReport,setWeekReport]= useState<WeeklyReport | null>(null);
  const [habitInsights, setHabitInsights] = useState<HabitInsight[]>([]);
  const [emotionPlan, setEmotionPlan] = useState<EmotionSupportPlan | null>(null);
  const [cyclePredict, setCyclePredict] = useState<CyclePrediction[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [selectedMonthDay, setSelectedMonthDay] = useState<MonthDay | null>(null);
  const [selectedTimelineDay, setSelectedTimelineDay] = useState<DayReadiness | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [lastPeriod, cycleLength, checkIn, health, recentSessions, checkInsMap, recentCheckIns, habits] =
        await Promise.all([
          getLastPeriod(),
          getCycleLength(),
          getDailyCheckIn(),
          getCachedHealthMetrics(),
          getRecentWorkoutSessions(14),
          getAllCheckIns(),
          getRecentCheckIns(7),
          getHabitInsights(),
        ]);

      const today = new Date().toISOString().split("T")[0];
      const day   = getCycleDay(lastPeriod ?? today);
      const expLen = cycleLength ?? 28;
      const pk    = toCyclePhaseKey(day);

      const readinessInput = buildReadinessInput(
        day, pk, checkIn, health, recentCheckIns, recentSessions, expLen
      );

      // Readiness
      const readinessResult = computeUnifiedReadiness(readinessInput);
      const exp = generateExplanation(readinessInput, readinessResult.score, readinessResult.level);
      const risks = detectRisks(readinessInput, recentCheckIns);
      const dynR  = generateDynamicRecommendations(readinessInput, readinessResult);

      // Hormone coach scores + phase recs
      const coachInput: CoachInput = {
        cycleDay: day, phaseKey: pk,
        sleepHours: checkIn?.sleepHours ?? null,
        hrv: health?.hrv ?? null,
        restingHeartRate: health?.restingHeartRate ?? null,
        activeCalories: health?.activeEnergyBurned ?? null,
        steps: health?.steps ?? null,
        symptoms: checkIn?.symptoms ?? [],
        userEnergyRating: checkIn?.energy ?? null,
        daysSinceLastWorkout: null,
        lastFastHours: null,
        todayFastingActive: false,
      };
      const dailyScores = computeDailyScores(coachInput);
      const phaseR = genPhaseRecs(coachInput, dailyScores);

      // Timeline, forecast, monthly
      const tl   = generateReadinessTimeline(day, readinessResult.score, readinessInput);
      const fc   = generateWeeklyForecast(day);
      const mtl  = generateMonthlyTimeline(day);

      // Weekly report
      const weekRep = generateWeeklyReport(checkInsMap, recentSessions, day);

      // Record habit observation (today → will be linked to tomorrow's energy)
      if (checkIn) {
        const lastSession = recentSessions[0];
        await recordHabitObservation({
          date: today,
          workoutType: lastSession?.exercises?.[0]?.exerciseId?.startsWith("cardio") ? "cardio" : "strength",
          fastingHours: null,
          phaseKey: pk,
          sleepHours: checkIn.sleepHours ?? null,
          nextDayEnergy: null, // filled in the next day
        });
      }

      // Life coach: emotion plan + cycle predictions
      const emotion = generateEmotionPlan(pk, today);
      const predictions = generateCyclePredictions(day, expLen, new Date(today));

      setCycleDay(day);
      setPhaseK(pk);
      setReadiness(readinessResult);
      setExplanation(exp);
      setRiskAlerts(risks);
      setDynRecs(dynR);
      setPhaseRecs(phaseR);
      setScores(dailyScores);
      setTimeline(tl);
      setForecast(fc);
      setMonthDays(mtl);
      setWeekReport(weekRep);
      setHabitInsights(habits);
      setEmotionPlan(emotion);
      setCyclePredict(predictions);

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const accentColor = phaseAccentColor(phaseK);
  const hs = scores?.hormoneStatus;

  if (loading) {
    return (
      <View style={S.loadingWrap}>
        <Brain size={48} color={accentColor} />
        <Text style={[S.loadingText, isAr && S.rtlText]}>
          {isAr ? "تحليل دورتكِ وبياناتكِ..." : "Analysing your cycle and health data…"}
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={S.loadingWrap}>
        <Brain size={48} color="rgba(255,255,255,0.2)" />
        <Text style={[S.loadingText, isAr && S.rtlText]}>
          {isAr ? "تعذّر تحميل البيانات" : "Couldn't load your data"}
        </Text>
        <Pressable onPress={load} style={S.retryBtn}>
          <Text style={S.retryBtnText}>{isAr ? "إعادة المحاولة" : "Try Again"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={[S.root, { opacity: fadeAnim }]}
      contentContainerStyle={[S.content, { paddingTop: insets.top + 14 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={S.header}>
        <View>
          <Text style={[S.headerTitle, isAr && S.rtlText]}>
            {isAr ? "مدرب الهرمونات" : "AI Hormone Coach"}
          </Text>
          <Text style={[S.headerSub, { color: accentColor }, isAr && S.rtlText]}>
            {isAr
              ? `اليوم ${cycleDay} — ${phaseNameAr(phaseK)}`
              : `Day ${cycleDay} — ${phaseNameEn(phaseK)}`}
          </Text>
        </View>
        <Pressable onPress={load} style={S.refreshBtn}>
          <RefreshCw size={18} color="rgba(255,255,255,0.55)" />
        </Pressable>
      </View>

      {/* ── Morning Brief entry card ── */}
      <Pressable
        onPress={() => router.push("/morning-brief" as any)}
        style={[S.briefCard, { borderColor: accentColor + "55" }]}
      >
        <View style={[S.briefIconWrap, { backgroundColor: accentColor + "22" }]}>
          <Sun size={22} color={accentColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[S.briefTitle, { textAlign: isAr ? "right" : "left" }]}>
            {isAr ? "الملخص الصباحي" : "Morning Brief"}
          </Text>
          <Text style={[S.briefSub, { textAlign: isAr ? "right" : "left" }]}>
            {isAr ? "خطة وجباتكِ · أوقاتكِ المثلى · توقعات الدورة" : "Meal plan · Best windows · Cycle predictions"}
          </Text>
        </View>
        <Sparkles size={16} color={accentColor} />
      </Pressable>

      {/* ── Readiness score ── */}
      {readiness && <ReadinessWidget result={readiness} isAr={isAr} />}

      {/* ── WHY explanation ── */}
      {explanation && <ExplanationSection exp={explanation} isAr={isAr} />}

      {/* ── Risk alerts ── */}
      {riskAlerts.length > 0 && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "تنبيهات صحية" : "Health Alerts"} isAr={isAr} />
          {riskAlerts.map((a) => (
            <RiskCard key={a.id} alert={a} isAr={isAr} />
          ))}
        </View>
      )}

      {/* ── Dynamic AI recommendations ── */}
      {dynRecs.length > 0 && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "توصيات اليوم الذكية" : "Today's AI Recommendations"} isAr={isAr} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dynRecs.map((r) => (
              <DynRecPill key={r.id} rec={r} isAr={isAr} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Hormone scores grid ── */}
      {scores && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "نتائج الهرمونات اليوم" : "Hormone Scores Today"} isAr={isAr} />
          <View style={S.scoreGrid}>
            <ScoreRing value={scores.energyScore}   label={isAr ? "طاقة" : "Energy"}   color="#FBBF24" />
            <ScoreRing value={scores.recoveryScore} label={isAr ? "تعافٍ" : "Recovery"} color="#22C55E" />
            <ScoreRing value={scores.moodScore}     label={isAr ? "مزاج" : "Mood"}     color="#EC4899" />
            <ScoreRing value={scores.stressScore}   label={isAr ? "هدوء" : "Calm"}     color="#8FD3FF" />
            <ScoreRing value={scores.focusScore}    label={isAr ? "تركيز" : "Focus"}   color="#C6A7FF" />
            <ScoreRing value={scores.hungerScore}   label={isAr ? "جوع" : "Hunger"}    color="#FB923C" />
          </View>
          <View style={S.sleepRow}>
            <Text style={[S.sleepLabel, isAr && S.rtlText]}>{isAr ? "النوم الموصى به" : "Recommended sleep"}</Text>
            <Text style={[S.sleepValue, { color: accentColor }]}>{scores.sleepNeedHours}h</Text>
          </View>
        </View>
      )}

      {/* ── Smart readiness timeline ── */}
      {timeline.length > 0 && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "توقعات الاستعداد — 7 أيام" : "7-Day Readiness Forecast"} isAr={isAr} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {timeline.map((day) => (
              <View key={day.date} style={{ marginRight: 10 }}>
                <TimelineDay
                  day={day}
                  isAr={isAr}
                  onPress={() => setSelectedTimelineDay(selectedTimelineDay?.date === day.date ? null : day)}
                />
              </View>
            ))}
          </ScrollView>
          {selectedTimelineDay && (
            <View style={[S.detailCard, { borderColor: selectedTimelineDay.color + "44" }]}>
              <Text style={[S.detailTitle, { color: selectedTimelineDay.color }, isAr && S.rtlText]}>
                {isAr ? selectedTimelineDay.dayLabelAr : selectedTimelineDay.dayLabelEn}
                {" · "}{isAr ? "استعداد" : "Readiness"} {selectedTimelineDay.predictedScore}
              </Text>
              <Text style={[S.detailBody, isAr && S.rtlText]}>
                {isAr ? selectedTimelineDay.workoutSuggestionAr : selectedTimelineDay.workoutSuggestionEn}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Hormone status ── */}
      {hs && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "الحالة الهرمونية" : "Hormone Status"} isAr={isAr} />
          <View style={[S.hormoneCard, { borderColor: hs.color + "44" }]}>
            <View style={S.hormoneHeader}>
              <View style={[S.hormoneDot, { backgroundColor: hs.color }]} />
              <Text style={[S.hormoneTitle, { color: hs.color }, isAr && S.rtlText]}>
                {isAr ? hs.dominantAr : hs.dominantEn}
              </Text>
              <View style={[S.hormoneLevel, { backgroundColor: hs.color + "22" }]}>
                <Text style={[S.hormoneLevelText, { color: hs.color }]}>
                  {isAr ? hs.levelLabelAr : hs.levelLabelEn}
                </Text>
              </View>
            </View>
            <Text style={[S.hormoneDesc, isAr && S.rtlText]}>
              {isAr ? hs.descriptionAr : hs.descriptionEn}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {hs.facts.map((f, i) => (
                <View key={i} style={[S.factChip, { borderColor: f.color + "44" }]}>
                  <Text>{f.icon}</Text>
                  <Text style={[S.factText, { color: f.color }, isAr && S.rtlText]}>
                    {isAr ? `${f.hormoneAr}: ${f.trendAr}` : `${f.hormoneEn}: ${f.trendEn}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* ── Phase-based deep recommendations ── */}
      {phaseRecs.length > 0 && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "توصيات المرحلة" : "Phase Recommendations"} isAr={isAr} />
          {phaseRecs.map((rec) => (
            <PhaseRecCard
              key={rec.id}
              rec={rec}
              isAr={isAr}
              expanded={expandedRec === rec.id}
              onToggle={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
            />
          ))}
        </View>
      )}

      {/* ── Weekly report ── */}
      {weekReport && (
        <View style={S.section}>
          <WeeklyReportSection report={weekReport} isAr={isAr} />
        </View>
      )}

      {/* ── Weekly forecast strip ── */}
      {forecast.length > 0 && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "توقعات الأسبوع" : "Weekly Forecast"} isAr={isAr} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {forecast.map((day) => (
              <ForecastDay key={day.date} day={day} isAr={isAr} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Monthly timeline ── */}
      {monthDays.length > 0 && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "الجدول الشهري" : "Monthly Timeline"} isAr={isAr} />
          <View style={S.monthGrid}>
            {monthDays.map((d) => (
              <MonthDot
                key={d.cycleDay}
                day={d}
                onPress={() => setSelectedMonthDay(selectedMonthDay?.cycleDay === d.cycleDay ? null : d)}
              />
            ))}
          </View>
          {selectedMonthDay && (
            <View style={[S.detailCard, { borderColor: selectedMonthDay.accentColor + "44", marginTop: 12 }]}>
              <Text style={[S.detailTitle, { color: selectedMonthDay.accentColor }, isAr && S.rtlText]}>
                {isAr
                  ? `اليوم ${selectedMonthDay.cycleDay} — ${selectedMonthDay.phaseNameAr}`
                  : `Day ${selectedMonthDay.cycleDay} — ${selectedMonthDay.phaseNameEn}`}
              </Text>
              <Text style={[S.detailBody, isAr && S.rtlText]}>
                {selectedMonthDay.moodEmoji} {isAr ? selectedMonthDay.moodLabelAr : selectedMonthDay.moodLabelEn}
              </Text>
              <Text style={[S.detailSub, isAr && S.rtlText]}>
                {isAr ? `الرغبات: ${selectedMonthDay.cravingsAr}` : `Cravings: ${selectedMonthDay.cravingsEn}`}
              </Text>
            </View>
          )}
          {/* Phase legend */}
          <View style={S.phaseLegend}>
            {(["menstrual","power","manifestation","secondPower","reset"] as CyclePhaseKey[]).map((pk) => (
              <View key={pk} style={S.phaseChip}>
                <View style={[S.phaseChipDot, { backgroundColor: phaseAccentColor(pk) }]} />
                <Text style={S.phaseChipText}>{isAr ? phaseNameAr(pk) : phaseNameEn(pk)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Habit insights ── */}
      {habitInsights.length > 0 && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "أنماطكِ الشخصية" : "Your Personal Patterns"} isAr={isAr} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {habitInsights.map((h) => (
              <HabitChip key={h.id} insight={h} isAr={isAr} />
            ))}
          </ScrollView>
        </View>
      )}

      {habitInsights.length === 0 && (
        <View style={S.emptyHabits}>
          <Text style={S.emptyIcon}>🌱</Text>
          <Text style={[S.emptyTitle, isAr && S.rtlText]}>
            {isAr ? "جمع البيانات لتحليل أنماطكِ" : "Building your personal patterns"}
          </Text>
          <Text style={[S.emptyBody, isAr && S.rtlText]}>
            {isAr
              ? "بعد أسبوعين من الاستخدام، سيكتشف المدرب الأنماط الخاصة بكِ."
              : "After 2 weeks of check-ins, the coach will detect what works best for your body."}
          </Text>
        </View>
      )}

      {/* ── Cycle predictions ── */}
      {cyclePredict.length > 0 && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "توقعات الدورة القادمة" : "Upcoming Cycle Events"} isAr={isAr} />
          {cyclePredict.map((p) => (
            <View key={p.eventType + p.date} style={[S.predRow, { borderColor: p.accentColor + "33" }]}>
              <Text style={S.predIcon}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[S.predLabel, { color: p.accentColor }, isAr && S.rtlText]}>
                  {isAr ? p.labelAr : p.labelEn}
                </Text>
                <Text style={[S.predDesc, isAr && S.rtlText]}>
                  {isAr ? p.descriptionAr : p.descriptionEn}
                </Text>
              </View>
              <View style={[S.predConf, { backgroundColor: p.accentColor + "22" }]}>
                <Text style={[S.predConfText, { color: p.accentColor }]}>{p.confidence}%</Text>
                <Text style={S.predDays}>
                  {p.daysFromNow === 0
                    ? (isAr ? "اليوم" : "Today")
                    : p.daysFromNow === 1
                    ? (isAr ? "غداً" : "tmrw")
                    : (isAr ? `${p.daysFromNow} أيام` : `${p.daysFromNow}d`)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Emotion coach (always shown) ── */}
      {emotionPlan && (
        <View style={S.section}>
          <SectionHeader title={isAr ? "مدرب المشاعر" : "Emotion Coach"} isAr={isAr} />

          {/* Breathing */}
          <View style={[S.emotionCard, { borderColor: accentColor + "33" }]}>
            <Text style={[S.emotionCardTitle, { color: accentColor }, isAr && S.rtlText]}>
              🫁 {isAr ? emotionPlan.breathingExercise.nameAr : emotionPlan.breathingExercise.nameEn}
            </Text>
            <Text style={[S.emotionCardBody, isAr && S.rtlText]}>
              {isAr ? emotionPlan.breathingExercise.instructionAr : emotionPlan.breathingExercise.instructionEn}
            </Text>
            <Text style={S.emotionCardSub}>
              {emotionPlan.breathingExercise.rounds} {isAr ? "جولات" : "rounds"}
              {" · "}{emotionPlan.meditationMinutes} {isAr ? "دقيقة تأمل" : "min meditation"}
            </Text>
          </View>

          {/* Affirmation */}
          <View style={[S.emotionCard, { borderColor: "#FF6FAE33" }]}>
            <Text style={[S.emotionCardTitle, { color: "#FF6FAE" }, isAr && S.rtlText]}>
              🌸 {isAr ? "تأكيد اليوم" : "Today's Affirmation"}
            </Text>
            <Text style={[S.emotionCardBody, S.italicText, isAr && S.rtlText]}>
              {isAr ? emotionPlan.affirmationAr : emotionPlan.affirmationEn}
            </Text>
          </View>

          {/* Journal prompt */}
          <View style={[S.emotionCard, { borderColor: "#8FD3FF33" }]}>
            <Text style={[S.emotionCardTitle, { color: "#8FD3FF" }, isAr && S.rtlText]}>
              ✍️ {isAr ? "سؤال المجلة" : "Journal Prompt"}
            </Text>
            <Text style={[S.emotionCardBody, isAr && S.rtlText]}>
              {isAr ? emotionPlan.journalPromptAr : emotionPlan.journalPromptEn}
            </Text>
          </View>

          {/* Walk + music */}
          <View style={S.emotionRow}>
            <View style={[S.emotionHalf, { borderColor: "#5BBB8533" }]}>
              <Text style={[S.emotionCardTitle, { color: "#5BBB85" }]}>🚶 {isAr ? "مشي" : "Walk"}</Text>
              <Text style={[S.emotionCardBody, isAr && S.rtlText]}>
                {isAr ? emotionPlan.walkSuggestionAr : emotionPlan.walkSuggestionEn}
              </Text>
            </View>
            <View style={[S.emotionHalf, { borderColor: "#C6A7FF33" }]}>
              <Text style={[S.emotionCardTitle, { color: "#C6A7FF" }]}>🎵 {isAr ? "موسيقى" : "Music"}</Text>
              <Text style={[S.emotionCardBody, isAr && S.rtlText]}>
                {isAr ? emotionPlan.musicMoodAr : emotionPlan.musicMoodEn}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: Math.max(insets.bottom + 80, 120) }} />
    </Animated.ScrollView>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#08080F" },
  content: { paddingHorizontal: 18 },

  loadingWrap:    { flex: 1, backgroundColor: "#08080F", alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText:    { color: "rgba(255,255,255,0.6)", fontSize: 16 },
  retryBtn:       { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 14, paddingHorizontal: 22, paddingVertical: 11, marginTop: 4 },
  retryBtnText:   { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },

  header:      { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, fontWeight: "600", marginTop: 4 },
  refreshBtn:  { padding: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" },

  section:     { marginBottom: 28 },
  sectionTitle:{ fontSize: 17, fontWeight: "700", color: "#FFFFFF", marginBottom: 14 },

  // Score grid
  scoreGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 12 },
  sleepRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 12 },
  sleepLabel:  { fontSize: 13, color: "rgba(255,255,255,0.6)" },
  sleepValue:  { fontSize: 20, fontWeight: "800" },

  // Detail card (for timeline + monthly selection)
  detailCard:  { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  detailTitle: { fontSize: 14, fontWeight: "700" },
  detailBody:  { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  detailSub:   { fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 18 },

  // Hormone card
  hormoneCard:      { borderRadius: 18, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.04)", padding: 16 },
  hormoneHeader:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  hormoneDot:       { width: 10, height: 10, borderRadius: 5 },
  hormoneTitle:     { fontSize: 15, fontWeight: "700", flex: 1 },
  hormoneLevel:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  hormoneLevelText: { fontSize: 11, fontWeight: "700" },
  hormoneDesc:      { fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 20, marginBottom: 12 },
  factChip:         { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, flexDirection: "row", alignItems: "center", gap: 6, maxWidth: 220 },
  factText:         { fontSize: 11, flex: 1 },

  // Monthly
  monthGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  phaseLegend: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  phaseChip:   { flexDirection: "row", alignItems: "center", gap: 5 },
  phaseChipDot:{ width: 8, height: 8, borderRadius: 4 },
  phaseChipText:{ fontSize: 11, color: "rgba(255,255,255,0.45)" },

  // Habit empty state
  emptyHabits: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 24, alignItems: "center", gap: 8, marginBottom: 24 },
  emptyIcon:   { fontSize: 32 },
  emptyTitle:  { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  emptyBody:   { fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 20 },

  // Morning brief entry card
  briefCard:    { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, gap: 12 },
  briefIconWrap:{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  briefTitle:   { fontSize: 15, fontWeight: "700", color: "#FFFFFF", marginBottom: 3 },
  briefSub:     { fontSize: 12, color: "rgba(255,255,255,0.45)" },

  // Cycle predictions
  predRow:     { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, gap: 12 },
  predIcon:    { fontSize: 22 },
  predLabel:   { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  predDesc:    { fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 17 },
  predConf:    { alignItems: "center", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, minWidth: 44 },
  predConfText:{ fontSize: 15, fontWeight: "800" },
  predDays:    { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 },

  // Emotion coach
  emotionCard:     { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  emotionCardTitle:{ fontSize: 13, fontWeight: "700", marginBottom: 8 },
  emotionCardBody: { fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 20 },
  emotionCardSub:  { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 },
  emotionRow:      { flexDirection: "row", gap: 10 },
  emotionHalf:     { flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12, borderWidth: 1 },
  italicText:      { fontStyle: "italic" },

  rtlText: { textAlign: "right", writingDirection: "rtl" },
});
