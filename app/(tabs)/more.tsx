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

import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight, Languages, Leaf, Moon, User, Zap } from "lucide-react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getActivityLevel,
  getGoalWeight,
  getHeight,
  getLifeMode,
  getName,
  getWeight,
  saveActivityLevel,
  saveCalories,
  saveGoalWeight,
  saveGoals,
  saveHeight,
  saveLifeMode,
  saveName,
  saveWeight,
} from "@/src/storage/profileStorage";

import {
  getCycleLength,
  getLastPeriod,
  saveCycleLength,
  saveLastPeriod,
} from "@/src/storage/cycleStorage";

import { useLanguage } from "@/src/context/LanguageContext";

const lifeModes = [
  {
    key: "regular",
    labelAr: "دورة منتظمة",
    labelEn: "Regular Cycle",
    subtitleAr: "مراحل الدورة تظهر بشكل واضح مع اقتراحات لطيفة.",
    subtitleEn: "Clear cycle phases with gentle daily guidance.",
    icon: "☀️",
  },
  {
    key: "pcos",
    labelAr: "غير منتظمة / تكيس المبايض",
    labelEn: "Irregular / PCOS",
    subtitleAr: "إيقاع يتعامل معها كنمط متغير بدون ضغط.",
    subtitleEn: "Adaptive rhythm support without pressure.",
    icon: "〰️",
  },
  {
    key: "moon",
    labelAr: "مزامنة القمر",
    labelEn: "Moon Sync",
    subtitleAr: "مرجع رمزي لمن تفضل ربط الإيقاع بالقمر.",
    subtitleEn: "A symbolic rhythm inspired by moon phases.",
    icon: "🌙",
  },
  {
    key: "pregnancy",
    labelAr: "حامل",
    labelEn: "Pregnancy",
    subtitleAr: "بدون مراحل دورة، تركيز على الراحة والتوازن.",
    subtitleEn: "Comfort-focused support and gentle balance.",
    icon: "♡",
  },
  {
    key: "postpartum",
    labelAr: "بعد الولادة / الرضاعة",
    labelEn: "Postpartum / Nursing",
    subtitleAr: "تعافي، ترطيب، نوم، ووجبات مشبعة بدون ضغط.",
    subtitleEn: "Recovery, hydration and nourishing support.",
    icon: "☼",
  },
];

