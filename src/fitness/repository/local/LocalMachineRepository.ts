import { MACHINES } from "../../data/machines";
import type { Machine } from "../../models/Machine";
import type { BodyRegion } from "../../models/types";
import type { IMachineRepository } from "../IMachineRepository";
import { normalizeText } from "../../search/normalize";

export class LocalMachineRepository implements IMachineRepository {
  private readonly machines: readonly Machine[] = MACHINES;

  async getAll(): Promise<Machine[]> {
    return [...this.machines];
  }

  async getById(id: string): Promise<Machine | null> {
    return this.machines.find((m) => m.id === id) ?? null;
  }

  async getByBodyRegion(region: BodyRegion): Promise<Machine[]> {
    return this.machines.filter(
      (m) => m.bodyRegion === region || m.bodyRegion === "full_body"
    );
  }

  async findByName(name: string): Promise<Machine[]> {
    const q = normalizeText(name);
    return this.machines.filter((m) => {
      const fields = [m.arabicName, m.englishName, ...m.aliases].map(normalizeText);
      return fields.some((f) => f.includes(q) || q.includes(f));
    });
  }
}
