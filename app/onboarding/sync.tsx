

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
    useEffect,
    useRef,
} from "react";
import { saveOnboardingComplete } from "@/src/storage/onboardingStorage";
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SyncScreen() {
  const pulse = useRef(
    new Animated.Value(1)
  ).current;

  const glow = useRef(
    new Animated.Value(0.6)
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, {
            toValue: 1.12,
            duration: 2800,
            useNativeDriver: true,
          }),

          Animated.timing(glow, {
            toValue: 1,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 2800,
            useNativeDriver: true,
          }),

          Animated.timing(glow, {
            toValue: 0.6,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    const timeout = setTimeout(async () => {
      await saveOnboardingComplete();
      router.replace("/(tabs)");
    }, 4200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#121225",
        "#221A3D",
      ]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.orbWrapper,
              {
                opacity: glow,
                transform: [
                  {
                    scale: pulse,
                  },
                ],
              },
            ]}
          >
            <View style={styles.orbOuter}>
              <View style={styles.orbMiddle}>
                <View style={styles.orbInner}>
                  <Text style={styles.orbEmoji}>
                    ✨
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.title}>
            إيقاع بدأ يفهم
            نمطك اليومي
          </Text>

          <Text style={styles.subtitle}>
            يتم الآن تهيئة التجربة لتصبح أكثر انسجامًا مع طاقتك ومشاعرك وإيقاعك الخاص.
          </Text>

          <View style={styles.loadingRow}>
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05050A",
  },

  safe: {
    flex: 1,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  orbWrapper: {
    marginBottom: 60,
  },

  orbOuter: {
    width: 240,
    height: 240,
    borderRadius: 999,

    backgroundColor:
      "rgba(198,167,255,0.10)",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.5,
    shadowRadius: 80,
  },

  orbMiddle: {
    width: 180,
    height: 180,
    borderRadius: 999,

    backgroundColor:
      "rgba(198,167,255,0.16)",

    justifyContent: "center",
    alignItems: "center",
  },

  orbInner: {
    width: 130,
    height: 130,
    borderRadius: 999,

    backgroundColor: "#C6A7FF",

    justifyContent: "center",
    alignItems: "center",
  },

  orbEmoji: {
    fontSize: 46,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 56,
    textAlign: "center",
    fontWeight: "900",
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 18,
    lineHeight: 34,
    textAlign: "center",
    marginTop: 24,
    maxWidth: 330,
  },

  loadingRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 44,
  },

  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#C6A7FF",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});