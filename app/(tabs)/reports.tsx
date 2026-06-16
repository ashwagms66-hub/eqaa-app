import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { useLanguage } from "@/src/context/LanguageContext";
import {
  getCycleDay,
  getCycleInsight,
  getCurrentPhase,
  getPhaseTheme,
} from "@/src/engine/cycleEngine";
import { getCyclePhase } from "@/src/engine/wellnessEngine";
import { FASTING_PHASES, getFastingPhase } from "@/src/data/fastingData";
import { getAllCheckIns } from "@/src/storage/checkinStorage";
import { getCycleLength, getLastPeriod } from "@/src/storage/cycleStorage";
import {
  getCalories,
  getGoalWeight,
  getGoals,
  getLifeMode,
  getWeight,
} from "@/src/storage/profileStorage";
import {
  getCompletionRate,
  getFastingHistory,
} from "@/src/utils/fastingAnalytics";
import { generateInsights, InsightBundle } from "@/src/engine/insightsEngine";
import { generatePredictions, PredictionBundle } from "@/src/engine/predictionsEngine";
import { generateNotifications, SmartNotification } from "@/src/engine/notificationEngine";

// ── helpers ───────────────────────────────────────────────────────────────────

function secToHHMM(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function weekStartMs(): number {
  return Date.now() - 7 * 24 * 60 * 60 * 1000;
}

function weekStartStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().split("T")[0];
}

function calcMacros(kcal: number, mode: string) {
  const s: Record<string, { p: number; c: number; f: number }> = {
    pcos:       { p: 0.34, c: 0.38, f: 0.28 },
    pregnancy:  { p: 0.30, c: 0.45, f: 0.25 },
    postpartum: { p: 0.32, c: 0.43, f: 0.25 },
    moon:       { p: 0.28, c: 0.47, f: 0.25 },
  };
  const r = s[mode] ?? { p: 0.30, c: 0.40, f: 0.30 };
  return {
    protein: Math.round((kcal * r.p) / 4),
    carbs:   Math.round((kcal * r.c) / 4),
    fat:     Math.round((kcal * r.f) / 9),
  };
}

// ── TrendRow ──────────────────────────────────────────────────────────────────

function TrendRow({
  icon, label, value, pct, barColor, isAr,
}: {
  icon: string; label: string; value: string;
  pct: number | null; barColor: string; isAr: boolean;
}) {
  return (
    <View style={tr.wrap}>
      <View style={[tr.row, isAr && { flexDirection: "row-reverse" }]}>
        <Text style={tr.icon}>{icon}</Text>
        <Text style={[tr.label, isAr && { textAlign: "right" }]}>{label}</Text>
        <Text style={[tr.val, { color: barColor }]}>{value}</Text>
      </View>
      {pct !== null && (
        <View style={tr.track}>
          <View style={[tr.fill, { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: barColor }]} />
        </View>
      )}
    </View>
  );
}

