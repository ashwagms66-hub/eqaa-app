

import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
    Moon,
    Sparkles,
    TrendingUp,
} from "lucide-react-native";

import {
    useLanguage,
} from "@/src/context/LanguageContext";

import {
    getAverageReadiness,
    getRecentMoodTrend,
} from "@/src/storage/rhythmMemory";

import {
    getEnergy,
    getSleep,
    getStress,
} from "@/src/storage/checkinStorage";

export default function ReportsScreen() {
  const { language } = useLanguage();

  const [averageReadiness, setAverageReadiness] =
    useState(82);

  const [sleepHours, setSleepHours] =
    useState(7);

  const [energyLevel, setEnergyLevel] =
    useState(78);

  const [stressLevel, setStressLevel] =
    useState("Low");

  const [moodTrend, setMoodTrend] =
    useState("balanced");

  useEffect(() => {
    async function loadData() {
      const avg =
        await getAverageReadiness();

      const trend =
        await getRecentMoodTrend();

      const savedSleep =
        await getSleep();

      const savedStress =
        await getStress();

      const savedEnergy =
        await getEnergy();

      if (avg) {
        setAverageReadiness(avg);
      }

      if (trend) {
        setMoodTrend(trend);
      }

      if (savedSleep !== null) {
        setSleepHours(savedSleep);
      }

      if (savedStress) {
        setStressLevel(savedStress);
      }

      if (savedEnergy !== null) {
        setEnergyLevel(savedEnergy);
      }
    }

    loadData();
  }, []);

  const rhythmText = useMemo(() => {
    if (moodTrend === "stress_high") {
      return language === "ar"
        ? "إيقاع لاحظ ارتفاعًا متكررًا في الضغط خلال الأيام الماضية."
        : "Eqa’a noticed repeated higher stress recently.";
    }

    if (moodTrend === "low_energy") {
      return language === "ar"
        ? "قد تحتاجين إلى نوم أعمق واستعادة الطاقة بشكل ألطف."
        : "Your rhythm may benefit from deeper recovery and rest.";
    }

    return language === "ar"
      ? "إيقاعك يبدو أكثر توازنًا واستقرارًا هذا الأسبوع."
      : "Your rhythm feels steadier and more balanced this week.";
  }, [language, moodTrend]);

  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#121225",
        "#241A3D",
      ]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>
          {language === "ar"
            ? "تقارير إيقاع"
            : "Eqa’a Reports"}
        </Text>

        <Text style={styles.title}>
          {language === "ar"
            ? "تحليلاتك"
            : "Your Analytics"}
        </Text>

        <Text style={styles.subtitle}>
          {language === "ar"
            ? "فهم أعمق للطاقة والنوم والإيقاع اليومي."
            : "A deeper reflection of your energy, sleep and rhythm."}
        </Text>

        <LinearGradient
          colors={[
            "rgba(198,167,255,0.18)",
            "rgba(255,255,255,0.05)",
          ]}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>
                {language === "ar"
                  ? "استقرار الإيقاع"
                  : "RHYTHM STABILITY"}
              </Text>

              <Text style={styles.heroValue}>
                {averageReadiness}%
              </Text>
            </View>

            <View style={styles.heroIconWrap}>
              <Sparkles
                size={28}
                color="#111111"
              />
            </View>
          </View>

          <Text style={styles.heroText}>
            {rhythmText}
          </Text>
        </LinearGradient>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Moon
              size={24}
              color="#C6A7FF"
            />

            <Text style={styles.metricLabel}>
              {language === "ar"
                ? "النوم"
                : "Sleep"}
            </Text>

            <Text style={styles.metricValue}>
              {sleepHours}h
            </Text>
          </View>

          <View style={styles.metricCard}>
            <TrendingUp
              size={24}
              color="#FFD66B"
            />

            <Text style={styles.metricLabel}>
              {language === "ar"
                ? "الطاقة"
                : "Energy"}
            </Text>

            <Text style={styles.metricValue}>
              {energyLevel}%
            </Text>
          </View>
        </View>

        <View style={styles.largeCard}>
          <Text style={styles.largeLabel}>
            {language === "ar"
              ? "تحليل الضغط"
              : "Stress Reflection"}
          </Text>

          <Text style={styles.largeValue}>
            {stressLevel}
          </Text>

          <Text style={styles.largeText}>
            {stressLevel === "High"
              ? language === "ar"
                ? "قد يكون الوقت مناسبًا لتخفيف الضغط والتركيز على الراحة والتنفس."
                : "This may be a good time to slow down and focus on recovery."
              : stressLevel === "Medium"
              ? language === "ar"
                ? "يوجد بعض الضغط الخفيف، لكن إيقاعك لا يزال متوازنًا نسبيًا."
                : "Some light stress is present, but your rhythm still feels relatively balanced."
              : language === "ar"
              ? "إيقاعك يبدو هادئًا ومتوازنًا حاليًا."
              : "Your rhythm currently feels calm and balanced."}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    paddingTop: 110,
    paddingHorizontal: 22,
    paddingBottom: 180,
  },

  label: {
    color: "#C6A7FF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 30,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 36,
    paddingHorizontal: 12,
  },

  heroCard: {
    borderRadius: 34,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heroLabel: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  heroValue: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "900",
    marginTop: 10,
  },

  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C6A7FF",
  },

  heroText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 16,
    lineHeight: 30,
    marginTop: 20,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    gap: 14,
    marginTop: 24,
  },

  metricCard: {
    flex: 1,
    minHeight: 170,
    borderRadius: 30,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    justifyContent: "space-between",
  },

  metricLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 20,
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
  },

  largeCard: {
    marginTop: 24,
    borderRadius: 34,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  largeLabel: {
    color: "#C6A7FF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  largeValue: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 10,
  },

  largeText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 16,
    lineHeight: 30,
    marginTop: 16,
    fontWeight: "600",
  },
});