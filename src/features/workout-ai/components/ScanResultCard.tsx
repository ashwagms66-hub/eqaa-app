import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { DifficultyBadge } from "./DifficultyBadge";
import type { ScanEntry } from "../models/types";

interface ScanResultCardProps {
  entry: ScanEntry;
  language: "ar" | "en";
  onPress: () => void;
}

export function ScanResultCard({ entry, language, onPress }: ScanResultCardProps) {
  const { result, imageUri, capturedAt } = entry;

  const timeStr = new Date(capturedAt).toLocaleTimeString(
    language === "ar" ? "ar-SA" : "en-US",
    { hour: "2-digit", minute: "2-digit" }
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.72}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={styles.thumbPlaceholder} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {language === "ar" ? result.machineNameAr : result.machineName}
        </Text>
        <Text style={styles.exercise} numberOfLines={1}>
          {language === "ar" ? result.exerciseNameAr : result.exerciseName}
        </Text>
        <View style={styles.row}>
          <DifficultyBadge difficulty={result.difficulty} language={language} />
          <Text style={styles.time}>{timeStr}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
  },
  thumb: {
    width: 84,
    height: 84,
  },
  thumbPlaceholder: {
    width: 84,
    height: 84,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  info: {
    flex: 1,
    padding: 12,
    gap: 5,
    justifyContent: "center",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  exercise: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
});
