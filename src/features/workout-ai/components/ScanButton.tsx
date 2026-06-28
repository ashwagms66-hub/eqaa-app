import React, { useEffect } from "react";
import { TouchableOpacity, StyleSheet, View, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { ScanLine } from "lucide-react-native";
import type { ScanStatus } from "../models/types";

interface ScanButtonProps {
  status: ScanStatus;
  onPress: () => void;
}

export function ScanButton({ status, onPress }: ScanButtonProps) {
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.12);

  const isLoading = status.kind === "capturing" || status.kind === "analyzing";

  useEffect(() => {
    if (isLoading) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.28, { duration: 900 }),
          withTiming(0.08, { duration: 900 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
      ringOpacity.value = withTiming(0.12, { duration: 300 });
    }
  }, [isLoading, scale, ringOpacity]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.outerRing, ringStyle]} />
      <Animated.View style={buttonStyle}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonLoading]}
          onPress={onPress}
          disabled={isLoading}
          activeOpacity={0.82}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#E2D4FF" />
          ) : (
            <ScanLine color="#E2D4FF" size={46} strokeWidth={1.7} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: "#E2D4FF",
  },
  button: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(226,212,255,0.09)",
    borderWidth: 2,
    borderColor: "rgba(226,212,255,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLoading: {
    borderColor: "rgba(226,212,255,0.18)",
  },
});
