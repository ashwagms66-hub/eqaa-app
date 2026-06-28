import type { Machine } from "../models/Machine";
import type { BodyRegion } from "../models/types";

export interface IMachineRepository {
  getAll(): Promise<Machine[]>;
  getById(id: string): Promise<Machine | null>;
  getByBodyRegion(region: BodyRegion): Promise<Machine[]>;
  findByName(name: string): Promise<Machine[]>;
}