const tr = StyleSheet.create({
  wrap:  { gap: 7, paddingVertical: 11, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  row:   { flexDirection: "row", alignItems: "center", gap: 10 },
  icon:  { fontSize: 16, width: 22, textAlign: "center" },
  label: { flex: 1, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: "600" },
  val:   { fontSize: 14, fontWeight: "800" },
  track: { height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" },
  fill:  { height: 4, borderRadius: 999 },
});

// ── phase recommendation lookup (canonical phase keys) ────────────────────────

const PHASE_RECS: Record<string, { actAr: string; actEn: string; recAr: string; recEn: string; foodAr: string; foodEn: string }> = {
  menstrual: {
    actAr:  "مشي خفيف أو تمدد — الراحة هي إنجازك الأول اليوم",
    actEn:  "Gentle walks or stretching — rest is your top achievement today",
    recAr:  "نوم مبكر، وتدفئة الجسم، وتقليل الضغوط بالكامل",
    recEn:  "Early sleep, body warmth, and full stress reduction",
    foodAr: "حديد + مغنيسيوم + شاي زنجبيل دافئ لتخفيف التقلصات",
    foodEn: "Iron + magnesium + warm ginger tea to ease cramps",
  },
  renewal: {
    actAr:  "تمارين قوة خفيفة ومشي — جسمك يبني طاقته من جديد",
    actEn:  "Light strength and walking — your body is rebuilding energy",
    recAr:  "نوم 7–8 ساعات يدعم بناء الطاقة وتجديد خلاياك",
    recEn:  "7–8h sleep supports energy building and cell renewal",
    foodAr: "بروتين معتدل + حديد + خضروات داعمة للتجديد",
    foodEn: "Moderate protein + iron + renewal-supporting vegetables",
  },
  power: {
    actAr:  "تمارين القوة والأثقال — جسمك في ذروة طاقته",
    actEn:  "Strength training — your body is at peak energy",
    recAr:  "نوم 7–8 ساعات يدعم بناء العضلات واستمرار الطاقة",
    recEn:  "7–8h sleep maintains peak muscle building and energy",
    foodAr: "بروتين عالٍ + كارب معتدل + خضروات داعمة للطاقة",
    foodEn: "High protein + moderate carbs + energy-supporting vegetables",
  },
  clarity: {
    actAr:  "بيلاتس أو مشي أو تمارين مرونة معتدلة",
    actEn:  "Pilates, walking, or moderate flexibility training",
    recAr:  "جسمك يحتاج تعافياً أعمق — جودة النوم تدعم الوضوح الذهني",
    recEn:  "Deeper recovery supports mental clarity this week",
    foodAr: "وجبات دافئة ومغذية تدعم التوازن الهرموني",
    foodEn: "Warm nourishing meals to support hormonal balance",
  },
  calm: {
    actAr:  "يوغا أو مشي هادئ — الراحة تدعمك أكثر من الشدة",
    actEn:  "Yoga or gentle walks — rest supports you more than intensity",
    recAr:  "نوم مبكر وتدفئة الجسم وتنفس عميق للاسترخاء",
    recEn:  "Early sleep, body warmth, and deep breathing for relaxation",
    foodAr: "مغنيسيوم + وجبات دافئة + شاي مهدئ",
    foodEn: "Magnesium + warm meals + calming herbal tea",
  },
};

// ── main ──────────────────────────────────────────────────────────────────────

export default function ReportsScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [cycleDay,    setCycleDay]    = useState(1);
  const [cycleLength, setCycleLength] = useState(28);
  const [hasPeriod,   setHasPeriod]   = useState(false);

  // fasting — real records only
  const [fastTotal,    setFastTotal]    = useState(0);
  const [lastFastSec,  setLastFastSec]  = useState(0);
  const [weekAvgSec,   setWeekAvgSec]   = useState(0);
  const [fastRate,     setFastRate]     = useState(0);

  // check-ins
  const [topMood,      setTopMood]      = useState<string | null>(null);
  const [topMoodCount, setTopMoodCount] = useState(0);
  const [avgEnergy,    setAvgEnergy]    = useState(0);
  const [avgSleep,     setAvgSleep]     = useState(7);
  const [checkInCount, setCheckInCount] = useState(0);

  // profile
  const [calories,   setCalories]   = useState(1900);
  const [lifeMode,   setLifeMode]   = useState("regular");
  const [weight,     setWeight]     = useState<number | null>(null);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [goals,      setGoals]      = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [
          lastPeriod, cycleLen,
          hist,
          checkIns,
          cals, lm, w, gw, gl,
        ] = await Promise.all([
          getLastPeriod(), getCycleLength(),
          getFastingHistory(),
          getAllCheckIns(),
          getCalories(), getLifeMode(), getWeight(), getGoalWeight(), getGoals(),
        ]);

        const cl = cycleLen ?? 28;
        setCycleLength(cl);
        let currentDay = 1;
        if (lastPeriod) {
          currentDay = getCycleDay(lastPeriod, cl);
          setCycleDay(currentDay);
          setHasPeriod(true);
        }

        // fasting — only use what's recorded
        setFastTotal(hist.length);
        if (hist.length > 0) {
          setLastFastSec(hist[hist.length - 1].durationSec);

          const sevenAgo = weekStartMs();
          const wkRecs = hist.filter((r) => r.startTime >= sevenAgo);
          if (wkRecs.length > 0) {
            const sum = wkRecs.reduce((s, r) => s + r.durationSec, 0);
            setWeekAvgSec(Math.round(sum / wkRecs.length));
          }

          const fpKeyNow = getFastingPhase(currentDay);
          const minH = FASTING_PHASES[fpKeyNow].fastingHoursMin;
          setFastRate(await getCompletionRate(minH));
        }

        // check-ins
        const ws = weekStartStr();
        const wk = Object.values(checkIns).filter((c) => c.date >= ws);
        const moodMap: Record<string, number> = {};
        wk.forEach((c) => { if (c.mood) moodMap[c.mood] = (moodMap[c.mood] ?? 0) + 1; });
        const top = Object.entries(moodMap).sort((a, b) => b[1] - a[1])[0];
        setTopMood(top?.[0] ?? null);
        setTopMoodCount(top?.[1] ?? 0);
        const engs = wk.map((c) => c.energy).filter((e): e is number => typeof e === "number");
        if (engs.length) setAvgEnergy(Math.round(engs.reduce((s, e) => s + e, 0) / engs.length));
        const sleeps = wk.map((c) => c.sleepHours).filter((h): h is number => typeof h === "number");
        if (sleeps.length) setAvgSleep(Math.round((sleeps.reduce((s, h) => s + h, 0) / sleeps.length) * 10) / 10);
        setCheckInCount(wk.length);

        setCalories(cals ?? 1900);
        setLifeMode(lm ?? "regular");
        setWeight(w ?? null);
        setGoalWeight(gw ?? null);
        setGoals(gl ?? []);
      }
      load();
    }, [])
  );

  // computed
  const phase      = useMemo(() => getCurrentPhase(cycleDay), [cycleDay]);
  const pTheme     = useMemo(() => getPhaseTheme(cycleDay),   [cycleDay]);
  const wellness   = useMemo(() => getCyclePhase(cycleDay, avgSleep, 6000, avgEnergy > 0 ? avgEnergy : undefined), [cycleDay, avgSleep, avgEnergy]);
  const fpKey      = useMemo(() => getFastingPhase(cycleDay), [cycleDay]);
  const insight    = useMemo(() => getCycleInsight(cycleDay, isAr ? "ar" : "en"), [cycleDay, isAr]);
  const phaseColor = pTheme.accent ?? "#C6A7FF";
  const readiness  = Math.min(100, Math.max(0, Math.round(wellness.readiness)));
  const macros     = useMemo(() => calcMacros(calories, lifeMode), [calories, lifeMode]);
  const daysLeft   = Math.max(0, cycleLength - cycleDay);
  const isRegular  = hasPeriod ? cycleLength >= 26 && cycleLength <= 32 : null;

  const weekAvgH = weekAvgSec > 0 ? weekAvgSec / 3600 : 0;

  const cyclePhaseKey = useMemo(() => {
    if (cycleDay <= 5)  return "menstrual";
    if (cycleDay <= 10) return "renewal";
    if (cycleDay <= 15) return "power";
    if (cycleDay <= 19) return "clarity";
    return "calm";
  }, [cycleDay]);

  const rec = useMemo(() => PHASE_RECS[cyclePhaseKey] ?? PHASE_RECS.power, [cyclePhaseKey]);

  const weightDiff = weight !== null && goalWeight !== null
    ? Math.abs(weight - goalWeight) : null;

  const goalForEngine = goals.includes("loss") ? "lose" : goals.includes("gain") ? "gain" : "maintain";

  const predictions = useMemo<PredictionBundle>(() => generatePredictions(
    cycleDay,
    cycleLength,
    hasPeriod,
    goalForEngine,
    {
      sessions:         fastTotal,
      adherence:        fastRate,
      weekAvgHours:     weekAvgH,
      fastingHoursMin:  FASTING_PHASES[fpKey].fastingHoursMin,
      fastingHoursMax:  FASTING_PHASES[fpKey].fastingHoursMax,
    },
    { weight, goalWeight },
    isAr ? "ar" : "en"
  ), [cycleDay, cycleLength, hasPeriod, goalForEngine, fastTotal, fastRate, weekAvgH, fpKey, weight, goalWeight, isAr]);

  const insights = useMemo<InsightBundle>(() => generateInsights(
    cycleDay,
    readiness,
    hasPeriod,
    goalForEngine,
    { adherence: fastRate, avgHours: weekAvgH, sessions: fastTotal },
    { protein: macros.protein, targetCalories: calories },
    isAr ? "ar" : "en"
  ), [cycleDay, readiness, hasPeriod, goalForEngine, fastRate, weekAvgH, fastTotal, macros.protein, calories, isAr]);

  const notifications = useMemo<SmartNotification[]>(() => generateNotifications(
    cycleDay,
    daysLeft,
    readiness,
    hasPeriod,
    fastTotal,
    fastRate,
    weekAvgH,
    FASTING_PHASES[fpKey].fastingHoursMin,
    FASTING_PHASES[fpKey].fastingHoursMax,
    goals,
    macros.protein,
    weight,
    goalWeight
  ), [cycleDay, daysLeft, readiness, hasPeriod, fastTotal, fastRate, weekAvgH, fpKey, goals, macros.protein, weight, goalWeight]);

  return (
    <View style={s.container}>
      <LinearGradient colors={["#03020C", "#0A0818", "#130B22"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* PAGE HEADER */}
          <Text style={s.pageLabel}>{isAr ? "إيقاع · ذكاء" : "Eqa'a · Intelligence"}</Text>
          <Text style={s.pageTitle}>{isAr ? "لوحة\nالذكاء" : "Intelligence\nDashboard"}</Text>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* INSIGHTS CARD — رؤى إيقاع                             */}
          {/* ═══════════════════════════════════════════════════════ */}
          <LinearGradient
            colors={["rgba(198,167,255,0.10)", "rgba(127,255,212,0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.card, s.iCard]}
          >
            {/* header */}
            <View style={[s.hd, isAr && s.rev]}>
              <Text style={s.hdIcon}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.hdTitle, isAr && s.rtl]}>{isAr ? "رؤى إيقاع" : "Eqa'a Insights"}</Text>
                <Text style={[s.hdSub, isAr && s.rtl]}>{isAr ? "تحليل ذكي مبني على بياناتك" : "Smart analysis built from your real data"}</Text>
              </View>
            </View>

            {/* all 5 insights — same structure: icon + title + message */}
            {[
              { icon: "🌟", labelAr: "جاهزيتك اليوم",  labelEn: "Daily Readiness", text: insights.dailyInsight,       daily: true  },
              { icon: "🌙", labelAr: "الدورة",          labelEn: "Cycle",           text: insights.cycleInsight,       daily: false },
              { icon: "⚡", labelAr: "الصيام",          labelEn: "Fasting",         text: insights.fastingInsight,     daily: false },
              { icon: "🥗", labelAr: "التغذية",         labelEn: "Nutrition",       text: insights.nutritionInsight,   daily: false },
              { icon: "🔮", labelAr: "التوقع القادم",   labelEn: "Upcoming",        text: insights.predictionInsight,  daily: false },
            ].map((item) => (
              <View
                key={item.labelEn}
                style={item.daily
                  ? s.iDailyBlock
                  : [s.iRow, isAr && s.rev]}
              >
                {item.daily ? (
                  /* daily insight — bigger, highlighted */
                  <>
                    <View style={[s.iDailyHead, isAr && s.rev]}>
                      <Text style={s.iRowIcon}>{item.icon}</Text>
                      <Text style={[s.iRowLabel, isAr && s.rtl]}>
                        {isAr ? item.labelAr : item.labelEn}
                      </Text>
                    </View>
                    <Text style={[s.iDailyTxt, isAr && s.rtl]}>{item.text}</Text>
                  </>
                ) : (
                  /* sub-insights */
                  <>
                    <Text style={s.iRowIcon}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.iRowLabel, isAr && s.rtl]}>
                        {isAr ? item.labelAr : item.labelEn}
                      </Text>
                      <Text style={[s.iRowTxt, isAr && s.rtl]}>{item.text}</Text>
                    </View>
                  </>
                )}
              </View>
            ))}
          </LinearGradient>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PREDICTIONS CARD — التوقعات الذكية                    */}
          {/* ═══════════════════════════════════════════════════════ */}
          <View style={s.card}>
            <View style={[s.hd, isAr && s.rev]}>
              <Text style={s.hdIcon}>🔮</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.hdTitle, isAr && s.rtl]}>{isAr ? "التوقعات الذكية" : "Smart Predictions"}</Text>
                <Text style={[s.hdSub, isAr && s.rtl]}>{isAr ? "مبنية على دورتك وبياناتك الحقيقية" : "Built from your cycle and real data"}</Text>
              </View>
            </View>

            {[
              { icon: "⚡", labelAr: "طاقتك القادمة",  labelEn: "Energy Ahead",   text: predictions.energyForecast         },
              { icon: "🌙", labelAr: "الدورة القادمة", labelEn: "Cycle Ahead",    text: predictions.cycleForecast          },
              { icon: "⏱",  labelAr: "الصيام الأمثل", labelEn: "Best Fasting",   text: predictions.fastingForecast        },
              { icon: "⚖️", labelAr: "مسار الوزن",    labelEn: "Weight Path",    text: predictions.weightForecast         },
              { icon: "💫", labelAr: "توصية ذكية",    labelEn: "AI Tip",         text: predictions.recommendationForecast },
            ].map((item) => (
              <View key={item.labelEn} style={[s.iRow, isAr && s.rev]}>
                <Text style={s.iRowIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.iRowLabel, isAr && s.rtl]}>{isAr ? item.labelAr : item.labelEn}</Text>
                  <Text style={[s.iRowTxt,   isAr && s.rtl]}>{item.text}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* NOTIFICATIONS CARD — التنبيهات الذكية                 */}
          {/* ═══════════════════════════════════════════════════════ */}
          {notifications.length > 0 && (
            <View style={s.card}>
              <View style={[s.hd, isAr && s.rev]}>
                <Text style={s.hdIcon}>🔔</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.hdTitle, isAr && s.rtl]}>{isAr ? "التنبيهات الذكية" : "Smart Alerts"}</Text>
                  <Text style={[s.hdSub, isAr && s.rtl]}>{isAr ? "مرتبة حسب الأولوية" : "Sorted by priority"}</Text>
                </View>
              </View>

              {notifications.slice(0, 6).map((n) => (
                <View key={n.id} style={[s.nRow, isAr && s.rev]}>
                  <View style={[s.nDot, {
                    backgroundColor:
                      n.priority === "high"   ? "#FF6B6B" :
                      n.priority === "medium" ? "#FFB86B" : "#7FFFD4",
                  }]} />
                  <View style={s.nContent}>
                    <View style={[s.nHead, isAr && s.rev]}>
                      <Text style={s.nCatIcon}>
                        {n.category === "cycle"      ? "🌙" :
                         n.category === "fasting"    ? "⚡" :
                         n.category === "nutrition"  ? "🥗" : "🔮"}
                      </Text>
                      <Text style={[s.nTitle, isAr && s.rtl]}>
                        {isAr ? n.titleAr : n.titleEn}
                      </Text>
                    </View>
                    <Text style={[s.nBody, isAr && s.rtl]}>
                      {isAr ? n.bodyAr : n.bodyEn}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* CARD 1 — CYCLE STATUS                                  */}
          {/* ═══════════════════════════════════════════════════════ */}
          <LinearGradient
            colors={[`${phaseColor}1C`, "rgba(255,255,255,0.02)"]}
            style={[s.card, { borderColor: `${phaseColor}2A` }]}
          >
            <View style={[s.hd, isAr && s.rev]}>
              <Text style={s.hdIcon}>🌙</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.hdTitle, isAr && s.rtl]}>{isAr ? "الدورة الحالية" : "Cycle Status"}</Text>
                <Text style={[s.hdSub, isAr && s.rtl]}>{isAr ? "المرحلة · اليوم · درجة الجاهزية" : "Phase · Day · Readiness"}</Text>
              </View>
            </View>

            <View style={[s.phaseBanner, { backgroundColor: `${phaseColor}14`, borderColor: `${phaseColor}20` }]}>
              <Text style={s.phaseBannerIcon}>{phase.icon}</Text>
              <Text style={[s.phaseBannerName, { color: phaseColor }]}>
                {isAr ? phase.phaseArabic : phase.title}
              </Text>
            </View>

            <View style={s.twoCol}>
              <View style={s.twoCell}>
                <Text style={[s.bigNum, { color: phaseColor }]}>{cycleDay}</Text>
                <Text style={[s.bigLbl, isAr && s.rtl]}>{isAr ? `يوم من ${cycleLength}` : `of ${cycleLength}`}</Text>
              </View>
              <View style={s.colDiv} />
              <View style={s.twoCell}>
                <Text style={[s.bigNum, { color: phaseColor }]}>{readiness}</Text>
                <Text style={[s.bigLbl, isAr && s.rtl]}>{isAr ? "درجة الجاهزية" : "Readiness"}</Text>
              </View>
            </View>

            <View style={s.barWrap}>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${readiness}%`, backgroundColor: phaseColor }]} />
              </View>
              <Text style={[s.barCaption, isAr && s.rtl]}>{readiness}/100</Text>
            </View>

            <Text style={[s.insightTxt, isAr && s.rtl]}>{insight}</Text>

            {/* Readiness scale explanation */}
            <View style={s.readinessScale}>
              <Text style={[s.readinessScaleTitle, isAr && s.rtl]}>
                {isAr ? "مقياس الجاهزية" : "Readiness Scale"}
              </Text>
              <View style={[s.readinessScaleRow, isAr && s.rev]}>
                {[
                  { range: "85–100", labelAr: "ممتاز",   labelEn: "Excellent", color: "#7FFFD4" },
                  { range: "70–84",  labelAr: "جيد",      labelEn: "Good",      color: "#5BBB85" },
                  { range: "50–69",  labelAr: "متوسط",    labelEn: "Moderate",  color: "#E9CF74" },
                  { range: "<50",    labelAr: "تعافي",    labelEn: "Recovery",  color: "#FF6FAE" },
                ].map((item) => (
                  <View
                    key={item.range}
                    style={[
                      s.readinessScaleItem,
                      { borderColor: `${item.color}40`, backgroundColor: `${item.color}12` },
                      readiness >= parseInt(item.range) && readiness <= (parseInt(item.range.split("–")[1] ?? "100") || 100)
                        ? { borderColor: item.color }
                        : undefined,
                    ]}
                  >
                    <Text style={[s.readinessScaleNum, { color: item.color }]}>{item.range}</Text>
                    <Text style={s.readinessScaleLbl}>{isAr ? item.labelAr : item.labelEn}</Text>
                  </View>
                ))}
              </View>
            </View>

            {hasPeriod && (
              <View style={[s.pillRow, isAr && s.rev]}>
                <View style={[s.pill, { backgroundColor: `${phaseColor}18`, borderColor: `${phaseColor}28` }]}>
                  <Text style={[s.pillTxt, { color: phaseColor }]}>
                    {isAr ? `${daysLeft} يوم حتى الدورة` : `${daysLeft}d to period`}
                  </Text>
                </View>
                {isRegular !== null && (
                  <View style={[s.pill, {
                    backgroundColor: isRegular ? "rgba(127,255,212,0.10)" : "rgba(255,184,107,0.10)",
                    borderColor:     isRegular ? "rgba(127,255,212,0.22)" : "rgba(255,184,107,0.22)",
                  }]}>
                    <Text style={[s.pillTxt, { color: isRegular ? "#7FFFD4" : "#FFB86B" }]}>
                      {isAr ? (isRegular ? "دورة منتظمة ✓" : "دورة متغيرة") : (isRegular ? "Regular ✓" : "Variable")}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </LinearGradient>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* CARD 2 — SMART FASTING                                 */}
          {/* ═══════════════════════════════════════════════════════ */}
          <View style={s.card}>
            <View style={[s.hd, isAr && s.rev]}>
              <Text style={s.hdIcon}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.hdTitle, isAr && s.rtl]}>{isAr ? "الصيام الذكي" : "Smart Fasting"}</Text>
                <Text style={[s.hdSub, isAr && s.rtl]}>
                  {isAr ? "آخر جلسة · متوسط الأسبوع · الالتزام" : "Last session · Weekly avg · Compliance"}
                </Text>
              </View>
            </View>

            {fastTotal === 0 ? (
              /* ── empty state ── */
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>⚡</Text>
                <Text style={[s.emptyMsg, isAr && s.rtl]}>
                  {isAr
                    ? "ابدئي أول جلسة صيام وسيظهر تحليلك هنا"
                    : "Start your first fasting session and your analysis will appear here"}
                </Text>
              </View>
            ) : (
              <>
                {/* 3 real metrics */}
                <View style={s.threeCol}>
                  <View style={s.cell}>
                    <Text style={[s.cellV, { color: "#7FFFD4" }]}>
                      {secToHHMM(lastFastSec)}
                    </Text>
                    <Text style={[s.cellL, isAr && s.rtl]}>{isAr ? "آخر جلسة" : "Last Fast"}</Text>
                  </View>
                  <View style={s.cellDiv} />
                  <View style={s.cell}>
                    <Text style={[s.cellV, { color: "#C6A7FF" }]}>
                      {weekAvgSec > 0 ? secToHHMM(weekAvgSec) : "—"}
                    </Text>
                    <Text style={[s.cellL, isAr && s.rtl]}>{isAr ? "متوسط الأسبوع" : "Weekly Avg"}</Text>
                  </View>
                  <View style={s.cellDiv} />
                  <View style={s.cell}>
                    <Text style={[s.cellV, { color: fastRate >= 70 ? "#7FFFD4" : "#FFB86B", fontSize: 22 }]}>
                      {`${fastRate}%`}
                    </Text>
                    <Text style={[s.cellL, isAr && s.rtl]}>{isAr ? "الالتزام" : "Compliance"}</Text>
                  </View>
                </View>

                {/* progress bar for compliance */}
                <View style={s.barWrap}>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, {
                      width: `${fastRate}%`,
                      backgroundColor: fastRate >= 70 ? "#7FFFD4" : "#FFB86B",
                    }]} />
                  </View>
                  <Text style={[s.barCaption, isAr && s.rtl]}>
                    {isAr
                      ? `${fastTotal} جلسة مسجلة · نافذة مقترحة ${FASTING_PHASES[fpKey].fastingHoursMin}–${FASTING_PHASES[fpKey].fastingHoursMax}h`
                      : `${fastTotal} sessions logged · Suggested ${FASTING_PHASES[fpKey].fastingHoursMin}–${FASTING_PHASES[fpKey].fastingHoursMax}h`}
                  </Text>
                </View>

                {/* milestone */}
                <View style={[s.milestoneBox, isAr && s.rev]}>
                  <Text style={s.milestoneIcon}>🏅</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.milestoneLbl, isAr && s.rtl]}>{isAr ? "مستواكِ الحالي" : "Your Level"}</Text>
                    <Text style={[s.milestoneVal, isAr && s.rtl]}>
                      {weekAvgH === 0
                        ? (isAr ? "ابدئي رحلة الصيام 🌙" : "Begin your fasting journey 🌙")
                        : weekAvgH < 13
                        ? (isAr ? "مبتدئة · وصولاً إلى 13h" : "Beginner · Building to 13h")
                        : weekAvgH < 16
                        ? (isAr ? "متوسطة · هدفك 16h" : "Intermediate · Target 16h")
                        : weekAvgH < 18
                        ? (isAr ? "متقدمة · هدفك 18h" : "Advanced · Target 18h")
                        : (isAr ? "صائمة محترفة 🌟" : "Expert faster 🌟")}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* CARD 3 — NUTRITION SUMMARY                             */}
          {/* ═══════════════════════════════════════════════════════ */}
          <View style={s.card}>
            <View style={[s.hd, isAr && s.rev]}>
              <Text style={s.hdIcon}>🥗</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.hdTitle, isAr && s.rtl]}>{isAr ? "ملخص التغذية" : "Nutrition Summary"}</Text>
                <Text style={[s.hdSub, isAr && s.rtl]}>{isAr ? "سعرات يومية · الماكرو الموصى" : "Daily calories · Recommended macros"}</Text>
              </View>
            </View>

            {/* big kcal */}
            <View style={s.kcalBlock}>
              <Text style={s.kcalNum}>{calories}</Text>
              <Text style={[s.kcalLbl, isAr && s.rtl]}>
                {isAr ? "سعرة حرارية مقترحة يومياً" : "suggested kcal / day"}
              </Text>
            </View>

            {/* macro cards */}
            <View style={[s.macroRow, isAr && s.rev]}>
              <View style={[s.macroCard, { borderColor: "rgba(198,167,255,0.28)" }]}>
                <Text style={[s.macroVal, { color: "#C6A7FF" }]}>{macros.protein}g</Text>
                <Text style={s.macroLbl}>{isAr ? "بروتين" : "Protein"}</Text>
              </View>
              <View style={[s.macroCard, { borderColor: "rgba(255,184,107,0.28)" }]}>
                <Text style={[s.macroVal, { color: "#FFB86B" }]}>{macros.carbs}g</Text>
                <Text style={s.macroLbl}>{isAr ? "كارب" : "Carbs"}</Text>
              </View>
              <View style={[s.macroCard, { borderColor: "rgba(127,255,212,0.28)" }]}>
                <Text style={[s.macroVal, { color: "#7FFFD4" }]}>{macros.fat}g</Text>
                <Text style={s.macroLbl}>{isAr ? "دهون" : "Fat"}</Text>
              </View>
            </View>

            {/* goal + weight pills */}
            <View style={[s.pillRow, isAr && s.rev]}>
              <View style={s.goalPill}>
                <Text style={s.goalPillTxt}>
                  {goals.includes("loss")
                    ? (isAr ? "🔥 خسارة الوزن" : "🔥 Fat Loss")
                    : goals.includes("gain")
                    ? (isAr ? "💪 زيادة العضلات" : "💪 Muscle Gain")
                    : (isAr ? "⚖️ المحافظة على الوزن" : "⚖️ Maintain")}
                </Text>
              </View>
              {weightDiff !== null && (
                <View style={s.goalPill}>
                  <Text style={s.goalPillTxt}>
                    {weightDiff < 0.5
                      ? (isAr ? "🎉 وصلتِ للهدف" : "🎉 Goal reached")
                      : (isAr
                          ? `${weightDiff.toFixed(1)} كجم ${goals.includes("gain") ? "للاكتساب" : "للهدف"}`
                          : `${weightDiff.toFixed(1)}kg to goal`)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* CARD 4 — DAILY RECOMMENDATION                          */}
          {/* ═══════════════════════════════════════════════════════ */}
          <View style={s.card}>
            <View style={[s.hd, isAr && s.rev]}>
              <Text style={s.hdIcon}>🎯</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.hdTitle, isAr && s.rtl]}>{isAr ? "توصية اليوم" : "Today's Recommendation"}</Text>
                <Text style={[s.hdSub, isAr && s.rtl]}>
                  {isAr
                    ? `مبنية على مرحلة ${wellness.phaseArabic}`
                    : `Based on your ${wellness.title} phase`}
                </Text>
              </View>
            </View>

            <View style={[s.recItem, isAr && s.rev]}>
              <Text style={s.recIcon}>🏃</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.recLabel, isAr && s.rtl]}>{isAr ? "الحركة" : "Activity"}</Text>
                <Text style={[s.recVal, isAr && s.rtl]}>{isAr ? rec.actAr : rec.actEn}</Text>
              </View>
            </View>

            <View style={[s.recItem, isAr && s.rev]}>
              <Text style={s.recIcon}>💤</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.recLabel, isAr && s.rtl]}>{isAr ? "التعافي" : "Recovery"}</Text>
                <Text style={[s.recVal, isAr && s.rtl]}>{isAr ? rec.recAr : rec.recEn}</Text>
              </View>
            </View>

            <View style={[s.recItem, isAr && s.rev]}>
              <Text style={s.recIcon}>🥗</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.recLabel, isAr && s.rtl]}>{isAr ? "التغذية" : "Food"}</Text>
                <Text style={[s.recVal, isAr && s.rtl]}>{isAr ? rec.foodAr : rec.foodEn}</Text>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* CARD 5 — WEEKLY TRENDS                                 */}
          {/* ═══════════════════════════════════════════════════════ */}
          <View style={[s.card, s.cardLast]}>
            <View style={[s.hd, isAr && s.rev]}>
              <Text style={s.hdIcon}>📊</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.hdTitle, isAr && s.rtl]}>{isAr ? "أنماط الأسبوع" : "Weekly Trends"}</Text>
                <Text style={[s.hdSub, isAr && s.rtl]}>{isAr ? "صيام · دورة · مزاج · طاقة" : "Fasting · Cycle · Mood · Energy"}</Text>
              </View>
            </View>

            {checkInCount === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📋</Text>
                <Text style={[s.emptyMsg, isAr && s.rtl]}>
                  {isAr
                    ? "ابدئي أول تسجيل يومي للحصول على تحليلات الأنماط الأسبوعية"
                    : "Complete your first daily check-in to unlock weekly pattern analysis"}
                </Text>
              </View>
            )}

            <TrendRow
              icon="⚡"
              label={isAr ? "انتظام الصيام" : "Fasting Compliance"}
              value={fastTotal > 0 ? `${fastRate}%` : (isAr ? "ابدئي أول جلسة صيام ✦" : "Start your first session ✦")}
              pct={fastTotal > 0 ? fastRate : null}
              barColor={fastRate >= 70 ? "#7FFFD4" : "#FFB86B"}
              isAr={isAr}
            />
            <TrendRow
              icon="🌙"
              label={isAr ? "انتظام الدورة" : "Cycle Regularity"}
              value={isRegular === null
                ? (isAr ? "أضيفي تاريخ آخر دورة ✦" : "Add your last period date ✦")
                : isAr
                  ? (isRegular ? "منتظمة ✓" : `${cycleLength} يوم`)
                  : (isRegular ? "Regular ✓" : `${cycleLength}-day`)}
              pct={isRegular === null ? null : isRegular ? 90 : 50}
              barColor={isRegular ? "#7FFFD4" : "#FFB86B"}
              isAr={isAr}
            />
            <TrendRow
              icon="✨"
              label={isAr ? "المزاج الأبرز" : "Dominant Mood"}
              value={topMood
                ? `${topMood}${topMoodCount > 1 ? ` ×${topMoodCount}` : ""}`
                : (isAr ? "سجّلي مزاجك اليومي ✦" : "Log your daily mood ✦")}
              pct={null}
              barColor="#C6A7FF"
              isAr={isAr}
            />
            <TrendRow
              icon="💪"
              label={isAr ? "متوسط الطاقة" : "Avg Energy"}
              value={avgEnergy > 0 ? `${avgEnergy}/10` : (isAr ? "سجّلي طاقتك اليومية ✦" : "Log your daily energy ✦")}
              pct={avgEnergy > 0 ? avgEnergy * 10 : null}
              barColor={avgEnergy >= 6 ? "#7FFFD4" : "#FFB86B"}
              isAr={isAr}
            />
            <TrendRow
              icon="💤"
              label={isAr ? "متوسط النوم" : "Avg Sleep"}
              value={checkInCount > 0 ? `${avgSleep}h` : (isAr ? "سجّلي ساعات نومك ✦" : "Log your sleep hours ✦")}
              pct={checkInCount > 0 ? Math.min(100, (avgSleep / 9) * 100) : null}
              barColor={avgSleep >= 7 ? "#7FFFD4" : "#FFB86B"}
              isAr={isAr}
            />
            {weight !== null && goalWeight !== null && (
              <TrendRow
                icon="⚖️"
                label={isAr ? "الوزن · الهدف" : "Weight · Goal"}
                value={`${weight} → ${goalWeight}${isAr ? " كجم" : " kg"}`}
                pct={null}
                barColor="#FFB86B"
                isAr={isAr}
              />
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#03020C" },
  scroll:    { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 140, gap: 16 },

  rtl: { textAlign: "right", writingDirection: "rtl" },
  rev: { flexDirection: "row-reverse" },

  // page header
  pageLabel: {
    color: "#C6A7FF", fontSize: 11, fontWeight: "800",
    textAlign: "center", letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 6,
  },
  pageTitle: {
    color: "#FFFFFF", fontSize: 44, fontWeight: "900",
    textAlign: "center", lineHeight: 50, letterSpacing: -1, marginBottom: 6,
  },

  // card
  card: {
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)", borderRadius: 28, padding: 22, gap: 18,
  },
  cardLast: { marginBottom: 0 },

  // card header
  hd:      { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  hdIcon:  { fontSize: 22, marginTop: 1 },
  hdTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  hdSub:   { color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "600", marginTop: 3 },

  // phase banner (card 1)
  phaseBanner: {
    borderRadius: 20, borderWidth: 1, paddingVertical: 18, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
  },
  phaseBannerIcon: { fontSize: 28 },
  phaseBannerName: { fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },

  // 2-col KPI
  twoCol:  { flexDirection: "row", alignItems: "center" },
  twoCell: { flex: 1, alignItems: "center", gap: 6 },
  colDiv:  { width: 1, height: 58, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 8 },
  bigNum:  { fontSize: 52, fontWeight: "900", letterSpacing: -1.5, lineHeight: 56 },
  bigLbl:  { color: "rgba(255,255,255,0.40)", fontSize: 12, fontWeight: "600", textAlign: "center" },

  // generic bar
  barWrap:    { gap: 8 },
  barTrack:   { height: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" },
  barFill:    { height: 8, borderRadius: 999 },
  barCaption: { color: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: "700", textAlign: "right" },

  // insight / sub text
  insightTxt: { color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: "600", lineHeight: 22 },

  // pills
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  pillTxt: { fontSize: 12, fontWeight: "700" },

  // 3-col KPI (fasting)
  threeCol: { flexDirection: "row", alignItems: "center" },
  cell:     { flex: 1, alignItems: "center", gap: 6, paddingVertical: 4 },
  cellV:    { color: "#FFFFFF", fontSize: 26, fontWeight: "900", letterSpacing: -0.5, textAlign: "center" },
  cellL:    { color: "rgba(255,255,255,0.40)", fontSize: 11, fontWeight: "700", textAlign: "center" },
  cellDiv:  { width: 1, height: 46, backgroundColor: "rgba(255,255,255,0.08)" },

  // milestone (card 2)
  milestoneBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "rgba(198,167,255,0.07)", borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: "rgba(198,167,255,0.14)",
  },
  milestoneIcon: { fontSize: 20 },
  milestoneLbl:  { color: "rgba(255,255,255,0.44)", fontSize: 11, fontWeight: "700" },
  milestoneVal:  { color: "#C6A7FF", fontSize: 15, fontWeight: "800", marginTop: 2 },

  // empty state (card 2 when no fasting data)
  emptyState: { alignItems: "center", paddingVertical: 24, gap: 12 },
  emptyIcon:  { fontSize: 40, opacity: 0.4 },
  emptyMsg:   {
    color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: "600",
    lineHeight: 22, textAlign: "center", paddingHorizontal: 10,
  },

  // nutrition kcal (card 3)
  kcalBlock: { alignItems: "center", gap: 6 },
  kcalNum:   { color: "#FFFFFF", fontSize: 58, fontWeight: "900", letterSpacing: -2, lineHeight: 62 },
  kcalLbl:   { color: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: "700", textAlign: "center" },

  // macro cards (card 3)
  macroRow: { flexDirection: "row", gap: 10 },
  macroCard: {
    flex: 1, alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20, borderWidth: 1,
    paddingVertical: 18, paddingHorizontal: 8,
  },
  macroVal: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  macroLbl: { color: "rgba(255,255,255,0.42)", fontSize: 11, fontWeight: "700" },

  // goal pill (card 3)
  goalPill:    { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  goalPillTxt: { color: "rgba(255,255,255,0.68)", fontSize: 12, fontWeight: "700" },

  // daily recommendation rows (card 4)
  recItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 14,
    paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  recIcon:  { fontSize: 20, marginTop: 2 },
  recLabel: { color: "rgba(255,255,255,0.38)", fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5 },
  recVal:   { color: "#FFFFFF", fontSize: 15, fontWeight: "600", lineHeight: 22 },

  // insights card
  iCard: { borderColor: "rgba(198,167,255,0.18)" },

  // daily insight block (prominent, always first)
  iDailyBlock: {
    backgroundColor: "rgba(198,167,255,0.08)",
    borderRadius: 18, borderWidth: 1,
    borderColor: "rgba(198,167,255,0.16)",
    paddingVertical: 16, paddingHorizontal: 16,
    gap: 10,
  },
  iDailyHead: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  iDailyTxt: {
    color: "#FFFFFF", fontSize: 15, fontWeight: "700", lineHeight: 24,
  },

  // sub-insight rows (cycle / fasting / nutrition / prediction)
  iRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 14,
    paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  iRowIcon:  { fontSize: 17, marginTop: 2, width: 22, textAlign: "center" },
  iRowLabel: {
    color: "rgba(255,255,255,0.38)", fontSize: 10, fontWeight: "800",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4,
  },
  iRowTxt: {
    color: "rgba(255,255,255,0.80)", fontSize: 14, fontWeight: "600", lineHeight: 22,
  },

  // readiness scale
  readinessScale: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", gap: 10,
  },
  readinessScaleTitle: {
    color: "rgba(255,255,255,0.38)", fontSize: 10, fontWeight: "800",
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  readinessScaleRow: {
    flexDirection: "row", gap: 8,
  },
  readinessScaleItem: {
    flex: 1, alignItems: "center", gap: 4,
    paddingVertical: 10, borderRadius: 14,
    borderWidth: 1,
  },
  readinessScaleNum: { fontSize: 12, fontWeight: "900" },
  readinessScaleLbl: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: "700" },

  // notification card rows
  nRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  nDot:     { width: 8, height: 8, borderRadius: 999, marginTop: 6, flexShrink: 0 },
  nContent: { flex: 1, gap: 4 },
  nHead:    { flexDirection: "row", alignItems: "center", gap: 6 },
  nCatIcon: { fontSize: 14 },
  nTitle:   { color: "#FFFFFF", fontSize: 13, fontWeight: "800", flex: 1 },
  nBody:    { color: "rgba(255,255,255,0.62)", fontSize: 13, fontWeight: "500", lineHeight: 20 },
});
