import { useEffect } from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        إيقاع
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05050A",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
  },
});