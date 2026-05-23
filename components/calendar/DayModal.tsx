import { useLanguage } from "@/src/context/LanguageContext";
import {
  DailyCheckIn,
  getCheckIn,
  saveCheckIn,
} from "@/src/storage/checkinStorage";

import { BlurView } from "expo-blur";

import {
  Brain,
  Droplets,
  Heart,
  Moon,
  Sparkles,
  X,
} from "lucide-react-native";

import React, {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type DayModalProps = {
  visible: boolean;
  selectedDate: string;
  onClose: () => void;
};

const moods = [
  {
    key: "calm",
    ar: "هادئة",
    en: "Calm",
    icon: Moon,
  },
  {
    key: "focused",
    ar: "مركزة",
    en: "Focused",
    icon: Brain,
  },
  {
    key: "happy",
    ar: "سعيدة",
    en: "Happy",
    icon: Sparkles,
  },
  {
    key: "sensitive",
    ar: "حساسة",
    en: "Sensitive",
    icon: Heart,
  },
];

const symptoms = [
  {
    key: "cramps",
    ar: "تقلصات",
    en: "Cramps",
  },
  {
    key: "headache",
    ar: "صداع",
    en: "Headache",
  },
  {
    key: "bloating",
    ar: "انتفاخ",
    en: "Bloating",
  },
  {
    key: "fatigue",
    ar: "إرهاق",
    en: "Fatigue",
  },
  {
    key: "back_pain",
    ar: "ألم ظهر",
    en: "Back Pain",
  },
  {
    key: "mood_swing",
    ar: "تقلب مزاج",
    en: "Mood Swing",
  },
  {
    key: "low_energy",
    ar: "طاقة منخفضة",
    en: "Low Energy",
  },
  {
    key: "cravings",
    ar: "رغبات غذائية",
    en: "Cravings",
  },
];

const flows = [
  {
    key: "Light",
    ar: "خفيف",
    en: "Light",
  },
  {
    key: "Medium",
    ar: "متوسط",
    en: "Medium",
  },
  {
    key: "Heavy",
    ar: "غزير",
    en: "Heavy",
  },
];

export default function DayModal({
  visible,
  selectedDate,
  onClose,
}: DayModalProps) {
  const { language } = useLanguage();

  const isArabic = language === "ar";

  const [selectedMood, setSelectedMood] =
    useState("");

  const [selectedFlow, setSelectedFlow] =
    useState<
      "Light" | "Medium" | "Heavy" | ""
    >("");

  const [selectedSymptoms, setSelectedSymptoms] =
    useState<string[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [energy, setEnergy] =
    useState(72);

  const [notes, setNotes] =
    useState("");

  const [isPeriodDay, setIsPeriodDay] =
    useState(false);

  useEffect(() => {
    async function loadExistingCheckIn() {
      try {
        if (!visible) return;

        const existing =
          await getCheckIn(selectedDate);

        if (existing) {
          setSelectedMood(existing.mood || "");

          setSelectedFlow(
            existing.flow || ""
          );

          setSelectedSymptoms(
            existing.symptoms || []
          );

          setEnergy(existing.energy || 72);

          setNotes(existing.notes || "");

          setIsPeriodDay(
            existing.isPeriodDay || false
          );
        } else {
          setSelectedMood("");
          setSelectedFlow("");
          setSelectedSymptoms([]);
          setEnergy(72);
          setNotes("");
          setIsPeriodDay(false);
        }
      } catch (error) {
        console.log(error);
      }
    }

    loadExistingCheckIn();
  }, [visible, selectedDate]);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptom)) {
        return prev.filter(
          (s) => s !== symptom
        );
      }

      return [...prev, symptom];
    });
  }

  async function handleSaveCheckIn() {
    try {
      setSaving(true);

      const payload: DailyCheckIn = {
        date: selectedDate,
        mood: selectedMood,
        flow:
          selectedFlow || undefined,
        symptoms: selectedSymptoms,
        energy,
        notes,
        isPeriodDay,
        createdAt:
          new Date().toISOString(),
      };

      await saveCheckIn(payload);

      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.sheetWrapper}>
          <BlurView
            intensity={45}
            tint="dark"
            style={styles.sheet}
          >
            <View style={styles.handle} />

            <Pressable
              style={styles.floatingCloseButton}
              onPress={onClose}
            >
              <X
                color="#FFFFFF"
                size={18}
              />
            </Pressable>

            <View style={styles.headerRow}>
              <View>
                <Text
                  style={[
                    styles.title,
                    isArabic &&
                      styles.rtlText,
                  ]}
                >
                  {isArabic
                    ? "تسجيل إيقاع اليوم"
                    : "Daily Check-In"}
                </Text>

                <Text
                  style={[
                    styles.dateText,
                    isArabic &&
                      styles.rtlText,
                  ]}
                >
                  {isArabic
                    ? "تابعي طاقتك ومشاعرك وأعراضك"
                    : "Track your rhythm, energy and symptoms"}
                </Text>

                <View
                  style={
                    styles.selectedDateBadge
                  }
                >
                  <Text
                    style={
                      styles.selectedDateBadgeText
                    }
                  >
                    {selectedDate}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingBottom: 180,
              }}
            >
              <View style={styles.periodCard}>
                <View>
                  <Text
                    style={[
                      styles.periodTitle,
                      isArabic &&
                        styles.rtlText,
                    ]}
                  >
                    {isArabic
                      ? "تتبع الدورة"
                      : "Period Tracking"}
                  </Text>

                  <Text
                    style={[
                      styles.periodSubtitle,
                      isArabic &&
                        styles.rtlText,
                    ]}
                  >
                    {isArabic
                      ? "تحديد هذا اليوم كيوم دورة"
                      : "Mark this day as period day"}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setIsPeriodDay(
                      !isPeriodDay
                    )
                  }
                  style={[
                    styles.periodToggle,
                    isPeriodDay &&
                      styles.activePeriodToggle,
                  ]}
                >
                  <View
                    style={[
                      styles.periodDot,
                      isPeriodDay &&
                        styles.activePeriodDot,
                    ]}
                  />
                </Pressable>
              </View>

              <View style={styles.energyCard}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isArabic &&
                      styles.rtlText,
                  ]}
                >
                  {isArabic
                    ? "مستوى الطاقة"
                    : "Energy Level"}
                </Text>

                <Text
                  style={styles.energyValue}
                >
                  {energy}%
                </Text>

                <View
                  style={styles.energyBar}
                >
                  <View
                    style={[
                      styles.energyFill,
                      {
                        width: `${energy}%`,
                      },
                    ]}
                  />
                </View>

                <View
                  style={
                    styles.energyButtons
                  }
                >
                  {[20, 40, 60, 80, 100].map(
                    (v) => (
                      <Pressable
                        key={v}
                        onPress={() =>
                          setEnergy(v)
                        }
                        style={
                          styles.energyChip
                        }
                      >
                        <Text
                          style={
                            styles.energyChipText
                          }
                        >
                          {v}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isArabic &&
                      styles.rtlText,
                  ]}
                >
                  {isArabic
                    ? "المزاج"
                    : "Mood"}
                </Text>

                <View style={styles.moodGrid}>
                  {moods.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Pressable
                        key={item.key}
                        onPress={() =>
                          setSelectedMood(
                            item.key
                          )
                        }
                        style={[
                          styles.moodCard,
                          selectedMood ===
                            item.key &&
                            styles.activeMoodCard,
                        ]}
                      >
                        <Icon
                          color="#C6A7FF"
                          size={20}
                        />

                        <Text
                          style={
                            styles.moodLabel
                          }
                        >
                          {isArabic
                            ? item.ar
                            : item.en}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isArabic &&
                      styles.rtlText,
                  ]}
                >
                  {isArabic
                    ? "التدفق"
                    : "Flow"}
                </Text>

                <View style={styles.flowRow}>
                  {flows.map((flow) => (
                    <Pressable
                      key={flow.key}
                      onPress={() =>
                        setSelectedFlow(
                          flow.key as
                            | "Light"
                            | "Medium"
                            | "Heavy"
                        )
                      }
                      style={[
                        styles.flowChip,
                        selectedFlow ===
                          flow.key &&
                          styles.activeFlowChip,
                      ]}
                    >
                      <Droplets
                        size={14}
                        color="#FF6FAE"
                      />

                      <Text
                        style={
                          styles.flowText
                        }
                      >
                        {isArabic
                          ? flow.ar
                          : flow.en}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isArabic &&
                      styles.rtlText,
                  ]}
                >
                  {isArabic
                    ? "الأعراض"
                    : "Symptoms"}
                </Text>

                <View
                  style={
                    styles.symptomsWrap
                  }
                >
                  {symptoms.map(
                    (symptom) => (
                      <Pressable
                        key={symptom.key}
                        onPress={() =>
                          toggleSymptom(
                            symptom.key
                          )
                        }
                        style={[
                          styles.symptomChip,
                          selectedSymptoms.includes(
                            symptom.key
                          ) &&
                            styles.activeSymptomChip,
                        ]}
                      >
                        <Text
                          style={
                            styles.symptomText
                          }
                        >
                          {isArabic
                            ? symptom.ar
                            : symptom.en}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isArabic &&
                      styles.rtlText,
                  ]}
                >
                  {isArabic
                    ? "ملاحظات"
                    : "Notes"}
                </Text>

                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={
                    isArabic
                      ? "كيف كان شعورك اليوم؟"
                      : "How did you feel today?"
                  }
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  multiline
                  style={[
                    styles.notesInput,
                    isArabic &&
                      styles.rtlText,
                  ]}
                />
              </View>

              <Pressable
                style={styles.saveFloating}
                onPress={handleSaveCheckIn}
                disabled={saving}
              >
                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {saving
                    ? isArabic
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : isArabic
                    ? "حفظ التتبع"
                    : "Save Check-In"}
                </Text>
              </Pressable>
            </ScrollView>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  floatingCloseButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
    zIndex: 999,
  },

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0,0,0,0.45)",
  },

  sheetWrapper: {
    width: "100%",
  },

  sheet: {
    paddingTop: 80,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 22,
    paddingBottom: 40,
    overflow: "hidden",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",
    backgroundColor:
      "rgba(18,18,22,0.88)",
    minHeight: "72%",
  },

  handle: {
    width: 64,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  headerRow: {
    marginBottom: 28,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },

  dateText: {
    marginTop: 4,
    color:
      "rgba(255,255,255,0.5)",
    fontSize: 14,
  },

  selectedDateBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor:
      "rgba(198,167,255,0.12)",
  },

  selectedDateBadgeText: {
    color: "#C6A7FF",
    fontSize: 12,
    fontWeight: "700",
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },

  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  moodCard: {
    width: "47%",
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },

  activeMoodCard: {
    borderColor: "#C6A7FF",
    backgroundColor:
      "rgba(198,167,255,0.16)",
    borderWidth: 1,
  },

  moodLabel: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  flowRow: {
    flexDirection: "row",
    gap: 10,
  },

  flowChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },

  activeFlowChip: {
    borderColor: "#FF6FAE",
    backgroundColor:
      "rgba(255,111,174,0.12)",
    borderWidth: 1,
  },

  flowText: {
    color: "#FFFFFF",
  },

  symptomsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  symptomChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },

  activeSymptomChip: {
    borderColor: "#C6A7FF",
    backgroundColor:
      "rgba(198,167,255,0.14)",
    borderWidth: 1,
  },

  symptomText: {
    color: "#FFFFFF",
    fontSize: 13,
  },

  periodCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },

  periodTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  periodSubtitle: {
    marginTop: 4,
    color:
      "rgba(255,255,255,0.45)",
    fontSize: 13,
  },

  periodToggle: {
    width: 54,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor:
      "rgba(255,255,255,0.12)",
  },

  activePeriodToggle: {
    backgroundColor: "#FF6FAE",
  },

  periodDot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },

  activePeriodDot: {
    alignSelf: "flex-end",
  },

  energyCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 26,
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },

  energyValue: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 18,
  },

  energyBar: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  energyFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#C6A7FF",
  },

  energyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  energyChip: {
    width: 48,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.06)",
  },

  energyChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  notesInput: {
    minHeight: 120,
    borderRadius: 22,
    padding: 18,
    textAlignVertical: "top",
    color: "#FFFFFF",
    backgroundColor:
      "rgba(255,255,255,0.05)",
  },

  saveFloating: {
    position: "absolute",
    bottom: 34,
    left: 24,
    right: 24,
    height: 58,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C6A7FF",
  },

  saveButtonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "800",
  },
});