import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@eqaa_exercise_favorites";
const HISTORY_KEY = "@eqaa_exercise_history";

export async function getFavoriteExerciseIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleFavoriteExercise(id: string): Promise<boolean> {
  try {
    const favorites = await getFavoriteExerciseIds();
    const idx = favorites.indexOf(id);
    if (idx === -1) {
      favorites.push(id);
    } else {
      favorites.splice(idx, 1);
    }
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return idx === -1; // returns true if now favorited
  } catch {
    return false;
  }
}

export async function isFavoriteExercise(id: string): Promise<boolean> {
  const favorites = await getFavoriteExerciseIds();
  return favorites.includes(id);
}

export async function addToExerciseHistory(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const history: string[] = raw ? JSON.parse(raw) : [];
    const filtered = history.filter((h) => h !== id);
    filtered.unshift(id);
    const capped = filtered.slice(0, 20); // keep last 20 unique
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
  } catch {}
}

export async function getExerciseHistory(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
