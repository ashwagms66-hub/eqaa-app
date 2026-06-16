import { useEffect, useMemo, useRef, useState } from "react";
import { Audio } from "expo-av";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useLanguage } from "@/src/context/LanguageContext";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = { headerShown: false };

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── particle definitions (static, outside component) ──────────────────
const ORB_SIZE      = 260;
const ARC_CONTAINER = 312;
const ARC_R         = (ARC_CONTAINER / 2) - 10;
const CIRCUMFERENCE = 2 * Math.PI * ARC_R;

const PARTICLES = [
  // large glass bubbles
  { id: 0,  cx: 0.22, cy: 0.28, r: 27, type: "bubble" as const },
  { id: 1,  cx: 0.74, cy: 0.20, r: 35, type: "bubble" as const },
  { id: 2,  cx: 0.54, cy: 0.72, r: 23, type: "bubble" as const },
  { id: 3,  cx: 0.13, cy: 0.58, r: 30, type: "bubble" as const },
  { id: 4,  cx: 0.83, cy: 0.64, r: 21, type: "bubble" as const },
  { id: 5,  cx: 0.40, cy: 0.14, r: 18, type: "bubble" as const },
  { id: 6,  cx: 0.63, cy: 0.45, r: 15, type: "bubble" as const },
  { id: 7,  cx: 0.87, cy: 0.36, r: 20, type: "bubble" as const },
  // bright star dots
  { id: 8,  cx: 0.46, cy: 0.25, r: 3.5, type: "star" as const },
  { id: 9,  cx: 0.60, cy: 0.76, r: 3.0, type: "star" as const },
  { id: 10, cx: 0.26, cy: 0.50, r: 4.0, type: "star" as const },
  { id: 11, cx: 0.76, cy: 0.84, r: 3.5, type: "star" as const },
  { id: 12, cx: 0.10, cy: 0.36, r: 3.0, type: "star" as const },
  { id: 13, cx: 0.88, cy: 0.16, r: 4.0, type: "star" as const },
  { id: 14, cx: 0.50, cy: 0.55, r: 5.0, type: "star" as const },
  { id: 15, cx: 0.68, cy: 0.13, r: 3.0, type: "star" as const },
  { id: 16, cx: 0.30, cy: 0.84, r: 4.0, type: "star" as const },
  { id: 17, cx: 0.17, cy: 0.14, r: 3.0, type: "star" as const },
];

