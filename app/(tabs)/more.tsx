import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
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
import {
  ChevronRight,
  Crown,
  Dumbbell,
  Globe,
  Heart,
  Info,
  Leaf,
  Moon,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  User,
  Zap,
} from "lucide-react-native";
import { Linking } from "react-native";
import { useSubscription } from "@/src/hooks/useSubscription";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useHealthData } from "@/src/services/health/useHealthData";
import { useLanguage } from "@/src/context/LanguageContext";
import { getName } from "@/src/storage/profileStorage";
import { getLastPeriod, getCycleLength } from "@/src/storage/cycleStorage";

// ── Strings ────────────────────────────────────────────────────────────────────

const S = {
  ar: {
    label: "إيقاع",
    title: "المزيد",
    premium: "Premium",
    premiumStatus: "حالة Premium",
    premiumActive: "نشط ✓",
    premiumInactive: "غير مفعّل",
    premiumActiveSub: "اشتراك Premium نشط",
    premiumInactiveSub: "افتحي الميزات الكاملة",
    restorePurchases: "استعادة الشراء",
    restoreSub: "استعادة اشتراك سابق",
    manageSubscription: "إدارة الاشتراك",
    manageSub: "App Store — إلغاء أو تجديد",
    restoringPurchases: "جارٍ الاستعادة...",
    restoreSuccess: "تم استعادة الشراء بنجاح.",
    restoreNone: "لم يتم العثور على اشتراك نشط.",
    restoreError: "تعذر إتمام العملية. حاولي مرة أخرى.",
    account: "الحساب",
    profile: "الملف الشخصي",
    profileSub: "الاسم والتخصيص",
    nutrition: "الملف الغذائي",
    nutritionSub: "السعرات، الهدف، النشاط",
    cycle: "بيانات الدورة",
    cycleSub: "مدة الدورة، آخر دورة",
    workoutSchedule: "جدول التمرين",
    workoutScheduleSub: "خططي أسبوعك",
    language: "اللغة",
    languageSub: "العربية / English",
    health: "الصحة",
    appleHealth: "Apple Health / Health Connect",
    appleHealthSub: "ربط بيانات الصحة",
    healthPrivacy: "الخصوصية الصحية",
    healthPrivacySub: "كيف نستخدم بياناتك",
    app: "التطبيق",
    about: "عن إيقاع",
    aboutSub: "القصة والمهمة",
    features: "الميزات",
    featuresSub: "ما يقدمه إيقاع",
    support: "الدعم",
    supportSub: "تواصل معنا",
    privacy: "سياسة الخصوصية",
    privacySub: "القواعد والحماية",
    version: "الإصدار",
    devZone: "منطقة التطوير",
    devZoneHint: "للاختبار فقط — لا تستخدم في الإنتاج",
    reset: "إعادة ضبط البيانات",
    resetTitle: "⚠️ إعادة ضبط البيانات",
    resetMsg:
      "هذا الإجراء سيحذف جميع البيانات بما فيها الدورة والتسجيلات اليومية والإعدادات. لا يمكن التراجع.",
    cancel: "إلغاء",
    resetConfirm: "إعادة ضبط",
    healthConnected: "متصل",
    healthConnect: "ربط Apple Health",
    healthComingSoon: "ربط Apple Health قادم قريباً. سيتم استخدامه لقراءة الخطوات والنوم ومعدل النبض.",
    healthComingSoonTitle: "Apple Health",
    healthPrivacyMsg: "بيانات صحتك تُخزَّن محلياً على جهازك فقط ولا تُشارَك مع أي جهة خارجية.",
    healthPrivacyTitle: "الخصوصية الصحية",
    aboutMsg: "إيقاع هو تطبيق مبني لمساعدة المرأة على فهم دورتها الهرمونية وتوافقها مع التمرين والتغذية والراحة.",
    aboutTitle: "عن إيقاع",
    featuresMsg: "تتبع الدورة · ماسح النادي · المدرب الذكي · الصيام الذكي · تتبع الرياضة · رؤى صحية",
    featuresTitle: "الميزات",
    supportMsg: "للتواصل أو الإبلاغ عن مشكلة، راسلونا عبر البريد الإلكتروني: support@eqaaapp.com",
    supportTitle: "الدعم",
    ok: "حسناً",
  },
  en: {
    label: "Eqa'a",
    title: "More",
    premium: "Premium",
    premiumStatus: "Premium Status",
    premiumActive: "Active ✓",
    premiumInactive: "Not Active",
    premiumActiveSub: "Premium subscription active",
    premiumInactiveSub: "Unlock the full experience",
    restorePurchases: "Restore Purchases",
    restoreSub: "Restore a previous subscription",
    manageSubscription: "Manage Subscription",
    manageSub: "Cancel or renew in App Store",
    restoringPurchases: "Restoring…",
    restoreSuccess: "Purchases restored successfully.",
    restoreNone: "No active subscription found.",
    restoreError: "Could not complete the action. Please try again.",
    account: "Account",
    profile: "Profile",
    profileSub: "Name & personalization",
    nutrition: "Nutrition Profile",
    nutritionSub: "Calories, goal, activity",
    cycle: "Cycle Data",
    cycleSub: "Cycle length, last period",
    workoutSchedule: "Workout Schedule",
    workoutScheduleSub: "Plan your week",
    language: "Language",
    languageSub: "العربية / English",
    health: "Health",
    appleHealth: "Apple Health / Health Connect",
    appleHealthSub: "Link health data",
    healthPrivacy: "Health Privacy",
    healthPrivacySub: "How we use your data",
    app: "App",
    about: "About Eqa'a",
    aboutSub: "Story & mission",
    features: "Features",
    featuresSub: "What Eqa'a offers",
    support: "Support",
    supportSub: "Contact us",
    privacy: "Privacy Policy",
    privacySub: "Rules & protection",
    version: "Version",
    devZone: "Developer Zone",
    devZoneHint: "Testing only — do not use in production",
    reset: "Reset All Data",
    resetTitle: "⚠️ Reset All Data",
    resetMsg:
      "This will erase all data including cycle, daily check-ins, and settings. This cannot be undone.",
    cancel: "Cancel",
    resetConfirm: "Reset",
    healthConnected: "Connected",
    healthConnect: "Connect Apple Health",
    healthComingSoon:
      "Apple Health connection is coming soon. It will be used to read steps, sleep, and heart rate.",
    healthComingSoonTitle: "Apple Health",
    healthPrivacyMsg:
      "Your health data is stored locally on your device only and is never shared with third parties.",
    healthPrivacyTitle: "Health Privacy",
    aboutMsg:
      "Eqa'a is built to help women understand their hormonal cycle and align it with exercise, nutrition, and rest.",
    aboutTitle: "About Eqa'a",
    featuresMsg:
      "Cycle tracking · Gym Scanner · AI Coach · Smart Fasting · Workout tracking · Health insights",
    featuresTitle: "Features",
    supportMsg:
      "To contact us or report an issue, email us at: support@eqaaapp.com",
    supportTitle: "Support",
    ok: "OK",
  },
} as const;

