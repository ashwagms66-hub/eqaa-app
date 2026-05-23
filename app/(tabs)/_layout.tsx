import { useLanguage } from "@/src/context/LanguageContext";
import { Tabs } from "expo-router";

import {
  BarChart3,
  CalendarDays,
  Dumbbell,
  Ellipsis,
  Home,
} from "lucide-react-native";

import { I18nManager } from "react-native";

export default function TabLayout() {
  const { language } = useLanguage();

  const isRTL = I18nManager.isRTL;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 22,

          height: 88,

          borderRadius: 30,

          backgroundColor:
            "rgba(8,8,15,0.96)",

          borderTopWidth: 0,

          paddingTop: 10,
          paddingBottom: 12,

          shadowColor: "#000000",
          shadowOpacity: 0.38,
          shadowRadius: 24,

          shadowOffset: {
            width: 0,
            height: 12,
          },

          elevation: 20,
        },

        tabBarActiveTintColor:
          "#E2D4FF",

        tabBarInactiveTintColor:
          "rgba(255,255,255,0.42)",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",

          marginTop: 4,

          letterSpacing: 0.2,

          textTransform: "none",

          writingDirection:
            isRTL ? "rtl" : "ltr",
        },

        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 2,
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:
            language === "ar"
              ? "الرئيسية"
              : "Home",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Home
              color={color}
              size={size}
              strokeWidth={2.4}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="workout"
        options={{
          title:
            language === "ar"
              ? "الرياضة"
              : "Workout",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Dumbbell
              color={color}
              size={size}
              strokeWidth={2.4}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title:
            language === "ar"
              ? "التقارير"
              : "Reports",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <BarChart3
              color={color}
              size={size}
              strokeWidth={2.4}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title:
            language === "ar"
              ? "الدورة"
              : "Cycle",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <CalendarDays
              color={color}
              size={size}
              strokeWidth={2.4}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title:
            language === "ar"
              ? "المزيد"
              : "More",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ellipsis
              color={color}
              size={size}
              strokeWidth={2.4}
            />
          ),
        }}
      />
    </Tabs>
  );
}