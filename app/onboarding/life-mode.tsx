

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
    useMemo,
    useState,
} from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const modes = [
  {
    key: "regular",
    emoji: "🌙",
    title: "منتظم",
    text:
      "إيقاع دورتك غالبًا ثابت ويمكن توقعه بشكل أوضح.",
  },

  {
    key: "irregular",
    emoji: "✨",
    title: "غير منتظم",
    text:
      "قد تختلف المواعيد والطاقة من شهر لآخر بشكل أكبر.",
  },

  {
    key: "moon",
    emoji: "🪐",
    title: "Moon Mode",
    text:
      "تجربة هادئة مرنة تركز على الطاقة والمشاعر أكثر من التتبع التقليدي.",
  },
];

export default function LifeModeScreen() {
  const [selected, setSelected] =
    useState("regular");

  const canContinue = useMemo(() => {
    return !!selected;
  }, [selected]);

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
        <View style={styles.content}>
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
              كيف يبدو
              إيقاعك عادة؟
            </Text>

            <Text style={styles.subtitle}>
              يساعد هذا إيقاع على تقديم تجربة أكثر قربًا من نمط حياتك وطاقة جسمك.
            </Text>
          </View>

          <View style={styles.cardsWrapper}>
            {modes.map((item) => {
              const active =
                selected === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() =>
                    setSelected(item.key)
                  }
                  style={[
                    styles.modeCard,
                    active &&
                      styles.modeCardActive,
                  ]}
                >
                  <View style={styles.modeTopRow}>
                    <Text style={styles.modeEmoji}>
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

                  <Text style={styles.modeTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.modeText}>
                    {item.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            disabled={!canContinue}
            onPress={() =>
              router.push(
                "/onboarding/sync"
              )
            }
            style={styles.continueButton}
          >
            <Text style={styles.continueText}>
              بدء التجربة
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

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  hero: {
    alignItems: "center",
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
    alignSelf: "center",
  },

  cardsWrapper: {
    marginTop: 42,
    gap: 16,
  },

  modeCard: {
    backgroundColor:
      "rgba(255,255,255,0.05)",

    borderRadius: 32,
    padding: 22,

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  modeCardActive: {
    backgroundColor:
      "rgba(198,167,255,0.16)",

    borderColor: "#C6A7FF",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.24,
    shadowRadius: 18,
  },

  modeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modeEmoji: {
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

  modeTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 18,
  },

  modeText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 15,
    lineHeight: 28,
    marginTop: 12,
  },

  bottomArea: {
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