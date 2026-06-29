import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import {
  getActivityLevel,
  getGoalWeight,
  getHeight,
  getLifeMode,
  getWeight,
  saveActivityLevel,
  saveCalories,
  saveGoalWeight,
  saveGoals,
  saveHeight,
  saveLifeMode,
  saveWeight,
} from "@/src/storage/profileStorage";

const S = {
  ar: {
    title: "الملف الغذائي",
    subtitle: "السعرات والهدف والنشاط",
    height: "الطول (سم)",
    weight: "الوزن الحالي (كجم)",
    goalWeight: "الوزن المستهدف (كجم)",
    activity: "مستوى النشاط",
    low: "خفيف",
    moderate: "معتدل",
    high: "عالٍ",
    goalLabel: "الهدف",
    loss: "خسارة وزن",
    maintain: "وزن مثالي",
    gain: "بناء عضلات",
    lifeStage: "المرحلة الحياتية",
    regular: "دورة منتظمة",
    pcos: "غير منتظمة / تكيس",
    moon: "مزامنة القمر",
    pregnancy: "حامل",
    postpartum: "بعد الولادة",
    caloriesLabel: "السعرات اليومية الموصى بها",
    caloriesUnit: "سعرة",
    caloriesNote: "بناءً على طولك ووزنك ومستوى نشاطك",
    save: "حفظ",
    savedTitle: "تم الحفظ ✨",
    savedMsg: "تم تحديث ملفك الغذائي بنجاح.",
  },
  en: {
    title: "Nutrition Profile",
    subtitle: "Calories, goal & activity",
    height: "Height (cm)",
    weight: "Current weight (kg)",
    goalWeight: "Goal weight (kg)",
    activity: "Activity Level",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    goalLabel: "Goal",
    loss: "Weight Loss",
    maintain: "Maintain",
    gain: "Build Muscle",
    lifeStage: "Life Stage",
    regular: "Regular Cycle",
    pcos: "Irregular / PCOS",
    moon: "Moon Sync",
    pregnancy: "Pregnancy",
    postpartum: "Postpartum",
    caloriesLabel: "Recommended Daily Calories",
    caloriesUnit: "kcal",
    caloriesNote: "Based on your height, weight & activity",
    save: "Save",
    savedTitle: "Saved ✨",
    savedMsg: "Your nutrition profile has been updated.",
  },
} as const;

type ActivityKey = "low" | "moderate" | "high";
type GoalKey = "loss" | "maintain" | "gain";
type LifeMode = "regular" | "pcos" | "moon" | "pregnancy" | "postpartum";