export default function MoreScreen() {
  const { language, setLanguage } = useLanguage();
  const isAr = language === "ar";

  const [firstName, setFirstName] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lifeMode, setLifeMode] = useState<
    "regular" | "pregnancy" | "postpartum" | "pcos" | "moon"
  >("regular");
  const [height, setHeight] = useState("163");
  const [weight, setWeight] = useState("68");
  const [goalWeight, setGoalWeight] = useState("60");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("loss");

  useEffect(() => {
    async function load() {
      const [
        savedName,
        savedMode,
        savedHeight,
        savedWeight,
        savedGoalWeight,
        savedActivity,
        savedCycleLength,
        savedLastPeriod,
      ] = await Promise.all([
        getName(),
        getLifeMode(),
        getHeight(),
        getWeight(),
        getGoalWeight(),
        getActivityLevel(),
        getCycleLength(),
        getLastPeriod(),
      ]);

      if (savedName) setFirstName(savedName);

      if (
        savedMode === "regular" ||
        savedMode === "pregnancy" ||
        savedMode === "postpartum" ||
        savedMode === "pcos" ||
        savedMode === "moon"
      ) {
        setLifeMode(savedMode);
      }

      setHeight(savedHeight.toString());
      setWeight(savedWeight.toString());
      setGoalWeight(savedGoalWeight.toString());
      setActivity(savedActivity);
      if (savedCycleLength) setCycleLength(savedCycleLength.toString());
      if (savedLastPeriod) setLastPeriodDate(savedLastPeriod);
    }
    load();
  }, []);

  function calculateCalories() {
    const w = Number(weight);
    const h = Number(height);
    if (!w || !h) return 1800;
    let base = 655 + 9.6 * w + 1.8 * h;
    if (activity === "low") base *= 1.2;
    else if (activity === "moderate") base *= 1.45;
    else if (activity === "high") base *= 1.55;
    if (goal === "loss") base -= 500;
    else if (goal === "gain") base += 250;
    if (lifeMode === "pregnancy") base += 250;
    if (lifeMode === "postpartum") base += 180;
    return Math.round(base);
  }

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  async function handleResetAll() {
    Alert.alert(
      isAr ? "⚠️ إعادة ضبط البيانات" : "⚠️ Reset All Data",
      isAr
        ? "هذا الإجراء سيحذف جميع البيانات بما فيها الدورة والتسجيلات اليومية والإعدادات. لا يمكن التراجع."
        : "This will erase all data including cycle, daily check-ins, and settings. This cannot be undone.",
      [
        { text: isAr ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: isAr ? "إعادة ضبط" : "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/disclaimer" as any);
          },
        },
      ]
    );
  }

  async function persistProfile() {
    const calculated = calculateCalories();
    await Promise.all([
      saveName(firstName.trim()),
      saveLifeMode(lifeMode),
      saveHeight(Number(height)),
      saveWeight(Number(weight)),
      saveGoalWeight(Number(goalWeight)),
      saveCalories(calculated),
      saveActivityLevel(activity),
      saveGoals([goal]),
      saveCycleLength(Number(cycleLength)),
    ]);
    if (lastPeriodDate) await saveLastPeriod(lastPeriodDate);
    Alert.alert(
      isAr ? "تم الحفظ ✨" : "Saved ✨",
      isAr
        ? "تم تحديث بيانات إيقاع بنجاح"
        : "Your Eqa'a profile has been updated successfully."
    );
  }

  const greetingName = firstName.trim();

  return (
    <LinearGradient
      colors={["#05050A", "#121225", "#221A3D"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <Text style={styles.label}>
            {isAr ? "إعدادات إيقاع" : "Eqa'a Settings"}
          </Text>
          <Text style={styles.title}>{isAr ? "الإعدادات" : "Settings"}</Text>

          {/* ── 1. Profile ──────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User color="#C6A7FF" size={20} />
              <Text style={styles.cardTitle}>
                {isAr ? "الملف الشخصي" : "Profile"}
              </Text>
            </View>
            <Text style={styles.helperText}>
              {isAr
                ? "أدخلي اسمك الأول ليظهر في تحيات التطبيق."
                : "Enter your first name to personalize your experience."}
            </Text>
            <TextInput
              style={[styles.nameInput, isAr && styles.rtlText]}
              placeholder={isAr ? "اسمكِ الأول…" : "Your first name…"}
              placeholderTextColor="rgba(255,255,255,0.28)"
              value={firstName}
              onChangeText={setFirstName}
              maxLength={30}
              returnKeyType="done"
            />
            {greetingName.length > 0 && (
              <LinearGradient
                colors={["rgba(198,167,255,0.13)", "rgba(120,60,255,0.06)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.greetingCard}
              >
                <Text style={[styles.greetingName, isAr && styles.rtlText]}>
                  {isAr ? `أهلاً ${greetingName} 🌙` : `Hello ${greetingName} 🌙`}
                </Text>
                <Text style={[styles.greetingSubtitle, isAr && styles.rtlText]}>
                  {isAr ? "إيقاع سعيد بوجودك اليوم" : "Eqa'a is happy to see you today"}
                </Text>
              </LinearGradient>
            )}
          </View>

          {/* ── 2. Language ─────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Languages color="#89CFF0" size={20} />
              <Text style={styles.cardTitle}>
                {isAr ? "اللغة" : "Language"}
              </Text>
            </View>
            <Text style={styles.helperText}>
              {isAr ? "اختاري لغة التطبيق." : "Choose your app language."}
            </Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setLanguage("ar")}
                style={[styles.chip, styles.chipGrow, isAr && styles.chipActive]}
              >
                <Text style={[styles.chipText, isAr && styles.chipTextActive]}>
                  العربية
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setLanguage("en")}
                style={[styles.chip, styles.chipGrow, !isAr && styles.chipActive]}
              >
                <Text style={[styles.chipText, !isAr && styles.chipTextActive]}>
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── 3. Cycle Information ────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Moon color="#C6A7FF" size={20} />
              <Text style={styles.cardTitle}>
                {isAr ? "بيانات الدورة" : "Cycle Information"}
              </Text>
            </View>
            <Text style={styles.helperText}>
              {isAr
                ? "اختاري أول يوم من آخر دورة ليتم تحديث التقويم والرئيسية تلقائياً."
                : "Select the first day of your last cycle to automatically update your rhythm and insights."}
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View>
                <Text style={styles.dateLabel}>
                  {isAr ? "تاريخ آخر دورة" : "Last Period Date"}
                </Text>
                <Text style={styles.dateValue}>
                  {lastPeriodDate || (isAr ? "اختاري التاريخ" : "Select Date")}
                </Text>
              </View>
              <Moon size={18} color="#C6A7FF" />
            </TouchableOpacity>

            {showDatePicker && (
              <View style={styles.datePickerWrapper}>
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
                  activeOpacity={0.9}
                  style={styles.doneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.doneButtonText}>
                    {isAr ? "تم" : "Done"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.inputLabel}>
              {isAr ? "مدة الدورة" : "Cycle Length"}
            </Text>
            <View style={styles.chipRow}>
              {["21", "24", "26", "28", "30", "32", "35"].map((item) => {
                const active = item === cycleLength;
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.9}
                    onPress={() => setCycleLength(item)}
                    style={[styles.dayChip, active && styles.chipActive]}
                  >
                    <Text style={[styles.dayChipText, active && styles.chipTextActive]}>
                      {isAr ? `${item} يوم` : `${item}d`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── 4. Life Stage ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.standaloneSectionTitle}>
              {isAr ? "المرحلة الحياتية" : "Life Stage"}
            </Text>
            <View style={styles.modeWrap}>
              {lifeModes.map((item) => {
                const active = item.key === lifeMode;
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
                    style={[styles.lifeCard, active && styles.activeLifeCard]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lifeTitle}>
                        {isAr ? item.labelAr : item.labelEn}
                      </Text>
                      <Text style={styles.lifeSubtitle}>
                        {isAr ? item.subtitleAr : item.subtitleEn}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.lifeIcon,
                        active && { backgroundColor: "#C6A7FF" },
                      ]}
                    >
                      <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── 5. Nutrition Profile ────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Leaf color="#34D399" size={20} />
              <Text style={styles.cardTitle}>
                {isAr ? "الملف الغذائي" : "Nutrition Profile"}
              </Text>
            </View>
            <Text style={styles.helperText}>
              {isAr
                ? "تُستخدم هذه البيانات لحساب السعرات الموصى بها لإيقاعكِ."
                : "Used to calculate your recommended daily calories."}
            </Text>

            <View style={styles.inputsRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {isAr ? "الطول" : "Height (cm)"}
                </Text>
                <TextInput
                  style={styles.numInput}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="163"
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  maxLength={3}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {isAr ? "الوزن الحالي" : "Current Weight"}
                </Text>
                <TextInput
                  style={styles.numInput}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="68"
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  maxLength={3}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {isAr ? "الوزن المستهدف" : "Goal Weight"}
                </Text>
                <TextInput
                  style={styles.numInput}
                  keyboardType="numeric"
                  value={goalWeight}
                  onChangeText={setGoalWeight}
                  placeholder="60"
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  maxLength={3}
                  returnKeyType="done"
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 22 }]}>
              {isAr ? "مستوى النشاط" : "Activity Level"}
            </Text>
            <View style={styles.chipRow}>
              {[
                { key: "low", ar: "خفيف", en: "Low" },
                { key: "moderate", ar: "معتدل", en: "Moderate" },
                { key: "high", ar: "عالٍ", en: "High" },
              ].map((item) => {
                const active = item.key === activity;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.9}
                    onPress={() => setActivity(item.key)}
                    style={[styles.chip, styles.chipGrow, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {isAr ? item.ar : item.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 22 }]}>
              {isAr ? "الهدف" : "Goal"}
            </Text>
            <View style={styles.chipRow}>
              {[
                { key: "loss", ar: "خسارة وزن", en: "Weight Loss" },
                { key: "maintain", ar: "وزن مثالي", en: "Maintain" },
                { key: "gain", ar: "بناء عضلات", en: "Build Muscle" },
              ].map((item) => {
                const active = item.key === goal;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.9}
                    onPress={() => setGoal(item.key)}
                    style={[styles.chip, styles.chipGrow, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {isAr ? item.ar : item.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <LinearGradient
              colors={["rgba(52,211,153,0.11)", "rgba(52,211,153,0.04)"]}
              style={styles.caloriesCard}
            >
              <Text style={styles.caloriesLabel}>
                {isAr ? "السعرات اليومية الموصى بها" : "Recommended Daily Calories"}
              </Text>
              <Text style={styles.caloriesValue}>
                {calculateCalories()}{" "}
                <Text style={styles.caloriesUnit}>{isAr ? "سعرة" : "kcal"}</Text>
              </Text>
              <Text style={[styles.caloriesDesc, isAr && styles.rtlText]}>
                {isAr
                  ? "بناءً على طولك ووزنك ومستوى نشاطك الحالي"
                  : "Based on your height, weight and activity level"}
              </Text>
            </LinearGradient>
          </View>

          {/* ── 6. Smart Fasting ────────────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.fastingCard}
            onPress={() => router.push("/(tabs)/fasting" as any)}
          >
            <LinearGradient
              colors={["rgba(120,60,255,0.18)", "rgba(80,30,200,0.10)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fastingCardGrad}
            >
              <View style={styles.fastingIconWrap}>
                <Zap color="#C6A7FF" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fastingCardTitle}>
                  {isAr ? "الصيام الذكي" : "Smart Fasting"}
                </Text>
                <Text style={[styles.fastingCardSubtitle, isAr && styles.rtlText]}>
                  {isAr
                    ? "صيام متوافق مع مراحل دورتك"
                    : "Cycle-aware fasting guidance"}
                </Text>
                <View style={styles.fastingBullets}>
                  <Text style={[styles.fastingBullet, isAr && styles.rtlText]}>
                    {isAr
                      ? "· ساعات الصيام المناسبة لكل مرحلة"
                      : "· Recommended fasting hours for each phase"}
                  </Text>
                  <Text style={[styles.fastingBullet, isAr && styles.rtlText]}>
                    {isAr
                      ? "· أطعمة موصى بها بحسب إيقاعك"
                      : "· Food suggestions aligned with your cycle"}
                  </Text>
                </View>
              </View>
              <ChevronRight color="rgba(198,167,255,0.55)" size={20} />
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Save Button ──────────────────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.saveButton}
            onPress={persistProfile}
          >
            <Text style={styles.saveButtonText}>
              {isAr ? "حفظ التغييرات" : "Save Changes"}
            </Text>
          </TouchableOpacity>

          {/* ── 7. Debug Reset ──────────────────────────────────────────────── */}
          <View style={styles.resetSection}>
            <Text style={[styles.resetSectionLabel, isAr && styles.rtlText]}>
              {isAr ? "منطقة التطوير" : "Developer Zone"}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleResetAll}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>
                {isAr ? "🗑️  إعادة ضبط البيانات" : "🗑️  Reset All Data"}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.resetHint, isAr && styles.rtlText]}>
              {isAr
                ? "يحذف جميع البيانات ويُعيد التهيئة — للاختبار فقط"
                : "Clears all data and restarts onboarding — for testing only"}
            </Text>
          </View>

          {/* ── 8. Privacy & Support ────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, isAr && styles.rtlText]}>
              {isAr
                ? "تساعد هذه الإعدادات إيقاع على تخصيص تجربتك اليومية بشكل أكثر انسجامًا وهدوءًا."
                : "These settings help Eqa'a personalize your daily rhythm more gently and intuitively."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/privacy-policy")}
              style={styles.privacyLink}
              activeOpacity={0.7}
            >
              <Text style={styles.privacyLinkText}>
                {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>إيقاع v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
    marginBottom: 8,
  },

  // ── RTL helper ──────────────────────────────────────────────────────────────
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },

  // ── Section containers ──────────────────────────────────────────────────────
  section: { marginTop: 34 },

  standaloneSectionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 16,
  },

  card: {
    marginTop: 28,
    borderRadius: 30,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  helperText: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 18,
    fontWeight: "600",
  },

  inputLabel: {
    color: "rgba(255,255,255,0.48)",
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  // ── Profile ─────────────────────────────────────────────────────────────────
  nameInput: {
    height: 64,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.18)",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
  },

  greetingCard: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.18)",
  },

  greetingName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },

  greetingSubtitle: {
    color: "rgba(198,167,255,0.72)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  // ── Shared chips ────────────────────────────────────────────────────────────
  chipRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  chip: {
    minWidth: 100,
    minHeight: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  chipGrow: { flexGrow: 1 },
  chipActive: { backgroundColor: "#C6A7FF", borderColor: "#C6A7FF" },
  chipText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  chipTextActive: { color: "#111111" },

  // ── Cycle ───────────────────────────────────────────────────────────────────
  dateButton: {
    minHeight: 84,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.30)",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 24,
  },

  dateLabel: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  dateValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  datePickerWrapper: {
    marginTop: -6,
    marginBottom: 24,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.16)",
    paddingBottom: 18,
  },

  doneButton: {
    marginHorizontal: 18,
    marginTop: 10,
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C6A7FF",
  },

  doneButtonText: { color: "#111111", fontSize: 16, fontWeight: "900" },

  dayChip: {
    minWidth: 82,
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  dayChipText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },

  // ── Life Stage ──────────────────────────────────────────────────────────────
  modeWrap: { gap: 12 },

  lifeCard: {
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  activeLifeCard: {
    backgroundColor: "rgba(198,167,255,0.13)",
    borderColor: "#C6A7FF",
  },

  lifeTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 5,
  },

  lifeSubtitle: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },

  lifeIcon: {
    width: 54,
    height: 54,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(198,167,255,0.11)",
    flexShrink: 0,
  },

  // ── Nutrition ───────────────────────────────────────────────────────────────
  inputsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },

  inputGroup: { flex: 1 },

  numInput: {
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  caloriesCard: {
    marginTop: 24,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.18)",
    alignItems: "center",
  },

  caloriesLabel: {
    color: "rgba(52,211,153,0.72)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  caloriesValue: {
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -2,
    textAlign: "center",
    lineHeight: 50,
  },

  caloriesUnit: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.48)",
  },

  caloriesDesc: {
    marginTop: 12,
    color: "rgba(255,255,255,0.36)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Smart Fasting ───────────────────────────────────────────────────────────
  fastingCard: {
    marginTop: 28,
    borderRadius: 28,
    overflow: "hidden",
  },

  fastingCardGrad: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "rgba(140,80,255,0.28)",
    borderRadius: 28,
  },

  fastingIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "rgba(198,167,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    flexShrink: 0,
  },

  fastingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  fastingCardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  soonBadge: {
    backgroundColor: "rgba(198,167,255,0.14)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.24)",
  },

  soonText: {
    color: "rgba(198,167,255,0.82)",
    fontSize: 11,
    fontWeight: "700",
  },

  fastingCardSubtitle: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
    lineHeight: 22,
  },

  fastingBullets: { gap: 8 },

  fastingBullet: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },

  // ── Save Button ─────────────────────────────────────────────────────────────
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
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },

  saveButtonText: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  // ── Debug Reset ─────────────────────────────────────────────────────────────
  resetSection: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,100,100,0.16)",
    paddingTop: 28,
    gap: 12,
  },

  resetSectionLabel: {
    color: "rgba(255,100,100,0.50)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },

  resetButton: {
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,80,80,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.28)",
  },

  resetButtonText: {
    color: "#FF6060",
    fontSize: 15,
    fontWeight: "800",
  },

  resetHint: {
    color: "rgba(255,100,100,0.36)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },

  // ── Privacy & Support ───────────────────────────────────────────────────────
  footer: { marginTop: 32, alignItems: "center" },

  footerText: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 14,
    lineHeight: 26,
    fontWeight: "600",
    textAlign: "center",
  },

  privacyLink: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 9,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.20)",
    backgroundColor: "rgba(198,167,255,0.06)",
  },

  privacyLinkText: {
    color: "rgba(198,167,255,0.82)",
    fontSize: 13,
    fontWeight: "700",
  },

  versionText: {
    marginTop: 14,
    color: "rgba(255,255,255,0.18)",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
