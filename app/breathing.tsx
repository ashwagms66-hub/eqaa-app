

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Audio } from "expo-av";

import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = {
  headerShown: false,
};

const PARTICLES = Array.from(
  { length: 24 },
  (_, i) => ({
    id: i,
    x: Math.random() * 420,
    y: Math.random() * 420,
    r: Math.random() * 2.5 + 1,
    opacity:
      Math.random() * 0.6 + 0.2,
  })
);

export default function BreathingScreen() {
  const { language } =
    useLanguage();

  const params =
    useLocalSearchParams();

  const isArabic =
    language === "ar";

  const isSleep =
    params.theme === "sleep";

  const isFocus =
    params.theme === "focus";

  const isPMS =
    params.theme === "pms";
const orbColors = isSleep
  ? {
      orb: "rgba(35,55,110,0.52)",
      glow: "rgba(120,170,255,0.20)",
      ring: "#8FB4FF",
      particle: "rgba(190,220,255,0.95)",
    }
  : isFocus
  ? {
      orb: "rgba(20,70,120,0.50)",
      glow: "rgba(80,210,255,0.22)",
      ring: "#57D5FF",
      particle: "rgba(220,250,255,0.95)",
    }
  : isPMS
  ? {
      orb: "rgba(120,40,110,0.48)",
      glow: "rgba(255,120,220,0.22)",
      ring: "#FF8EDB",
      particle: "rgba(255,220,240,0.95)",
    }
  : {
      orb: "rgba(70,50,140,0.48)",
      glow: "rgba(167,139,255,0.22)",
      ring: "#A78BFF",
      particle: "rgba(255,255,255,0.92)",
    };
  const TOTAL_SECONDS =
    Number(
      params.duration ?? 90
    );

  const [seconds, setSeconds] =
    useState(TOTAL_SECONDS);

  const [running, setRunning] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [phase, setPhase] =
    useState(
      isArabic
        ? "شهيق"
        : "Inhale"
    );

  const [
    affirmationIndex,
    setAffirmationIndex,
  ] = useState(0);

  const completionOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const completionScale =
    useRef(
      new Animated.Value(0.8)
    ).current;

  const scaleAnim = useRef(
    new Animated.Value(1)
  ).current;

  const floatAnim = useRef(
    new Animated.Value(0)
  ).current;

  const glowAnim = useRef(
    new Animated.Value(0.7)
  ).current;

  const backgroundPulse =
    useRef(
      new Animated.Value(1)
    ).current;

  const progressAnim =
    useRef(
      new Animated.Value(0)
    ).current;

  const ambientSound =
    useRef<Audio.Sound | null>(
      null
    );

  const inhaleSound =
    useRef<Audio.Sound | null>(
      null
    );

  const exhaleSound =
    useRef<Audio.Sound | null>(
      null
    );

  const affirmations = isArabic
    ? [
        "اهدئي قليلًا",
        "أنتِ في أمان",
        "تنفسي بلطف",
        "عودي لإيقاعك",
      ]
    : [
        "Slow down",
        "Your body is safe",
        "Breathe gently",
        "Feel your rhythm",
      ];

  useEffect(() => {
    async function loadSounds() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const ambientFile =
        isSleep
          ? require("@/assets/sounds/sleep.mp3")
          : isFocus
          ? require("@/assets/sounds/focus.mp3")
          : isPMS
          ? require("@/assets/sounds/pms.mp3")
          : require("@/assets/sounds/reset.mp3");

      const {
        sound: ambient,
      } =
        await Audio.Sound.createAsync(
          ambientFile,
          {
            shouldPlay: false,
            isLooping: true,
            volume: 0.35,
          }
        );

      ambientSound.current =
        ambient;

      const {
        sound: inhale,
      } =
        await Audio.Sound.createAsync(
          require("@/assets/sounds/inhale.mp3"),
          {
            shouldPlay: false,
            volume: 0.7,
          }
        );

      inhaleSound.current =
        inhale;

      const {
        sound: exhale,
      } =
        await Audio.Sound.createAsync(
          require("@/assets/sounds/exhale.mp3"),
          {
            shouldPlay: false,
            volume: 0.65,
          }
        );

      exhaleSound.current =
        exhale;
    }

    loadSounds();

    return () => {
      ambientSound.current?.unloadAsync();
      inhaleSound.current?.unloadAsync();
      exhaleSound.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(
            backgroundPulse,
            {
              toValue: 1.05,
              duration: 4000,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            floatAnim,
            {
              toValue: -10,
              duration: 4000,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            glowAnim,
            {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }
          ),
        ]),

        Animated.parallel([
          Animated.timing(
            backgroundPulse,
            {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            floatAnim,
            {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            glowAnim,
            {
              toValue: 0.7,
              duration: 4000,
              useNativeDriver: true,
            }
          ),
        ]),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (running) {
      progressAnim.setValue(0);

      Animated.timing(
        progressAnim,
        {
          toValue: 1,
          duration:
            TOTAL_SECONDS * 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }
      ).start();
    } else {
      progressAnim.stopAnimation();
    }
  }, [running]);

  useEffect(() => {
    let timer: ReturnType<
      typeof setInterval
    > | null = null;

    if (
      running &&
      seconds > 0
    ) {
      timer = setInterval(() => {
        setSeconds((prev) => {
          const next =
            prev - 1;

          if (next <= 0) {
            setRunning(false);

            setCompleted(true);

            Animated.parallel([
              Animated.timing(
                completionOpacity,
                {
                  toValue: 1,
                  duration: 1200,
                  useNativeDriver: true,
                }
              ),

              Animated.spring(
                completionScale,
                {
                  toValue: 1,
                  friction: 6,
                  tension: 40,
                  useNativeDriver: true,
                }
              ),
            ]).start();

            Haptics.notificationAsync(
              Haptics
                .NotificationFeedbackType
                .Success
            );

            ambientSound.current?.pauseAsync();

            return 0;
          }

          if (next % 4 === 0) {
            const cycle =
              next % 12;

            if (cycle >= 8) {
              setPhase(
                isArabic
                  ? "شهيق"
                  : "Inhale"
              );

              inhaleSound.current?.replayAsync();

              Animated.timing(
                scaleAnim,
                {
                  toValue: 1.04,
                  duration: 4200,
                  useNativeDriver: true,
                }
              ).start();
            } else if (
              cycle >= 6
            ) {
              setPhase(
                isArabic
                  ? "حبس"
                  : "Hold"
              );

              Animated.timing(
                scaleAnim,
                {
                  toValue: 1.12,
                  duration: 2000,
                  useNativeDriver: true,
                }
              ).start();
            } else {
              setPhase(
                isArabic
                  ? "زفير"
                  : "Exhale"
              );

              exhaleSound.current?.replayAsync();

              Animated.timing(
                scaleAnim,
                {
                  toValue: 0.97,
                  duration: 5200,
                  useNativeDriver: true,
                }
              ).start();
            }

            setAffirmationIndex(
              (old) =>
                (old + 1) %
                affirmations.length
            );

            Haptics.selectionAsync();
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (timer)
        clearInterval(timer);
    };
  }, [running, seconds]);

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [
          {
            scale: backgroundPulse,
          },
        ],
      }}
    >
      <LinearGradient
        colors={
          isSleep
            ? [
                "#040816",
                "#0D1B3D",
                "#172554",
              ]
            : isFocus
            ? [
                "#06111F",
                "#0B2545",
                "#12355B",
              ]
            : isPMS
            ? [
                "#140A18",
                "#2D102C",
                "#4A1D44",
              ]
            : [
                "#05050A",
                "#171726",
                "#24182F",
              ]
        }
        style={styles.container}
      >
        <SafeAreaView
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            <TouchableOpacity
              style={
                styles.topBackButton
              }
              onPress={() =>
                router.back()
              }
            >
              <Text
                style={
                  styles.topBackArrow
                }
              >
                ←
              </Text>

              <Text
                style={
                  styles.topBackText
                }
              >
                {isArabic
                  ? "رجوع"
                  : "Back"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>
              {isArabic
                ? "جلسة التنفس"
                : "Breathing"}
            </Text>

            <Text style={styles.title}>
              {params.title
                ? String(
                    params.title
                  )
                : isArabic
                ? "خذي لحظة لنفسك"
                : "Take a moment for you"}
            </Text>

            <Text
              style={
                styles.sessionHint
              }
            >
              {isSleep
                ? isArabic
                  ? "جلسة مهدئة للنوم"
                  : "Deep Sleep Session"
                : isFocus
                ? isArabic
                  ? "جلسة تركيز ذهني"
                  : "Focus Session"
                : isPMS
                ? isArabic
                  ? "جلسة هدوء واحتواء"
                  : "Gentle PMS Calm"
                : isArabic
                ? "تنفس بإيقاع هادئ"
                : "Breathe with calm rhythm"}
            </Text>


            <View style={styles.ringWrapper}>
              <Animated.View
                style={[
                  styles.progressRing,
                  {
                    borderRightColor: orbColors.ring,
                    transform: [
                      {
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.circle,
                  {
                    backgroundColor: orbColors.orb,
                    shadowColor: orbColors.ring,
                    shadowOpacity: 0.9,
                    shadowRadius: isSleep ? 80 : 120,
                    transform: [
                      { scale: scaleAnim },
                      { translateY: floatAnim },
                    ],
                    opacity: glowAnim,
                  },
                ]}
              >
                <Text style={styles.phase}>{phase}</Text>
                <Text style={styles.timer}>
                  {phase === (isArabic ? "شهيق" : "Inhale")
                    ? isArabic
                      ? "خذي نفسًا"
                      : "Breathe In"
                    : phase === (isArabic ? "زفير" : "Exhale")
                    ? isArabic
                      ? "أطلقيه"
                      : "Breathe Out"
                    : isArabic
                    ? "اهدئي"
                    : "Hold"}
                </Text>
              </Animated.View>
            </View>

            {completed && (
              <Animated.View
                style={[
                  styles.completionOverlay,
                  {
                    opacity:
                      completionOpacity,
                    transform: [
                      {
                        scale:
                          completionScale,
                      },
                    ],
                  },
                ]}
              >
                <Text
                  style={
                    styles.completionEmoji
                  }
                >
                  ✨
                </Text>

                <Text
                  style={
                    styles.completionTitle
                  }
                >
                  {isArabic
                    ? "جلسة مكتملة"
                    : "Session Complete"}
                </Text>
              </Animated.View>
            )}

            <Text
              style={
                styles.affirmation
              }
            >
              {completed
                ? isArabic
                  ? "جلسة مكتملة ✨"
                  : "Session Complete ✨"
                : affirmations[
                    affirmationIndex
                  ]}
            </Text>

            <TouchableOpacity
              style={
                styles.centerControl
              }
              onPress={async () => {
                if (completed) {
                  completionScale.setValue(
                    0.8
                  );

                  completionOpacity.setValue(
                    0
                  );

                  setCompleted(false);

                  setSeconds(
                    TOTAL_SECONDS
                  );

                  progressAnim.setValue(
                    0
                  );
                }

                const nextState =
                  !running;

                setRunning(
                  nextState
                );

                if (nextState) {
                  await ambientSound.current?.playAsync();
                } else {
                  await ambientSound.current?.pauseAsync();
                }
              }}
            >
           <View
              style={[
                styles.centerButtonGlow,
                {
                  backgroundColor: orbColors.glow,
                },
              ]}
            />
            <View
              style={[
                styles.centerButton,
                {
                  transform: [
                    {
                      scale: running ? 1.06 : 1,
                    },
                  ],
                },
              ]}
            >
                <Text
                  style={
                    styles.centerButtonText
                  }
                >
                  {completed
                    ? isArabic
                      ? "إعادة"
                      : "Restart"
                    : running
                    ? "❚❚"
                    : "▶"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      flex: 1,
      paddingTop: 36,
      alignItems: "center",
      paddingHorizontal: 24,
    },

    label: {
      color:
        "rgba(255,255,255,0.82)",
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 4,
    },

    title: {
      color:
        "rgba(255,255,255,0.55)",
      fontSize: 22,
      fontWeight: "600",
      marginTop: 10,
      textAlign: "center",
    },

    sessionHint: {
      marginTop: 12,
      color:
        "rgba(255,255,255,0.42)",
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
    },

    ringWrapper: {
      marginTop: 8,
      justifyContent:
        "center",
      alignItems: "center",
      width: 460,
      height: 460,
    },

    progressRing: {
      position: "absolute",
      width: 338,
      height: 338,
      borderRadius: 999,
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.14)",
      borderTopColor: "rgba(255,255,255,0.95)",
      borderRightColor: "rgba(167,139,255,0.85)",
    },

    circle: {
      width: 310,
      height: 310,
      borderRadius: 999,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: "rgba(70,50,140,0.48)",
    },

    phase: {
      color:
        "rgba(255,255,255,0.55)",
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 12,
      letterSpacing: 5,
    },

    timer: {
      color: "#FFFFFF",
      fontSize: 46,
      fontWeight: "300",
      textAlign: "center",
    },

    affirmation: {
      marginTop: 20,
      color:
        "rgba(255,255,255,0.95)",
      fontSize: 30,
      textAlign: "center",
      fontWeight: "800",
    },

    completionOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(3,3,8,0.82)",
    },

    completionEmoji: {
      fontSize: 72,
      marginBottom: 24,
    },

    completionTitle: {
      color: "#FFFFFF",
      fontSize: 38,
      fontWeight: "800",
    },

    topBackButton: {
      zIndex: 20,
      position: "absolute",
      top: 10,
      left: 0,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(255,255,255,0.06)",
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 999,
    },

    topBackArrow: {
      color: "#FFFFFF",
      fontSize: 18,
      marginRight: 8,
    },

    topBackText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },

    centerControl: {
      marginTop: 34,
      justifyContent:
        "center",
      alignItems: "center",
    },

    centerButtonGlow: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 999,
      backgroundColor: "rgba(167,139,255,0.22)",
    },

    centerButton: {

      width: 94,
      height: 94,
      borderRadius: 999,
      backgroundColor:
        "rgba(0,0,0,0.22)",
      borderWidth: 1.5,
      borderColor:
        "rgba(198,167,255,0.45)",
      justifyContent:
        "center",
      alignItems: "center",
    },

    centerButtonText: {
      color: "#FFFFFF",
      fontSize: 30,
      fontWeight: "700",
    },
  });