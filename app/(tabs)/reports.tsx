import { useLanguage } from "@/src/context/LanguageContext";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
  Activity,
  Brain,
  Flame,
  Moon,
  Sparkles,
} from "lucide-react-native";

export default function ReportsScreen() {
  const { language } = useLanguage();

  return (
    <LinearGradient
      colors={["#05050A", "#121225", "#221A3D"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
     <Text style={styles.label}>
  {language === "ar"
    ? "تقارير إيقاع"
    : "Eqa'a Reports"}
</Text>

        <Text style={styles.title}>
  {language === "ar"
    ? "تحليلات\nإيقاعك"
    : "Your\nRhythm"}
</Text>

       <Text style={styles.subtitle}>
  {language === "ar"
    ? "نظرة أعمق على طاقتك وتوازن جسمك هذا الأسبوع."
    : "A deeper look into your energy and balance this week."}
</Text>

        <LinearGradient
          colors={[
            "rgba(198,167,255,0.18)",
            "rgba(255,255,255,0.04)",
          ]}
          style={styles.scoreCard}
        >
          <Text style={styles.scoreEmoji}>
            ✨
          </Text>

          <Text style={styles.scoreLabel}>
  {language === "ar"
    ? "مؤشر الإيقاع"
    : "Rhythm Score"}
</Text>

          <Text style={styles.scoreValue}>
            87
          </Text>

         <Text style={styles.scoreText}>
  {language === "ar"
    ? "إيقاعك يبدو أكثر استقرارًا وانسجامًا هذا الأسبوع."
    : "Your rhythm feels more stable and aligned this week."}
</Text>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Moon
              color="#C6A7FF"
              size={24}
            />

            <Text style={styles.statValue}>
              7.9h
            </Text>

            <Text style={styles.statLabel}>
              النوم
            </Text>
          </View>

          <View style={styles.statCard}>
            <Flame
              color="#FFB86B"
              size={24}
            />

            <Text style={styles.statValue}>
              81%
            </Text>

            <Text style={styles.statLabel}>
              الطاقة
            </Text>
          </View>

          <View style={styles.statCard}>
            <Brain
              color="#89CFF0"
              size={24}
            />

<Text style={styles.statValue}>
  {language === "ar"
    ? "مستقر"
    : "Stable"}
</Text>
            <Text style={styles.statLabel}>
              المزاج
            </Text>
          </View>

          <View style={styles.statCard}>
            <Activity
              color="#7FFFD4"
              size={24}
            />

            <Text style={styles.statValue}>
              8.4k
            </Text>

            <Text style={styles.statLabel}>
              الخطوات
            </Text>
          </View>
        </View>

       <Text style={styles.sectionTitle}>
  {language === "ar"
    ? "تحليل هذا الأسبوع"
    : "This Week"}
</Text>

        <View style={styles.insightCard}>
          <View style={styles.insightTop}>
            <Sparkles
              color="#C6A7FF"
              size={22}
            />

          <Text style={styles.insightTitle}>
  {language === "ar"
    ? "رؤية الأسبوع"
    : "Weekly Insight"}
</Text>
          </View>

       <Text style={styles.insightText}>
  {language === "ar"
    ? "نومك يبدو أكثر استقرارًا هذا الأسبوع، كما أن مستويات الطاقة تتحسن تدريجيًا. قد يكون هذا الوقت مناسبًا للحركة المنتظمة والتركيز على التعافي."
    : "Your sleep feels more stable this week, and your energy levels may be gradually improving. This could be a supportive time for movement and recovery."}
</Text>
        </View>

      <Text style={styles.chartTitle}>
  {language === "ar"
    ? "نمط الطاقة"
    : "Energy Pattern"}
</Text>

          <View style={styles.chartBars}>
            <View style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 80,
                  },
                ]}
              />

              <Text style={styles.chartLabel}>
                س
              </Text>
            </View>

            <View style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 120,
                  },
                ]}
              />

              <Text style={styles.chartLabel}>
                ن
              </Text>
            </View>

            <View style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 96,
                  },
                ]}
              />

              <Text style={styles.chartLabel}>
                ث
              </Text>
            </View>

            <View style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 150,
                  },
                ]}
              />

              <Text style={styles.chartLabel}>
                ر
              </Text>
            </View>

            <View style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 130,
                  },
                ]}
              />

              <Text style={styles.chartLabel}>
                خ
              </Text>
            </View>

            <View style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 90,
                  },
                ]}
              />

              <Text style={styles.chartLabel}>
                ج
              </Text>
            </View>

            <View style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: 110,
                  },
                ]}
              />

              <Text style={styles.chartLabel}>
                س
              </Text>
            </View>
          </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05050A",
  },

  scroll: {
    paddingHorizontal: 22,
    paddingTop: 70,
    paddingBottom: 180,
  },

  label: {
    color: "#C6A7FF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  title: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 18,
    color: "rgba(255,255,255,0.62)",
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
  },

  scoreCard: {
    marginTop: 34,
    borderRadius: 34,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  scoreEmoji: {
    fontSize: 32,
    marginBottom: 14,
  },

  scoreLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 16,
    fontWeight: "700",
  },

  scoreValue: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 84,
    lineHeight: 90,
    fontWeight: "900",
  },

  scoreText: {
    marginTop: 14,
    color: "rgba(255,255,255,0.76)",
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "600",
  },

  statsGrid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },

  statCard: {
    width: "47%",
    borderRadius: 28,
    paddingVertical: 28,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  statValue: {
    marginTop: 14,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  statLabel: {
    marginTop: 8,
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 36,
    marginBottom: 18,
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },

  insightCard: {
    borderRadius: 30,
    padding: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  insightTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  insightTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  insightText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 18,
    lineHeight: 34,
    fontWeight: "600",
  },

  chartCard: {
    marginTop: 28,
    borderRadius: 30,
    padding: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  chartTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 28,
    textAlign: "center",
  },

  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  chartColumn: {
    alignItems: "center",
  },

  chartBar: {
    width: 22,
    borderRadius: 999,
    backgroundColor: "#C6A7FF",
    marginBottom: 12,
  },

  chartLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
  },
});
