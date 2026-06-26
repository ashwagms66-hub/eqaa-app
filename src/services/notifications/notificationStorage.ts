import AsyncStorage from "@react-native-async-storage/async-storage";

const SENT_KEY = "@eqaa_sent_notification_ids";
const MAX_STORED = 200;

export async function markNotificationSent(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SENT_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(id)) {
      ids.push(id);
      if (ids.length > MAX_STORED) ids.splice(0, ids.length - MAX_STORED);
      await AsyncStorage.setItem(SENT_KEY, JSON.stringify(ids));
    }
  } catch { /* noop */ }
}

export async function wasNotificationSent(id: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SENT_KEY);
    if (!raw) return false;
    const ids: string[] = JSON.parse(raw);
    return ids.includes(id);
  } catch {
    return false;
  }
}

export async function clearSentNotifications(): Promise<void> {
  try { await AsyncStorage.removeItem(SENT_KEY); } catch { /* noop */ }
}
