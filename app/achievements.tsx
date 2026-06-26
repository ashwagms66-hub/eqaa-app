import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLanguage } from "@/src/context/LanguageContext";
import { getAllAchievements } from "@/src/services/achievements";
import type { Achievement } from "@/src/services/achievements";

function formatDate(iso: string, language: string): string {
  return new Date(iso).toLocaleDateString(language === "ar" ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  consistency: "#F59E0B",
  strength:    "#EF4444",
  volume:      "#3B82F6",
  cycle:       "#EC4899",
  milestone:   "#22C55E",
};

const CATEGORY_LABEL: Record<string, [string, string]> = {
  consistency: ["Consistency", "الثبات"],
  strength:    ["Strength",    "القوة"],
  volume:      ["Volume",      "الحجم"],
  cycle:       ["Cycle",       "الدورة"],
  milestone:   ["Milestone",   "إنجاز"],
};

export default function AchievementsScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const listFade = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      listFade.setValue(0);
      getAllAchievements().then((all) => {
        setAchievements(all);
        setLoading(false);
        Animated.timing(listFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, [])
  );

  const unlocked = achievements.filter((a) => a.unlockedAt !== null);
  const locked = achievements.filter((a) => a.unlockedAt === null);

  const filtered = (list: Achievement[]) =>
    filter === "all" ? list : list.filter((a) => a.category === filter);

  const categories = ["all", "consistency", "strength", "volume", "cycle", "milestone"];

  return (
    <LinearGradient colors={["#05050A", "#121225"]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={[s.header, isAr && { flexDirection: "row-reverse" }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnTxt}>{isAr ? "›" : "‹"}</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>
            {isAr ? "الإنجازات" : "Achievements"}
          </Text>
          <View style={[s.countBadge]}>
            <Text style={s.countTxt}>{unlocked.length}/{achievements.length}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#C6A7FF" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Progress bar */}
            <View style={s.progressWrap}>
              <View style={s.progressBg}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: achievements.length > 0
                        ? `${(unlocked.length / achievements.length) * 100}%`
                        : "0%",
                    },
                  ]}
                />
              </View>
              <Text style={s.progressLabel}>
                {isAr
                  ? `فتحتِ ${unlocked.length} من ${achievements.length} إنجازاً`
                  : `${unlocked.length} of ${achievements.length} unlocked`}
              </Text>
            </View>

            {/* Category filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filters}
              style={{ maxHeight: 46 }}
            >
              {categories.map((cat) => {
                const active = filter === cat;
                const color = cat === "all" ? "#C6A7FF" : CATEGORY_COLORS[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[s.filterChip, active && { borderColor: color + "60", backgroundColor: color + "18" }]}
                    onPress={() => setFilter(cat)}
                  >
                    <Text style={[s.filterTxt, active && { color }]}>
                      {cat === "all"
                        ? (isAr ? "الكل" : "All")
                        : isAr
                        ? CATEGORY_LABEL[cat]?.[1] ?? cat
                        : CATEGORY_LABEL[cat]?.[0] ?? cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Animated.ScrollView
              style={{ opacity: listFade }}
              contentContainerStyle={s.scroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Unlocked */}
              {filtered(unlocked).length > 0 && (
                <>
                  <Text style={[s.sectionTitle, isAr && { textAlign: "right" }]}>
                    {isAr ? "✅ مفتوحة" : "✅ Unlocked"}
                  </Text>
                  {filtered(unlocked).map((ach, i) => (
                    <AchievementCard key={ach.id} ach={ach} isAr={isAr} unlocked index={i} />
                  ))}
                </>
              )}

              {/* Locked */}
              {filtered(locked).length > 0 && (
                <>
                  <Text style={[s.sectionTitle, { marginTop: 16 }, isAr && { textAlign: "right" }]}>
                    {isAr ? "🔒 مقفلة" : "🔒 Locked"}
                  </Text>
                  {filtered(locked).map((ach, i) => (
                    <AchievementCard key={ach.id} ach={ach} isAr={isAr} unlocked={false} index={unlocked.length + i} />
                  ))}
                </>
              )}

              {filtered(unlocked).length === 0 && filtered(locked).length === 0 && (
                <View style={s.empty}>
                  <Text style={s.emptyEmoji}>🔍</Text>
                  <Text style={s.emptyTxt}>{isAr ? "لا توجد نتائج" : "Nothing here"}</Text>
                </View>
              )}
            </Animated.ScrollView>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function AchievementCard({
  ach,
  isAr,
  unlocked,
  index,
}: {
  ach: Achievement;
  isAr: boolean;
  unlocked: boolean;
  index: number;
}) {
  const catColor = CATEGORY_COLORS[ach.category] ?? "#888";
  const [en, ar] = CATEGORY_LABEL[ach.category] ?? [ach.category, ach.category];
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 40,
        useNativeDriver: true,
        tension: 120,
        friction: 9,
      }),
      Animated.timing(opacAnim, {
        toValue: 1,
        duration: 220,
        delay: index * 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.achCard,
        !unlocked && s.achCardLocked,
        { transform: [{ scale: scaleAnim }], opacity: opacAnim },
      ]}
    >
      <View style={[s.achIconWrap, { backgroundColor: unlocked ? catColor + "20" : "rgba(255,255,255,0.06)" }]}>
        <Text style={[s.achIcon, !unlocked && { opacity: 0.3 }]}>{ach.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={[s.achNameRow, isAr && { flexDirection: "row-reverse" }]}>
          <Text style={[s.achName, !unlocked && { color: "rgba(255,255,255,0.35)" }, isAr && { textAlign: "right" }]}>
            {isAr ? ach.nameAr : ach.nameEn}
          </Text>
          <View style={[s.catBadge, { borderColor: catColor + "50", backgroundColor: catColor + "12" }]}>
            <Text style={[s.catBadgeTxt, { color: catColor }]}>{isAr ? ar : en}</Text>
          </View>
        </View>
        <Text style={[s.achDesc, !unlocked && { opacity: 0.4 }, isAr && { textAlign: "right" }]}>
          {isAr ? ach.descriptionAr : ach.descriptionEn}
        </Text>
        {unlocked && ach.unlockedAt && (
          <Text style={[s.achDate, isAr && { textAlign: "right" }]}>
            {isAr ? "فُتح في " : "Unlocked "}{formatDate(ach.unlockedAt, isAr ? "ar" : "en")}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  backBtnTxt: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  countBadge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 999, backgroundColor: "rgba(198,167,255,0.15)",
    borderWidth: 1, borderColor: "rgba(198,167,255,0.25)",
  },
  countTxt: { color: "#C6A7FF", fontSize: 13, fontWeight: "800" },

  progressWrap: { paddingHorizontal: 20, marginBottom: 14 },
  progressBg: {
    height: 6, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: "#C6A7FF" },
  progressLabel: {
    color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600", marginTop: 6,
  },

  filters: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  filterTxt: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "700" },

  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  sectionTitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "800", letterSpacing: 0.6, marginBottom: 10 },

  achCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  achCardLocked: { opacity: 0.7 },
  achIconWrap: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  achIcon: { fontSize: 28 },
  achNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" },
  achName: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  catBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    borderWidth: 1,
  },
  catBadgeTxt: { fontSize: 10, fontWeight: "800" },
  achDesc: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 20, fontWeight: "500" },
  achDate: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: "600", marginTop: 4 },

  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 40 },
  emptyTxt: { color: "rgba(255,255,255,0.35)", fontSize: 16, fontWeight: "700" },
});
