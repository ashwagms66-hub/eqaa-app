import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Bookmark, BookmarkCheck, Play, Trash2 } from "lucide-react-native";
import { useLanguage } from "@/src/context/LanguageContext";
import { ScanButton } from "@/src/features/workout-ai/components/ScanButton";
import { ScanResultCard } from "@/src/features/workout-ai/components/ScanResultCard";
import { useGymScanner } from "@/src/features/workout-ai/hooks/useGymScanner";
import type { ScanEntry } from "@/src/features/workout-ai/models/types";
import {
  loadSavedScanSessions,
  saveSavedScanSession,
  deleteSavedScanSession,
  touchSavedScanSession,
  type SavedScanSession,
} from "@/src/storage/savedScanSessionStorage";
import { useSubscription } from "@/src/hooks/useSubscription";

const STRINGS = {
  ar: {
    title: "ماسح النادي",
    subtitle: "صوّري جهاز النادي وسيحلله الذكاء الاصطناعي",
    scanHint: "تصوير جهاز النادي",
    analyzing: "جاري التحليل...",
    capturing: "فتح الكاميرا...",
    recent: "عمليات البحث الأخيرة",
    noHistory: "لا توجد عمليات بحث بعد",
    noHistorySub: "اضغطي الزر أعلاه لتصوير جهاز في النادي",
    errorTitle: "حدث خطأ",
    permissionDenied: "يُرجى السماح بالوصول إلى الكاميرا من الإعدادات",
    apiKeyMissing: "خدمة الذكاء الاصطناعي غير مفعّلة حالياً.",
    analysisError: "حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.",
    saveBannerTitle: "حفظ جلسة من الأجهزة الممسوحة؟",
    saveBannerBody: (n: number) => `مسحتِ ${n} أجهزة. احفظيها كجلسة جاهزة للمرات القادمة.`,
    saveSession: "حفظ الجلسة",
    later: "لاحقاً",
    savedSessions: "جلساتي المحفوظة",
    noSaved: "لا توجد جلسات محفوظة بعد",
    machines: (n: number) => `${n} أجهزة`,
    lastUsed: "آخر استخدام",
    never: "لم تُستخدم",
    promptTitle: "اسم الجلسة",
    promptMsg: "أدخلي اسماً لهذه الجلسة",
    promptPlaceholder: "تمرين علوي",
    savedOk: "تم الحفظ ✨",
    savedMsg: (name: string) => `تم حفظ "${name}" بنجاح`,
    confirmDelete: "حذف الجلسة؟",
    confirmDeleteMsg: "هذا الإجراء لا يمكن التراجع عنه.",
    delete: "حذف",
    cancel: "إلغاء",
    start: "ابدئي",
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
    apiKeyMissing: "AI scanner is not enabled yet.",
    analysisError: "An error occurred during analysis. Please try again.",
    saveBannerTitle: "Save scanned machines as a workout?",
    saveBannerBody: (n: number) => `You scanned ${n} machines. Save them as a reusable session for next time.`,
    saveSession: "Save Session",
    later: "Later",
    savedSessions: "Saved Sessions",
    noSaved: "No saved sessions yet",
    machines: (n: number) => `${n} machines`,
    lastUsed: "Last used",
    never: "Never used",
    promptTitle: "Session Name",
    promptMsg: "Enter a name for this session",
    promptPlaceholder: "Upper Body",
    savedOk: "Saved ✨",
    savedMsg: (name: string) => `"${name}" saved successfully`,
    confirmDelete: "Delete session?",
    confirmDeleteMsg: "This cannot be undone.",
    delete: "Delete",
    cancel: "Cancel",
    start: "Start",
  },
} as const;

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string, isAr: boolean): string {
  return new Date(iso).toLocaleDateString(isAr ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function GymScannerScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const t = STRINGS[language];
  const { status, history, startScan } = useGymScanner();
  const { isPremium } = useSubscription();

  const [savedSessions, setSavedSessions] = useState<SavedScanSession[]>([]);
  const [saveBannerDismissed, setSaveBannerDismissed] = useState(false);

  const loadSaved = useCallback(async () => {
    const sessions = await loadSavedScanSessions();
    setSavedSessions(sessions);
  }, []);

  useFocusEffect(useCallback(() => {
    loadSaved();
    setSaveBannerDismissed(false);
  }, [loadSaved]));

  useEffect(() => {
    if (status.kind !== "error") return;
    if (status.code === "camera_permission_denied") {
      Alert.alert(t.errorTitle, t.permissionDenied);
    }
  }, [status, t]);

  const handleScan = useCallback(async () => {
    if (!isPremium) {
      router.push("/paywall" as any);
      return;
    }
    const entry = await startScan();
    if (entry) {
      router.push(`/gym-scan-result?id=${entry.id}`);
    }
  }, [startScan, isPremium]);

  const todayScans: ScanEntry[] = history.filter(
    (e) => e.capturedAt.startsWith(todayISO())
  );

  const showSaveBanner = !saveBannerDismissed && todayScans.length >= 2;

  function handleSaveSession() {
    Alert.prompt(
      t.promptTitle,
      t.promptMsg,
      async (name) => {
        if (!name?.trim()) return;
        const session: SavedScanSession = {
          id: `saved_${Date.now()}`,
          name: name.trim(),
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          machines: todayScans.map((e) => ({
            machineName: e.result.machineName,
            machineNameAr: e.result.machineNameAr,
            exerciseName: e.result.exerciseName,
            exerciseNameAr: e.result.exerciseNameAr,
            machineType: e.result.machineType,
          })),
        };
        await saveSavedScanSession(session);
        setSavedSessions((prev) => [session, ...prev]);
        setSaveBannerDismissed(true);
        Alert.alert(t.savedOk, t.savedMsg(name.trim()));
      },
      "plain-text",
      t.promptPlaceholder
    );
  }

  async function handleStartSaved(session: SavedScanSession) {
    await touchSavedScanSession(session.id);
    const firstMatch = history.find(
      (e) => e.result.machineName === session.machines[0]?.machineName
    );
    if (firstMatch) {
      router.push(`/gym-scan-result?id=${firstMatch.id}`);
    } else {
      Alert.alert(
        isAr ? "جهاز غير موجود" : "Machine not found",
        isAr
          ? "لم يُعثر على هذا الجهاز في التاريخ الأخير. امسحيه مجدداً."
          : "This machine was not found in recent scans. Please re-scan it."
      );
    }
  }

  function handleDeleteSaved(session: SavedScanSession) {
    Alert.alert(t.confirmDelete, t.confirmDeleteMsg, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: async () => {
          await deleteSavedScanSession(session.id);
          setSavedSessions((prev) => prev.filter((s) => s.id !== session.id));
        },
      },
    ]);
  }

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
          <Text style={[styles.title, isAr && styles.rtl]}>{t.title}</Text>
          <Text style={[styles.subtitle, isAr && styles.rtl]}>{t.subtitle}</Text>
        </View>

        <View style={styles.hero}>
          <ScanButton status={status} onPress={handleScan} />
          {statusLabel !== null && (
            <Text style={styles.statusLabel}>{statusLabel}</Text>
          )}
          {status.kind === "error" && status.code !== "camera_permission_denied" && (
            <Text style={styles.errorLabel}>
              {status.code === "api_key_missing" ? t.apiKeyMissing : t.analysisError}
            </Text>
          )}
          {status.kind === "idle" && (
            <Text style={styles.scanHint}>{t.scanHint}</Text>
          )}
        </View>

        {/* ── Save banner ─────────────────────────────────────────────── */}
        {showSaveBanner && (
          <View style={styles.saveBanner}>
            <BookmarkCheck size={20} color="#C6A7FF" strokeWidth={2} style={{ flexShrink: 0 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.saveBannerTitle, isAr && styles.rtl]}>
                {t.saveBannerTitle}
              </Text>
              <Text style={[styles.saveBannerBody, isAr && styles.rtl]}>
                {t.saveBannerBody(todayScans.length)}
              </Text>
            </View>
            <View style={styles.saveBannerBtns}>
              <TouchableOpacity
                style={styles.savePrimaryBtn}
                onPress={handleSaveSession}
                activeOpacity={0.85}
              >
                <Text style={styles.savePrimaryTxt}>{t.saveSession}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSaveBannerDismissed(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.saveLaterTxt}>{t.later}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Saved sessions ──────────────────────────────────────────── */}
        {savedSessions.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionRow, isAr && { flexDirection: "row-reverse" }]}>
              <Bookmark size={16} color="#C6A7FF" strokeWidth={2} />
              <Text style={styles.sectionTitle}>{t.savedSessions}</Text>
            </View>
            {savedSessions.map((session) => (
              <View key={session.id} style={styles.savedCard}>
                <View style={styles.savedCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.savedName, isAr && styles.rtl]} numberOfLines={1}>
                      {session.name}
                    </Text>
                    <Text style={[styles.savedMeta, isAr && styles.rtl]}>
                      {t.machines(session.machines.length)}
                      {" · "}
                      {session.lastUsedAt
                        ? `${t.lastUsed} ${formatDate(session.lastUsedAt, isAr)}`
                        : t.never}
                    </Text>
                  </View>
                  <View style={[styles.savedActions, isAr && { flexDirection: "row-reverse" }]}>
                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => handleStartSaved(session)}
                      activeOpacity={0.85}
                    >
                      <Play size={13} color="#08080F" strokeWidth={2.5} fill="#08080F" />
                      <Text style={styles.startBtnTxt}>{t.start}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteSaved(session)}
                      style={styles.deleteBtn}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={15} color="rgba(255,59,48,0.7)" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.machineList}>
                  {session.machines.slice(0, 4).map((m, i) => (
                    <View key={i} style={styles.machineChip}>
                      <Text style={styles.machineChipTxt} numberOfLines={1}>
                        {isAr ? m.machineNameAr : m.machineName}
                      </Text>
                    </View>
                  ))}
                  {session.machines.length > 4 && (
                    <View style={styles.machineChip}>
                      <Text style={styles.machineChipTxt}>+{session.machines.length - 4}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Recent scans ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isAr && styles.rtl]}>{t.recent}</Text>
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
  safe: { flex: 1, backgroundColor: "#08080F" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  rtl: { textAlign: "right" },

  header: { paddingTop: 24, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: "800", color: "#FFFFFF", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.48)", lineHeight: 21 },

  hero: { alignItems: "center", paddingVertical: 44, gap: 18 },
  statusLabel: { fontSize: 15, color: "#E2D4FF", fontWeight: "600" },
  errorLabel: {
    fontSize: 13, color: "#FF3B30", textAlign: "center",
    paddingHorizontal: 24, lineHeight: 18,
  },
  scanHint: { fontSize: 14, color: "rgba(255,255,255,0.42)", fontWeight: "500" },

  saveBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "rgba(198,167,255,0.10)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.25)",
    padding: 16,
    marginBottom: 24,
  },
  saveBannerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  saveBannerBody: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 18,
  },
  saveBannerBtns: { gap: 8, marginTop: 10 },
  savePrimaryBtn: {
    backgroundColor: "#C6A7FF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  savePrimaryTxt: { color: "#111111", fontSize: 13, fontWeight: "800" },
  saveLaterTxt: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  section: { marginTop: 4, marginBottom: 20 },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },

  savedCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  savedCardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  savedName: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  savedMeta: { color: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: "500", marginTop: 2 },
  savedActions: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#C6A7FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  startBtnTxt: { color: "#08080F", fontSize: 12, fontWeight: "800" },
  deleteBtn: {
    width: 32, height: 32,
    alignItems: "center", justifyContent: "center",
  },
  machineList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  machineChip: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  machineChipTxt: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: 44, gap: 8 },
  emptyTitle: { fontSize: 15, color: "rgba(255,255,255,0.45)", fontWeight: "600" },
  emptySub: {
    fontSize: 13, color: "rgba(255,255,255,0.28)",
    textAlign: "center", lineHeight: 19,
  },
});
