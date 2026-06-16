

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveCycleLength, saveLastPeriod } from "@/src/storage/cycleStorage";

const days = Array.from(
  { length: 31 },
  (_, i) => i + 1
);

const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export default function CycleScreen() {
  const today = new Date();

  const [selectedDay, setSelectedDay] =
    useState(today.getDate());

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  const canContinue = useMemo(() => {
    return !!selectedDay;
  }, [selectedDay]);

  async function handleContinue() {
    const year = today.getFullYear();
    const month = String(selectedMonth + 1).padStart(2, "0");
    const day = String(selectedDay).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    await saveLastPeriod(dateStr);
    await saveCycleLength(28);
    router.push("/onboarding/life-mode");
  }

  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#121225",
        "#221A3D",
      ]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
       <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.scroll}
  bounces={false}
>
          <View style={styles.hero}>
            <View style={styles.orbOuter}>
              <View style={styles.orbMiddle}>
                <View style={styles.orbInner}>
                  <Text style={styles.orbEmoji}>
                    🌙
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.title}>
              متى بدأت
              آخر دورة؟
            </Text>

            <Text style={styles.subtitle}>
              يساعد هذا إيقاع على فهم التغيّرات اليومية بطريقة أكثر دقة وهدوءًا.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              الشهر
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthsRow}
            >
              {months.map((month, index) => {
                const active =
                  selectedMonth === index;

                return (
                  <Pressable
                    key={month}
                    onPress={() =>
                      setSelectedMonth(index)
                    }
                    style={[
                      styles.monthCard,
                      active &&
                        styles.monthCardActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthText,
                        active &&
                          styles.monthTextActive,
                      ]}
                    >
                      {month}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              اليوم
            </Text>

            <View style={styles.daysGrid}>
              {days.map((day) => {
                const active =
                  selectedDay === day;

                return (
                  <Pressable
                    key={day}
                    onPress={() =>
                      setSelectedDay(day)
                    }
                    style={[
                      styles.dayCard,
                      active &&
                        styles.dayCardActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        active &&
                          styles.dayTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

        <View style={styles.previewCard}>
  <Text style={styles.previewLabel}>
    بداية إيقاعك الحالي
  </Text>

  <Text style={styles.previewDate}>
    {selectedDay} {months[selectedMonth]}
  </Text>

  <Text
    style={{
      color: "rgba(255,255,255,0.60)",
      fontSize: 14,
      textAlign: "center",
      marginTop: 10,
      lineHeight: 24,
    }}
  >
    يساعد هذا إيقاع على تقديم تجربة يومية أكثر دقة وهدوءًا.
  </Text>
</View>
        </ScrollView>

        <View style={styles.bottomArea}>
          <Pressable
            disabled={!canContinue}
            onPress={handleContinue}
            style={[
              styles.continueButton,
              !canContinue && {
                opacity: 0.45,
              },
            ]}
          >
            <Text style={styles.continueText}>
              التالي
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05050A",
  },

  safe: {
    flex: 1,
  },

 scroll: {
  paddingHorizontal: 24,
  paddingBottom: 140,
},

  hero: {
    alignItems: "center",
    marginTop: 24,
  },

  orbOuter: {
    width: 180,
    height: 180,
    borderRadius: 999,

    backgroundColor:
      "rgba(198,167,255,0.10)",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.45,
    shadowRadius: 60,
  },

  orbMiddle: {
    width: 140,
    height: 140,
    borderRadius: 999,

    backgroundColor:
      "rgba(198,167,255,0.16)",

    justifyContent: "center",
    alignItems: "center",
  },

  orbInner: {
    width: 100,
    height: 100,
    borderRadius: 999,

    backgroundColor: "#C6A7FF",

    justifyContent: "center",
    alignItems: "center",
  },

  orbEmoji: {
    fontSize: 36,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 52,
    textAlign: "center",
    fontWeight: "900",
    marginTop: 36,
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 17,
    lineHeight: 32,
    textAlign: "center",
    marginTop: 18,
    maxWidth: 320,
  },

  section: {
    marginTop: 40,
  },

  sectionLabel: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 18,
  },

  monthsRow: {
    gap: 12,
    paddingRight: 12,
  },

  monthCard: {
    backgroundColor:
      "rgba(255,255,255,0.05)",

    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  monthCardActive: {
    backgroundColor: "#C6A7FF",
    borderColor: "#C6A7FF",
  },

  monthText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  monthTextActive: {
    color: "#171726",
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  dayCard: {
    width: 58,
    height: 58,
    borderRadius: 20,

    backgroundColor:
      "rgba(255,255,255,0.05)",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  dayCardActive: {
    backgroundColor: "#C6A7FF",
    borderColor: "#C6A7FF",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.24,
    shadowRadius: 18,
  },

  dayText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  dayTextActive: {
    color: "#171726",
  },

previewCard: {
  marginTop: 42,

  backgroundColor:
    "rgba(255,255,255,0.05)",

  borderRadius: 34,
  padding: 26,

  borderWidth: 1,
  borderColor:
    "rgba(255,255,255,0.06)",

  shadowColor: "#C6A7FF",
  shadowOpacity: 0.12,
  shadowRadius: 24,
},

  previewLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    fontWeight: "700",
  },

  previewDate: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 12,
  },

  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 24,
paddingBottom: 42,
    paddingTop: 18,

    backgroundColor:
      "rgba(5,5,10,0.92)",
  },

  continueButton: {
    backgroundColor: "#C6A7FF",
    borderRadius: 999,
    minHeight: 62,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.34,
    shadowRadius: 22,
  },

  continueText: {
    color: "#171726",
    fontSize: 18,
    fontWeight: "900",
  },
});