import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { getOnboardingComplete } from "@/src/storage/onboardingStorage";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const accepted = await AsyncStorage.getItem("accepted_disclaimer");

      if (!accepted) {
        router.replace("/disclaimer" as any);
        setLoading(false);
        return;
      }

      const onboardingDone = await getOnboardingComplete();
      if (!onboardingDone) {
        router.replace("/onboarding/name" as any);
        setLoading(false);
        return;
      }

      router.replace("/splash" as any);
      setLoading(false);
    };

    bootstrap();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F1017",
        }}
      />
    );
  }

  return null;
}