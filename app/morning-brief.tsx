import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, Droplets, Moon, Utensils, Clock, Zap, Target, BookOpen, Heart, AlertCircle } from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import { getCycleDay } from "@/src/engine/cycleEngine";
import { getLastPeriod, getCycleLength } from "@/src/storage/cycleStorage";
import { getDailyCheckIn, getRecentCheckIns } from "@/src/storage/checkinStorage";
import type { DailyCheckIn } from "@/src/storage/checkinStorage";
import { getCachedHealthMetrics } from "@/src/services/health/healthService";
import { getRecentWorkoutSessions } from "@/src/services/workouts/workoutStorage";

import {
  computeUnifiedReadiness,
} from "@/src/services/readiness";

import { getDailyBrief } from "@/src/services/daily-brief";
import type { DailyBrief, DailyWidget, CyclePrediction } from "@/src/services/daily-brief";

// ── Helpers ───────────────────────────────────────────────────────────────────

type CyclePhaseKey = "menstrual" | "power" | "manifestation" | "secondPower" | "reset";

function toCyclePhaseKey(cycleDay: number): CyclePhaseKey {
  const d = ((cycleDay - 1) % 28) + 1;
  if (d <= 5)  return "menstrual";
  if (d <= 10) return "power";
  if (d <= 15) return "manifestation";
  if (d <= 19) return "secondPower";
  return "reset";
}

