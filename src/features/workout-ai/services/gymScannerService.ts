import { captureGymEquipment, CameraError } from "../camera/cameraService";
import { buildGymScanPrompt } from "../vision/promptBuilder";
import { analyzeGymEquipment } from "../vision/visionClient";
import { parseVisionResponse } from "../vision/responseParser";
import { saveScanEntry, generateScanId } from "../storage/scanHistoryStorage";
import type { ScanEntry, ScanStatus } from "../models/types";

export async function runGymScan(
  onStatus: (status: ScanStatus) => void
): Promise<ScanEntry> {
  onStatus({ kind: "capturing" });

  let imageUri: string;
  let base64: string;

  try {
    const capture = await captureGymEquipment();
    imageUri = capture.uri;
    base64 = capture.base64;
  } catch (err) {
    if (err instanceof CameraError) {
      if (err.code === "camera_cancelled") {
        onStatus({ kind: "idle" });
      } else {
        onStatus({ kind: "error", message: err.message, code: err.code });
      }
      throw err;
    }
    onStatus({ kind: "error", message: "Camera error.", code: "analysis_failed" });
    throw err;
  }

  onStatus({ kind: "analyzing" });

  let result;
  try {
    const prompt = buildGymScanPrompt();
    const rawResponse = await analyzeGymEquipment(base64, prompt);
    result = parseVisionResponse(rawResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    const code = message.includes("API key")
      ? "api_key_missing"
      : message.includes("non-JSON")
        ? "parse_failed"
        : "analysis_failed";
    onStatus({ kind: "error", message, code });
    throw err;
  }

  const entry: ScanEntry = {
    id: generateScanId(),
    capturedAt: new Date().toISOString(),
    imageUri,
    result,
  };

  try {
    await saveScanEntry(entry);
  } catch {
    // Non-fatal: result is still usable even if storage fails
  }

  onStatus({ kind: "success", result, imageUri });
  return entry;
}
