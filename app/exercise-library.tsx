import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
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

import { useLanguage } from "@/src/context/LanguageContext";
import {
  EXERCISE_DATABASE,
  searchExercises,
  getFavoriteExerciseIds,
  type ExerciseCategory,
  type Exercise,
} from "@/src/services/exercise-library";

const CATEGORIES: { key: ExerciseCategory | "all" | "favorites"; labelEn: string; labelAr: string; emoji: string }[] = [
  { key: "all",        labelEn: "All",        labelAr: "الكل",     emoji: "✨" },
  { key: "favorites",  labelEn: "Saved",      labelAr: "المحفوظة", emoji: "❤️" },
  { key: "glutes",     labelEn: "Glutes",     labelAr: "ألية",     emoji: "🍑" },
  { key: "legs",       labelEn: "Legs",       labelAr: "ساقين",    emoji: "🦵" },
  { key: "chest",      labelEn: "Chest",      labelAr: "صدر",      emoji: "💪" },
  { key: "back",       labelEn: "Back",       labelAr: "ظهر",      emoji: "🦸" },
  { key: "shoulders",  labelEn: "Shoulders",  labelAr: "كتف",      emoji: "🏋️" },
  { key: "arms",       labelEn: "Arms",       labelAr: "ذراعين",   emoji: "💪" },
  { key: "core",       labelEn: "Core",       labelAr: "جوهر",     emoji: "🔥" },
  { key: "cardio",     labelEn: "Cardio",     labelAr: "كارديو",   emoji: "🏃" },
  { key: "stretching", labelEn: "Stretching", labelAr: "تمدد",     emoji: "🙆‍♀️" },
  { key: "mobility",   labelEn: "Mobility",   labelAr: "مرونة",    emoji: "🌀" },
  { key: "recovery",   labelEn: "Recovery",   labelAr: "تعافٍ",    emoji: "🧘" },
];

const DIFFICULTIES = [
  { key: "all",          labelEn: "All Levels", labelAr: "الكل" },
  { key: "beginner",     labelEn: "Beginner",   labelAr: "مبتدئ" },
  { key: "intermediate", labelEn: "Intermediate",labelAr: "متوسط" },
  { key: "advanced",     labelEn: "Advanced",   labelAr: "متقدم" },
];

const EQUIPMENT_FILTERS = [
  { key: "all",           labelEn: "Any",         labelAr: "الكل" },
  { key: "bodyweight",    labelEn: "Bodyweight",  labelAr: "وزن الجسم" },
  { key: "dumbbell",      labelEn: "Dumbbell",    labelAr: "دمبل" },
  { key: "barbell",       labelEn: "Barbell",     labelAr: "بار" },
  { key: "cable",         labelEn: "Cable",       labelAr: "كابل" },
  { key: "machine",       labelEn: "Machine",     labelAr: "آلة" },
  { key: "resistance_band",labelEn: "Band",       labelAr: "إيلاستيك" },
];

const DIFF_COLOR: Record<string, string> = {
  beginner:     "#22C55E",
  intermediate: "#F59E0B",
  advanced:     "#EF4444",
};

