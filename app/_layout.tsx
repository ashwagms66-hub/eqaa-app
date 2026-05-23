import {
  LanguageProvider,
} from "@/src/context/LanguageContext";

import {
  Stack,
} from "expo-router";

export default function RootLayout() {
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
      </Stack>
    </LanguageProvider>
  );
}