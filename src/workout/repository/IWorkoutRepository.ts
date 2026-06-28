import type { WorkoutSession, WorkoutStatus } from "../models/WorkoutSession";

export interface IWorkoutRepository {
  getAll(): Promise<WorkoutSession[]>;
  getById(id: string): Promise<WorkoutSession | null>;
  getByStatus(status: WorkoutStatus): Promise<WorkoutSession[]>;
  getByScanEntryId(scanEntryId: string): Promise<WorkoutSession[]>;
  save(session: WorkoutSession): Promise<void>;
  delete(id: string): Promise<void>;
}
