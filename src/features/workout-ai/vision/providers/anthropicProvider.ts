import Anthropic from "@anthropic-ai/sdk";
import type { VisionProvider, VisionImageInput } from "../types";

const MODEL = "claude-opus-4-8";

const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

function isSupportedMimeType(mime: string): mime is SupportedMimeType {
  return SUPPORTED_MIME_TYPES.includes(mime as SupportedMimeType);
}

export class AnthropicVisionProvider implements VisionProvider {
  readonly name = "anthropic";

  private get apiKey(): string {
    const key = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
    if (!key) throw new Error("EXPO_PUBLIC_ANTHROPIC_API_KEY is not configured.");
    return key;
  }

  async analyzeImage(image: VisionImageInput, prompt: string): Promise<string> {
    const mimeType = isSupportedMimeType(image.mimeType)
      ? image.mimeType
      : "image/jpeg";

    const client = new Anthropic({
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: true,
    });

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: image.base64,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response returned from AI.");
    }
    return textBlock.text;
  }
}
