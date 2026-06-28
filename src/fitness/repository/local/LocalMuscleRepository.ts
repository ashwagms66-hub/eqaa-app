import { MUSCLES } from "../../data/muscles";
import type { Muscle } from "../../models/Muscle";
import type { BodyPart } from "../../models/types";
import type { IMuscleRepository } from "../IMuscleRepository";

export class LocalMuscleRepository implements IMuscleRepository {
  private readonly muscles: readonly Muscle[] = MUSCLES;

  async getAll(): Promise<Muscle[]> {
    return [...this.muscles];
  }

  async getById(id: string): Promise<Muscle | null> {
    return this.muscles.find((m) => m.id === id) ?? null;
  }

  async getByBodyPart(bodyPart: BodyPart): Promise<Muscle[]> {
    return this.muscles.filter((m) => m.bodyPart === bodyPart);
  }

  async getByIds(ids: string[]): Promise<Muscle[]> {
    const set = new Set(ids);
    return this.muscles.filter((m) => set.has(m.id));
  }
}