function mean(arr: number[]): number | null {
  if (!arr.length) return null;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function formatHour(h: number): string {
  const suffix = h < 12 ? "AM" : "PM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

function greetingText(isAr: boolean): string {
  const hour = new Date().getHours();
  if (hour < 12) return isAr ? "صباح الخير" : "Good Morning";
  if (hour < 17) return isAr ? "مساء النور" : "Good Afternoon";
  return isAr ? "مساء الخير" : "Good Evening";
}

function phaseHormoneStatus(phaseKey: CyclePhaseKey): { en: string; ar: string } {
  const map: Record<CyclePhaseKey, { en: string; ar: string }> = {
    menstrual:     { en: "Low — rest & restore",     ar: "منخفض — استراحة واستعادة" },
    power:         { en: "Rising — build & grow",    ar: "صاعد — بناء ونمو" },
    manifestation: { en: "Peak — lead & create",     ar: "ذروة — قيادة وإبداع" },
    secondPower:   { en: "Balanced — focus & refine",ar: "متوازن — تركيز وتحسين" },
    reset:         { en: "Declining — slow & nurture",ar: "هابط — تباطؤ ورعاية" },
  };
  return map[phaseKey];
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionCard = React.memo(function SectionCard({
  children, style,
}: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
});

const WidgetCard = React.memo(function WidgetCard({
  widget, isAr,
}: { widget: DailyWidget; isAr: boolean }) {
  const ICONS: Record<string, React.ReactNode> = {
    focus:     <Target size={18} color={widget.accentColor} />,
    challenge: <Zap size={18} color={widget.accentColor} />,
    win:       <Heart size={18} color={widget.accentColor} />,
    tomorrow:  <BookOpen size={18} color={widget.accentColor} />,
  };
  return (
    <View style={[styles.widgetCard, { borderColor: widget.accentColor + "33" }]}>
      <View style={styles.widgetHeader}>
        {ICONS[widget.type]}
        <Text style={[styles.widgetTitle, { color: widget.accentColor }]}>
          {isAr ? widget.titleAr : widget.titleEn}
        </Text>
      </View>
      <Text style={[styles.widgetContent, { textAlign: isAr ? "right" : "left" }]}>
        {isAr ? widget.contentAr : widget.contentEn}
      </Text>
    </View>
  );
});

const MealRow = React.memo(function MealRow({
  label, meal, isAr,
}: {
  label: string;
  meal: { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string; calories: number; proteinG: number };
  isAr: boolean;
}) {
  return (
    <View style={styles.mealRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.mealLabel, { textAlign: isAr ? "right" : "left" }]}>{label}</Text>
        <Text style={[styles.mealName, { textAlign: isAr ? "right" : "left" }]}>
          {isAr ? meal.nameAr : meal.nameEn}
        </Text>
        <Text style={[styles.mealDesc, { textAlign: isAr ? "right" : "left" }]}>
          {isAr ? meal.descriptionAr : meal.descriptionEn}
        </Text>
      </View>
      <View style={styles.macroBox}>
        <Text style={styles.macroVal}>{meal.calories}</Text>
        <Text style={styles.macroUnit}>kcal</Text>
        <Text style={styles.macroVal}>{meal.proteinG}g</Text>
        <Text style={styles.macroUnit}>protein</Text>
      </View>
    </View>
  );
});

const PredictionChip = React.memo(function PredictionChip({
  p, isAr,
}: { p: CyclePrediction; isAr: boolean }) {
  return (
    <View style={[styles.predChip, { borderColor: p.accentColor + "44" }]}>
      <Text style={styles.predIcon}>{p.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.predLabel, { color: p.accentColor, textAlign: isAr ? "right" : "left" }]}>
          {isAr ? p.labelAr : p.labelEn}
        </Text>
        <Text style={[styles.predDays, { textAlign: isAr ? "right" : "left" }]}>
          {p.daysFromNow === 0
            ? (isAr ? "اليوم" : "Today")
            : p.daysFromNow === 1
            ? (isAr ? "غداً" : "Tomorrow")
            : (isAr ? `خلال ${p.daysFromNow} أيام` : `In ${p.daysFromNow} days`)}
          {" · "}{p.confidence}%
        </Text>
      </View>
    </View>
  );
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function MorningBriefScreen() {
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAr = language === "ar";

  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      const [lastPeriod, cycleLength, health, workoutSessions, checkIn, recentCheckIns, yesterdayCheckIn] =
        await Promise.all([
          getLastPeriod(),
          getCycleLength(),
          getCachedHealthMetrics(),
          getRecentWorkoutSessions(7),
          getDailyCheckIn(today),
          getRecentCheckIns(7),
          getDailyCheckIn(yesterday),
        ]);

      const cycleDay = lastPeriod ? getCycleDay(lastPeriod) : 14;
      const phaseKey = toCyclePhaseKey(cycleDay);
      const expLen = cycleLength ?? 28;

      // Compute real readiness score
      const sleeps   = recentCheckIns.map((c: DailyCheckIn) => c.sleepHours).filter((v): v is number => v !== undefined);
      const energies = recentCheckIns.map((c: DailyCheckIn) => c.energy).filter((v): v is number => v !== undefined);

      let consecutiveLowEnergy = 0;
      for (const c of [...recentCheckIns].reverse()) {
        if ((c.energy ?? 5) <= 4) consecutiveLowEnergy++;
        else break;
      }
      let consecutivePoorSleep = 0;
      for (const c of [...recentCheckIns].reverse()) {
        if ((c.sleepHours ?? 7) < 6) consecutivePoorSleep++;
        else break;
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const weekSessions = workoutSessions.filter(
        (s) => new Date(s.startedAt) >= sevenDaysAgo && s.status === "completed"
      );
      const lastSession = weekSessions[0];
      type Intensity = "heavy" | "moderate" | "light" | "none";
      let lastWorkoutIntensity: Intensity = "none";
      if (lastSession) {
        const dur = lastSession.durationMinutes ?? 0;
        if (dur >= 60) lastWorkoutIntensity = "heavy";
        else if (dur >= 30) lastWorkoutIntensity = "moderate";
        else lastWorkoutIntensity = "light";
      }

      const readinessResult = computeUnifiedReadiness({
        cycleDay,
        phaseKey,
        expectedCycleLength: expLen,
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
        workoutDaysLast7:         weekSessions.length,
        lastWorkoutIntensity,
        consecutiveLowEnergyDays: consecutiveLowEnergy,
        consecutivePoorSleepDays: consecutivePoorSleep,
      });

      const hormoneStatus = phaseHormoneStatus(phaseKey);

      const result = await getDailyBrief({
        cycleDay,
        phaseKey,
        readinessScore:  readinessResult.score,
        energyScore:     checkIn?.energy ? checkIn.energy * 10 : 65,
        hormoneStatusEn: hormoneStatus.en,
        hormoneStatusAr: hormoneStatus.ar,
        sleepHours:      checkIn?.sleepHours ?? null,
        workoutToday:    weekSessions.some((s) => {
          const d = new Date(s.startedAt).toISOString().split("T")[0];
          return d === today;
        }),
        fastingHours:    null,
        waterGoalBase:   2.0,
        weightKg:        checkIn?.weight ?? null,
        symptoms:        checkIn?.symptoms ?? [],
        todayMood:       checkIn?.mood ?? null,
        yesterdayMood:   (yesterdayCheckIn as DailyCheckIn | null)?.mood ?? null,
        yesterdayEnergy: (yesterdayCheckIn as DailyCheckIn | null)?.energy
          ? ((yesterdayCheckIn as DailyCheckIn).energy! * 10)
          : null,
        yesterdaySleep:  (yesterdayCheckIn as DailyCheckIn | null)?.sleepHours ?? null,
      });

      setBrief(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ChevronIcon = isAr ? ChevronRight : ChevronLeft;
  const topPad = insets.top + 12;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: topPad }]}>
        <ActivityIndicator color="#C6A7FF" size="large" />
        <Text style={styles.loadingText}>{isAr ? "جارٍ التحضير..." : "Preparing your brief..."}</Text>
      </View>
    );
  }

  if (error || !brief) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: topPad }]}>
        <AlertCircle size={36} color="#FF6FAE" />
        <Text style={styles.errorText}>{isAr ? "تعذّر تحميل الملخص" : "Couldn't load brief"}</Text>
        <Pressable onPress={load} style={styles.retryBtn}>
          <Text style={styles.retryText}>{isAr ? "إعادة المحاولة" : "Try Again"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: topPad }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, isAr && styles.rowReverse]}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <ChevronIcon size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { textAlign: isAr ? "right" : "left" }]}>
            {greetingText(isAr)} ✨
          </Text>
          <Text style={[styles.headerDate, { textAlign: isAr ? "right" : "left" }]}>
            {new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
        </View>
      </View>

      {/* Motivational sentence */}
      <SectionCard style={styles.motivCard}>
        <Text style={[styles.motivText, { textAlign: isAr ? "right" : "left" }]}>
          {isAr ? brief.motivationalAr : brief.motivationalEn}
        </Text>
      </SectionCard>

      {/* Readiness + goals strip */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { borderColor: "#C6A7FF44" }]}>
          <Text style={[styles.statVal, { color: "#C6A7FF" }]}>{brief.readinessScore}</Text>
          <Text style={styles.statLbl}>{isAr ? brief.readinessLabelAr : brief.readinessLabelEn}</Text>
        </View>
        <View style={[styles.statBox, { borderColor: "#5BBB8544" }]}>
          <Droplets size={18} color="#5BBB85" />
          <Text style={[styles.statVal, { color: "#5BBB85" }]}>{brief.waterGoalLiters}L</Text>
          <Text style={styles.statLbl}>{isAr ? "الماء" : "Water"}</Text>
        </View>
        <View style={[styles.statBox, { borderColor: "#8FD3FF44" }]}>
          <Moon size={18} color="#8FD3FF" />
          <Text style={[styles.statVal, { color: "#8FD3FF" }]}>{brief.sleepGoalHours}h</Text>
          <Text style={styles.statLbl}>{isAr ? "النوم" : "Sleep"}</Text>
        </View>
      </View>

      {/* Best time windows */}
      <SectionCard>
        <Text style={[styles.sectionTitle, { textAlign: isAr ? "right" : "left" }]}>
          {isAr ? "أفضل أوقاتكِ اليوم" : "Your Best Windows Today"}
        </Text>
        {[
          { icon: <Target size={15} color="#F59E0B" />, color: "#F59E0B", label: isAr ? "عمل عميق" : "Deep Work", tw: brief.bestWorkWindow },
          { icon: <BookOpen size={15} color="#5BBB85" />, color: "#5BBB85", label: isAr ? "تعلم" : "Learning", tw: brief.bestStudyWindow },
          { icon: <Zap size={15} color="#FF6FAE" />, color: "#FF6FAE", label: isAr ? "تمرين" : "Workout", tw: brief.bestWorkoutWindow },
        ].map((item) => (
          <View key={item.label} style={styles.twRow}>
            {item.icon}
            <Text style={[styles.twLabel, { color: item.color }]}>{item.label}</Text>
            <Text style={styles.twTime}>
              {formatHour(item.tw.startHour)} – {formatHour(item.tw.endHour)}
            </Text>
          </View>
        ))}
      </SectionCard>

      {/* Fasting window */}
      <SectionCard>
        <View style={styles.rowBetween}>
          <Clock size={18} color="#8FD3FF" />
          <Text style={[styles.sectionTitle, { flex: 1, marginLeft: isAr ? 0 : 8, marginRight: isAr ? 8 : 0, marginBottom: 0, textAlign: isAr ? "right" : "left" }]}>
            {isAr ? "نافذة الصيام" : "Fasting Window"}
          </Text>
          <Text style={styles.fastingBadge}>{brief.fastingWindow.hoursTotal}h</Text>
        </View>
        <Text style={[styles.fastingTime, { textAlign: isAr ? "right" : "left" }]}>
          {formatHour(brief.fastingWindow.startHour)} → {formatHour(brief.fastingWindow.endHour)}
        </Text>
      </SectionCard>

      {/* Meals */}
      <SectionCard>
        <View style={styles.rowBetween}>
          <Utensils size={18} color="#F59E0B" />
          <Text style={[styles.sectionTitle, { flex: 1, marginLeft: isAr ? 0 : 8, marginRight: isAr ? 8 : 0, marginBottom: 0 }]}>
            {isAr ? "خطة وجباتكِ" : "Your Meal Plan"}
          </Text>
          <Text style={styles.calBadge}>{brief.meals.totalCalories} kcal</Text>
        </View>
        <MealRow label={isAr ? "الفطور" : "Breakfast"} meal={brief.meals.breakfast} isAr={isAr} />
        <MealRow label={isAr ? "الغداء" : "Lunch"}     meal={brief.meals.lunch}     isAr={isAr} />
        <MealRow label={isAr ? "العشاء" : "Dinner"}    meal={brief.meals.dinner}    isAr={isAr} />
        <MealRow label={isAr ? "سناك"   : "Snack"}     meal={brief.meals.snack}     isAr={isAr} />
        <View style={styles.macroTotals}>
          {[
            { lbl: "P", val: brief.meals.totalProteinG, color: "#5BBB85" },
            { lbl: "C", val: brief.meals.totalCarbsG,   color: "#F59E0B" },
            { lbl: "F", val: brief.meals.totalFatG,     color: "#C6A7FF" },
          ].map((m) => (
            <View key={m.lbl} style={styles.macroTotal}>
              <Text style={[styles.macroTotalVal, { color: m.color }]}>{m.val}g</Text>
              <Text style={styles.macroTotalLbl}>{m.lbl}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Daily widgets */}
      <Text style={[styles.sectionTitle, styles.standaloneTitle, { textAlign: isAr ? "right" : "left" }]}>
        {isAr ? "بطاقات اليوم" : "Today's Cards"}
      </Text>
      {brief.widgets.map((w) => (
        <WidgetCard key={w.type} widget={w} isAr={isAr} />
      ))}

      {/* Affirmation */}
      <SectionCard style={styles.affirmCard}>
        <Text style={styles.affirmEmoji}>🌸</Text>
        <Text style={[styles.affirmText, { textAlign: isAr ? "right" : "left" }]}>
          {isAr ? brief.emotionPlan.affirmationAr : brief.emotionPlan.affirmationEn}
        </Text>
      </SectionCard>

      {/* Cycle predictions */}
      {brief.predictions.length > 0 && (
        <SectionCard>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? "right" : "left" }]}>
            {isAr ? "توقعات الدورة القادمة" : "Upcoming Cycle Events"}
          </Text>
          {brief.predictions.map((p) => (
            <PredictionChip key={p.eventType + p.date} p={p} isAr={isAr} />
          ))}
        </SectionCard>
      )}

      {/* Insights: today vs yesterday */}
      {brief.insightTimeline.changes.length > 0 && (
        <SectionCard>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? "right" : "left" }]}>
            {isAr ? "اليوم مقارنةً بالأمس" : "Today vs Yesterday"}
          </Text>
          <Text style={[styles.insightSummary, { textAlign: isAr ? "right" : "left" }]}>
            {isAr ? brief.insightTimeline.summaryAr : brief.insightTimeline.summaryEn}
          </Text>
          {brief.insightTimeline.changes.map((ch) => (
            <View key={ch.metric} style={styles.insightRow}>
              <Text style={styles.insightIcon}>{ch.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightExpl, { color: ch.color, textAlign: isAr ? "right" : "left" }]}>
                  {isAr ? ch.explanationAr : ch.explanationEn}
                </Text>
                <Text style={[styles.insightVals, { textAlign: isAr ? "right" : "left" }]}>
                  {isAr
                    ? `${ch.previousValueAr} → ${ch.currentValueAr}`
                    : `${ch.previousValueEn} → ${ch.currentValueEn}`}
                </Text>
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      <View style={{ height: Math.max(insets.bottom + 40, 60) }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#08080F" },
  content: { paddingHorizontal: 18 },
  loadingContainer: { flex: 1, backgroundColor: "#08080F", alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  errorText:   { color: "#FF6FAE", fontSize: 15, fontWeight: "600" },
  retryBtn:    { marginTop: 8, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  retryText:   { color: "#fff", fontWeight: "700" },

  header:     { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12 },
  rowReverse: { flexDirection: "row-reverse" },
  backBtn:    { width: 36, height: 36, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18 },
  greeting:   { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  headerDate: { color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 2 },

  card:      { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  motivCard: { borderColor: "#C6A7FF33" },
  motivText: { color: "#E2D4FF", fontSize: 15, lineHeight: 24, fontStyle: "italic", fontWeight: "600" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statBox:  { flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, gap: 4 },
  statVal:  { fontSize: 20, fontWeight: "800" },
  statLbl:  { color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: "600" },

  sectionTitle:    { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  standaloneTitle: { marginBottom: 10, marginTop: 4 },

  twRow:   { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", gap: 8 },
  twLabel: { fontSize: 13, fontWeight: "600", flex: 1 },
  twTime:  { color: "rgba(255,255,255,0.55)", fontSize: 12 },

  rowBetween:   { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  fastingBadge: { backgroundColor: "#8FD3FF22", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, color: "#8FD3FF", fontSize: 13, fontWeight: "700" },
  fastingTime:  { color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: "600", marginTop: 4 },

  calBadge: { backgroundColor: "#F59E0B22", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, color: "#F59E0B", fontSize: 13, fontWeight: "700" },

  mealRow:   { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", gap: 10 },
  mealLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 },
  mealName:  { color: "#fff", fontSize: 14, fontWeight: "700" },
  mealDesc:  { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2, lineHeight: 17 },
  macroBox:  { alignItems: "center", minWidth: 54 },
  macroVal:  { color: "#fff", fontSize: 14, fontWeight: "700" },
  macroUnit: { color: "rgba(255,255,255,0.35)", fontSize: 10 },

  macroTotals:   { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  macroTotal:    { alignItems: "center", gap: 2 },
  macroTotalVal: { fontSize: 16, fontWeight: "800" },
  macroTotalLbl: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "600" },

  widgetCard:    { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1 },
  widgetHeader:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  widgetTitle:   { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  widgetContent: { color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 22 },

  affirmCard:  { borderColor: "#FF6FAE33", alignItems: "center", gap: 12 },
  affirmEmoji: { fontSize: 28 },
  affirmText:  { color: "#FFD1E8", fontSize: 15, lineHeight: 24, fontStyle: "italic", fontWeight: "600" },

  predChip:  { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  predIcon:  { fontSize: 20, marginTop: 1 },
  predLabel: { fontSize: 14, fontWeight: "700" },
  predDays:  { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },

  insightSummary: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 20, marginBottom: 12, marginTop: -4 },
  insightRow:     { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  insightIcon:    { fontSize: 18, marginTop: 1 },
  insightExpl:    { fontSize: 13, fontWeight: "600", lineHeight: 19 },
  insightVals:    { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 3 },
});
