import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

interface Props {
  setNumber: number;
  reps: number;
  weight: number | null;
}

export function WorkoutSetRow({ setNumber, reps, weight }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Check size={12} color="#E2D4FF" strokeWidth={2.5} />
      </View>
      <Text style={styles.setLabel}>سيت {setNumber}</Text>
      <Text style={styles.repsText}>{reps} تكرار</Text>
      {weight !== null && (
        <Text style={styles.weightText}>{weight} كغ</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    marginBottom: 6,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(226,212,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  setLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
  repsText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  weightText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
});
