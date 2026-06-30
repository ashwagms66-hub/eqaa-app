import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Activity, Dumbbell, Flame, Heart, Maximize2, Shield,
  Star, Sun, Target, Wind, Zap,
} from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import {
  getExerciseById,
  toggleFavoriteExercise,
  isFavoriteExercise,
  addToExerciseHistory,
} from "@/src/services/exercise-library";
import { getPRForExercise } from "@/src/services/pr";
import { workoutSessionService } from "@/src/workout/services/WorkoutSessionService";
import type { Exercise } from "@/src/services/exercise-library/types";
import type { PersonalRecord } from "@/src/services/pr/prService";

type LucideIcon = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

const CATEGORY_VISUAL: Record<string, {
  colors: [string, string];
  Icon: LucideIcon;
  accentColor: string;
  labelEn: string;
  labelAr: string;
}> = {
  glutes:    { colors: ["rgba(255,111,174,0.22)", "rgba(198,167,255,0.06)"], Icon: Target,    accentColor: "#FF6FAE", labelEn: "Glutes",     labelAr: "الألية"   },
  legs:      { colors: ["rgba(255,159,10,0.22)",  "rgba(255,204,2,0.06)"],  Icon: Zap,       accentColor: "#FF9F0A", labelEn: "Legs",       labelAr: "الساقين"  },
  chest:     { colors: ["rgba(255,59,48,0.22)",   "rgba(255,111,174,0.06)"],Icon: Heart,     accentColor: "#FF453A", labelEn: "Chest",      labelAr: "الصدر"    },
  back:      { colors: ["rgba(100,210,255,0.22)", "rgba(10,132,255,0.06)"], Icon: Shield,    accentColor: "#64D2FF", labelEn: "Back",       labelAr: "الظهر"    },
  shoulders: { colors: ["rgba(198,167,255,0.22)", "rgba(226,212,255,0.06)"],Icon: Star,      accentColor: "#C6A7FF", labelEn: "Shoulders",  labelAr: "الكتف"    },
  arms:      { colors: ["rgba(48,209,88,0.22)",   "rgba(52,199,89,0.06)"],  Icon: Dumbbell,  accentColor: "#30D158", labelEn: "Arms",       labelAr: "الذراعين" },
  core:      { colors: ["rgba(255,159,10,0.22)",  "rgba(255,69,58,0.06)"],  Icon: Flame,     accentColor: "#FF9F0A", labelEn: "Core",       labelAr: "الجوهر"   },
  cardio:    { colors: ["rgba(255,55,95,0.22)",   "rgba(255,59,48,0.06)"],  Icon: Activity,  accentColor: "#FF375F", labelEn: "Cardio",     labelAr: "كارديو"   },
  mobility:  { colors: ["rgba(100,210,255,0.22)", "rgba(90,200,250,0.06)"], Icon: Wind,      accentColor: "#64D2FF", labelEn: "Mobility",   labelAr: "المرونة"  },
  recovery:  { colors: ["rgba(48,209,88,0.22)",   "rgba(52,199,89,0.06)"],  Icon: Sun,       accentColor: "#30D158", labelEn: "Recovery",   labelAr: "التعافي"  },
  stretching:{ colors: ["rgba(198,167,255,0.22)", "rgba(226,212,255,0.06)"],Icon: Maximize2, accentColor: "#C6A7FF", labelEn: "Stretching", labelAr: "التمدد"   },
};

const DIFF_COLOR: Record<string, string> = {
  beginner:     "#22C55E",
  intermediate: "#F59E0B",
  advanced:     "#EF4444",
};

const PHASE_MAP: Record<string, [string, string]> = {
  menstrual: ["Menstrual", "الحيض"],
  renewal:   ["Follicular", "الجريب"],
  power:     ["Ovulation", "التبويض"],
  clarity:   ["Luteal", "الطور الأصفر"],
  calm:      ["Late Luteal", "الطور الأخير"],
  all:       ["All Phases", "جميع المراحل"],
};

const EQUIP_MAP: Record<string, [string, string]> = {
  barbell:        ["Barbell", "بار"],
  dumbbell:       ["Dumbbell", "دمبل"],
  cable:          ["Cable", "كابل"],
  machine:        ["Machine", "آلة"],
  bodyweight:     ["Bodyweight", "وزن الجسم"],
  resistance_band:["Resistance Band", "إيلاستيك"],
  kettlebell:     ["Kettlebell", "كيتل بيل"],
  foam_roller:    ["Foam Roller", "أسطوانة رغوة"],
  none:           ["None", "بدون معدات"],
};

// ── Animated media / illustration section ──────────────────────────────────────

