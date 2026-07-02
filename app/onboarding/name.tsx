import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { saveName } from "@/src/storage/profileStorage";
import { useLanguage } from "@/src/context/LanguageContext";

const S = {
  ar: {
    title: "كيف تودين أن يناديكِ إيقاع؟",
    subtitle: "اسمكِ يجعل التجربة أكثر خصوصية ودقّة داخل إيقاع.",
    placeholder: "اسمكِ",
    cta: "التالي",
  },
  en: {
    title: "What should Eqa'a call you?",
    subtitle: "Your name makes the experience more personal and accurate inside Eqa'a.",
    placeholder: "Your name",
    cta: "Next",
  },
} as const;

export default function NameScreen() {
  const [name, setName] = useState("");
  const { language } = useLanguage();
  const isAr = language === "ar";
  const t = S[language];
  const insets = useSafeAreaInsets();

  const canContinue = useMemo(() => name.trim().length > 1, [name]);

  async function handleContinue() {
    await saveName(name.trim());
    router.push("/onboarding/cycle");
  }

  return (
    <LinearGradient colors={["#05050A", "#121225", "#221A3D"]} style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.flex}
      >
        <SafeAreaView style={s.flex} edges={["top"]}>
          <ScrollView
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={s.orbOuter}>
              <View style={s.orbMiddle}>
                <View style={s.orbInner}>
                  <Text style={s.orbEmoji}>✨</Text>
                </View>
              </View>
            </View>

            <Text style={[s.title, isAr ? s.rtl : s.ltr]}>{t.title}</Text>
            <Text style={[s.subtitle, isAr ? s.rtl : s.ltr]}>{t.subtitle}</Text>

            <View style={s.inputWrapper}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t.placeholder}
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={[s.input, isAr ? s.rtl : s.ltr]}
                autoFocus
                textAlign={isAr ? "right" : "left"}
                returnKeyType="done"
                onSubmitEditing={canContinue ? handleContinue : undefined}
              />
            </View>
          </ScrollView>

          <View style={[s.bottomArea, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Pressable
              disabled={!canContinue}
              onPress={handleContinue}
              style={[s.continueButton, !canContinue && s.disabled]}
            >
              <Text style={s.continueText}>{t.cta}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05050A" },
  flex: { flex: 1 },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  orbOuter: {
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "rgba(198,167,255,0.10)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.45,
    shadowRadius: 60,
    marginBottom: 40,
  },
  orbMiddle: {
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(198,167,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  orbInner: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: "#C6A7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  orbEmoji: { fontSize: 36 },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 44,
    fontWeight: "900",
    marginBottom: 14,
    width: "100%",
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 36,
    width: "100%",
  },

  inputWrapper: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    paddingTop: 16,
    backgroundColor: "rgba(5,5,10,0.92)",
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
  disabled: { opacity: 0.45 },
  continueText: {
    color: "#171726",
    fontSize: 18,
    fontWeight: "900",
  },

  rtl: { textAlign: "right" },
  ltr: { textAlign: "left" },
});
