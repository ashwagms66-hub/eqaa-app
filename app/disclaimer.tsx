import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getOnboardingComplete } from "@/src/storage/onboardingStorage";

export default function DisclaimerScreen() {
  const handleContinue = async () => {
    await AsyncStorage.setItem("accepted_disclaimer", "true");
    const onboardingDone = await getOnboardingComplete();
    if (onboardingDone) {
      router.replace("/splash" as any);
    } else {
      router.replace("/onboarding/name" as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        إخلاء مسؤولية
      </Text>

      <Text style={styles.text}>
        إيقاع تطبيق توعوي يساعد على فهم الإيقاع الشخصي
        ونمط الحياة.
        لا يقدم التطبيق تشخيصًا طبيًا أو علاجًا أو
        نصائح صحية احترافية.
      </Text>

      <Text style={styles.textEn}>
        Eqa’a is an educational wellness app and
        does not provide medical advice,
        diagnosis, or treatment.
      </Text>

      <Pressable
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>
          أوافق • Continue
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1017",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },

  text: {
    color: "#D8D8D8",
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
    marginBottom: 18,
  },

  textEn: {
    color: "#9EA3B0",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#C6A7FF",
    paddingVertical: 16,
    borderRadius: 18,
  },

  buttonText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});