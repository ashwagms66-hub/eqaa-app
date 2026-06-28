import type { BodyRegion, EquipmentType } from "./types";

export interface Machine {
  id: string;
  brand: string | null;
  model: string | null;
  arabicName: string;
  englishName: string;
  aliases: string[];
  bodyRegion: BodyRegion;
  equipmentType: EquipmentType;
  exerciseIds: string[];
  imageReferences: string[];
}
