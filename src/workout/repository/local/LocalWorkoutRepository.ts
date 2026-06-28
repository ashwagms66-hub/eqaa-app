import type { IWorkoutRepository } from "../IWorkoutRepository";
import type { WorkoutSession, WorkoutStatus } from "../../models/WorkoutSession";
import { loadAllSessions, saveAllSessions } from "../../storage/workoutStorage";

export class LocalWorkoutRepository implements IWorkoutRepository {
  async getAll(): Promise<WorkoutSession[]> {
    const all = await loadAllSessions();
    return all.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async getById(id: string): Promise<WorkoutSession | null> {
    const all = await loadAllSessions();
    return all.find((s) => s.id === id) ?? null;
  }

  async getByStatus(status: WorkoutStatus): Promise<WorkoutSession[]> {
    const all = await loadAllSessions();
    return all
      .filter((s) => s.status === status)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  async getByScanEntryId(scanEntryId: string): Promise<WorkoutSession[]> {
    const all = await loadAllSessions();
    return all.filter((s) => s.scanEntryId === scanEntryId);
  }

  async save(session: WorkoutSession): Promise<void> {
    const all = await loadAllSessions();
    const idx = all.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      all[idx] = session;
    } else {
      all.push(session);
    }
    await saveAllSessions(all);
  }

  async delete(id: string): Promise<void> {
    const all = await loadAllSessions();
    await saveAllSessions(all.filter((s) => s.id !== id));
  }
}
