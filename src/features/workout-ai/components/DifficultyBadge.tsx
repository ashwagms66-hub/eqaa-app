import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Difficulty } from "../models/types";

const CONFIG: Record<Difficulty, { bg: string; color: string; labelAr: string; labelEn: string }> =
  {
    beginner: {
      bg: "rgba(52,199,89,0.15)",
      color: "#34C759",
      labelAr: "مبتدئ",
      labelEn: "Beginner",
    },
    intermediate: {
      bg: "rgba(255,159,10,0.15)",
      color: "#FF9F0A",
      labelAr: "متوسط",
      labelEn: "Intermediate",
    },
    advanced: {
      bg: "rgba(255,59,48,0.15)",
      color: "#FF3B30",
      labelAr: "متقدم",
      labelEn: "Advanced",
    },
  };

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  language?: "ar" | "en";
}

export function DifficultyBadge({ difficulty, language = "ar" }: DifficultyBadgeProps) {
  const cfg = CONFIG[difficulty];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.label, { color: cfg.color }]}>
        {language === "ar" ? cfg.labelAr : cfg.labelEn}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
