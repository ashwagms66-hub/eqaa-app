import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { useLanguage } from "@/src/context/LanguageContext";
import { getName, saveName } from "@/src/storage/profileStorage";

const S = {
  ar: {
    title: "الملف الشخصي",
    subtitle: "الاسم والتخصيص",
    namePlaceholder: "اسمكِ الأول…",
    nameLabel: "الاسم الأول",
    greeting: (name: string) => `أهلاً ${name} 🌙`,
    greetingSubtitle: "إيقاع سعيد بوجودك اليوم",
    save: "حفظ",
    savedTitle: "تم الحفظ ✨",
    savedMsg: "تم تحديث ملفك الشخصي.",
    ok: "حسناً",
  },
  en: {
    title: "Profile",
    subtitle: "Name & personalization",
    namePlaceholder: "Your first name…",
    nameLabel: "First name",
    greeting: (name: string) => `Hello ${name} 🌙`,
    greetingSubtitle: "Eqa'a is happy to see you today",
    save: "Save",
    savedTitle: "Saved ✨",
    savedMsg: "Your profile has been updated.",
    ok: "OK",
  },
} as const;

export default function ProfileSettingsScreen() {
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const isAr = language === "ar";
  const t = S[language];

  const [name, setName] = useState("");

  useEffect(() => {
    getName().then((n) => {
      if (n) setName(n);
    });
  }, []);

  async function handleSave() {
    await saveName(name.trim());
    Alert.alert(t.savedTitle, t.savedMsg, [
      { text: t.ok, onPress: () => router.back() },
    ]);
  }

  const BackIcon = isAr ? ChevronRight : ChevronLeft;
  const trimmed = name.trim();

  return (
    <LinearGradient colors={["#05050A", "#121225", "#221A3D"]} style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Top bar */}
        <View style={[s.topBar, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <BackIcon color="rgba(255,255,255,0.7)" size={22} strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[s.screenTitle, isAr && { textAlign: "right" }]}>{t.title}</Text>
            <Text style={[s.screenSubtitle, isAr && { textAlign: "right" }]}>{t.subtitle}</Text>
          </View>
        </View>

        <View style={[s.body, { paddingBottom: insets.bottom + 40 }]}>
          <Text style={[s.fieldLabel, isAr && { textAlign: "right" }]}>{t.nameLabel}</Text>
          <TextInput
            style={[s.nameInput, isAr && { textAlign: "right", writingDirection: "rtl" }]}
            placeholder={t.namePlaceholder}
            placeholderTextColor="rgba(255,255,255,0.28)"
            value={name}
            onChangeText={setName}
            maxLength={30}
            returnKeyType="done"
            autoFocus
          />

          {trimmed.length > 0 && (
            <LinearGradient
              colors={["rgba(198,167,255,0.13)", "rgba(120,60,255,0.06)"]}
              style={s.greetingCard}
            >
              <Text style={[s.greetingName, isAr && { textAlign: "right" }]}>
                {t.greeting(trimmed)}
              </Text>
              <Text style={[s.greetingSubtitle, isAr && { textAlign: "right" }]}>
                {t.greetingSubtitle}
              </Text>
            </LinearGradient>
          )}

          <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.88}>
            <Text style={s.saveBtnText}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    flexShrink: 0,
  },

  screenTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  screenSubtitle: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },

  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  fieldLabel: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },

  nameInput: {
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.20)",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  greetingCard: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(198,167,255,0.18)",
    marginBottom: 8,
    gap: 4,
  },

  greetingName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  greetingSubtitle: {
    color: "rgba(198,167,255,0.72)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  saveBtn: {
    marginTop: 24,
    height: 60,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C6A7FF",
    shadowColor: "#C6A7FF",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },

  saveBtnText: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "900",
  },
});
