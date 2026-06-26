import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StoredInsight {
  id: string;
  type: "sleep" | "activity" | "cycle" | "recovery" | "pattern" | "energy";
  text: string;
  textAr: string;
  icon: string;
  generatedAt: string;
  weekOf: string;
}

const INSIGHTS_KEY = "@eqaa_health_insights";
const LAST_GENERATED_KEY = "@eqaa_insights_last_generated";

export async function saveInsights(insights: StoredInsight[]): Promise<void> {
  try {
    await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
    await AsyncStorage.setItem(LAST_GENERATED_KEY, new Date().toISOString());
  } catch {}
}

export async function getStoredInsights(): Promise<StoredInsight[]> {
  try {
    const raw = await AsyncStorage.getItem(INSIGHTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredInsight[];
  } catch {
    return [];
  }
}

export async function getLastGeneratedDate(): Promise<Date | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_GENERATED_KEY);
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}

export async function shouldRegenerateInsights(): Promise<boolean> {
  const last = await getLastGeneratedDate();
  if (!last) return true;
  const daysSinceLast = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLast >= 7;
}
