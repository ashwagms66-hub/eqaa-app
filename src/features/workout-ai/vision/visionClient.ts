import type { VisionProvider } from "./types";
import { AnthropicVisionProvider } from "./providers/anthropicProvider";

let _provider: VisionProvider = new AnthropicVisionProvider();

export function setVisionProvider(provider: VisionProvider): void {
  _provider = provider;
}

export function getVisionProvider(): VisionProvider {
  return _provider;
}

export async function analyzeGymEquipment(
  base64: string,
  prompt: string
): Promise<string> {
  return _provider.analyzeImage({ base64, mimeType: "image/jpeg" }, prompt);
}