function ExerciseMediaSection({ exercise, isAr }: { exercise: Exercise; isAr: boolean }) {
  const videoRef = useRef<Video>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, []);

  async function togglePlay() {
    if (!videoRef.current) return;
    if (playing) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setPlaying(!playing);
  }

  if (exercise.videoUrl) {
    return (
      <View style={ms.container}>
        <Video
          ref={videoRef}
          source={{ uri: exercise.videoUrl }}
          style={ms.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          onLoad={() => setLoaded(true)}
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if (status.isLoaded) setPlaying(status.isPlaying);
          }}
        />
        {!loaded && (
          <View style={[StyleSheet.absoluteFill, ms.loadingOverlay]}>
            <Text style={ms.loadingEmoji}>{exercise.emoji}</Text>
          </View>
        )}
        <TouchableOpacity style={ms.playBtn} onPress={togglePlay} activeOpacity={0.85}>
          <View style={ms.playBtnInner}>
            <Text style={ms.playBtnIcon}>{playing ? "⏸" : "▶"}</Text>
          </View>
        </TouchableOpacity>
        <View style={ms.badge}>
          <Text style={ms.badgeTxt}>{isAr ? "فيديو تعليمي" : "Tutorial Video"}</Text>
        </View>
      </View>
    );
  }

  // Fallback: category-themed instructional visual
  const visual = CATEGORY_VISUAL[exercise.category];
  const accent = visual?.accentColor ?? "#C6A7FF";
  const gradColors: [string, string, string] = [
    visual?.colors[0] ?? "rgba(198,167,255,0.15)",
    visual?.colors[1] ?? "rgba(198,167,255,0.04)",
    "rgba(0,0,0,0)",
  ];
  const Icon = visual?.Icon ?? Dumbbell;
  const catLabel = isAr ? (visual?.labelAr ?? exercise.category) : (visual?.labelEn ?? exercise.category);

  return (
    <View style={ms.container}>
      <LinearGradient colors={gradColors} style={ms.fallbackBg} />
      <Animated.View style={[ms.glowRing, { opacity: glowAnim, borderColor: accent + "20" }]} />
      <View style={ms.fallbackContent}>
        <Animated.View style={[ms.iconCircle, { transform: [{ scale: pulseAnim }], borderColor: accent + "50", backgroundColor: accent + "18" }]}>
          <Icon size={40} color={accent} strokeWidth={1.5} />
        </Animated.View>
        <Text style={[ms.categoryLabel, { color: accent }]}>{catLabel}</Text>
        {exercise.primaryMuscles.length > 0 && (
          <View style={ms.muscleTagRow}>
            {exercise.primaryMuscles.slice(0, 3).map((m) => (
              <View key={m} style={[ms.muscleTag, { borderColor: accent + "35", backgroundColor: accent + "14" }]}>
                <Text style={[ms.muscleTagText, { color: accent }]}>{m}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={ms.badge}>
        <Text style={ms.badgeTxt}>{isAr ? "تركيز التمرين" : "Exercise Focus"}</Text>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ExerciseDetailScreen() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { id } = useLocalSearchParams<{ id: string }>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [pr, setPr] = useState<PersonalRecord | null>(null);
  const [logging, setLogging] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const ex = getExerciseById(id);
      if (!ex) return;
      setExercise(ex);
      addToExerciseHistory(id);
      isFavoriteExercise(id).then(setIsFav);
      getPRForExercise(id).then(setPr);
      Animated.timing(fadeAnim, { toValue: 1, duration: 340, useNativeDriver: true }).start();
    }, [id])
  );

  async function handleFavorite() {
    if (!id) return;
    const nowFav = await toggleFavoriteExercise(id);
    setIsFav(nowFav);
  }

  async function handleLog() {
    if (logging || !exercise || !id) return;
    setLogging(true);
    try {
      const session = await workoutSessionService.createSession({
        exerciseId: id,
        machineId: null,
        targetSets: exercise.defaultSets || 3,
        targetReps: String(exercise.defaultReps || 10),
        targetRestSeconds: 90,
        scanEntryId: null,
      });
      router.push({ pathname: "/workout-session", params: { id: session.id } });
    } catch {
      setLogging(false);
    }
  }

  if (!exercise) {
    return (
      <LinearGradient colors={["#05050A", "#121225"]} style={s.container}>
        <SafeAreaView />
      </LinearGradient>
    );
  }

  const diffColor = DIFF_COLOR[exercise.difficulty] ?? "#888";

  return (
    <LinearGradient colors={["#05050A", "#121225"]} style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={[s.header, isAr && { flexDirection: "row-reverse" }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnTxt}>{isAr ? "›" : "‹"}</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>
            {isAr ? exercise.nameAr : exercise.nameEn}
          </Text>
          <TouchableOpacity onPress={handleFavorite} style={s.favBtn}>
            <Text style={s.favBtnTxt}>{isFav ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Media section ── */}
          <ExerciseMediaSection exercise={exercise} isAr={isAr} />

          {/* ── Title + badges ── */}
          <View style={s.titleBlock}>
            <Text style={s.heroName}>{isAr ? exercise.nameAr : exercise.nameEn}</Text>
            <View style={[s.badgeRow, isAr && { flexDirection: "row-reverse" }]}>
              <View style={[s.badge, { borderColor: `${diffColor}60`, backgroundColor: `${diffColor}15` }]}>
                <Text style={[s.badgeTxt, { color: diffColor }]}>
                  {isAr
                    ? exercise.difficulty === "beginner" ? "مبتدئ" : exercise.difficulty === "intermediate" ? "متوسط" : "متقدم"
                    : exercise.difficulty}
                </Text>
              </View>
              <View style={s.badge}>
                <Text style={s.badgeTxt}>{isAr ? arabicCategory(exercise.category) : exercise.category}</Text>
              </View>
              {exercise.defaultSets > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeTxt}>
                    {exercise.isTimeBased
                      ? `${exercise.defaultSets}×${exercise.defaultDurationSec}s`
                      : `${exercise.defaultSets}×${exercise.defaultReps}`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── PR banner ── */}
          {pr && (
            <View style={s.prBanner}>
              <Text style={s.prEmoji}>🏆</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.prLabel, isAr && { textAlign: "right" }]}>
                  {isAr ? "رقمك القياسي الشخصي" : "Your Personal Record"}
                </Text>
                <Text style={[s.prValue, isAr && { textAlign: "right" }]}>
                  {pr.estimated1RMkg
                    ? `${pr.estimated1RMkg}kg ${isAr ? "تقديري 1RM" : "est. 1RM"}`
                    : `${pr.maxWeightKg}kg × ${pr.maxReps} reps`}
                </Text>
              </View>
            </View>
          )}

          {/* ── Description ── */}
          <Section title={isAr ? "الوصف" : "Description"}>
            <Text style={[s.bodyText, isAr && { textAlign: "right" }]}>
              {isAr ? exercise.descriptionAr : exercise.descriptionEn}
            </Text>
          </Section>

          {/* ── Muscles ── */}
          <Section title={isAr ? "العضلات المستهدفة" : "Muscles Targeted"}>
            <View style={s.muscleWrap}>
              <View style={s.muscleLine}>
                <Text style={s.muscleTag}>{isAr ? "أساسية" : "Primary"}</Text>
                <Text style={s.musclePrimary}>{exercise.primaryMuscles.join(", ")}</Text>
              </View>
              {exercise.secondaryMuscles.length > 0 && (
                <View style={s.muscleLine}>
                  <Text style={s.muscleTag}>{isAr ? "ثانوية" : "Secondary"}</Text>
                  <Text style={s.muscleSecondary}>{exercise.secondaryMuscles.join(", ")}</Text>
                </View>
              )}
            </View>
          </Section>

          {/* ── Equipment ── */}
          <Section title={isAr ? "المعدات" : "Equipment"}>
            <View style={[s.equipRow, isAr && { flexDirection: "row-reverse" }]}>
              {exercise.equipment.map((eq) => {
                const [en, ar] = EQUIP_MAP[eq] ?? [eq, eq];
                return (
                  <View key={eq} style={s.equipPill}>
                    <Text style={s.equipTxt}>{isAr ? ar : en}</Text>
                  </View>
                );
              })}
            </View>
          </Section>

          {/* ── Breathing ── */}
          <Section title={isAr ? "التنفس" : "Breathing Technique"}>
            <View style={[s.breathRow, isAr && { flexDirection: "row-reverse" }]}>
              <Text style={s.breathEmoji}>🫁</Text>
              <Text style={[s.bodyText, { flex: 1 }, isAr && { textAlign: "right" }]}>
                {isAr ? exercise.breathingAr : exercise.breathingEn}
              </Text>
            </View>
          </Section>

          {/* ── Cycle phases ── */}
          <Section title={isAr ? "أفضل مراحل الدورة" : "Best Cycle Phases"}>
            <View style={[s.phaseRow, isAr && { flexDirection: "row-reverse" }]}>
              {exercise.cyclePhases.map((phase) => {
                const [en, ar] = PHASE_MAP[phase] ?? [phase, phase];
                return (
                  <View key={phase} style={s.phasePill}>
                    <Text style={s.phasePillTxt}>{isAr ? ar : en}</Text>
                  </View>
                );
              })}
            </View>
          </Section>

          {/* ── Common mistakes ── */}
          <Section title={isAr ? "الأخطاء الشائعة" : "Common Mistakes"}>
            {(isAr ? exercise.commonMistakesAr : exercise.commonMistakesEn).map((m, i) => (
              <View key={i} style={[s.listRow, isAr && { flexDirection: "row-reverse" }]}>
                <Text style={s.listBullet}>⚠️</Text>
                <Text style={[s.listText, isAr && { textAlign: "right" }]}>{m}</Text>
              </View>
            ))}
          </Section>

          {/* ── Beginner tips ── */}
          <Section title={isAr ? "نصائح للمبتدئات" : "Beginner Tips"}>
            {(isAr ? exercise.beginnerTipsAr : exercise.beginnerTipsEn).map((t, i) => (
              <View key={i} style={[s.listRow, isAr && { flexDirection: "row-reverse" }]}>
                <Text style={s.listBullet}>✅</Text>
                <Text style={[s.listText, isAr && { textAlign: "right" }]}>{t}</Text>
              </View>
            ))}
          </Section>

          {/* ── Log CTA ── */}
          <TouchableOpacity
            style={[s.logBtn, logging && s.logBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleLog}
            disabled={logging}
          >
            {logging ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <Text style={s.logBtnTxt}>
                {isAr ? "سجّلي هذا التمرين" : "Log This Exercise"}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function arabicCategory(cat: string): string {
  const map: Record<string, string> = {
    glutes: "ألية", legs: "ساقين", chest: "صدر", back: "ظهر",
    shoulders: "كتف", arms: "ذراعين", core: "جوهر",
    mobility: "مرونة", cardio: "كارديو", recovery: "تعافٍ", stretching: "تمدد",
  };
  return map[cat] ?? cat;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  container: {
    height: 220,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  fallbackBg: { ...StyleSheet.absoluteFillObject },
  glowRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 40,
    borderColor: "rgba(198,167,255,0.12)",
  },
  emojiOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(198,167,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(198,167,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  bigEmoji: { fontSize: 44 },
  fallbackContent: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "capitalize",
    marginTop: 2,
  },
  muscleTagRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  muscleTag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  muscleTagText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  video: { width: "100%", height: "100%" },
  loadingOverlay: {
    backgroundColor: "rgba(5,5,10,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingEmoji: { fontSize: 48 },
  playBtn: {
    position: "absolute",
    bottom: 14,
    right: 14,
  },
  playBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnIcon: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  badge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  badgeTxt: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700" },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
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
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", flex: 1, textAlign: "center" },
  favBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  favBtnTxt: { fontSize: 22 },

  titleBlock: { alignItems: "center", marginBottom: 16, gap: 10 },
  heroName: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", textAlign: "center" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  badge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  badgeTxt: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },

  prBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,215,0,0.08)", borderRadius: 18, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,215,0,0.25)",
  },
  prEmoji: { fontSize: 24 },
  prLabel: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700" },
  prValue: { color: "#FFD700", fontSize: 16, fontWeight: "900", marginTop: 2 },

  section: {
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 10,
  },
  sectionTitle: {
    color: "#C6A7FF", fontSize: 12, fontWeight: "800",
    letterSpacing: 0.8, textTransform: "uppercase",
  },
  bodyText: { color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 24, fontWeight: "500" },

  muscleWrap: { gap: 8 },
  muscleLine: { flexDirection: "row", alignItems: "flex-start", gap: 8, flexWrap: "wrap" },
  muscleTag: {
    color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700",
    minWidth: 60,
  },
  musclePrimary: { color: "#FFFFFF", fontWeight: "800", fontSize: 13, flex: 1 },
  muscleSecondary: { color: "rgba(255,255,255,0.65)", fontWeight: "600", fontSize: 13, flex: 1 },

  equipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  equipPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  equipTxt: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "700" },

  breathRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  breathEmoji: { fontSize: 18, flexShrink: 0, marginTop: 2 },

  phaseRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  phasePill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: "rgba(198,167,255,0.12)",
    borderWidth: 1, borderColor: "rgba(198,167,255,0.25)",
  },
  phasePillTxt: { color: "#C6A7FF", fontSize: 12, fontWeight: "700" },

  listRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  listBullet: { fontSize: 14, flexShrink: 0, marginTop: 2 },
  listText: { color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 22, fontWeight: "500", flex: 1 },

  logBtn: {
    paddingVertical: 18, borderRadius: 20,
    backgroundColor: "#C6A7FF", alignItems: "center", marginTop: 8,
  },
  logBtnDisabled: { opacity: 0.6 },
  logBtnTxt: { color: "#111", fontSize: 16, fontWeight: "900" },
});
