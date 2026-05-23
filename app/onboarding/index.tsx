import {
  useLanguage,
} from "@/src/context/LanguageContext";

import {
  onboardingSlides,
} from "@/src/data/onboardingSlides";

import React, {
  useRef,
  useState,
} from "react";

import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  router,
} from "expo-router";

const { width } =
  Dimensions.get("window");

export default function OnboardingScreen() {
  const {
    language,
    toggleLanguage,
  } = useLanguage();

  const [activeIndex, setActiveIndex] =
    useState(0);

  const scrollX = useRef(
    new Animated.Value(0)
  ).current;

  async function finishOnboarding() {
    await AsyncStorage.setItem(
      "@eqaa_onboarding_seen",
      "true"
    );

    router.replace("/");
  }

  return (
    <LinearGradient
      colors={[
        "#05050A",
        "#121225",
        "#24182F",
      ]}
      style={styles.container}
    >
      <Animated.View
        pointerEvents="none"
        style={styles.glow}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleLanguage}
        style={styles.languageButton}
      >
        <Text style={styles.languageText}>
          {language === "ar"
            ? "EN"
            : "AR"}
        </Text>
      </TouchableOpacity>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x /
              width
          );

          setActiveIndex(index);
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: scrollX,
                },
              },
            },
          ],
          {
            useNativeDriver: false,
          }
        )}
        scrollEventThrottle={16}
      >
        {onboardingSlides.map(
          (slide, index) => {
            return (
              <View
                key={slide.id}
                style={styles.slide}
              >
                <View style={styles.heroWrap}>
                  <Text style={styles.heroEmoji}>
                    {index === 0
                      ? "🌙"
                      : index === 1
                      ? "✨"
                      : "🧘‍♀️"}
                  </Text>
                </View>

                <Text style={styles.title}>
                  {language === "ar"
                    ? slide.titleAr
                    : slide.title}
                </Text>

                <Text style={styles.subtitle}>
                  {language === "ar"
                    ? slide.subtitleAr
                    : slide.subtitle}
                </Text>
              </View>
            );
          }
        )}
      </Animated.ScrollView>

      <View style={styles.bottomArea}>
        <View style={styles.pagination}>
          {onboardingSlides.map(
            (_, index) => {
              const active =
                activeIndex === index;

              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    active && styles.activeDot,
                  ]}
                />
              );
            }
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={finishOnboarding}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {activeIndex ===
            onboardingSlides.length - 1
              ? language === "ar"
                ? "ابدئي رحلتك"
                : "Start Your Rhythm"
              : language === "ar"
              ? "تخطي"
              : "Skip"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05050A",
  },

  glow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor:
      "rgba(198,167,255,0.22)",
    top: -100,
    alignSelf: "center",
  },

  languageButton: {
    position: "absolute",
    top: 70,
    right: 24,
    zIndex: 99,
    width: 54,
    height: 54,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  languageText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  slide: {
    width,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  heroWrap: {
    width: 180,
    height: 180,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
    marginBottom: 42,
  },

  heroEmoji: {
    fontSize: 72,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 24,
    color: "rgba(255,255,255,0.72)",
    fontSize: 18,
    lineHeight: 34,
    textAlign: "center",
    paddingHorizontal: 12,
  },

  bottomArea: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  pagination: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  activeDot: {
    width: 28,
    backgroundColor: "#C6A7FF",
  },

  button: {
    minHeight: 62,
    borderRadius: 999,
    backgroundColor: "#C6A7FF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 42,
  },

  buttonText: {
    color: "#171726",
    fontSize: 17,
    fontWeight: "900",
  },
});