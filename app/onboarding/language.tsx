import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLanguage } from "@/src/context/LanguageContext";

export default function LanguageScreen() {
  const { setLanguage } = useLanguage();

  async function pick(lang: "ar" | "en") {
    await setLanguage(lang);
    router.replace("/onboarding/name" as any);
  }

  return (
    <LinearGradient colors={["#05050A", "#121225", "#221A3D"]} style={s.container}>
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <View style={s.brandWrap}>
            <Text style={s.brandAr}>إيقاع</Text>
            <Text style={s.brandEn}>Eqa'a</Text>
          </View>

          <Text style={s.prompt}>اختاري لغتك / Choose your language</Text>

          <View style={s.btns}>
            <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={() => pick("ar")}>
              <Text style={s.btnLabel}>العربية</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={() => pick("en")}>
              <Text style={s.btnLabel}>English</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  brandWrap: { alignItems: "center", marginBottom: 8 },
  brandAr: {
    color: "#C6A7FF",
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -1,
  },
  brandEn: {
    color: "rgba(198,167,255,0.50)",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: -4,
  },
  prompt: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 48,
    marginBottom: 28,
    textAlign: "center",
  },
  btns: { width: "100%", gap: 14 },
  btn: {
    width: "100%",
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: "rgba(198,167,255,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(198,167,255,0.22)",
    alignItems: "center",
  },
  btnLabel: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
});
