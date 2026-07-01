import React, { useEffect } from "react";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { Stack } from "expo-router";
import { configurePurchases } from "@/src/services/subscriptionService";

export default function RootLayout() {
  useEffect(() => {
    configurePurchases();
  }, []);

  return (
    <LanguageProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="splash" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="breathing" />
        <Stack.Screen name="breathing-sessions" />
        <Stack.Screen name="movement-session" />
        <Stack.Screen name="nutrition" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="workout-log" />
        <Stack.Screen name="exercise-library" />
        <Stack.Screen name="exercise-detail" />
        <Stack.Screen name="progress-charts" />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="morning-brief" />
        <Stack.Screen name="gym-scan-result" />
        <Stack.Screen name="workout-session" />
        <Stack.Screen name="profile-settings" />
        <Stack.Screen name="nutrition-profile" />
        <Stack.Screen name="cycle-settings" />
        <Stack.Screen name="paywall" />
      </Stack>
    </LanguageProvider>
  );
}