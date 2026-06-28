import type { Muscle } from "../models/Muscle";
import type { BodyPart } from "../models/types";

export interface IMuscleRepository {
  getAll(): Promise<Muscle[]>;
  getById(id: string): Promise<Muscle | null>;
  getByBodyPart(bodyPart: BodyPart): Promise<Muscle[]>;
  getByIds(ids: string[]): Promise<Muscle[]>;
}
