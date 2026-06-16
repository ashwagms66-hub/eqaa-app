

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useMemo,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveName } from "@/src/storage/profileStorage";

export default function NameScreen() {
  const [name, setName] = useState("");

  const canContinue = useMemo(() => {
    return name.trim().length > 1;
  }, [name]);

  async function handleContinue() {
    await saveName(name.trim());
    router.push("/onboarding/cycle");
  }

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
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          style={styles.flex}
        >
          <View style={styles.content}>
            <View style={styles.orbOuter}>
              <View style={styles.orbMiddle}>
                <View style={styles.orbInner}>
                  <Text style={styles.orbEmoji}>
                    ✨
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.title}>
              كيف تودين أن
              يناديك إيقاع؟
            </Text>

            <Text style={styles.subtitle}>
              اسمك يجعل التجربة أكثر خصوصية ودفئًا داخل إيقاع.
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="اكتبي اسمك"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
                autoFocus
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.bottomArea}>
            <Pressable
              disabled={!canContinue}
              onPress={handleContinue}
              style={[
                styles.continueButton,
                !canContinue && {
                  opacity: 0.45,
                },
              ]}
            >
              <Text style={styles.continueText}>
                التالي
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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

  flex: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  orbOuter: {
    width: 180,
    height: 180,
    borderRadius: 999,

    backgroundColor:
      "rgba(198,167,255,0.10)",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.45,
    shadowRadius: 60,
  },

  orbMiddle: {
    width: 140,
    height: 140,
    borderRadius: 999,

    backgroundColor:
      "rgba(198,167,255,0.16)",

    justifyContent: "center",
    alignItems: "center",
  },

  orbInner: {
    width: 100,
    height: 100,
    borderRadius: 999,

    backgroundColor: "#C6A7FF",

    justifyContent: "center",
    alignItems: "center",
  },

  orbEmoji: {
    fontSize: 36,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 52,
    textAlign: "center",
    fontWeight: "900",
    marginTop: 40,
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 17,
    lineHeight: 32,
    textAlign: "center",
    marginTop: 18,
    maxWidth: 320,
  },

  inputWrapper: {
    width: "100%",
    marginTop: 42,

    backgroundColor:
      "rgba(255,255,255,0.06)",

    borderRadius: 28,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",

    paddingHorizontal: 22,
    paddingVertical: 6,
  },

  input: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    minHeight: 64,
  },

  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 18,

    backgroundColor:
      "rgba(5,5,10,0.92)",
  },

  continueButton: {
    backgroundColor: "#C6A7FF",
    borderRadius: 999,
    minHeight: 62,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#C6A7FF",
    shadowOpacity: 0.34,
    shadowRadius: 22,
  },

  continueText: {
    color: "#171726",
    fontSize: 18,
    fontWeight: "900",
  },
});