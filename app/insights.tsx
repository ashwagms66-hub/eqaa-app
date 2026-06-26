import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ArrowLeft, Brain, RefreshCw, Sparkles } from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import { getLastPeriod } from "@/src/storage/cycleStorage";
import { getCycleDay } from "@/src/engine/cycleEngine";
import { getWellnessPhaseForDay, WELLNESS_PHASES } from "@/src/engine/wellnessEngine";
import { useHealthData } from "@/src/services/health/useHealthData";
import { formatLastSynced } from "@/src/services/health/healthService";
import { calculateEqaaScore } from "@/src/services/scoring/scoringService";
import { getInsights, type StoredInsight } from "@/src/services/insights/insightsService";
import { getWorkoutRecommendation, getIntensityLabel } from "@/src/services/recommendations/recommendationService";
import { getDailyCheckIn } from "@/src/storage/checkinStorage";

export default function InsightsScreen() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [cycleDay, setCycleDay] = useState(14);
  const [insights, setInsights] = useState<StoredInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);

  const { metrics, syncing, permissionStatus, isAvailable, requestAndSync, sync } =
    useHealthData();

  useEffect(() => {
    async function load() {
      const [lastPeriod, ci] = await Promise.all([getLastPeriod(), getDailyCheckIn()]);
      if (lastPeriod) setCycleDay(getCycleDay(lastPeriod));
      if (ci) {
        setSymptoms(ci.symptoms ?? []);
        if (typeof ci.energy === "number") setEnergyLevel(ci.energy);
      }
    }
    load();
  }, []);

  const loadInsights = useCallback(async (forceRefresh = false) => {
    setInsightsLoading(true);
    try {
      const data = await getInsights(forceRefresh);
      setInsights(data);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const score = useMemo(
    () =>
      calculateEqaaScore({
        sleepHours: metrics?.sleepHours ?? null,
        steps: metrics?.steps ?? null,
        activeEnergyBurned: metrics?.activeEnergyBurned ?? null,
        cycleDay,
        symptoms,
        hrv: metrics?.hrv ?? null,
        restingHeartRate: metrics?.restingHeartRate ?? null,
        energyLevel: energyLevel !== null ? energyLevel * 10 : null,
      }),
    [metrics, cycleDay, symptoms, energyLevel]
  );

  const phase = useMemo(() => getWellnessPhaseForDay(cycleDay), [cycleDay]);
  const phaseInfo = WELLNESS_PHASES[phase];
  const recommendation = useMemo(() => getWorkoutRecommendation(cycleDay), [cycleDay]);

  const scoreBreakdown = [
    {
      label: isRTL ? "النوم" : "Sleep",
      score: score.sleepScore,
      max: 30,
      icon: "🌙",
      color: "#60A5FA",
    },
    {
      label: isRTL ? "النشاط" : "Activity",
      score: score.activityScore,
      max: 20,
      icon: "🏃",
      color: "#34D399",
    },
    {
      label: isRTL ? "انسجام الدورة" : "Cycle Align",
      score: score.cycleAlignScore,
      max: 20,
      icon: phaseInfo.emoji,
      color: phaseInfo.color,
    },
    {
      label: isRTL ? "الأعراض" : "Symptoms",
      score: score.symptomScore,
      max: 15,
      icon: "💊",
      color: "#F472B6",
    },
    {
      label: isRTL ? "التعافي" : "Recovery",
      score: score.recoveryScore,
      max: 15,
      icon: "❤️",
      color: "#FB923C",
    },
  ];

  return (
    <LinearGradient colors={["#05050A", "#171726", "#24182F"]} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.header, isRTL && { flexDirection: "row-reverse" }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="#fff" size={22} strokeWidth={2.4} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isRTL ? "رؤى إيقاع" : "Eqa'a Insights"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* ── Eqa'a Score Card ── */}
          <View style={[styles.scoreCard, { borderColor: `${score.color}30` }]}>
            <View style={[styles.rowBetween, isRTL && { flexDirection: "row-reverse" }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardSectionLabel, isRTL && { textAlign: "right" }]}>
                  {isRTL ? "نقاط إيقاع اليومية" : "EQAA DAILY SCORE"}
                </Text>
                <View style={[styles.scoreRow, isRTL && { flexDirection: "row-reverse" }]}>
                  <Text style={[styles.scoreNumber, { color: score.color }]}>
                    {score.total}
                  </Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <Text
                  style={[styles.scoreLabel, { color: score.color }, isRTL && { textAlign: "right" }]}
                >
                  {isRTL ? score.labelAr : score.label}
                </Text>
                <Text style={[styles.scoreDesc, isRTL && { textAlign: "right" }]}>
                  {isRTL ? score.descriptionAr : score.description}
                </Text>
              </View>
              <View
                style={[
                  styles.scoreCircle,
                  { backgroundColor: `${score.color}18`, borderColor: `${score.color}40` },
                ]}
              >
                <Text style={[styles.scoreCircleNum, { color: score.color }]}>
                  {score.total}
                </Text>
              </View>
            </View>

            {/* Breakdown bars */}
            <View style={styles.breakdownSection}>
              {scoreBreakdown.map((b) => (
                <View key={b.label} style={styles.breakdownRow}>
                  <View style={[styles.breakdownLeft, isRTL && { flexDirection: "row-reverse" }]}>
                    <Text style={styles.breakdownIcon}>{b.icon}</Text>
                    <Text style={styles.breakdownLabel}>{b.label}</Text>
                  </View>
                  <View style={styles.breakdownBarWrap}>
                    <View style={styles.breakdownBarBg}>
                      <View
                        style={[
                          styles.breakdownBarFill,
                          {
                            width: `${(b.score / b.max) * 100}%`,
                            backgroundColor: b.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={[styles.breakdownScore, { color: b.color }]}>
                    {b.score}/{b.max}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Health Summary ── */}
          <View style={styles.healthCard}>
            <View style={[styles.cardHeaderRow, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={styles.cardSectionLabel}>
                {isRTL ? "ملخص الصحة" : "HEALTH SUMMARY"}
              </Text>
              {isAvailable && (
                <TouchableOpacity
                  onPress={permissionStatus === "granted" ? sync : requestAndSync}
                  style={styles.syncBtn}
                  disabled={syncing}
                >
                  {syncing ? (
                    <ActivityIndicator size="small" color="#C6A7FF" />
                  ) : (
                    <RefreshCw size={16} color="#C6A7FF" strokeWidth={2.4} />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {permissionStatus !== "granted" && isAvailable ? (
              <TouchableOpacity
                style={styles.connectHealthBtn}
                onPress={requestAndSync}
                activeOpacity={0.86}
              >
                <Text style={styles.connectHealthIcon}>❤️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.connectHealthTitle, isRTL && { textAlign: "right" }]}>
                    {isRTL
                      ? "ربط Apple Health / Health Connect"
                      : "Connect Apple Health / Health Connect"}
                  </Text>
                  <Text style={[styles.connectHealthSub, isRTL && { textAlign: "right" }]}>
                    {isRTL
                      ? "اضغطي للسماح بالوصول إلى بيانات الصحة"
                      : "Tap to grant access to health data"}
                  </Text>
                </View>
                <Text style={styles.connectArrow}>{isRTL ? "←" : "→"}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.metricsGrid}>
                  <MetricTile
                    icon="👟"
                    label={isRTL ? "الخطوات" : "Steps"}
                    value={metrics?.steps?.toLocaleString() ?? "—"}
                    isRTL={isRTL}
                  />
                  <MetricTile
                    icon="🌙"
                    label={isRTL ? "النوم" : "Sleep"}
                    value={
                      metrics?.sleepHours != null
                        ? `${metrics.sleepHours}h`
                        : "—"
                    }
                    isRTL={isRTL}
                  />
                  <MetricTile
                    icon="❤️"
                    label={isRTL ? "النبض" : "Heart Rate"}
                    value={metrics?.heartRate != null ? `${metrics.heartRate} bpm` : "—"}
                    isRTL={isRTL}
                  />
                  <MetricTile
                    icon="💓"
                    label={isRTL ? "نبض الراحة" : "Resting HR"}
                    value={
                      metrics?.restingHeartRate != null
                        ? `${metrics.restingHeartRate} bpm`
                        : "—"
                    }
                    isRTL={isRTL}
                  />
                  <MetricTile
                    icon="📉"
                    label="HRV"
                    value={metrics?.hrv != null ? `${metrics.hrv} ms` : "—"}
                    isRTL={isRTL}
                  />
                  <MetricTile
                    icon="🔥"
                    label={isRTL ? "السعرات" : "Calories"}
                    value={
                      metrics?.activeEnergyBurned != null
                        ? `${metrics.activeEnergyBurned} kcal`
                        : "—"
                    }
                    isRTL={isRTL}
                  />
                </View>
                <Text style={[styles.lastSynced, isRTL && { textAlign: "right" }]}>
                  {isRTL ? "آخر مزامنة: " : "Last sync: "}
                  {formatLastSynced(metrics?.lastSynced ?? null, language)}
                </Text>
              </>
            )}
          </View>

          {/* ── Insights Engine ── */}
          <View style={styles.insightsSection}>
            <View style={[styles.cardHeaderRow, isRTL && { flexDirection: "row-reverse" }]}>
              <View style={[styles.insightsTitleRow, isRTL && { flexDirection: "row-reverse" }]}>
                <Brain size={18} color="#C6A7FF" strokeWidth={2.2} />
                <Text style={styles.insightsSectionTitle}>
                  {isRTL ? "رؤى مخصصة" : "Personalized Insights"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => loadInsights(true)}
                style={styles.syncBtn}
                disabled={insightsLoading}
              >
                {insightsLoading ? (
                  <ActivityIndicator size="small" color="#C6A7FF" />
                ) : (
                  <RefreshCw size={16} color="#C6A7FF" strokeWidth={2.4} />
                )}
              </TouchableOpacity>
            </View>

            {insightsLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#C6A7FF" />
                <Text style={styles.loadingText}>
                  {isRTL ? "جارٍ تحليل بياناتك..." : "Analyzing your data..."}
                </Text>
              </View>
            ) : (
              insights.map((insight) => (
                <View key={insight.id} style={styles.insightCard}>
                  <Text style={styles.insightIcon}>{insight.icon}</Text>
                  <Text style={[styles.insightText, isRTL && { textAlign: "right" }]}>
                    {isRTL ? insight.textAr : insight.text}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* ── Fitness Recommendation ── */}
          <View
            style={[
              styles.recommendCard,
              { borderColor: `${recommendation.accentColor}30` },
            ]}
          >
            <View style={[styles.cardHeaderRow, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={styles.cardSectionLabel}>
                {isRTL ? "توصية التمرين" : "FITNESS RECOMMENDATION"}
              </Text>
              <View
                style={[
                  styles.intensityPill,
                  { backgroundColor: `${recommendation.accentColor}20` },
                ]}
              >
                <Text style={[styles.intensityText, { color: recommendation.accentColor }]}>
                  {getIntensityLabel(recommendation.intensity, language)}
                </Text>
              </View>
            </View>

            <View style={[styles.recommendHeader, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={styles.recommendIcon}>{recommendation.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recommendTitle, isRTL && { textAlign: "right" }]}>
                  {isRTL ? recommendation.titleAr : recommendation.title}
                </Text>
                <Text style={[styles.recommendSub, isRTL && { textAlign: "right" }]}>
                  {isRTL ? recommendation.subtitleAr : recommendation.subtitle}
                </Text>
              </View>
            </View>

            <Text style={[styles.recommendDesc, isRTL && { textAlign: "right" }]}>
              {isRTL ? recommendation.descriptionAr : recommendation.description}
            </Text>

            <View style={styles.workoutList}>
              {recommendation.workouts.map((w, idx) => (
                <View
                  key={idx}
                  style={[styles.workoutRow, isRTL && { flexDirection: "row-reverse" }]}
                >
                  <View
                    style={[
                      styles.workoutDot,
                      { backgroundColor: recommendation.accentColor },
                    ]}
                  />
                  <Text style={styles.workoutName}>
                    {isRTL ? w.nameAr : w.name}
                  </Text>
                  <Text style={styles.workoutDuration}>
                    {isRTL ? w.durationAr : w.duration}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.tipBox,
                { backgroundColor: `${recommendation.accentColor}12` },
              ]}
            >
              <Text style={styles.tipEmoji}>💡</Text>
              <Text style={[styles.tipText, isRTL && { textAlign: "right" }]}>
                {isRTL ? recommendation.tipAr : recommendation.tip}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetricTile({
  icon,
  label,
  value,
  isRTL,
}: {
  icon: string;
  label: string;
  value: string;
  isRTL: boolean;
}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={[styles.metricLabel, isRTL && { textAlign: "center" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 20,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },

  // Score Card
  scoreCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
  },

  cardSectionLabel: {
    color: "#C6A7FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },

  scoreNumber: {
    fontSize: 52,
    fontWeight: "900",
  },

  scoreMax: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 18,
    fontWeight: "700",
  },

  scoreLabel: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },

  scoreDesc: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
    lineHeight: 20,
  },

  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  scoreCircleNum: {
    fontSize: 24,
    fontWeight: "900",
  },

  breakdownSection: {
    marginTop: 22,
    gap: 12,
  },

  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 100,
  },

  breakdownIcon: { fontSize: 14 },

  breakdownLabel: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 12,
    fontWeight: "600",
  },

  breakdownBarWrap: { flex: 1 },

  breakdownBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 4,
    overflow: "hidden",
  },

  breakdownBarFill: {
    height: 6,
    borderRadius: 4,
  },

  breakdownScore: {
    fontSize: 12,
    fontWeight: "700",
    width: 38,
    textAlign: "right",
  },

  // Health Card
  healthCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 28,
    padding: 22,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  syncBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(198,167,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  connectHealthBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(198,167,255,0.10)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.20)",
  },

  connectHealthIcon: { fontSize: 28 },

  connectHealthTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  connectHealthSub: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
    marginTop: 2,
  },

  connectArrow: {
    color: "#C6A7FF",
    fontSize: 18,
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  metricTile: {
    width: "30%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 4,
    flexGrow: 1,
  },

  metricIcon: { fontSize: 20 },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  metricLabel: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 11,
    fontWeight: "600",
  },

  lastSynced: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    marginTop: 14,
    fontWeight: "500",
  },

  // Insights
  insightsSection: {
    backgroundColor: "rgba(198,167,255,0.07)",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.15)",
  },

  insightsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  insightsSectionTitle: {
    color: "#C6A7FF",
    fontSize: 15,
    fontWeight: "800",
  },

  loadingBox: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },

  loadingText: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 14,
  },

  insightCard: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    alignItems: "flex-start",
  },

  insightIcon: { fontSize: 22, marginTop: 1 },

  insightText: {
    flex: 1,
    color: "rgba(255,255,255,0.80)",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
  },

  // Recommendation Card
  recommendCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
  },

  intensityPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  intensityText: {
    fontSize: 11,
    fontWeight: "800",
  },

  recommendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },

  recommendIcon: { fontSize: 36 },

  recommendTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  recommendSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginTop: 3,
  },

  recommendDesc: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 18,
  },

  workoutList: { gap: 12 },

  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  workoutDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  workoutName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  workoutDuration: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
  },

  tipBox: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginTop: 18,
    alignItems: "flex-start",
  },

  tipEmoji: { fontSize: 16 },

  tipText: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "500",
  },
});
