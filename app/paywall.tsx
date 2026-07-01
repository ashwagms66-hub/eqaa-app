import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLanguage } from "@/src/context/LanguageContext";
import { useSubscription } from "@/src/hooks/useSubscription";

// ─────────────────────────────────────────────────────────────────────────────
// Strings
// ─────────────────────────────────────────────────────────────────────────────

const S = {
  ar: {
    title: "إيقاع Premium",
    trial: "ابدئي 7 أيام مجانًا",
    subtitle: "افتحي الماسح الذكي، جدول التمرين الأسبوعي، الصيام الذكي، تفاصيل الوجبات، وتوصيات تناسب إيقاع جسمك.",
    features: [
      "ماسح النادي الذكي بالذكاء الاصطناعي",
      "جدول تمرين أسبوعي مخصص",
      "مراحل الصيام الذكي والإنجازات",
      "تفاصيل الوجبات والكميات الغذائية",
      "سجل التمارين المتقدم والإحصائيات",
      "توصيات يومية مخصصة",
    ],
    yearly: "سنوي",
    monthly: "شهري",
    bestValue: "الأوفر",
    perYear: "/ سنة",
    perMonth: "/ شهر",
    cta: "ابدئي الآن",
    restore: "استعادة الشراء",
    cancel: "يمكنك الإلغاء في أي وقت",
    close: "✕",
    loadingPrices: "جارٍ تحميل الأسعار...",
    purchaseSuccess: "تم تفعيل Premium بنجاح.",
    restoreSuccess: "تم استعادة الشراء بنجاح.",
    restoreNone: "لم يتم العثور على اشتراك نشط.",
    restoreError: "تعذر إتمام العملية. حاولي مرة أخرى.",
    purchaseError: "تعذر إتمام الشراء. حاولي مرة أخرى.",
    alreadyTitle: "أنتِ مشتركة في Premium",
    alreadySub: "جميع الميزات الكاملة متاحة لكِ.",
    manageSubscription: "إدارة الاشتراك",
    ok: "حسناً",
  },
  en: {
    title: "Eqa'a Premium",
    trial: "Start with 7 days free",
    subtitle: "Unlock AI Gym Scanner, weekly workout plans, smart fasting, meal details, and personalized body-rhythm guidance.",
    features: [
      "AI Gym Scanner powered by vision",
      "Personalized weekly workout schedule",
      "Smart fasting phases & milestones",
      "Meal details with gram measurements",
      "Advanced workout history & stats",
      "Daily personalized recommendations",
    ],
    yearly: "Yearly",
    monthly: "Monthly",
    bestValue: "Best Value",
    perYear: "/ year",
    perMonth: "/ month",
    cta: "Get Started",
    restore: "Restore Purchases",
    cancel: "Cancel anytime",
    close: "✕",
    loadingPrices: "Loading prices…",
    purchaseSuccess: "Premium activated successfully.",
    restoreSuccess: "Purchases restored successfully.",
    restoreNone: "No active subscription found.",
    restoreError: "Could not complete the action. Please try again.",
    purchaseError: "Could not complete the purchase. Please try again.",
    alreadyTitle: "You're subscribed to Premium",
    alreadySub: "All premium features are unlocked.",
    manageSubscription: "Manage Subscription",
    ok: "OK",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function PaywallScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const t = S[language];

  const {
    isPremium,
    loading,
    monthlyPackage,
    yearlyPackage,
    purchaseMonthly,
    purchaseYearly,
    restore,
  } = useSubscription();

  const [selected, setSelected] = useState<"yearly" | "monthly">("yearly");
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function handlePurchase() {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await (selected === "yearly" ? purchaseYearly() : purchaseMonthly());
      if (result === "success") {
        Alert.alert(t.purchaseSuccess, "", [
          { text: t.ok, onPress: () => router.back() },
        ]);
      } else if (result === "error") {
        Alert.alert(t.purchaseError);
      }
      // "cancelled" — do nothing
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    if (restoring) return;
    setRestoring(true);
    try {
      const result = await restore();
      if (result === "restored") {
        Alert.alert(t.restoreSuccess, "", [
          { text: t.ok, onPress: () => router.back() },
        ]);
      } else if (result === "none") {
        Alert.alert(t.restoreNone);
      } else {
        Alert.alert(t.restoreError);
      }
    } finally {
      setRestoring(false);
    }
  }

  const hasPackages = !!monthlyPackage || !!yearlyPackage;

  return (
    <LinearGradient colors={["#05050A", "#0E0820", "#1A0F35"]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Close */}
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.closeTxt}>{t.close}</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Crown & title */}
          <Text style={s.crown}>👑</Text>
          <Text style={[s.title, isAr && s.rtlText]}>{t.title}</Text>

          {/* ── Already subscribed state (for App Review screenshots + premium users) ── */}
          {!loading && isPremium ? (
            <>
              <Text style={[s.trial, isAr && s.rtlText]}>{t.alreadyTitle}</Text>
              <Text style={[s.subtitle, isAr && s.rtlText]}>{t.alreadySub}</Text>
              <View style={s.alreadyBadge}>
                <Text style={s.alreadyBadgeTxt}>✓ Premium</Text>
              </View>
              <TouchableOpacity
                style={s.cta}
                activeOpacity={0.85}
                onPress={() => Linking.openURL("https://apps.apple.com/account/subscriptions")}
              >
                <Text style={s.ctaTxt}>{t.manageSubscription}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[s.trial, isAr && s.rtlText]}>{t.trial}</Text>
              <Text style={[s.subtitle, isAr && s.rtlText]}>{t.subtitle}</Text>

              {/* Feature list */}
              <View style={s.featureList}>
                {t.features.map((f, i) => (
                  <View key={i} style={[s.featureRow, isAr && s.featureRowRTL]}>
                    <Text style={s.featureCheck}>✦</Text>
                    <Text style={[s.featureTxt, isAr && s.rtlText]}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* Package cards */}
              {loading ? (
                <View style={s.loadingRow}>
                  <ActivityIndicator color="#C6A7FF" />
                  <Text style={s.loadingTxt}>{t.loadingPrices}</Text>
                </View>
              ) : (
                <View style={s.packages}>
                  {/* Yearly */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[s.pkg, selected === "yearly" && s.pkgSelected]}
                    onPress={() => setSelected("yearly")}
                  >
                    <LinearGradient
                      colors={selected === "yearly"
                        ? ["rgba(198,167,255,0.18)", "rgba(198,167,255,0.06)"]
                        : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={[s.pkgRow, isAr && s.pkgRowRTL]}>
                      <View style={[s.radioOuter, selected === "yearly" && s.radioOuterSel]}>
                        {selected === "yearly" && <View style={s.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.pkgLabel, isAr && s.rtlText]}>{t.yearly}</Text>
                        <Text style={[s.pkgPrice, isAr && s.rtlText]}>
                          {yearlyPackage
                            ? `${yearlyPackage.product.priceString} ${t.perYear}`
                            : "—"}
                        </Text>
                      </View>
                      <View style={s.bestValueBadge}>
                        <Text style={s.bestValueTxt}>{t.bestValue}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Monthly */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[s.pkg, selected === "monthly" && s.pkgSelected]}
                    onPress={() => setSelected("monthly")}
                  >
                    <LinearGradient
                      colors={selected === "monthly"
                        ? ["rgba(198,167,255,0.18)", "rgba(198,167,255,0.06)"]
                        : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={[s.pkgRow, isAr && s.pkgRowRTL]}>
                      <View style={[s.radioOuter, selected === "monthly" && s.radioOuterSel]}>
                        {selected === "monthly" && <View style={s.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.pkgLabel, isAr && s.rtlText]}>{t.monthly}</Text>
                        <Text style={[s.pkgPrice, isAr && s.rtlText]}>
                          {monthlyPackage
                            ? `${monthlyPackage.product.priceString} ${t.perMonth}`
                            : "—"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* CTA */}
              <TouchableOpacity
                style={[s.cta, (!hasPackages || purchasing) && s.ctaDisabled]}
                activeOpacity={0.85}
                onPress={handlePurchase}
                disabled={!hasPackages || purchasing}
              >
                {purchasing
                  ? <ActivityIndicator color="#111" />
                  : <Text style={s.ctaTxt}>{t.cta}</Text>}
              </TouchableOpacity>

              {/* Restore */}
              <TouchableOpacity
                style={s.restoreBtn}
                activeOpacity={0.7}
                onPress={handleRestore}
                disabled={restoring}
              >
                {restoring
                  ? <ActivityIndicator color="rgba(198,167,255,0.6)" size="small" />
                  : <Text style={s.restoreTxt}>{t.restore}</Text>}
              </TouchableOpacity>

              {/* Disclaimer */}
              <Text style={[s.disclaimer, isAr && s.rtlText]}>{t.cancel}</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },

  closeBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeTxt: { color: "rgba(255,255,255,0.70)", fontSize: 16, fontWeight: "700" },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: "center",
  },

  crown: { fontSize: 52, marginBottom: 12 },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  trial: {
    color: "#C6A7FF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 320,
  },

  featureList: {
    width: "100%",
    gap: 10,
    marginBottom: 28,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureRowRTL: { flexDirection: "row-reverse" },

  featureCheck: {
    color: "#C6A7FF",
    fontSize: 14,
    fontWeight: "900",
    flexShrink: 0,
  },

  featureTxt: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },

  alreadyBadge: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.35)",
    marginVertical: 20,
  },
  alreadyBadgeTxt: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    marginTop: 8,
  },
  loadingTxt: { color: "rgba(255,255,255,0.45)", fontSize: 14 },

  packages: { width: "100%", gap: 12, marginBottom: 24 },

  pkg: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 18,
  },
  pkgSelected: { borderColor: "#C6A7FF" },

  pkgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  pkgRowRTL: { flexDirection: "row-reverse" },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioOuterSel: { borderColor: "#C6A7FF" },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#C6A7FF",
  },

  pkgLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 3,
  },
  pkgPrice: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontWeight: "600",
  },

  bestValueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(198,167,255,0.20)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.40)",
  },
  bestValueTxt: {
    color: "#C6A7FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  cta: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "#C6A7FF",
    alignItems: "center",
    marginBottom: 16,
  },
  ctaDisabled: { opacity: 0.55 },
  ctaTxt: {
    color: "#111",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  restoreBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
    alignItems: "center",
  },
  restoreTxt: {
    color: "rgba(198,167,255,0.65)",
    fontSize: 15,
    fontWeight: "700",
  },

  disclaimer: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },

  rtlText: { textAlign: "right" },
});
