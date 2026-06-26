import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PremiumFeature, PremiumStatus } from "./types";

export type { PremiumFeature, PremiumStatus };

const PREMIUM_KEY = "@eqaa_premium_status";

// During MVP all features are unlocked — swap in a real paywall when ready
const DEFAULT_STATUS: PremiumStatus = {
  isActive: true,
  expiresAt: null,
  enabledFeatures: [
    "ai_coach", "morning_brief", "meal_planner", "productivity_coach",
    "emotion_coach", "cycle_predictions", "notifications", "weekly_report",
    "habit_learning", "wearable_sync",
  ],
};

export async function getPremiumStatus(): Promise<PremiumStatus> {
  try {
    const raw = await AsyncStorage.getItem(PREMIUM_KEY);
    if (raw) return JSON.parse(raw) as PremiumStatus;
  } catch { /* fallback to default */ }
  return DEFAULT_STATUS;
}

export async function canAccess(feature: PremiumFeature): Promise<boolean> {
  const status = await getPremiumStatus();
  return status.isActive && status.enabledFeatures.includes(feature);
}

export async function setPremiumStatus(status: PremiumStatus): Promise<void> {
  await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(status));
}
