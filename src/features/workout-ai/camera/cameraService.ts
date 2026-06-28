import * as ImagePicker from "expo-image-picker";
import type { ScanErrorCode } from "../models/types";

export interface CaptureResult {
  base64: string;
  uri: string;
  mimeType: "image/jpeg";
}

export class CameraError extends Error {
  constructor(
    message: string,
    public readonly code: ScanErrorCode
  ) {
    super(message);
    this.name = "CameraError";
  }
}

export async function captureGymEquipment(): Promise<CaptureResult> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    throw new CameraError(
      "Camera permission is required to scan gym equipment.",
      "camera_permission_denied"
    );
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.5,
    base64: true,
    exif: false,
  });

  if (result.canceled) {
    throw new CameraError("User cancelled camera.", "camera_cancelled");
  }

  const asset = result.assets[0];
  if (!asset.base64) {
    throw new CameraError("Failed to capture image data.", "analysis_failed");
  }

  return {
    base64: asset.base64,
    uri: asset.uri,
    mimeType: "image/jpeg",
  };
}
