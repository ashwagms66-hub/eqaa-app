import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ScanEntry } from "../models/types";

const STORAGE_KEY = "@eqaa_gym_scan_history";
const MAX_ENTRIES = 50;

export async function saveScanEntry(entry: ScanEntry): Promise<void> {
  const existing = await loadScanHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function loadScanHistory(): Promise<ScanEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getScanEntryById(id: string): Promise<ScanEntry | null> {
  const history = await loadScanHistory();
  return history.find((e) => e.id === id) ?? null;
}

export async function deleteScanEntry(id: string): Promise<void> {
  const history = await loadScanHistory();
  const updated = history.filter((e) => e.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function generateScanId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