export default function NutritionProfileScreen() {
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const isAr = language === "ar";
  const t = S[language];

  const [height, setHeight] = useState("163");
  const [weight, setWeight] = useState("68");
  const [goalWeight, setGoalWeight] = useState("60");
  const [activity, setActivity] = useState<ActivityKey>("moderate");
  const [goal, setGoal] = useState<GoalKey>("loss");
  const [lifeMode, setLifeMode] = useState<LifeMode>("regular");

  useEffect(() => {
    async function load() {
      const [h, w, gw, act, mode] = await Promise.all([
        getHeight(),
        getWeight(),
        getGoalWeight(),
        getActivityLevel(),
        getLifeMode(),
      ]);
      setHeight(h.toString());
      setWeight(w.toString());
      setGoalWeight(gw.toString());
      if (act === "low" || act === "moderate" || act === "high") setActivity(act);
      if (mode) setLifeMode(mode as LifeMode);
    }
    load();
  }, []);

  function calcCalories(): number {
    const w = Number(weight) || 68;
    const h = Number(height) || 163;
    let base = 655 + 9.6 * w + 1.8 * h;
    if (activity === "low") base *= 1.2;
    else if (activity === "moderate") base *= 1.45;
    else base *= 1.55;
    if (goal === "loss") base -= 500;
    else if (goal === "gain") base += 250;
    if (lifeMode === "pregnancy") base += 250;
    if (lifeMode === "postpartum") base += 180;
    return Math.round(base);
  }

  async function handleSave() {
    const cals = calcCalories();
    await Promise.all([
      saveHeight(Number(height)),
      saveWeight(Number(weight)),
      saveGoalWeight(Number(goalWeight)),
      saveActivityLevel(activity),
      saveCalories(cals),
      saveGoals([goal]),
      saveLifeMode(lifeMode),
    ]);
    Alert.alert(t.savedTitle, t.savedMsg, [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  const BackIcon = isAr ? ChevronRight : ChevronLeft;
  const calories = calcCalories();

  const activityOptions: { key: ActivityKey; label: string }[] = [
    { key: "low", label: t.low },
    { key: "moderate", label: t.moderate },
    { key: "high", label: t.high },
  ];

  const goalOptions: { key: GoalKey; label: string }[] = [
    { key: "loss", label: t.loss },
    { key: "maintain", label: t.maintain },
    { key: "gain", label: t.gain },
  ];

  const lifeModeOptions: { key: LifeMode; label: string }[] = [
    { key: "regular", label: t.regular },
    { key: "pcos", label: t.pcos },
    { key: "moon", label: t.moon },
    { key: "pregnancy", label: t.pregnancy },
    { key: "postpartum", label: t.postpartum },
  ];

  return (
    <LinearGradient colors={["#05050A", "#121225", "#221A3D"]} style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Top bar */}
        <View style={[s.topBar, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <BackIcon color="rgba(255,255,255,0.7)" size={22} strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[s.screenTitle, isAr && { textAlign: "right" }]}>{t.title}</Text>
            <Text style={[s.screenSubtitle, isAr && { textAlign: "right" }]}>{t.subtitle}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Measurements */}
          <View style={s.inputsRow}>
            <NumField label={t.height} value={height} onChange={setHeight} isAr={isAr} />
            <NumField label={t.weight} value={weight} onChange={setWeight} isAr={isAr} />
            <NumField label={t.goalWeight} value={goalWeight} onChange={setGoalWeight} isAr={isAr} />
          </View>

          {/* Activity */}
          <FieldLabel title={t.activity} isAr={isAr} />
          <ChipRow>
            {activityOptions.map((item) => (
              <ChipButton
                key={item.key}
                label={item.label}
                active={activity === item.key}
                onPress={() => setActivity(item.key)}
              />
            ))}
          </ChipRow>

          {/* Goal */}
          <FieldLabel title={t.goalLabel} isAr={isAr} />
          <ChipRow>
            {goalOptions.map((item) => (
              <ChipButton
                key={item.key}
                label={item.label}
                active={goal === item.key}
                onPress={() => setGoal(item.key)}
              />
            ))}
          </ChipRow>

          {/* Life Stage */}
          <FieldLabel title={t.lifeStage} isAr={isAr} />
          <ChipRow wrap>
            {lifeModeOptions.map((item) => (
              <ChipButton
                key={item.key}
                label={item.label}
                active={lifeMode === item.key}
                onPress={() => setLifeMode(item.key)}
              />
            ))}
          </ChipRow>

          {/* Calories preview */}
          <LinearGradient
            colors={["rgba(52,211,153,0.12)", "rgba(52,211,153,0.04)"]}
            style={s.caloriesCard}
          >
            <Text style={s.caloriesLabel}>{t.caloriesLabel}</Text>
            <Text style={s.caloriesValue}>
              {calories}{" "}
              <Text style={s.caloriesUnit}>{t.caloriesUnit}</Text>
            </Text>
            <Text style={[s.caloriesNote, isAr && { textAlign: "right" }]}>{t.caloriesNote}</Text>
          </LinearGradient>

          {/* Save */}
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.88}>
            <Text style={s.saveBtnText}>{t.save}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function NumField({
  label,
  value,
  onChange,
  isAr,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  isAr: boolean;
}) {
  return (
    <View style={s.inputGroup}>
      <Text style={[s.inputLabel, isAr && { textAlign: "right" }]}>{label}</Text>
      <TextInput
        style={[s.numInput, isAr && { textAlign: "right" }]}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        placeholderTextColor="rgba(255,255,255,0.28)"
        maxLength={4}
        returnKeyType="next"
      />
    </View>
  );
}

function FieldLabel({ title, isAr }: { title: string; isAr: boolean }) {
  return (
    <Text style={[s.fieldLabel, isAr && { textAlign: "right" }]}>{title}</Text>
  );
}

function ChipRow({ children, wrap }: { children: React.ReactNode; wrap?: boolean }) {
  return (
    <View style={[s.chipRow, wrap && { flexWrap: "wrap" }]}>{children}</View>
  );
}

function ChipButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.chip, active && s.chipActive]}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    flexShrink: 0,
  },

  screenTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  screenSubtitle: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  inputsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  inputGroup: { flex: 1 },

  inputLabel: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },

  numInput: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  fieldLabel: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
    marginTop: 20,
  },

  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },

  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
  },

  chipActive: {
    backgroundColor: "#C6A7FF",
    borderColor: "#C6A7FF",
  },

  chipText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },

  chipTextActive: { color: "#111111" },

  caloriesCard: {
    marginTop: 28,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.18)",
    alignItems: "center",
    gap: 6,
  },

  caloriesLabel: {
    color: "rgba(52,211,153,0.72)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },

  caloriesValue: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -2,
    textAlign: "center",
  },

  caloriesUnit: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.45)",
  },

  caloriesNote: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },

  saveBtn: {
    marginTop: 32,
    height: 60,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C6A7FF",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },

  saveBtnText: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "900",
  },
});
