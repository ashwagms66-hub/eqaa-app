import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Ellipse, Rect, Circle } from "react-native-svg";
import type { MuscleGroup } from "../models/types";

const PRIMARY = "#E2D4FF";
const SECONDARY = "rgba(226,212,255,0.35)";
const INACTIVE = "rgba(255,255,255,0.08)";
const SKIN = "rgba(255,255,255,0.13)";

function muscleColor(
  m: MuscleGroup,
  primary: MuscleGroup[],
  secondary: MuscleGroup[]
): string {
  if (primary.includes(m) || primary.includes("full_body")) return PRIMARY;
  if (secondary.includes(m) || secondary.includes("full_body")) return SECONDARY;
  return INACTIVE;
}

interface BodyProps {
  view: "front" | "back";
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
}

function BodySVG({ view, primary, secondary }: BodyProps) {
  const c = (m: MuscleGroup) => muscleColor(m, primary, secondary);

  return (
    <Svg width={130} height={290} viewBox="0 0 160 360">
      {/* Head */}
      <Circle cx={80} cy={28} r={22} fill={SKIN} />
      {/* Neck */}
      <Rect x={73} y={48} width={14} height={16} rx={4} fill={SKIN} />

      {view === "front" ? (
        <>
          {/* Shoulders */}
          <Ellipse cx={43} cy={80} rx={22} ry={13} fill={c("shoulders")} />
          <Ellipse cx={117} cy={80} rx={22} ry={13} fill={c("shoulders")} />
          {/* Chest */}
          <Ellipse cx={80} cy={90} rx={27} ry={22} fill={c("chest")} />
          {/* Biceps */}
          <Ellipse cx={31} cy={112} rx={10} ry={21} fill={c("biceps")} />
          <Ellipse cx={129} cy={112} rx={10} ry={21} fill={c("biceps")} />
          {/* Forearms */}
          <Ellipse cx={25} cy={153} rx={8} ry={19} fill={c("forearms")} />
          <Ellipse cx={135} cy={153} rx={8} ry={19} fill={c("forearms")} />
          {/* Core */}
          <Rect x={57} y={110} width={46} height={58} rx={10} fill={c("core")} />
          {/* Quads */}
          <Rect x={57} y={175} width={20} height={56} rx={8} fill={c("quads")} />
          <Rect x={83} y={175} width={20} height={56} rx={8} fill={c("quads")} />
          {/* Calves */}
          <Ellipse cx={67} cy={253} rx={10} ry={19} fill={c("calves")} />
          <Ellipse cx={93} cy={253} rx={10} ry={19} fill={c("calves")} />
        </>
      ) : (
        <>
          {/* Shoulders (back) */}
          <Ellipse cx={43} cy={80} rx={22} ry={13} fill={c("shoulders")} />
          <Ellipse cx={117} cy={80} rx={22} ry={13} fill={c("shoulders")} />
          {/* Back */}
          <Rect x={54} y={64} width={52} height={64} rx={10} fill={c("back")} />
          {/* Triceps */}
          <Ellipse cx={31} cy={112} rx={10} ry={21} fill={c("triceps")} />
          <Ellipse cx={129} cy={112} rx={10} ry={21} fill={c("triceps")} />
          {/* Forearms */}
          <Ellipse cx={25} cy={153} rx={8} ry={19} fill={c("forearms")} />
          <Ellipse cx={135} cy={153} rx={8} ry={19} fill={c("forearms")} />
          {/* Glutes */}
          <Ellipse cx={80} cy={177} rx={27} ry={18} fill={c("glutes")} />
          {/* Hamstrings */}
          <Rect x={57} y={191} width={20} height={46} rx={8} fill={c("hamstrings")} />
          <Rect x={83} y={191} width={20} height={46} rx={8} fill={c("hamstrings")} />
          {/* Calves */}
          <Ellipse cx={67} cy={253} rx={10} ry={19} fill={c("calves")} />
          <Ellipse cx={93} cy={253} rx={10} ry={19} fill={c("calves")} />
        </>
      )}
    </Svg>
  );
}

interface MuscleMapViewProps {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  language?: "ar" | "en";
}

export function MuscleMapView({
  primaryMuscles,
  secondaryMuscles,
  language = "ar",
}: MuscleMapViewProps) {
  const [view, setView] = useState<"front" | "back">("front");

  return (
    <View style={styles.container}>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === "front" && styles.toggleActive]}
          onPress={() => setView("front")}
        >
          <Text style={[styles.toggleText, view === "front" && styles.toggleTextActive]}>
            {language === "ar" ? "الأمام" : "Front"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === "back" && styles.toggleActive]}
          onPress={() => setView("back")}
        >
          <Text style={[styles.toggleText, view === "back" && styles.toggleTextActive]}>
            {language === "ar" ? "الخلف" : "Back"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.svgWrap}>
        <BodySVG view={view} primary={primaryMuscles} secondary={secondaryMuscles} />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: PRIMARY }]} />
          <Text style={styles.legendText}>
            {language === "ar" ? "رئيسية" : "Primary"}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: SECONDARY }]} />
          <Text style={styles.legendText}>
            {language === "ar" ? "ثانوية" : "Secondary"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 14,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: "rgba(226,212,255,0.14)",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
  },
  toggleTextActive: {
    color: "#E2D4FF",
  },
  svgWrap: {
    alignItems: "center",
  },
  legend: {
    flexDirection: "row",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
  },
});
