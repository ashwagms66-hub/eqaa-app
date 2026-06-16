

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

const goals = [
  {
    key: "rhythm",
    emoji: "🌙",
    title: "فهم الإيقاع",
    text:
      "فهم تغيّرات الطاقة والمشاعر خلال الدورة اليومية.",
  },

  {
    key: "sleep",
    emoji: "😴",
    title: "تحسين النوم",
    text:
      "بناء روتين أكثر هدوءًا وتوازنًا للنوم والراحة.",
  },

  {
    key: "energy",
    emoji: "⚡",
    title: "رفع الطاقة",
    text:
      "ملاحظة الأوقات التي تشعرين فيها بالنشاط والتركيز.",
  },

  {
    key: "emotion",
    emoji: "🤍",
    title: "فهم المشاعر",
    text:
      "متابعة التغيّرات العاطفية بلطف ووعي أكبر.",
  },

  {
    key: "weight",
    emoji: "🌿",
    title: "خسارة الوزن بلطف",
    text:
      "فهم احتياجات الجسم بطريقة أكثر توازنًا وهدوءًا.",
  },
];

export default function GoalsScreen() {
  const [selected, setSelected] =
    useState<string[]>([]);

  const canContinue = useMemo(() => {
    return selected.length > 0;
  }, [selected]);

  function toggleGoal(key: string) {
    setSelected((prev) => {
      if (prev.includes(key)) {
        return prev.filter(
          (item) => item !== key
        );
      }

      return [...prev, key];
    });
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
        >
          <View style={styles.hero}>
            <View style={styles.orbOuter}>
              <View style={styles.orbMiddle}>
                <View style={styles.orbInner}>
                  <Text style={styles.orbEmoji}>
                    ✨
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.title}>
              ما الذي ترغبين
              أن يساعدك فيه إيقاع؟
            </Text>

            <Text style={styles.subtitle}>
              اختياراتك تساعد إيقاع على بناء تجربة أقرب لطاقتك اليومية ونمط حياتك.
            </Text>
          </View>

          <View style={styles.cardsWrapper}>
            {goals.map((item) => {
              const active =
                selected.includes(item.key);

              return (
                <Pressable
                  key={item.key}
                  onPress={() =>
                    toggleGoal(item.key)
                  }
                  style={[
                    styles.goalCard,
                    active &&
                      styles.goalCardActive,
                  ]}
                >
                  <View style={styles.goalTopRow}>
                    <Text style={styles.goalEmoji}>
                      {item.emoji}
                    </Text>

                    <View
                      style={[
                        styles.selectionDot,
                        active &&
                          styles.selectionDotActive,
                      ]}
                    />
                  </View>

                  <Text style={styles.goalTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.goalText}>
                    {item.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomArea}>
          <Pressable
            disabled={!canContinue}
            onPress={() =>
              router.push(
                "/onboarding/name"
              )
            }
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

  cardsWrapper: {
    marginTop: 42,
    gap: 16,
  },

  goalCard: {
    backgroundColor:
      "rgba(255,255,255,0.05)",

    borderRadius: 32,
    padding: 22,

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  goalCardActive: {
    backgroundColor:
      "rgba(198,167,255,0.16)",

    borderColor: "#C6A7FF",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.24,
    shadowRadius: 18,
  },

  goalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  goalEmoji: {
    fontSize: 30,
  },

  selectionDot: {
    width: 18,
    height: 18,
    borderRadius: 999,

    borderWidth: 2,
    borderColor:
      "rgba(255,255,255,0.18)",
  },

  selectionDotActive: {
    backgroundColor: "#C6A7FF",
    borderColor: "#C6A7FF",
  },

  goalTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 18,
  },

  goalText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 15,
    lineHeight: 28,
    marginTop: 12,
  },

  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 24,
    paddingBottom: 34,
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