// ── Component ──────────────────────────────────────────────────────────────────

export default function MoreScreen() {
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const isAr = language === "ar";
  const t = S[language];

  const { permissionStatus, isAvailable, syncing, requestAndSync, sync, metrics } =
    useHealthData();

  const { isPremium, restore, loading: subLoading } = useSubscription();
  const [restoring, setRestoring] = React.useState(false);

  async function handleRestorePurchases() {
    if (restoring) return;
    setRestoring(true);
    try {
      const result = await restore();
      if (result === "restored") {
        Alert.alert(t.restoreSuccess);
      } else if (result === "none") {
        Alert.alert(t.restoreNone);
      } else {
        Alert.alert(t.restoreError);
      }
    } finally {
      setRestoring(false);
    }
  }

  function handleManageSubscription() {
    Linking.openURL("https://apps.apple.com/account/subscriptions");
  }

  const [profileName, setProfileName] = useState("");
  const [cycleSummary, setCycleSummary] = useState("");

  useEffect(() => {
    async function load() {
      const [name, lastPeriod, cycleLen] = await Promise.all([
        getName(),
        getLastPeriod(),
        getCycleLength(),
      ]);
      if (name) setProfileName(name);
      if (lastPeriod) {
        const dateStr = new Date(lastPeriod).toLocaleDateString(
          isAr ? "ar-SA" : "en-GB",
          { day: "numeric", month: "short" }
        );
        const len = cycleLen ?? 28;
        setCycleSummary(isAr ? `${len} يوم · ${dateStr}` : `${len}d · ${dateStr}`);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  function handleLanguageToggle() {
    setLanguage(isAr ? "en" : "ar");
  }

  async function handleResetAll() {
    Alert.alert(t.resetTitle, t.resetMsg, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.resetConfirm,
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/disclaimer" as any);
        },
      },
    ]);
  }

  function handleHealthPress() {
    if (!isAvailable) {
      Alert.alert(t.healthComingSoonTitle, t.healthComingSoon, [
        { text: t.ok },
      ]);
      return;
    }
    if (permissionStatus === "granted") {
      sync();
    } else {
      requestAndSync();
    }
  }

  function handleHealthPrivacy() {
    Alert.alert(t.healthPrivacyTitle, t.healthPrivacyMsg, [{ text: t.ok }]);
  }

  function handleAbout() {
    Alert.alert(t.aboutTitle, t.aboutMsg, [{ text: t.ok }]);
  }

  function handleFeatures() {
    Alert.alert(t.featuresTitle, t.featuresMsg, [{ text: t.ok }]);
  }

  function handleSupport() {
    Alert.alert(t.supportTitle, t.supportMsg, [{ text: t.ok }]);
  }

  const healthSubtitle =
    isAvailable && permissionStatus === "granted"
      ? (syncing
          ? (isAr ? "جارٍ المزامنة…" : "Syncing…")
          : (isAr ? "متصل ✓" : "Connected ✓"))
      : t.appleHealthSub;

  const healthIconColor =
    isAvailable && permissionStatus === "granted" ? "#34D399" : "#F472B6";

  return (
    <LinearGradient colors={["#05050A", "#121225", "#221A3D"]} style={s.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <Text style={s.pageLabel}>{t.label}</Text>
        <Text style={s.pageTitle}>{t.title}</Text>

        {/* ── Account ───────────────────────────────────────────────────────── */}
        <SectionLabel title={t.account} />
        <GroupCard>
          <SettingsRow
            icon={<User color="#C6A7FF" size={18} strokeWidth={2.2} />}
            title={t.profile}
            subtitle={profileName || t.profileSub}
            onPress={() => router.push("/profile-settings" as any)}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Leaf color="#34D399" size={18} strokeWidth={2.2} />}
            title={t.nutrition}
            subtitle={t.nutritionSub}
            onPress={() => router.push("/nutrition-profile" as any)}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Moon color="#C6A7FF" size={18} strokeWidth={2.2} />}
            title={t.cycle}
            subtitle={cycleSummary || t.cycleSub}
            onPress={() => router.push("/cycle-settings" as any)}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Dumbbell color="#C6A7FF" size={18} strokeWidth={2.2} />}
            title={t.workoutSchedule}
            subtitle={t.workoutScheduleSub}
            onPress={() => router.push("/workout-schedule" as any)}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Globe color="#89CFF0" size={18} strokeWidth={2.2} />}
            title={t.language}
            subtitle={isAr ? "العربية" : "English"}
            onPress={handleLanguageToggle}
            isAr={isAr}
            accessory={
              <View style={s.langBadge}>
                <Text style={s.langBadgeText}>{isAr ? "ع" : "EN"}</Text>
              </View>
            }
            showChevron={false}
          />
        </GroupCard>

        {/* ── Premium ───────────────────────────────────────────────────────── */}
        <SectionLabel title={t.premium} />
        <GroupCard>
          <SettingsRow
            icon={<Crown color={isPremium ? "#FFD700" : "#C6A7FF"} size={18} strokeWidth={2.2} />}
            title={t.premiumStatus}
            subtitle={isPremium ? t.premiumActiveSub : t.premiumInactiveSub}
            onPress={() => router.push("/paywall" as any)}
            isAr={isAr}
            showChevron={true}
            accessory={isPremium ? (
              <View style={s.premiumActiveBadge}>
                <Text style={s.premiumActiveBadgeTxt}>{t.premiumActive}</Text>
              </View>
            ) : undefined}
          />
          <Divider />
          <SettingsRow
            icon={<RefreshCw color="#89CFF0" size={18} strokeWidth={2.2} />}
            title={restoring ? t.restoringPurchases : t.restorePurchases}
            subtitle={t.restoreSub}
            onPress={handleRestorePurchases}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Settings color="#C6A7FF" size={18} strokeWidth={2.2} />}
            title={t.manageSubscription}
            subtitle={t.manageSub}
            onPress={handleManageSubscription}
            isAr={isAr}
          />
        </GroupCard>

        {/* ── Health ────────────────────────────────────────────────────────── */}
        <SectionLabel title={t.health} />
        <GroupCard>
          <SettingsRow
            icon={<Heart color={healthIconColor} size={18} strokeWidth={2.2} />}
            title={t.appleHealth}
            subtitle={healthSubtitle}
            onPress={handleHealthPress}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Shield color="#89CFF0" size={18} strokeWidth={2.2} />}
            title={t.healthPrivacy}
            subtitle={t.healthPrivacySub}
            onPress={handleHealthPrivacy}
            isAr={isAr}
          />
        </GroupCard>

        {/* ── App ───────────────────────────────────────────────────────────── */}
        <SectionLabel title={t.app} />
        <GroupCard>
          <SettingsRow
            icon={<Info color="#C6A7FF" size={18} strokeWidth={2.2} />}
            title={t.about}
            subtitle={t.aboutSub}
            onPress={handleAbout}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Zap color="#FFD60A" size={18} strokeWidth={2.2} />}
            title={t.features}
            subtitle={t.featuresSub}
            onPress={handleFeatures}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Globe color="#64D2FF" size={18} strokeWidth={2.2} />}
            title={t.support}
            subtitle={t.supportSub}
            onPress={handleSupport}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Shield color="#C6A7FF" size={18} strokeWidth={2.2} />}
            title={t.privacy}
            subtitle={t.privacySub}
            onPress={() => router.push("/privacy-policy")}
            isAr={isAr}
          />
          <Divider />
          <SettingsRow
            icon={<Info color="rgba(255,255,255,0.30)" size={18} strokeWidth={2.2} />}
            title={t.version}
            subtitle="v1.1.0"
            onPress={() => {}}
            isAr={isAr}
            showChevron={false}
          />
        </GroupCard>

        {/* ── Developer Zone ────────────────────────────────────────────────── */}
        <View style={s.devSection}>
          <Text style={s.devLabel}>{t.devZone}</Text>
          <Text style={[s.devHint, isAr && { textAlign: "right" }]}>{t.devZoneHint}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleResetAll}
            style={s.resetButton}
          >
            <Trash2 color="#FF6060" size={16} strokeWidth={2.2} />
            <Text style={s.resetButtonText}>{t.reset}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return <Text style={s.sectionLabel}>{title}</Text>;
}

