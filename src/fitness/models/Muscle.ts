import type { BodyPart } from "./types";

export interface Muscle {
  id: string;
  arabicName: string;
  englishName: string;
  bodyPart: BodyPart;
  imageOverlay: string | null;
}
