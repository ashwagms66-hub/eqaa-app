import React, { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import {
  DEFAULT_SCHEDULE_DAYS,
  DAY_LABELS,
  ORDERED_DAY_KEYS,
  WORKOUT_TYPES,
  WORKOUT_TYPE_META,
  getTodayDayKey,
  getTodayWorkoutFromSchedule,
  getWorkoutSchedule,
  saveWorkoutSchedule,
  resetWorkoutSchedule,
  type WorkoutDayKey,
  type WorkoutDayType,
  type WorkoutSchedule,
  type WorkoutScheduleDay,
  type WorkoutScheduleRepeatMode,
} from "@/src/storage/workoutScheduleStorage";

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function WorkoutScheduleScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [days, setDays] = useState<WorkoutScheduleDay[]>(DEFAULT_SCHEDULE_DAYS);
  const [repeatMode, setRepeatMode] = useState<WorkoutScheduleRepeatMode>("continuous");

  // Picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<WorkoutDayKey | null>(null);
  const [draftType, setDraftType] = useState<WorkoutDayType>("rest");
  const [draftCustom, setDraftCustom] = useState("");

  const todayKey = getTodayDayKey();
  const todayDraft: WorkoutScheduleDay =
    days.find((d) => d.dayKey === todayKey) ?? { dayKey: todayKey, type: "rest" };

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const saved = await getWorkoutSchedule();
        if (saved) {
          setDays(saved.days);
          setRepeatMode(saved.repeatMode);
        } else {
          setDays(DEFAULT_SCHEDULE_DAYS);
          setRepeatMode("continuous");
        }
      }
      load();
    }, [])
  );

  function openPicker(dayKey: WorkoutDayKey) {
    const day = days.find((d) => d.dayKey === dayKey);
    setEditingKey(dayKey);
    setDraftType(day?.type ?? "rest");
    setDraftCustom(day?.customLabel ?? "");
    setPickerVisible(true);
  }

  function confirmPicker() {
    if (draftType === "custom" && !draftCustom.trim()) {
      Alert.alert(
        isAr ? "تنبيه" : "Required",
        isAr ? "اكتبي اسم التمرين المخصص" : "Enter a custom workout name"
      );
      return;
    }
    if (!editingKey) return;
    setDays((prev) =>
      prev.map((d) =>
        d.dayKey === editingKey
          ? {
              ...d,
              type: draftType,
              customLabel: draftType === "custom" ? draftCustom.trim() : undefined,
            }
          : d
      )
    );
    setPickerVisible(false);
  }

  async function handleSave() {
    const now = new Date().toISOString();
    const existing = await getWorkoutSchedule();
    const schedule: WorkoutSchedule = {
      days,
      repeatMode,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await saveWorkoutSchedule(schedule);
    Alert.alert(
      "",
      isAr ? "تم حفظ جدول التمرين" : "Workout schedule saved",
      [{ text: isAr ? "حسناً" : "OK" }]
    );
  }

  function handleReset() {
    Alert.alert(
      isAr ? "إعادة الضبط" : "Reset Schedule",
      isAr
        ? "هل تريدين إعادة ضبط الجدول لأيام الراحة؟"
        : "Reset all days to rest?",
      [
        { text: isAr ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: isAr ? "إعادة الضبط" : "Reset",
          style: "destructive",
          onPress: async () => {
            await resetWorkoutSchedule();
            setDays(DEFAULT_SCHEDULE_DAYS);
            setRepeatMode("continuous");
          },
        },
      ]
    );
  }

  const todayMeta = WORKOUT_TYPE_META[todayDraft.type];
  const todayLabel = isAr ? todayMeta.labelAr : todayMeta.labelEn;
  const todayDisplayLabel =
    todayDraft.type === "custom" && todayDraft.customLabel
      ? todayDraft.customLabel
      : todayLabel;

  return (
    <LinearGradient colors={["#05050A", "#121225", "#221A3D"]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={[s.header, isAr && { flexDirection: "row-reverse" }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {isAr
              ? <ChevronRight color="#FFFFFF" size={22} strokeWidth={2.5} />
              : <ChevronLeft color="#FFFFFF" size={22} strokeWidth={2.5} />}
          </TouchableOpacity>
          <Text style={s.headerTitle}>{isAr ? "جدول التمرين" : "Workout Schedule"}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtitle */}
          <Text style={[s.subtitle, isAr && { textAlign: "right" }]}>
            {isAr
              ? "خططي أسبوعك وخلّي إيقاع يرتب تمرينك اليومي"
              : "Plan your week and let Eqa'a organize today's training"}
          </Text>

          {/* Today Preview Card */}
          <View style={[s.todayCard, { borderColor: `${todayMeta.accent}50` }]}>
            <LinearGradient
              colors={[`${todayMeta.accent}18`, "rgba(0,0,0,0)"]}
              style={s.todayGrad}
            >
              <Text style={[s.todayDateLabel, isAr && { textAlign: "right" }]}>
                {isAr
                  ? `اليوم: ${DAY_LABELS[todayKey].ar}`
                  : `Today: ${DAY_LABELS[todayKey].en}`}
              </Text>
              <View style={[s.todayRow, isAr && { flexDirection: "row-reverse" }]}>
                <View style={[s.todayOrbWrap, { backgroundColor: `${todayMeta.accent}22` }]}>
                  <Text style={s.todayEmoji}>{todayMeta.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  {todayDraft.type === "rest" ? (
                    <>
                      <Text style={[s.todayWorkoutLabel, isAr && { textAlign: "right" }]}>
                        {isAr ? "اليوم راحة" : "Rest Day"}
                      </Text>
                      <Text style={[s.todayWorkoutDesc, isAr && { textAlign: "right" }]}>
                        {isAr ? "خذي وقتك للاستشفاء" : "Give your body time to recover"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[s.todayWorkoutSmall, isAr && { textAlign: "right" }]}>
                        {isAr ? "تمرين اليوم" : "Today's workout"}
                      </Text>
                      <Text style={[s.todayWorkoutLabel, { color: todayMeta.accent }, isAr && { textAlign: "right" }]}>
                        {todayDisplayLabel}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Weekly Planner */}
          <Text style={s.sectionTitle}>{isAr ? "الجدول الأسبوعي" : "Weekly Schedule"}</Text>
          {ORDERED_DAY_KEYS.map((key) => {
            const day = days.find((d) => d.dayKey === key) ?? { dayKey: key, type: "rest" as WorkoutDayType };
            const meta = WORKOUT_TYPE_META[day.type];
            const isToday = key === todayKey;
            const label = isAr ? meta.labelAr : meta.labelEn;
            const displayLabel =
              day.type === "custom" && day.customLabel ? day.customLabel : label;

            return (
              <TouchableOpacity
                key={key}
                style={[
                  s.dayCard,
                  { borderColor: isToday ? `${meta.accent}60` : "rgba(255,255,255,0.08)" },
                  isToday && { backgroundColor: `${meta.accent}0D` },
                ]}
                onPress={() => openPicker(key)}
                activeOpacity={0.8}
              >
                <View style={[s.dayCardInner, isAr && { flexDirection: "row-reverse" }]}>
                  {/* Day name */}
                  <View style={s.dayNameWrap}>
                    <Text style={[s.dayName, isAr && { textAlign: "right" }]}>
                      {isAr ? DAY_LABELS[key].ar : DAY_LABELS[key].en}
                    </Text>
                    {isToday && (
                      <Text style={[s.todayBadge, { color: meta.accent }]}>
                        {isAr ? "اليوم" : "Today"}
                      </Text>
                    )}
                  </View>
                  {/* Workout type */}
                  <View style={[s.dayTypeWrap, isAr && { flexDirection: "row-reverse" }]}>
                    <Text style={s.dayTypeEmoji}>{meta.emoji}</Text>
                    <Text style={[s.dayTypeLabel, { color: day.type === "rest" ? "rgba(255,255,255,0.38)" : meta.accent }]} numberOfLines={1}>
                      {displayLabel}
                    </Text>
                  </View>
                  {/* Chevron */}
                  {isAr
                    ? <ChevronLeft color="rgba(255,255,255,0.25)" size={16} strokeWidth={2} />
                    : <ChevronRight color="rgba(255,255,255,0.25)" size={16} strokeWidth={2} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Repeat Mode */}
          <Text style={s.sectionTitle}>{isAr ? "تكرار الجدول" : "Schedule Repeat"}</Text>
          <View style={[s.repeatRow, isAr && { flexDirection: "row-reverse" }]}>
            <TouchableOpacity
              style={[s.repeatOpt, repeatMode === "continuous" && s.repeatOptActive]}
              onPress={() => setRepeatMode("continuous")}
              activeOpacity={0.8}
            >
              <Text style={[s.repeatOptText, repeatMode === "continuous" && s.repeatOptTextActive]}>
                {isAr ? "تكرار مستمر" : "Repeat continuously"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.repeatOpt, repeatMode === "one_month" && s.repeatOptActive]}
              onPress={() => setRepeatMode("one_month")}
              activeOpacity={0.8}
            >
              <Text style={[s.repeatOptText, repeatMode === "one_month" && s.repeatOptTextActive]}>
                {isAr ? "تكرار لمدة شهر" : "Repeat for one month"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save */}
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>{isAr ? "حفظ الجدول" : "Save Schedule"}</Text>
          </TouchableOpacity>

          {/* Reset */}
          <TouchableOpacity style={s.resetBtn} onPress={handleReset} activeOpacity={0.85}>
            <Text style={s.resetBtnText}>{isAr ? "إعادة الضبط" : "Reset"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* ── Workout Type Picker Modal ──────────────────────────────────────── */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <TouchableOpacity style={s.modalSheet} activeOpacity={1} onPress={() => {}}>
            {/* Modal header */}
            <View style={[s.modalHeader, isAr && { flexDirection: "row-reverse" }]}>
              <Text style={s.modalTitle}>
                {isAr ? "اختاري نوع التمرين" : "Choose Workout Type"}
              </Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)} style={s.modalCloseBtn}>
                <X color="rgba(255,255,255,0.5)" size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={s.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              {WORKOUT_TYPES.map((type) => {
                const meta = WORKOUT_TYPE_META[type];
                const isSelected = draftType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      s.typeRow,
                      isSelected && { backgroundColor: `${meta.accent}18`, borderColor: `${meta.accent}50` },
                      isAr && { flexDirection: "row-reverse" },
                    ]}
                    onPress={() => setDraftType(type)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.typeEmoji}>{meta.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.typeLabel, { color: isSelected ? meta.accent : "#FFFFFF" }, isAr && { textAlign: "right" }]}>
                        {isAr ? meta.labelAr : meta.labelEn}
                      </Text>
                      <Text style={[s.typeDesc, isAr && { textAlign: "right" }]}>
                        {isAr ? meta.descAr : meta.descEn}
                      </Text>
                    </View>
                    {isSelected && (
                      <Text style={[s.checkMark, { color: meta.accent }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Custom label input */}
              {draftType === "custom" && (
                <TextInput
                  value={draftCustom}
                  onChangeText={setDraftCustom}
                  placeholder={isAr ? "اكتبي اسم التمرين" : "Enter workout name"}
                  placeholderTextColor="rgba(255,255,255,0.30)"
                  style={[s.customInput, isAr && { textAlign: "right" }]}
                  autoFocus
                  returnKeyType="done"
                />
              )}

              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Confirm button */}
            <TouchableOpacity style={s.confirmBtn} onPress={confirmPicker} activeOpacity={0.85}>
              <Text style={s.confirmBtnText}>{isAr ? "تأكيد" : "Confirm"}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  subtitle: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 20,
  },

  // Today preview card
  todayCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 28,
  },

  todayGrad: {
    padding: 20,
  },

  todayDateLabel: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  todayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  todayOrbWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  todayEmoji: { fontSize: 26 },

  todayWorkoutSmall: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: 0.3,
  },

  todayWorkoutLabel: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  todayWorkoutDesc: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  // Day cards
  dayCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
  },

  dayCardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },

  dayNameWrap: {
    width: 100,
    flexShrink: 0,
  },

  dayName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  todayBadge: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  dayTypeWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dayTypeEmoji: { fontSize: 18 },

  dayTypeLabel: {
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },

  // Repeat mode
  repeatRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  repeatOpt: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },

  repeatOptActive: {
    borderColor: "rgba(198,167,255,0.55)",
    backgroundColor: "rgba(198,167,255,0.12)",
  },

  repeatOptText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  repeatOptTextActive: {
    color: "#C6A7FF",
  },

  // Buttons
  saveBtn: {
    backgroundColor: "#C6A7FF",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  saveBtnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
  },

  resetBtn: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  resetBtnText: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 14,
    fontWeight: "700",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#16162A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },

  typeEmoji: { fontSize: 24, flexShrink: 0 },

  typeLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },

  typeDesc: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },

  checkMark: {
    fontSize: 18,
    fontWeight: "900",
    flexShrink: 0,
  },

  customInput: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.30)",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 14,
    marginBottom: 4,
  },

  confirmBtn: {
    backgroundColor: "#C6A7FF",
    margin: 16,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },

  confirmBtnText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "900",
  },
});
