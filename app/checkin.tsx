import React, { useCallback, useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import { useLanguage } from "@/src/context/LanguageContext";
import { getDailyCheckIn, saveDailyCheckIn } from "@/src/storage/checkinStorage";

// ── data ──────────────────────────────────────────────────────────────────────

const MOODS = [
  { key: "calm",  emoji: "🌙", ar: "هدوء",    en: "Calm"    },
  { key: "focus", emoji: "⚡", ar: "طاقة",    en: "Energy"  },
  { key: "soft",  emoji: "💜", ar: "مشاعري",  en: "Reflect" },
  { key: "slow",  emoji: "🥗", ar: "أكلي",    en: "Food"    },
];

const ENERGY_LEVELS = [
  { value: 2,  emoji: "😴", ar: "منهكة",    en: "Drained"   },
  { value: 4,  emoji: "🌧️", ar: "خافتة",   en: "Low"       },
  { value: 6,  emoji: "🌤️", ar: "متوازنة", en: "Balanced"  },
  { value: 8,  emoji: "⚡", ar: "جيدة",    en: "Good"      },
  { value: 10, emoji: "🔥", ar: "مرتفعة",  en: "High"      },
];

const SLEEP_OPTIONS = [
  { value: 4, label: "4h" },
  { value: 5, label: "5h" },
  { value: 6, label: "6h" },
  { value: 7, label: "7h" },
  { value: 8, label: "8h" },
  { value: 9, label: "9h+" },
];

const SYMPTOMS = [
  { key: "cramps",     emoji: "🌊", ar: "تقلصات",     en: "Cramps"      },
  { key: "headache",   emoji: "😣", ar: "صداع",        en: "Headache"    },
  { key: "fatigue",    emoji: "😴", ar: "إرهاق",       en: "Fatigue"     },
  { key: "bloating",   emoji: "🫧", ar: "انتفاخ",      en: "Bloating"    },
  { key: "anxiety",    emoji: "😟", ar: "قلق",          en: "Anxiety"     },
  { key: "mood_swing", emoji: "💭", ar: "تقلب مزاج",   en: "Mood swings" },
  { key: "insomnia",   emoji: "🌙", ar: "صعوبة نوم",   en: "Insomnia"    },
  { key: "cravings",   emoji: "🍫", ar: "شهية زائدة",  en: "Cravings"    },
];

// ── screen ─────────────────────────────────────────────────────────────────────

export default function CheckinScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [mood,             setMood]             = useState<string | null>(null);
  const [energy,           setEnergy]           = useState<number | null>(null);
  const [sleepHours,       setSleepHours]       = useState<number | null>(null);
  const [symptoms,         setSymptoms]         = useState<string[]>([]);
  const [fastingCompleted, setFastingCompleted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [weightStr,        setWeightStr]        = useState("");
  const [saving,           setSaving]           = useState(false);
  const [saved,            setSaved]            = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const ci = await getDailyCheckIn();
        if (!ci) return;
        if (ci.mood)             setMood(ci.mood);
        if (ci.energy)           setEnergy(ci.energy);
        if (ci.sleepHours)       setSleepHours(ci.sleepHours);
        if (ci.symptoms)         setSymptoms(ci.symptoms);
        if (ci.fastingCompleted) setFastingCompleted(ci.fastingCompleted);
        if (ci.workoutCompleted) setWorkoutCompleted(ci.workoutCompleted);
        if (ci.weight)           setWeightStr(String(ci.weight));
      }
      load();
    }, [])
  );

  function toggleSymptom(key: string) {
    setSymptoms(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const weight = weightStr.trim() !== "" ? parseFloat(weightStr) : undefined;
      await saveDailyCheckIn({
        mood:             mood ?? undefined,
        energy:           energy ?? undefined,
        sleepHours:       sleepHours ?? undefined,
        symptoms,
        fastingCompleted,
        workoutCompleted,
        weight:           isNaN(weight as number) ? undefined : weight,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.back();
      }, 1000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <LinearGradient colors={["#05050A", "#121225", "#241A3D"]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Text style={s.pageLabel}>{isAr ? "إيقاع" : "Eqa'a"}</Text>
            <Text style={s.pageTitle}>{isAr ? "تسجيل اليوم" : "Daily Check-In"}</Text>
            <Text style={[s.pageSub, isAr && { textAlign: "right" }]}>
              {isAr
                ? "بضع لحظات تساعد إيقاع على دعمك بشكل أعمق."
                : "A few moments help Eqa'a support you more deeply."}
            </Text>

            {/* ── 1. Mood ── */}
            <View style={s.section}>
              <Text style={[s.sectionLabel, isAr && { textAlign: "right" }]}>
                {isAr ? "🌙  مزاجك اليوم" : "🌙  Today's Mood"}
              </Text>
              <View style={[s.grid2, isAr && { flexDirection: "row-reverse" }]}>
                {MOODS.map(m => {
                  const active = mood === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      activeOpacity={0.85}
                      onPress={() => setMood(m.key)}
                      style={[s.moodCard, active && s.moodCardActive]}
                    >
                      <Text style={s.optEmoji}>{m.emoji}</Text>
                      <Text style={[s.optLabel, active && s.optLabelActive]}>
                        {isAr ? m.ar : m.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── 2. Energy ── */}
            <View style={s.section}>
              <Text style={[s.sectionLabel, isAr && { textAlign: "right" }]}>
                {isAr ? "⚡  مستوى الطاقة" : "⚡  Energy Level"}
              </Text>
              <View style={[s.row5, isAr && { flexDirection: "row-reverse" }]}>
                {ENERGY_LEVELS.map(e => {
                  const active = energy === e.value;
                  return (
                    <TouchableOpacity
                      key={e.value}
                      activeOpacity={0.85}
                      onPress={() => setEnergy(e.value)}
                      style={[s.energyBtn, active && { backgroundColor: "#FFD66B22", borderColor: "#FFD66B" }]}
                    >
                      <Text style={s.optEmoji}>{e.emoji}</Text>
                      <Text style={[s.optLabelSm, active && { color: "#FFD66B", fontWeight: "800" }]}>
                        {isAr ? e.ar : e.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── 3. Sleep ── */}
            <View style={s.section}>
              <Text style={[s.sectionLabel, isAr && { textAlign: "right" }]}>
                {isAr ? "💤  ساعات النوم" : "💤  Sleep Hours"}
              </Text>
              <View style={[s.row6, isAr && { flexDirection: "row-reverse" }]}>
                {SLEEP_OPTIONS.map(o => {
                  const active = sleepHours === o.value;
                  return (
                    <TouchableOpacity
                      key={o.value}
                      activeOpacity={0.85}
                      onPress={() => setSleepHours(o.value)}
                      style={[s.sleepBtn, active && { backgroundColor: "#C6A7FF22", borderColor: "#C6A7FF" }]}
                    >
                      <Text style={[s.sleepBtnTxt, active && { color: "#C6A7FF", fontWeight: "800" }]}>
                        {o.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── 4. Symptoms ── */}
            <View style={s.section}>
              <Text style={[s.sectionLabel, isAr && { textAlign: "right" }]}>
                {isAr ? "🌊  أعراض اليوم (اختياري)" : "🌊  Today's Symptoms (optional)"}
              </Text>
              <View style={[s.chipRow, isAr && { flexDirection: "row-reverse" }]}>
                {SYMPTOMS.map(sym => {
                  const active = symptoms.includes(sym.key);
                  return (
                    <TouchableOpacity
                      key={sym.key}
                      activeOpacity={0.85}
                      onPress={() => toggleSymptom(sym.key)}
                      style={[s.chip, active && s.chipActive]}
                    >
                      <Text style={s.chipEmoji}>{sym.emoji}</Text>
                      <Text style={[s.chipTxt, active && s.chipTxtActive]}>
                        {isAr ? sym.ar : sym.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── 5. Fasting + Workout toggles ── */}
            <View style={s.section}>
              <Text style={[s.sectionLabel, isAr && { textAlign: "right" }]}>
                {isAr ? "✅  إنجازات اليوم" : "✅  Today's Achievements"}
              </Text>
              <View style={[s.toggleRow, isAr && { flexDirection: "row-reverse" }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setFastingCompleted(p => !p)}
                  style={[s.toggleCard, fastingCompleted && { backgroundColor: "#7FFFD422", borderColor: "#7FFFD4" }]}
                >
                  <Text style={s.toggleEmoji}>⚡</Text>
                  <Text style={[s.toggleTxt, fastingCompleted && { color: "#7FFFD4" }]}>
                    {isAr ? "أكملتِ الصيام" : "Fasting done"}
                  </Text>
                  <View style={[s.togglePill, { backgroundColor: fastingCompleted ? "#7FFFD4" : "rgba(255,255,255,0.10)" }]}>
                    <Text style={[s.togglePillTxt, { color: fastingCompleted ? "#111" : "rgba(255,255,255,0.35)" }]}>
                      {fastingCompleted ? "✓" : "○"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setWorkoutCompleted(p => !p)}
                  style={[s.toggleCard, workoutCompleted && { backgroundColor: "#C6A7FF22", borderColor: "#C6A7FF" }]}
                >
                  <Text style={s.toggleEmoji}>🏃</Text>
                  <Text style={[s.toggleTxt, workoutCompleted && { color: "#C6A7FF" }]}>
                    {isAr ? "تمارين اليوم" : "Workout done"}
                  </Text>
                  <View style={[s.togglePill, { backgroundColor: workoutCompleted ? "#C6A7FF" : "rgba(255,255,255,0.10)" }]}>
                    <Text style={[s.togglePillTxt, { color: workoutCompleted ? "#111" : "rgba(255,255,255,0.35)" }]}>
                      {workoutCompleted ? "✓" : "○"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── 6. Weight (optional) ── */}
            <View style={s.section}>
              <Text style={[s.sectionLabel, isAr && { textAlign: "right" }]}>
                {isAr ? "⚖️  وزنكِ اليوم (اختياري)" : "⚖️  Today's Weight (optional)"}
              </Text>
              <View style={s.weightRow}>
                <TextInput
                  style={[s.weightInput, isAr && { textAlign: "right" }]}
                  value={weightStr}
                  onChangeText={setWeightStr}
                  placeholder={isAr ? "مثال: 62.5" : "e.g. 62.5"}
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
                <Text style={s.weightUnit}>{isAr ? "كجم" : "kg"}</Text>
              </View>
            </View>

            {/* ── Save button ── */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSave}
              disabled={saving}
              style={[s.saveBtn, saved && { backgroundColor: "#7FFFD4" }]}
            >
              <Text style={s.saveBtnTxt}>
                {saved
                  ? (isAr ? "✓  تم الحفظ" : "✓  Saved")
                  : saving
                  ? (isAr ? "جارٍ الحفظ…" : "Saving…")
                  : (isAr ? "حفظ تسجيل اليوم" : "Save Check-In")}
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 8,
  },

  pageLabel: {
    color: "#C6A7FF",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  pageSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 10,
  },

  section: {
    marginTop: 22,
    gap: 14,
  },
  sectionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  // mood grid 2×2
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moodCard: {
    width: "47%",
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  moodCardActive: {
    backgroundColor: "rgba(198,167,255,0.18)",
    borderColor: "#C6A7FF",
  },

  // shared option styles
  optEmoji:      { fontSize: 26 },
  optLabel:      { color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: "700" },
  optLabelActive:{ color: "#FFFFFF", fontWeight: "900" },
  optLabelSm:    { color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: "600", textAlign: "center" },

  // energy 5-col row
  row5: {
    flexDirection: "row",
    gap: 8,
  },
  energyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  // sleep 6-col row
  row6: {
    flexDirection: "row",
    gap: 8,
  },
  sleepBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sleepBtnTxt: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "700",
  },

  // symptom chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipActive: {
    backgroundColor: "rgba(255,111,174,0.18)",
    borderColor: "#FF6FAE",
  },
  chipEmoji:    { fontSize: 14 },
  chipTxt:      { color: "rgba(255,255,255,0.60)", fontSize: 13, fontWeight: "600" },
  chipTxtActive:{ color: "#FF6FAE", fontWeight: "800" },

  // fasting/workout toggles
  toggleRow: {
    flexDirection: "row",
    gap: 12,
  },
  toggleCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 22,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  toggleEmoji:   { fontSize: 24 },
  toggleTxt:     { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700", textAlign: "center" },
  togglePill:    { width: 32, height: 20, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  togglePillTxt: { fontSize: 12, fontWeight: "900" },

  // weight input
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weightInput: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 18,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  weightUnit: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 16,
    fontWeight: "700",
    width: 40,
  },

  // save
  saveBtn: {
    marginTop: 32,
    height: 60,
    borderRadius: 999,
    backgroundColor: "#C6A7FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
  },
  saveBtnTxt: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