const ExerciseCard = React.memo(function ExerciseCard({
  ex,
  isFav,
  isAr,
  onPress,
}: {
  ex: Exercise;
  isFav: boolean;
  isAr: boolean;
  onPress: () => void;
}) {
  const diffColor = DIFF_COLOR[ex.difficulty] ?? "#888";
  return (
    <TouchableOpacity style={s.exCard} activeOpacity={0.85} onPress={onPress}>
      <View style={[s.exLeft, isAr && { flexDirection: "row-reverse" }]}>
        <View style={[s.exEmojiWrap, { backgroundColor: `${diffColor}15` }]}>
          <Text style={s.exEmoji}>{ex.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[s.exNameRow, isAr && { flexDirection: "row-reverse" }]}>
            <Text style={[s.exName, isAr && { textAlign: "right" }]} numberOfLines={1}>
              {isAr ? ex.nameAr : ex.nameEn}
            </Text>
            {isFav && <Text style={s.favDot}>❤️</Text>}
          </View>
          <Text style={[s.exMeta, isAr && { textAlign: "right" }]} numberOfLines={1}>
            {ex.primaryMuscles.join(", ")}
          </Text>
        </View>
      </View>
      <View style={[s.diffBadge, { borderColor: `${diffColor}50`, backgroundColor: `${diffColor}15` }]}>
        <Text style={[s.diffTxt, { color: diffColor }]}>
          {isAr
            ? ex.difficulty === "beginner" ? "مبتدئ" : ex.difficulty === "intermediate" ? "متوسط" : "متقدم"
            : ex.difficulty}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default function ExerciseLibraryScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState("all");
  const [equipFilter, setEquipFilter] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getFavoriteExerciseIds().then(setFavoriteIds);
    }, [])
  );

  const exercises = useMemo<Exercise[]>(() => {
    const searched = searchExercises(query, {
      difficulty: diffFilter !== "all" ? diffFilter : undefined,
      equipment:  equipFilter !== "all" ? equipFilter : undefined,
    });
    if (activeCategory === "favorites") return searched.filter((e) => favoriteIds.includes(e.id));
    if (activeCategory !== "all") return searched.filter((e) => e.category === activeCategory);
    return searched;
  }, [query, activeCategory, favoriteIds, diffFilter, equipFilter]);

  function navigateToDetail(id: string) {
    router.push({ pathname: "/exercise-detail", params: { id } } as any);
  }

  const activeFilters = (diffFilter !== "all" ? 1 : 0) + (equipFilter !== "all" ? 1 : 0);

  return (
    <LinearGradient colors={["#05050A", "#121225"]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={[s.header, isAr && { flexDirection: "row-reverse" }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnTxt}>{isAr ? "›" : "‹"}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={s.headerTitle}>{isAr ? "مكتبة التمارين" : "Exercise Library"}</Text>
            <Text style={s.headerCount}>
              {exercises.length} {isAr ? "تمرين" : "exercises"}
            </Text>
          </View>
          <TouchableOpacity
            style={[s.filterToggleBtn, activeFilters > 0 && s.filterToggleBtnActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={[s.filterToggleTxt, activeFilters > 0 && { color: "#C6A7FF" }]}>
              {activeFilters > 0 ? `⚙️ ${activeFilters}` : "⚙️"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={[s.searchInput, isAr && { textAlign: "right" }]}
            value={query}
            onChangeText={setQuery}
            placeholder={isAr ? "ابحثي بالاسم، عضلة، معدة..." : "Search by name, muscle, equipment..."}
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={s.clearBtn}>
              <Text style={s.clearBtnTxt}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Advanced filters */}
        {showFilters && (
          <View style={s.filtersPanel}>
            <Text style={[s.filterGroupLabel, isAr && { textAlign: "right" }]}>
              {isAr ? "المستوى" : "Difficulty"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterChips}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[s.filterChip, diffFilter === d.key && s.filterChipActive]}
                  onPress={() => setDiffFilter(d.key)}
                >
                  <Text style={[s.filterChipTxt, diffFilter === d.key && { color: "#C6A7FF" }]}>
                    {isAr ? d.labelAr : d.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[s.filterGroupLabel, { marginTop: 8 }, isAr && { textAlign: "right" }]}>
              {isAr ? "المعدات" : "Equipment"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterChips}>
              {EQUIPMENT_FILTERS.map((eq) => (
                <TouchableOpacity
                  key={eq.key}
                  style={[s.filterChip, equipFilter === eq.key && s.filterChipActive]}
                  onPress={() => setEquipFilter(eq.key)}
                >
                  <Text style={[s.filterChipTxt, equipFilter === eq.key && { color: "#C6A7FF" }]}>
                    {isAr ? eq.labelAr : eq.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chips}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => { setActiveCategory(cat.key); setQuery(""); }}
                style={[s.chip, active && s.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={s.chipEmoji}>{cat.emoji}</Text>
                <Text style={[s.chipLabel, active && s.chipLabelActive]}>
                  {isAr ? cat.labelAr : cat.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Exercise list */}
        <FlatList
          data={exercises}
          keyExtractor={(e) => e.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyTitle}>{isAr ? "لا توجد تمارين" : "No exercises found"}</Text>
              <Text style={s.emptySub}>
                {isAr ? "جربي مصطلح بحث أو فلتر مختلف" : "Try a different search term or filter"}
              </Text>
            </View>
          }
          renderItem={({ item: ex }) => (
            <ExerciseCard
              ex={ex}
              isFav={favoriteIds.includes(ex.id)}
              isAr={isAr}
              onPress={() => navigateToDetail(ex.id)}
            />
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  backBtnTxt: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  headerCount: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: "600", marginTop: 1 },
  filterToggleBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  filterToggleBtnActive: { backgroundColor: "rgba(198,167,255,0.15)", borderWidth: 1, borderColor: "rgba(198,167,255,0.3)" },
  filterToggleTxt: { fontSize: 16, color: "rgba(255,255,255,0.7)" },

  searchWrap: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 14, height: 46, gap: 10,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1, color: "#FFFFFF", fontSize: 15, fontWeight: "600",
  },
  clearBtn: { padding: 4 },
  clearBtnTxt: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "700" },

  filtersPanel: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  filterGroupLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "800", letterSpacing: 0.6, marginBottom: 6 },
  filterChips: { gap: 6 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  filterChipActive: { backgroundColor: "rgba(198,167,255,0.12)", borderColor: "rgba(198,167,255,0.30)" },
  filterChipTxt: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" },

  chips: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12, gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    minHeight: 40,
  },
  chipActive: { backgroundColor: "rgba(198,167,255,0.15)", borderColor: "rgba(198,167,255,0.40)" },
  chipEmoji: { fontSize: 14, lineHeight: 18 },
  chipLabel: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  chipLabelActive: { color: "#C6A7FF" },

  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  exCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", gap: 12,
    minHeight: 70,
  },
  exLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  exEmojiWrap: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  exEmoji: { fontSize: 20 },
  exNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  exName: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", flex: 1 },
  favDot: { fontSize: 12, flexShrink: 0 },
  exMeta: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600", marginTop: 3 },
  diffBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    borderWidth: 1, flexShrink: 0,
  },
  diffTxt: { fontSize: 11, fontWeight: "800" },

  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { color: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: "800" },
  emptySub: { color: "rgba(255,255,255,0.3)", fontSize: 14, fontWeight: "600", textAlign: "center" },
});
