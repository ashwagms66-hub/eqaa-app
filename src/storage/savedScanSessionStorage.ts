import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedScanMachine {
  machineName: string;
  machineNameAr: string;
  exerciseName: string;
  exerciseNameAr: string;
  machineType: string;
}

export interface SavedScanSession {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  machines: SavedScanMachine[];
}

const KEY = "@eqaa_saved_scan_sessions";

export async function loadSavedScanSessions(): Promise<SavedScanSession[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSavedScanSession(session: SavedScanSession): Promise<void> {
  const all = await loadSavedScanSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    all[idx] = session;
  } else {
    all.unshift(session);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export async function deleteSavedScanSession(id: string): Promise<void> {
  const all = await loadSavedScanSessions();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter((s) => s.id !== id)));
}

export async function touchSavedScanSession(id: string): Promise<void> {
  const all = await loadSavedScanSessions();
  const idx = all.findIndex((s) => s.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], lastUsedAt: new Date().toISOString() };
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  }
}