function GroupCard({ children }: { children: React.ReactNode }) {
  return <View style={s.groupCard}>{children}</View>;
}

function Divider() {
  return <View style={s.divider} />;
}

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isAr: boolean;
  accessory?: React.ReactNode;
  showChevron?: boolean;
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  isAr,
  accessory,
  showChevron = true,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[s.row, isAr && s.rowRTL]}
    >
      <View style={s.rowIcon}>{icon}</View>
      <View style={s.rowContent}>
        <Text style={[s.rowTitle, isAr && { textAlign: "right" }]}>{title}</Text>
        {subtitle ? (
          <Text style={[s.rowSubtitle, isAr && { textAlign: "right" }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {accessory ?? (showChevron ? (
        <ChevronRight
          color="rgba(255,255,255,0.25)"
          size={16}
          strokeWidth={2.2}
          style={isAr ? { transform: [{ scaleX: -1 }] } : undefined}
        />
      ) : null)}
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    paddingHorizontal: 20,
  },

  premiumActiveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.35)",
  },
  premiumActiveBadgeTxt: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "800",
  },

  pageLabel: {
    color: "#C6A7FF",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  pageTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 24,
  },

  sectionLabel: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 20,
    paddingHorizontal: 4,
  },

  groupCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginLeft: 54,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },

  rowRTL: {
    flexDirection: "row-reverse",
  },

  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  rowContent: {
    flex: 1,
    gap: 2,
  },

  rowTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  rowSubtitle: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 12,
    fontWeight: "500",
  },

  langBadge: {
    backgroundColor: "rgba(137,207,240,0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(137,207,240,0.25)",
  },

  langBadgeText: {
    color: "#89CFF0",
    fontSize: 12,
    fontWeight: "800",
  },

  // Developer Zone
  devSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,80,80,0.14)",
    gap: 8,
    alignItems: "center",
  },

  devLabel: {
    color: "rgba(255,80,80,0.50)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },

  devHint: {
    color: "rgba(255,100,100,0.30)",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },

  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,80,80,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.22)",
  },

  resetButtonText: {
    color: "#FF6060",
    fontSize: 14,
    fontWeight: "700",
  },
});
