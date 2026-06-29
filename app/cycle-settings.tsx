import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, Moon } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useLanguage } from "@/src/context/LanguageContext";
import {
  getCycleLength,
  getLastPeriod,
  getPeriodLength,
  saveCycleLength,
  saveLastPeriod,
  savePeriodLength,
} from "@/src/storage/cycleStorage";

const S = {
  ar: {
    title: "بيانات الدورة",
    subtitle: "مدة الدورة وآخر دورة والمرحلة الحياتية",
    lastPeriodLabel: "تاريخ آخر دورة",
    selectDate: "اختاري التاريخ",
    cycleLengthLabel: "مدة الدورة (بالأيام)",
    periodLengthLabel: "مدة الحيض (بالأيام)",
    dayUnit: "يوم",
    done: "تم",
    save: "حفظ",
    savedTitle: "تم الحفظ ✨",
    savedMsg: "تم تحديث بيانات دورتك بنجاح.",
    ok: "حسناً",
  },
  en: {
    title: "Cycle Data",
    subtitle: "Last period, cycle length & life stage",
    lastPeriodLabel: "Last Period Date",
    selectDate: "Select date",
    cycleLengthLabel: "Cycle Length (days)",
    periodLengthLabel: "Period Length (days)",
    dayUnit: "d",
    done: "Done",
    save: "Save",
    savedTitle: "Saved ✨",
    savedMsg: "Your cycle data has been updated.",
    ok: "OK",
  },
} as const;

const CYCLE_LENGTHS = ["21", "24", "26", "28", "30", "32", "35"];
const PERIOD_LENGTHS = ["2", "3", "4", "5", "6", "7", "8"];

export default function CycleSettingsScreen() {
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const isAr = language === "ar";
  const t = S[language];

  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    async function load() {
      const [lp, cl, pl] = await Promise.all([getLastPeriod(), getCycleLength(), getPeriodLength()]);
      if (lp) setLastPeriodDate(lp);
      if (cl) setCycleLength(cl.toString());
      if (pl) setPeriodLength(pl.toString());
    }
    load();
  }, []);

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  function displayDate(): string {
    if (!lastPeriodDate) return t.selectDate;
    return new Date(lastPeriodDate).toLocaleDateString(
      isAr ? "ar-SA" : "en-GB",
      { day: "numeric", month: "long", year: "numeric" }
    );
  }

  async function handleSave() {
    await Promise.all([
      saveCycleLength(Number(cycleLength)),
      savePeriodLength(Number(periodLength)),
      lastPeriodDate ? saveLastPeriod(lastPeriodDate) : Promise.resolve(),
    ]);
    Alert.alert(t.savedTitle, t.savedMsg, [
      { text: t.ok, onPress: () => router.back() },
    ]);
  }

  const BackIcon = isAr ? ChevronRight : ChevronLeft;

  return (
    <LinearGradient colors={["#05050A", "#121225", "#221A3D"]} style={s.container}>
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
      >
        {/* Last period date */}
        <Text style={[s.fieldLabel, isAr && { textAlign: "right" }]}>
          {t.lastPeriodLabel}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[s.dateButton, isAr && { flexDirection: "row-reverse" }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={s.dateValue}>{displayDate()}</Text>
          <Moon color="#C6A7FF" size={18} strokeWidth={2} />
        </TouchableOpacity>

        {showDatePicker && (
          <View style={s.pickerWrapper}>
            <DateTimePicker
              value={lastPeriodDate ? new Date(lastPeriodDate) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              maximumDate={new Date()}
              onChange={(_, selectedDate) => {
                if (Platform.OS !== "ios") setShowDatePicker(false);
                if (selectedDate) setLastPeriodDate(formatDate(selectedDate));
              }}
            />
            <TouchableOpacity
              style={s.doneBtn}
              onPress={() => setShowDatePicker(false)}
              activeOpacity={0.88}
            >
              <Text style={s.doneBtnText}>{t.done}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cycle length */}
        <Text style={[s.fieldLabel, isAr && { textAlign: "right" }, { marginTop: 28 }]}>
          {t.cycleLengthLabel}
        </Text>
        <View style={s.chipRow}>
          {CYCLE_LENGTHS.map((len) => {
            const active = len === cycleLength;
            return (
              <TouchableOpacity
                key={len}
                activeOpacity={0.85}
                onPress={() => setCycleLength(len)}
                style={[s.chip, active && s.chipActive]}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {isAr ? `${len} ${t.dayUnit}` : `${len}${t.dayUnit}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Period length */}
        <Text style={[s.fieldLabel, isAr && { textAlign: "right" }, { marginTop: 28 }]}>
          {t.periodLengthLabel}
        </Text>
        <View style={s.chipRow}>
          {PERIOD_LENGTHS.map((len) => {
            const active = len === periodLength;
            return (
              <TouchableOpacity
                key={len}
                activeOpacity={0.85}
                onPress={() => setPeriodLength(len)}
                style={[s.chip, active && s.chipActive]}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {isAr ? `${len} ${t.dayUnit}` : `${len}${t.dayUnit}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current summary */}
        {lastPeriodDate && (
          <LinearGradient
            colors={["rgba(198,167,255,0.10)", "rgba(198,167,255,0.03)"]}
            style={s.summaryCard}
          >
            <Moon color="#C6A7FF" size={18} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={[s.summaryTitle, isAr && { textAlign: "right" }]}>
                {isAr ? "ملخص الدورة" : "Cycle Summary"}
              </Text>
              <Text style={[s.summaryText, isAr && { textAlign: "right" }]}>
                {isAr
                  ? `دورة مدتها ${cycleLength} يوماً · بدأت ${displayDate()}`
                  : `${cycleLength}-day cycle · Started ${displayDate()}`}
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Save */}
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.88}>
          <Text style={s.saveBtnText}>{t.save}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
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

  fieldLabel: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.28)",
  },

  dateValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    flex: 1,
  },

  pickerWrapper: {
    marginTop: 10,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.16)",
    paddingBottom: 16,
  },

  doneBtn: {
    marginHorizontal: 18,
    marginTop: 10,
    height: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C6A7FF",
  },

  doneBtnText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "900",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    minWidth: 76,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
  },

  chipActive: {
    backgroundColor: "#C6A7FF",
    borderColor: "#C6A7FF",
  },

  chipText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  chipTextActive: { color: "#111111" },

  summaryCard: {
    marginTop: 28,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.16)",
  },

  summaryTitle: {
    color: "#C6A7FF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },

  summaryText: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
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
