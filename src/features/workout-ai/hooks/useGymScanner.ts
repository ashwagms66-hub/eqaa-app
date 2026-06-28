import { useCallback, useEffect, useState } from "react";
import { runGymScan } from "../services/gymScannerService";
import { loadScanHistory } from "../storage/scanHistoryStorage";
import type { ScanEntry, ScanStatus } from "../models/types";

export interface UseGymScannerResult {
  status: ScanStatus;
  history: ScanEntry[];
  startScan: () => Promise<ScanEntry | null>;
  resetError: () => void;
}

export function useGymScanner(): UseGymScannerResult {
  const [status, setStatus] = useState<ScanStatus>({ kind: "idle" });
  const [history, setHistory] = useState<ScanEntry[]>([]);

  const refreshHistory = useCallback(async () => {
    const entries = await loadScanHistory();
    setHistory(entries);
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const startScan = useCallback(async (): Promise<ScanEntry | null> => {
    if (status.kind === "capturing" || status.kind === "analyzing") return null;
    try {
      const entry = await runGymScan(setStatus);
      await refreshHistory();
      return entry;
    } catch {
      // status is already updated to error/idle by runGymScan
      return null;
    }
  }, [status.kind, refreshHistory]);

  const resetError = useCallback(() => {
    setStatus({ kind: "idle" });
  }, []);

  return { status, history, startScan, resetError };
}
