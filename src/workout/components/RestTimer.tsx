import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { formatSeconds } from "../utils/formatters";

interface Props {
  seconds: number;
  onSkip: () => void;
  language: "ar" | "en";
}

export function RestTimer({ seconds, onSkip, language }: Props) {
  const isAr = language === "ar";
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{isAr ? "استراحة" : "Rest"}</Text>
      <Text style={styles.countdown}>{formatSeconds(seconds)}</Text>
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{isAr ? "تخطى الراحة" : "Skip Rest"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  label: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontFamily: "System",
  },
  countdown: {
    color: "#E2D4FF",
    fontSize: 72,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
  },
  skipBtn: {
    backgroundColor: "rgba(226,212,255,0.12)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  skipText: {
    color: "#E2D4FF",
    fontSize: 14,
    fontWeight: "600",
  },
});