export default function BreathingScreen() {
  const { language } = useLanguage();
  const params = useLocalSearchParams();
  const isArabic = language === "ar";

  const isSleep = params.theme === "sleep";
  const isFocus = params.theme === "focus";
  const isPMS   = params.theme === "pms";

  // ── theme ─────────────────────────────────────────────────────────
  const theme = isSleep
    ? { orb: "rgba(18,36,88,0.72)",  ring: "#8FB4FF", glow: "rgba(100,155,255,0.22)", accent: "rgba(80,160,255,0.18)",
        bg: ["#020810","#060E28","#0A1440"] as const,
        a1: "rgba(15,55,210,0.48)",  a2: "rgba(30,90,230,0.38)",  a3: "rgba(8,110,190,0.30)",  a4: "rgba(55,130,240,0.35)" }
    : isFocus
    ? { orb: "rgba(12,50,92,0.70)",  ring: "#57D5FF", glow: "rgba(60,200,255,0.22)", accent: "rgba(40,200,255,0.18)",
        bg: ["#020C14","#040F22","#081830"] as const,
        a1: "rgba(0,160,240,0.45)",  a2: "rgba(0,90,210,0.38)",   a3: "rgba(0,200,220,0.28)",  a4: "rgba(20,120,200,0.35)" }
    : isPMS
    ? { orb: "rgba(88,22,82,0.70)",  ring: "#FF8EDB", glow: "rgba(240,90,200,0.22)", accent: "rgba(255,80,180,0.16)",
        bg: ["#0E040E","#220A20","#380F34"] as const,
        a1: "rgba(210,20,145,0.46)",  a2: "rgba(170,10,110,0.38)", a3: "rgba(230,55,165,0.30)", a4: "rgba(140,20,190,0.35)" }
    : { orb: "rgba(46,32,110,0.72)", ring: "#C6A7FF", glow: "rgba(160,130,255,0.22)", accent: "rgba(140,100,255,0.16)",
        bg: ["#03020C","#0A0818","#140B22"] as const,
        a1: "rgba(130,30,255,0.46)",  a2: "rgba(40,20,210,0.38)",  a3: "rgba(200,35,160,0.28)", a4: "rgba(65,40,220,0.38)" };

  const TOTAL_SECONDS  = Number(params.duration ?? 90);
  const TOTAL_BREATHS  = Math.floor(TOTAL_SECONDS / 12);

  // ── state ─────────────────────────────────────────────────────────
  const [seconds,          setSeconds]          = useState(TOTAL_SECONDS);
  const [running,          setRunning]          = useState(false);
  const [completed,        setCompleted]        = useState(false);
  const [phase,            setPhase]            = useState<"inhale"|"hold"|"exhale">("inhale");
  const [phaseCountdown,   setPhaseCountdown]   = useState(4);
  const [breathCount,      setBreathCount]      = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  // ── core anims ────────────────────────────────────────────────────
  const scaleAnim         = useRef(new Animated.Value(1)).current;
  const floatAnim         = useRef(new Animated.Value(0)).current;
  const glowAnim          = useRef(new Animated.Value(0.75)).current;
  const progressAnim      = useRef(new Animated.Value(0)).current;
  const completionOpacity = useRef(new Animated.Value(0)).current;
  const completionScale   = useRef(new Animated.Value(0.85)).current;
  const headerOpacity     = useRef(new Animated.Value(1)).current;

  // pulse rings
  const r1s = useRef(new Animated.Value(1)).current;
  const r1o = useRef(new Animated.Value(0.50)).current;
  const r2s = useRef(new Animated.Value(1)).current;
  const r2o = useRef(new Animated.Value(0.35)).current;
  const r3s = useRef(new Animated.Value(1)).current;
  const r3o = useRef(new Animated.Value(0.20)).current;

  // ── particle animated values (one translateY + opacity per particle) ──
  const particleAnims = useRef(
    PARTICLES.map(() => ({
      ty: new Animated.Value(0),
      op: new Animated.Value(1),
    }))
  ).current;

  // ── sounds ────────────────────────────────────────────────────────
  const ambientSound  = useRef<Audio.Sound | null>(null);
  const inhaleSound   = useRef<Audio.Sound | null>(null);
  const exhaleSound   = useRef<Audio.Sound | null>(null);
  const chimeSound    = useRef<Audio.Sound | null>(null);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const affirmations = isArabic
    ? ["اهدئي قليلًا", "أنتِ في أمان", "تنفسي بلطف", "عودي لإيقاعك"]
    : ["Slow down", "You are safe", "Breathe gently", "Feel your rhythm"];

  // ── load sounds ───────────────────────────────────────────────────
  useEffect(() => {
    async function loadSounds() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      const ambientFile = isSleep
        ? require("@/assets/sounds/sleep.mp3")
        : isFocus ? require("@/assets/sounds/focus.mp3")
        : isPMS   ? require("@/assets/sounds/pms.mp3")
        :           require("@/assets/sounds/reset.mp3");

      const { sound: ambient } = await Audio.Sound.createAsync(ambientFile,
        { shouldPlay: false, isLooping: true, volume: 0.35 });
      ambientSound.current = ambient;

      const { sound: inhale } = await Audio.Sound.createAsync(
        require("@/assets/sounds/inhale.mp3"), { shouldPlay: false, volume: 0.7 });
      inhaleSound.current = inhale;

      const { sound: exhale } = await Audio.Sound.createAsync(
        require("@/assets/sounds/exhale.mp3"), { shouldPlay: false, volume: 0.65 });
      exhaleSound.current = exhale;

      try {
        const { sound: chime } = await Audio.Sound.createAsync(
          require("@/assets/sounds/chime.mp3"), { shouldPlay: false, volume: 0.8 });
        chimeSound.current = chime;
      } catch {
        // chime.mp3 may be empty or missing — skip silently
      }
    }
    loadSounds();
    return () => {
      ambientSound.current?.unloadAsync();
      inhaleSound.current?.unloadAsync();
      exhaleSound.current?.unloadAsync();
      chimeSound.current?.unloadAsync();
    };
  }, []);

  // ── particle float animations ─────────────────────────────────────
  useEffect(() => {
    const anims = particleAnims.map((anim, i) => {
      const p = PARTICLES[i];
      const floatDist  = p.type === "bubble" ? 9 + (i % 4) * 2 : 5 + (i % 3);
      const duration   = p.type === "bubble" ? 3400 + (i * 370) % 2400 : 2600 + (i * 290) % 2000;
      const opMin      = p.type === "bubble" ? 0.55 : 0.40;

      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim.ty, {
            toValue: -floatDist,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim.ty, {
            toValue: floatDist * 0.6,
            duration: duration * 0.85,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      const opLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim.op, {
            toValue: opMin,
            duration: duration * 1.3,
            useNativeDriver: true,
          }),
          Animated.timing(anim.op, {
            toValue: 1,
            duration: duration * 1.3,
            useNativeDriver: true,
          }),
        ])
      );
      floatLoop.start();
      opLoop.start();
      return [floatLoop, opLoop];
    });

    return () => anims.forEach(([f, o]) => { f.stop(); o.stop(); });
  }, []);

  // ── idle float ────────────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(floatAnim, { toValue: -12, duration: 3800, useNativeDriver: true }),
          Animated.timing(glowAnim,  { toValue: 1,   duration: 3800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, { toValue: 0,    duration: 3800, useNativeDriver: true }),
          Animated.timing(glowAnim,  { toValue: 0.75, duration: 3800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  // ── pulse rings ───────────────────────────────────────────────────
  useEffect(() => {
    const RING_DUR = 2700;
    const makePulse = (sv: Animated.Value, ov: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(sv, { toValue: 2.7, duration: RING_DUR, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(ov, { toValue: 0,   duration: RING_DUR, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(sv, { toValue: 1,   duration: 0, useNativeDriver: true }),
            Animated.timing(ov, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
    const a1 = makePulse(r1s, r1o, 0);
    const a2 = makePulse(r2s, r2o, 900);
    const a3 = makePulse(r3s, r3o, 1800);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  // ── progress ring ─────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: TOTAL_SECONDS * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.stopAnimation();
    }
  }, [running]);

  // ── header fade ───────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: running ? 0 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [running]);

  // ── main timer ────────────────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (running && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => {
          const next = prev - 1;

          // phase countdown every second
          const cyclePos = next % 12;
          let cd: number;
          if      (cyclePos >= 8) cd = cyclePos - 8 + 1;
          else if (cyclePos >= 6) cd = cyclePos - 6 + 1;
          else                    cd = cyclePos + 1;
          setPhaseCountdown(cd);

          if (next % 4 === 0) {
            if (cyclePos >= 8) {
              setPhase("inhale");
              setBreathCount((b) => b + 1);
              inhaleSound.current?.replayAsync();
              Animated.timing(scaleAnim, {
                toValue: 1.20, duration: 3800,
                easing: Easing.out(Easing.sin), useNativeDriver: true,
              }).start();
            } else if (cyclePos >= 6) {
              setPhase("hold");
              Animated.timing(scaleAnim, {
                toValue: 1.24, duration: 1800, useNativeDriver: true,
              }).start();
            } else {
              setPhase("exhale");
              exhaleSound.current?.replayAsync();
              Animated.timing(scaleAnim, {
                toValue: 0.95, duration: 5200,
                easing: Easing.in(Easing.sin), useNativeDriver: true,
              }).start();
            }
            setAffirmationIndex((i) => (i + 1) % affirmations.length);
            Haptics.selectionAsync();
          }

          if (next <= 0) {
            setRunning(false);
            setCompleted(true);
            chimeSound.current?.replayAsync();
            Animated.parallel([
              Animated.timing(completionOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
              Animated.spring(completionScale,   { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
            ]).start();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            ambientSound.current?.pauseAsync();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [running, seconds]);

  // ── helpers ───────────────────────────────────────────────────────
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const phaseLabel = isArabic
    ? phase === "inhale" ? "شهيق" : phase === "hold" ? "حبس" : "زفير"
    : phase === "inhale" ? "INHALE" : phase === "hold" ? "HOLD" : "EXHALE";

  const phaseInstruction = isArabic
    ? phase === "inhale" ? "استنشقي" : phase === "hold" ? "أمسكي" : "أخرجي"
    : phase === "inhale" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out";

  // pre-computed particle styles (stable across renders)
  const particleStyles = useMemo(() =>
    PARTICLES.map((p) => ({
      position: "absolute" as const,
      left: p.cx * ORB_SIZE - p.r,
      top:  p.cy * ORB_SIZE - p.r,
      width:  p.r * 2,
      height: p.r * 2,
      borderRadius: 999,
      ...(p.type === "bubble"
        ? {
            backgroundColor: "transparent",
            borderWidth: 1.2,
            borderColor: "rgba(255,255,255,0.32)",
          }
        : {
            backgroundColor: "rgba(255,255,255,0.92)",
          }),
    }))
  , []);

  // ── render ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── 1. dark base gradient ── */}
      <LinearGradient colors={theme.bg} style={StyleSheet.absoluteFill} />

      {/* ── 2. vivid aurora blobs (pre-blur) ── */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.aurora1, { backgroundColor: theme.a1 }]} />
        <View style={[styles.aurora2, { backgroundColor: theme.a2 }]} />
        <View style={[styles.aurora3, { backgroundColor: theme.a3 }]} />
        <View style={[styles.aurora4, { backgroundColor: theme.a4 }]} />
      </View>

      {/* ── 3. gaussian blur — dissolves blobs into atmospheric haze ── */}
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* ── 4. planets (above blur = crisp spheres) ── */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.planetLeft}>
          <LinearGradient
            colors={["rgba(180,100,255,0.95)", "rgba(100,30,210,0.80)", "rgba(35,8,110,0.30)"]}
            start={{ x: 0.15, y: 0.08 }}
            end={{ x: 0.88, y: 0.92 }}
            style={{ flex: 1, borderRadius: 999 }}
          />
        </View>
        <View style={styles.planetRight}>
          <LinearGradient
            colors={["rgba(60,130,255,0.94)", "rgba(30,65,210,0.75)", "rgba(8,20,120,0.26)"]}
            start={{ x: 0.12, y: 0.08 }}
            end={{ x: 0.90, y: 0.92 }}
            style={{ flex: 1, borderRadius: 999 }}
          />
        </View>
      </View>

      {/* ── 5. edge vignette for depth ── */}
      <LinearGradient
        colors={["rgba(2,1,10,0.55)", "transparent", "transparent", "rgba(2,1,10,0.70)"]}
        locations={[0, 0.28, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>

          {/* top row */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>{isArabic ? "رجوع" : "Back"}</Text>
            </TouchableOpacity>
            {running && (
              <View style={styles.timerBadge}>
                <Text style={styles.timerBadgeText}>{formatTime(seconds)}</Text>
              </View>
            )}
          </View>

          {/* session header */}
          <Animated.View style={[styles.sessionHeader, { opacity: headerOpacity }]}>
            <Text style={styles.breadcrumb}>
              {isArabic ? "جلسة  |  لتنفس" : "Breathe  |  Session"}
            </Text>
            <Text style={styles.sessionTitle}>
              {params.title ? String(params.title) : isArabic ? "خذي لحظة" : "Take a moment"}
            </Text>
            <Text style={styles.sessionHint}>
              {isSleep ? (isArabic ? "جلسة مهدئة للنوم" : "Sleep Wind Down")
               : isFocus ? (isArabic ? "جلسة تركيز ذهني" : "Deep Focus")
               : isPMS   ? (isArabic ? "جلسة هدوء واحتواء" : "Gentle Calm")
               : (isArabic ? "إعادة الاتزان" : "Emotional Reset")}
            </Text>
          </Animated.View>

          {/* ── orb area ── */}
          <View style={styles.orbArea}>

            {/* SVG progress arc */}
            <View style={styles.arcWrapper} pointerEvents="none">
              <Svg width={ARC_CONTAINER} height={ARC_CONTAINER}>
                <Circle
                  cx={ARC_CONTAINER / 2} cy={ARC_CONTAINER / 2}
                  r={ARC_R}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={2}
                  fill="none"
                />
                <AnimatedCircle
                  cx={ARC_CONTAINER / 2} cy={ARC_CONTAINER / 2}
                  r={ARC_R}
                  stroke={theme.ring}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeDashoffset as any}
                  strokeLinecap="round"
                />
              </Svg>
            </View>

            {/* pulse rings */}
            {([{ s: r1s, o: r1o }, { s: r2s, o: r2o }, { s: r3s, o: r3o }] as const).map((r, i) => (
              <Animated.View
                key={i}
                pointerEvents="none"
                style={[
                  styles.pulseRing,
                  { borderColor: theme.ring, transform: [{ scale: r.s }], opacity: r.o },
                ]}
              />
            ))}

            {/* outer glow halo */}
            <Animated.View
              pointerEvents="none"
              style={[styles.glowHalo, { backgroundColor: theme.glow, opacity: glowAnim }]}
            />

            {/* ── THE ORB ── */}
            <Animated.View
              style={[
                styles.orb,
                {
                  backgroundColor: theme.orb,
                  shadowColor: theme.ring,
                  transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
                },
              ]}
            >
              <View
                pointerEvents="none"
                style={[styles.orbBottomAccent, { backgroundColor: theme.accent }]}
              />

              {PARTICLES.map((p, i) => (
                <Animated.View
                  key={p.id}
                  pointerEvents="none"
                  style={[
                    particleStyles[i],
                    {
                      transform: [{ translateY: particleAnims[i].ty }],
                      opacity: Animated.multiply(particleAnims[i].op, p.type === "bubble" ? 0.85 : 0.80),
                    },
                  ]}
                />
              ))}

              <LinearGradient
                colors={["rgba(255,255,255,0.10)", "transparent", "transparent"]}
                start={{ x: 0.1, y: 0.05 }}
                end={{ x: 0.9, y: 0.95 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />

              <View style={styles.orbTextLayer} pointerEvents="none">
                <Text style={styles.orbPhaseLabel}>
                  {running ? phaseLabel : (isArabic ? "تنفس" : "BREATHE")}
                </Text>
                {running ? (
                  <>
                    <Text style={styles.orbCountdown}>{phaseCountdown}</Text>
                    <Text style={styles.orbInstruction}>{phaseInstruction}</Text>
                  </>
                ) : (
                  <Text style={styles.orbIdleText}>
                    {isArabic ? "خذي نفسًا" : "Press play"}
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* ── phase cards (left = زفير, right = شهيق) ── */}
            {!completed && (
              <>
                <View style={[
                  styles.phaseCard, styles.phaseCardLeft,
                  running && phase === "exhale" && styles.phaseCardActive,
                ]}>
                  <Text style={[styles.phaseCardDur, running && phase === "exhale" && styles.phaseCardDurActive]}>
                    {isArabic ? "٦" : "6"}
                  </Text>
                  <Text style={styles.phaseCardUnit}>{isArabic ? "ثواني" : "sec"}</Text>
                  <Text style={[styles.phaseCardName, running && phase === "exhale" && styles.phaseCardNameActive]}>
                    {isArabic ? "زفير" : "EXHALE"}
                  </Text>
                </View>

                <View style={[
                  styles.phaseCard, styles.phaseCardRight,
                  running && phase === "inhale" && styles.phaseCardActive,
                ]}>
                  <Text style={[styles.phaseCardDur, running && phase === "inhale" && styles.phaseCardDurActive]}>
                    {isArabic ? "٤" : "4"}
                  </Text>
                  <Text style={styles.phaseCardUnit}>{isArabic ? "ثواني" : "sec"}</Text>
                  <Text style={[styles.phaseCardName, running && phase === "inhale" && styles.phaseCardNameActive]}>
                    {isArabic ? "شهيق" : "INHALE"}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* ── stats row (visible while running) ── */}
          {running && !completed && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{isArabic ? "٤-٢-٦" : "4-2-6"}</Text>
                <Text style={styles.statLabel}>{isArabic ? "النمط" : "Pattern"}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{breathCount}</Text>
                <Text style={styles.statLabel}>{isArabic ? "أنفاس" : "Breaths"}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{TOTAL_BREATHS}</Text>
                <Text style={styles.statLabel}>{isArabic ? "إجمالي" : "Total"}</Text>
              </View>
            </View>
          )}

          {/* ── bottom section ── */}
          <View style={styles.bottomSection}>
            <Text style={styles.affirmation}>
              {completed
                ? (isArabic ? "جلسة مكتملة ✨" : "Session Complete ✨")
                : affirmations[affirmationIndex]}
            </Text>

            <TouchableOpacity
              style={styles.playButtonWrapper}
              activeOpacity={0.85}
              onPress={async () => {
                if (completed) {
                  completionScale.setValue(0.85);
                  completionOpacity.setValue(0);
                  setCompleted(false);
                  setSeconds(TOTAL_SECONDS);
                  setBreathCount(0);
                  setPhase("inhale");
                  setPhaseCountdown(4);
                  progressAnim.setValue(0);
                }
                const next = !running;
                setRunning(next);
                if (next) {
                  await ambientSound.current?.playAsync();
                } else {
                  await ambientSound.current?.pauseAsync();
                }
              }}
            >
              <View style={[styles.playButtonGlow, { backgroundColor: theme.glow }]} />
              <LinearGradient
                colors={
                  running
                    ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"]
                    : [theme.ring + "55", theme.ring + "22"]
                }
                style={styles.playButton}
              >
                <Text style={styles.playButtonIcon}>
                  {completed ? "↺" : running ? "❚❚" : "▶"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {!running && !completed && (
              <Text style={styles.sessionTimeHint}>
                {isArabic ? `${formatTime(seconds)} متبقية` : `${formatTime(seconds)} remaining`}
              </Text>
            )}
          </View>

        </View>
      </SafeAreaView>

      {/* completion overlay */}
      {completed && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.completionOverlay,
            { opacity: completionOpacity, transform: [{ scale: completionScale }] },
          ]}
        >
          <Text style={styles.completionEmoji}>✨</Text>
          <Text style={styles.completionTitle}>
            {isArabic ? "جلسة مكتملة" : "Session Complete"}
          </Text>
          <Text style={styles.completionSub}>
            {isArabic ? "أحسنتِ، استمري" : "Well done, keep going"}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#03020C" },

  // ── aurora blobs (vibrant, blurred into atmospheric haze) ────────
  aurora1: {
    position: "absolute",
    width: 480, height: 480, borderRadius: 999,
    top: -160, left: -140,
  },
  aurora2: {
    position: "absolute",
    width: 420, height: 420, borderRadius: 999,
    top: -100, right: -160,
  },
  aurora3: {
    position: "absolute",
    width: 360, height: 360, borderRadius: 999,
    top: "28%", left: -110,
  },
  aurora4: {
    position: "absolute",
    width: 450, height: 450, borderRadius: 999,
    bottom: -160, right: -130,
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
  },
  backArrow: { color: "#FFFFFF", fontSize: 17 },
  backText:  { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  timerBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  timerBadgeText: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  sessionHeader: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  breadcrumb: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 8,
  },
  sessionTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  sessionHint: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },

  // ── orb area ──────────────────────────────────────────────────────
  orbArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  arcWrapper: {
    position: "absolute",
    width: ARC_CONTAINER,
    height: ARC_CONTAINER,
    transform: [{ rotate: "-90deg" }],
  },

  pulseRing: {
    position: "absolute",
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: 999,
    borderWidth: 1.5,
  },

  glowHalo: {
    position: "absolute",
    width: ORB_SIZE + 70,
    height: ORB_SIZE + 70,
    borderRadius: 999,
  },

  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: 999,
    overflow: "hidden",
    shadowOpacity: 0.65,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
    elevation: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  orbBottomAccent: {
    position: "absolute",
    bottom: -20,
    left: "10%",
    width: "80%",
    height: 80,
    borderRadius: 999,
    opacity: 0.7,
  },

  orbTextLayer: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  orbPhaseLabel: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 5,
    marginBottom: 6,
  },
  orbCountdown: {
    color: "#FFFFFF",
    fontSize: 76,
    fontWeight: "200",
    lineHeight: 80,
  },
  orbInstruction: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  orbIdleText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 24,
    fontWeight: "300",
  },

  // ── phase cards ────────────────────────────────────────────────────
  phaseCard: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -48 }],
    width: 56,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 4,
    opacity: 0.50,
  },
  phaseCardLeft:  { left: 6 },
  phaseCardRight: { right: 6 },
  phaseCardActive: {
    backgroundColor: "rgba(255,255,255,0.11)",
    borderColor: "rgba(255,255,255,0.22)",
    opacity: 1,
  },
  phaseCardDur: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 22,
    fontWeight: "700",
  },
  phaseCardDurActive: { color: "#FFFFFF" },
  phaseCardUnit: {
    color: "rgba(255,255,255,0.32)",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  phaseCardName: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 5,
  },
  phaseCardNameActive: { color: "rgba(255,255,255,0.85)" },

  // ── stats row ──────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statLabel: {
    color: "rgba(255,255,255,0.36)",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  // ── decorative planets ─────────────────────────────────────────────
  planetLeft: {
    position: "absolute",
    left: -44,
    top: "26%",
    width: 118,
    height: 118,
    borderRadius: 59,
    overflow: "hidden",
    opacity: 0.84,
  },
  planetRight: {
    position: "absolute",
    right: -50,
    top: "14%",
    width: 138,
    height: 138,
    borderRadius: 69,
    overflow: "hidden",
    opacity: 0.80,
  },

  // ── bottom section ─────────────────────────────────────────────────
  bottomSection: {
    alignItems: "center",
    paddingBottom: 20,
    gap: 10,
  },

  affirmation: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  playButtonWrapper: {
    marginTop: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 999,
  },
  playButton: {
    width: 86,
    height: 86,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
  },
  playButtonIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },

  sessionTimeHint: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },

  // ── completion overlay ─────────────────────────────────────────────
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(2,2,8,0.88)",
  },
  completionEmoji:  { fontSize: 72, marginBottom: 20 },
  completionTitle:  { color: "#FFFFFF", fontSize: 36, fontWeight: "800", marginBottom: 12 },
  completionSub:    { color: "rgba(255,255,255,0.52)", fontSize: 17, fontWeight: "500" },
});
