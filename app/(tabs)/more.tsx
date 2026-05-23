import React, {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";

import {
  Languages,
  Moon
} from "lucide-react-native";

import {
  getActivityLevel,
  getAge,
  getCalories,
  getHeight,
  getLifeMode,
  getWeight,
  saveActivityLevel,
  saveAge,
  saveCalories,
  saveGoals,
  saveHeight,
  saveLifeMode,
  saveWeight,
} from "@/src/storage/profileStorage";

import {
  getCycleLength,
  getLastPeriod,
  saveCycleLength,
  saveLastPeriod,
} from "@/src/storage/cycleStorage";

import {
  useLanguage,
} from "@/src/context/LanguageContext";

const lifeModes = [
  {
    key: "regular",
    labelAr: "دورة منتظمة",
    labelEn: "Regular Cycle",
    subtitleAr:
      "مراحل الدورة تظهر بشكل واضح مع اقتراحات لطيفة.",
    subtitleEn:
      "Clear cycle phases with gentle daily guidance.",
    icon: "☀️",
  },
  {
    key: "pcos",
    labelAr:
      "غير منتظمة / تكيس المبايض",
    labelEn:
      "Irregular / PCOS",
    subtitleAr:
      "إيقاع يتعامل معها كنمط متغير بدون ضغط.",
    subtitleEn:
      "Adaptive rhythm support without pressure.",
    icon: "〰️",
  },
  {
    key: "moon",
    labelAr: "مزامنة القمر",
    labelEn: "Moon Sync",
    subtitleAr:
      "مرجع رمزي لمن تفضل ربط الإيقاع بالقمر.",
    subtitleEn:
      "A symbolic rhythm inspired by moon phases.",
    icon: "🌙",
  },
  {
    key: "pregnancy",
    labelAr: "حامل",
    labelEn: "Pregnancy",
    subtitleAr:
      "بدون مراحل دورة، تركيز على الراحة والتوازن.",
    subtitleEn:
      "Comfort-focused support and gentle balance.",
    icon: "♡",
  },
  {
    key: "postpartum",
    labelAr:
      "بعد الولادة / الرضاعة",
    labelEn:
      "Postpartum / Nursing",
    subtitleAr:
      "تعافي، ترطيب، نوم، ووجبات مشبعة بدون ضغط.",
    subtitleEn:
      "Recovery, hydration and nourishing support.",
    icon: "☼",
  },
];

export default function MoreScreen() {
  const {
    language,
    setLanguage,
  } = useLanguage();

  const [lifeMode, setLifeMode] =
    useState<
      | "regular"
      | "pregnancy"
      | "postpartum"
      | "pcos"
      | "moon"
    >("regular");

  const [height, setHeight] =
    useState("163");

  const [weight, setWeight] =
    useState("68");

  const [age, setAge] =
    useState("26");

  const [calories, setCalories] =
    useState("1400");

  const [activity, setActivity] =
    useState("moderate");

  const [cycleLength, setCycleLength] =
    useState("28");

  const [lastPeriodDate, setLastPeriodDate] =
    useState("");

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [goal, setGoal] =
    useState("loss");

  useEffect(() => {
    async function loadProfile() {
      const savedMode =
        await getLifeMode();

      const savedHeight =
        await getHeight();

      const savedWeight =
        await getWeight();

      const savedAge =
        await getAge();

      const savedCalories =
        await getCalories();

      const savedActivity =
        await getActivityLevel();

      const savedCycleLength =
        await getCycleLength();

      const savedLastPeriod =
        await getLastPeriod();

      if (
        savedMode === "regular" ||
        savedMode === "pregnancy" ||
        savedMode === "postpartum" ||
        savedMode === "pcos" ||
        savedMode === "moon"
      ) {
        setLifeMode(savedMode);
      }

      setHeight(
        savedHeight.toString()
      );

      setWeight(
        savedWeight.toString()
      );

      setAge(savedAge.toString());

      setCalories(
        savedCalories.toString()
      );

      setActivity(savedActivity);

      if (savedCycleLength) {
        setCycleLength(
          savedCycleLength.toString()
        );
      }

      if (savedLastPeriod) {
        setLastPeriodDate(savedLastPeriod);
      }
    }

    loadProfile();
  }, []);

  function calculateCalories() {
    const weightNum = Number(weight);
    const heightNum = Number(height);
    const ageNum = Number(age);

    if (
      !weightNum ||
      !heightNum ||
      !ageNum
    ) {
      return 1900;
    }

    let baseCalories =
      10 * weightNum +
      6.25 * heightNum -
      5 * ageNum -
      161;

    if (activity === "low") {
      baseCalories *= 1.2;
    }

    if (activity === "moderate") {
      baseCalories *= 1.45;
    }

    if (activity === "high") {
      baseCalories *= 1.7;
    }

    if (goal === "loss") {
      baseCalories -= 350;
    }

    if (goal === "gain") {
      baseCalories += 250;
    }

    if (lifeMode === "pregnancy") {
      baseCalories += 250;
    }

    if (lifeMode === "postpartum") {
      baseCalories += 180;
    }

    return Math.round(baseCalories);
  }

  function formatDate(date: Date) {
    return date
      .toISOString()
      .split("T")[0];
  }

  async function persistProfile() {
    await saveLifeMode(lifeMode);

    await saveHeight(
      Number(height)
    );

    await saveWeight(
      Number(weight)
    );

    await saveAge(Number(age));

    const calculatedCalories =
      calculateCalories();

    setCalories(
      calculatedCalories.toString()
    );

    await saveCalories(
      calculatedCalories
    );

    await saveActivityLevel(
      activity
    );

await saveGoals([goal]);
    await saveCycleLength(
      Number(cycleLength)
    );

    if (lastPeriodDate) {
      await saveLastPeriod(
        lastPeriodDate
      );
    }

   Alert.alert(
  language === "ar"
    ? "تم الحفظ ✨"
    : "Saved ✨",

  language === "ar"
    ? "تم تحديث بيانات إيقاع بنجاح"
    : "Your Eqa’a profile has been updated successfully."
);
  }
  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#121225",
        "#221A3D",
      ]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.label}>
          {language === "ar"
            ? "إعدادات إيقاع"
            : "Eqa’a Settings"}
        </Text>

        <Text style={styles.title}>
          {language === "ar"
            ? "الإعدادات"
            : "Settings"}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar"
              ? "المرحلة الحياتية"
              : "Life Mode"}
          </Text>

          <View style={styles.modeWrap}>
            {lifeModes.map((item) => {
              const active =
                item.key === lifeMode;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.9}
                  onPress={() =>
                    setLifeMode(
                      item.key as
                        | "regular"
                        | "pregnancy"
                        | "postpartum"
                        | "pcos"
                        | "moon"
                    )
                  }
                  style={[
                    styles.lifeCard,
                    active &&
                      styles.activeLifeCard,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.lifeTitle}
                    >
{language === "ar"
  ? item.labelAr
  : item.labelEn}                    </Text>

                    <Text
                      style={
                        styles.lifeSubtitle
                      }
                    >
{language === "ar"
  ? item.subtitleAr
  : item.subtitleEn}                    </Text>
                  </View>

                  <View
                    style={[
                      styles.lifeIcon,
                      active && {
                        backgroundColor:
                          "#C6A7FF",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                      }}
                    >
                      {item.icon}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Languages
              color="#89CFF0"
              size={20}
            />

            <Text style={styles.cardTitle}>
{language === "ar"
  ? "اللغة"
  : "Language"}            </Text>
          </View>

          <Text style={styles.helperText}>
{language === "ar"
  ? "اختاري لغة التطبيق."
  : "Choose your app language."}          </Text>

          <View style={styles.activityRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                setLanguage("ar")
              }
              style={[
                styles.activityChip,
                language === "ar" && {
                  backgroundColor:
                    "#C6A7FF",
                },
              ]}
            >
              <Text
                style={[
                  styles.activityText,
                  language === "ar" && {
                    color: "#111111",
                  },
                ]}
              >
                العربية
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                setLanguage("en")
              }
              style={[
                styles.activityChip,
                language === "en" && {
                  backgroundColor:
                    "#C6A7FF",
                },
              ]}
            >
              <Text
                style={[
                  styles.activityText,
                  language === "en" && {
                    color: "#111111",
                  },
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Moon
              color="#C6A7FF"
              size={20}
            />

            <Text style={styles.cardTitle}>
{language === "ar"
  ? "بيانات الدورة"
  : "Cycle Information"}            </Text>
          </View>

          <Text style={styles.helperText}>
{language === "ar"
  ? "اختاري أول يوم من آخر دورة ليتم تحديث التقويم والرئيسية والتغذية بشكل تلقائي."
  : "Select the first day of your last cycle to automatically update your rhythm and insights."}          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cycleButton}
            onPress={() => {
              setShowDatePicker(true);
            }}
          >
            <View>
              <Text
                style={styles.cycleLabel}
              >
{language === "ar"
  ? "تاريخ آخر دورة"
  : "Last Period Date"}              </Text>

              <Text
                style={styles.cycleValue}
              >
                {lastPeriodDate ||
                  (language === "ar"
                    ? "اختاري التاريخ"
                    : "Select Date")}
              </Text>
            </View>

            <Moon
              size={18}
              color="#C6A7FF"
            />
          </TouchableOpacity>

          {showDatePicker && (
            <View
              style={
                styles.datePickerWrapper
              }
            >
              <DateTimePicker
                value={
                  lastPeriodDate
                    ? new Date(
                        lastPeriodDate
                      )
                    : new Date()
                }
                mode="date"
                display={
                  Platform.OS === "ios"
                    ? "inline"
                    : "default"
                }
                maximumDate={
                  new Date()
                }
                onChange={(
                  event,
                  selectedDate
                ) => {
                  if (
                    Platform.OS !== "ios"
                  ) {
                    setShowDatePicker(
                      false
                    );
                  }

                  if (
                    selectedDate
                  ) {
                    setLastPeriodDate(
                      formatDate(
                        selectedDate
                      )
                    );
                  }
                }}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                style={
                  styles.doneButton
                }
                onPress={() =>
                  setShowDatePicker(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.doneButtonText
                  }
                >
                  {language === "ar"
  ? "تم"
  : "Done"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.inputLabel}>
{language === "ar"
  ? "مدة الدورة"
  : "Cycle Length"}          </Text>

          <View style={styles.activityRow}>
            {[
              "21",
              "24",
              "26",
              "28",
              "30",
              "32",
              "35",
            ].map((item) => {
              const active =
                item === cycleLength;

              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.9}
                  onPress={() =>
                    setCycleLength(item)
                  }
                  style={[
                    styles.dayChip,
                    active && {
                      backgroundColor:
                        "#C6A7FF",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      active && {
                        color:
                          "#111111",
                      },
                    ]}
                  >
                    {language === "ar"
                      ? `${item} يوم`
                      : `${item} Days`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.saveButton}
          onPress={persistProfile}
        >
          <Text
            style={styles.saveButtonText}
          >
{language === "ar"
  ? "حفظ التغييرات"
  : "Save Changes"}          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
{language === "ar"
  ? "تساعد هذه الإعدادات إيقاع على تخصيص تجربتك اليومية بشكل أكثر انسجامًا وهدوءًا."
  : "These settings help Eqa’a personalize your daily rhythm more gently and intuitively."}          </Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    paddingTop: 120,
    paddingHorizontal: 22,
    paddingBottom: 180,
  },

  label: {
    color: "#C6A7FF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  title: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "900",
    textAlign: "center",
  },

  section: {
    marginTop: 36,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 18,
  },

  modeWrap: {
    gap: 16,
  },

  lifeCard: {
    borderRadius: 34,
    padding: 24,
    backgroundColor:
      "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  activeLifeCard: {
    backgroundColor:
      "rgba(198,167,255,0.16)",
    borderColor: "#C6A7FF",
  },

  lifeTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },

  lifeSubtitle: {
    color:
      "rgba(255,255,255,0.64)",
    fontSize: 15,
    lineHeight: 28,
    fontWeight: "600",
  },

  lifeIcon: {
    width: 72,
    height: 72,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(198,167,255,0.12)",
  },

  card: {
    marginTop: 26,
    borderRadius: 30,
    padding: 22,
    backgroundColor:
      "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  helperText: {
    color:
      "rgba(255,255,255,0.58)",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 18,
    fontWeight: "600",
  },

  inputLabel: {
    color:
      "rgba(255,255,255,0.55)",
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "700",
  },

  activityRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  activityChip: {
    minWidth: 140,
    flexGrow: 1,
    minHeight: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.06)",
  },

  activityText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  cycleButton: {
    minHeight: 88,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:
      "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor:
      "rgba(198,167,255,0.34)",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    marginBottom: 24,
  },

  cycleLabel: {
    color:
      "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginBottom: 10,
    fontWeight: "700",
  },

  cycleValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  datePickerWrapper: {
    marginTop: -6,
    marginBottom: 24,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor:
      "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor:
      "rgba(198,167,255,0.18)",
    paddingBottom: 18,
  },

  doneButton: {
    marginHorizontal: 18,
    marginTop: 10,
    height: 54,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C6A7FF",
  },

  doneButtonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
  },

  dayChip: {
    minWidth: 86,
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.06)",
    marginBottom: 12,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.04)",
  },

  dayChipText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  saveButton: {
  marginTop: 40,
  height: 66,
  borderRadius: 999,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#C6A7FF",
  shadowColor: "#C6A7FF",
  shadowOpacity: 0.3,
  shadowRadius: 24,
  shadowOffset: {
    width: 0,
    height: 10,
  },
  elevation: 14,
},

saveButtonText: {
  color: "#111111",
  fontSize: 18,
  fontWeight: "900",
  letterSpacing: -0.2,
},

footer: {
  marginTop: 30,
  alignItems: "center",
},

footerText: {
  color: "rgba(255,255,255,0.6)",
  fontSize: 14,
  lineHeight: 26,
  fontWeight: "600",
  textAlign: "center",
},
});
