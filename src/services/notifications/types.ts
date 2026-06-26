export type NotificationCategory =
  | "readiness" | "meal" | "hydration" | "fasting" | "workout"
  | "emotion" | "cycle" | "sleep" | "breathwork" | "brief";

export interface ScheduledNotification {
  id:          string;
  category:    NotificationCategory;
  titleEn:     string;
  titleAr:     string;
  bodyEn:      string;
  bodyAr:      string;
  /** Hour 0–23 for the scheduled fire time */
  fireHour:    number;
  fireMinute:  number;
  /** ISO date string YYYY-MM-DD this notification belongs to */
  date:        string;
}
