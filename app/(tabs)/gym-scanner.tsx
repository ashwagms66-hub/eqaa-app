import React, { useCallback, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLanguage } from "@/src/context/LanguageContext";
import { ScanButton } from "@/src/features/workout-ai/components/ScanButton";
import { ScanResultCard } from "@/src/features/workout-ai/components/ScanResultCard";
import { useGymScanner } from "@/src/features/workout-ai/hooks/useGymScanner";

const STRINGS = {
  ar: {
    title: "ماسح النادي",
    subtitle: "صوّر جهاز النادي وسيحلله الذكاء الاصطناعي",
    scanHint: "تصوير جهاز النادي",
    analyzing: "جاري التحليل...",
    capturing: "فتح الكاميرا...",
    recent: "عمليات البحث الأخيرة",
    noHistory: "لا توجد عمليات بحث بعد",
    noHistorySub: "اضغط الزر أعلاه لتصوير جهاز في النادي",
    errorTitle: "حدث خطأ",
    permissionDenied: "يُرجى السماح بالوصول إلى الكاميرا من الإعدادات",
    apiKeyMissing: "مفتاح API غير موجود. يُرجى إعداد EXPO_PUBLIC_ANTHROPIC_API_KEY",
  },
  en: {
    title: "Gym Scanner",
    subtitle: "Point your camera at gym equipment and AI will analyze it",
    scanHint: "Scan Gym Machine",
    analyzing: "Analyzing...",
    capturing: "Opening camera...",
    recent: "Recent Scans",
    noHistory: "No scans yet",
    noHistorySub: "Tap the button above to scan gym equipment",
    errorTitle: "Error",
    permissionDenied: "Please allow camera access in Settings",
    apiKeyMissing: "API key missing. Set EXPO_PUBLIC_ANTHROPIC_API_KEY",
  },
} as const;

export default function GymScannerScreen() {
  const { language } = useLanguage();
  const t = STRINGS[language];
  const { status, history, startScan } = useGymScanner();

  // Show system alert on actionable errors only
  useEffect(() => {
    if (status.kind !== "error") return;
    if (status.code === "camera_permission_denied") {
      Alert.alert(t.errorTitle, t.permissionDenied);
    } else if (status.code === "api_key_missing") {
      Alert.alert(t.errorTitle, t.apiKeyMissing);
    }
  }, [status, t]);

  const handleScan = useCallback(async () => {
    const entry = await startScan();
    if (entry) {
      router.push(`/gym-scan-result?id=${entry.id}`);
    }
  }, [startScan]);

  const statusLabel =
    status.kind === "analyzing"
      ? t.analyzing
      : status.kind === "capturing"
        ? t.capturing
        : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        <View style={styles.hero}>
          <ScanButton status={status} onPress={handleScan} />
          {statusLabel !== null && (
            <Text style={styles.statusLabel}>{statusLabel}</Text>
          )}
          {status.kind === "error" &&
            status.code !== "camera_permission_denied" &&
            status.code !== "api_key_missing" && (
              <Text style={styles.errorLabel}>{status.message}</Text>
            )}
          {status.kind === "idle" && (
            <Text style={styles.scanHint}>{t.scanHint}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.recent}</Text>
          {history.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t.noHistory}</Text>
              <Text style={styles.emptySub}>{t.noHistorySub}</Text>
            </View>
          ) : (
            history.slice(0, 10).map((entry) => (
              <ScanResultCard
                key={entry.id}
                entry={entry}
                language={language}
                onPress={() => router.push(`/gym-scan-result?id=${entry.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#08080F",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.48)",
    lineHeight: 21,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 44,
    gap: 18,
  },
  statusLabel: {
    fontSize: 15,
    color: "#E2D4FF",
    fontWeight: "600",
  },
  errorLabel: {
    fontSize: 13,
    color: "#FF3B30",
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  scanHint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.42)",
    fontWeight: "500",
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 14,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 44,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "600",
  },
  emptySub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.28)",
    textAlign: "center",
    lineHeight: 19,
  },
});
