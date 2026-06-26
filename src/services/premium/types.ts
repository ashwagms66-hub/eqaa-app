export type PremiumFeature =
  | "ai_coach"
  | "morning_brief"
  | "meal_planner"
  | "productivity_coach"
  | "emotion_coach"
  | "cycle_predictions"
  | "notifications"
  | "weekly_report"
  | "habit_learning"
  | "wearable_sync";

export interface PremiumStatus {
  isActive:       boolean;
  expiresAt:      string | null;
  enabledFeatures: PremiumFeature[];
}
