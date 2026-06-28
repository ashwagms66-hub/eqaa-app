export interface VisionImageInput {
  base64: string;
  mimeType: string;
}

export interface VisionProvider {
  readonly name: string;
  analyzeImage(image: VisionImageInput, prompt: string): Promise<string>;
}
