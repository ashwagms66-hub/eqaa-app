import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { WorkoutSet } from "../models/WorkoutSet";
import { workoutRepository } from "../repository";
import { generateId } from "../utils/formatters";

export interface CreateSessionParams {
  exerciseId: string;
  machineId: string | null;
  targetSets: number;
  targetReps: string;
  targetRestSeconds: number;
  scanEntryId: string | null;
}

export class WorkoutSessionService {
  async createSession(params: CreateSessionParams): Promise<WorkoutSession> {
    const now = new Date().toISOString();

    const workoutExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId: params.exerciseId,
      machineId: params.machineId,
      sets: [],
      targetSets: params.targetSets,
      targetReps: params.targetReps,
      targetRestSeconds: params.targetRestSeconds,
      startedAt: now,
      completedAt: null,
      notes: null,
    };

    const session: WorkoutSession = {
      id: generateId(),
      exercises: [workoutExercise],
      startedAt: now,
      completedAt: null,
      status: "active",
      durationSeconds: 0,
      scanEntryId: params.scanEntryId,
      notes: null,
    };

    await workoutRepository.save(session);
    return session;
  }

  async addSet(
    sessionId: string,
    workoutExerciseId: string,
    setData: Omit<WorkoutSet, "id" | "completedAt">
  ): Promise<WorkoutSession> {
    const session = await workoutRepository.getById(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const newSet: WorkoutSet = {
      ...setData,
      id: generateId(),
      completedAt: new Date().toISOString(),
    };

    const updated: WorkoutSession = {
      ...session,
      exercises: session.exercises.map((ex) =>
        ex.id === workoutExerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
      ),
    };

    await workoutRepository.save(updated);
    return updated;
  }

  async completeSession(sessionId: string): Promise<WorkoutSession> {
    const session = await workoutRepository.getById(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const now = new Date().toISOString();
    const durationSeconds = Math.round(
      (Date.now() - new Date(session.startedAt).getTime()) / 1000
    );

    const updated: WorkoutSession = {
      ...session,
      status: "completed",
      completedAt: now,
      durationSeconds,
      exercises: session.exercises.map((ex) => ({
        ...ex,
        completedAt: ex.completedAt ?? now,
      })),
    };

    await workoutRepository.save(updated);
    return updated;
  }

  async abandonSession(sessionId: string): Promise<WorkoutSession> {
    const session = await workoutRepository.getById(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const now = new Date().toISOString();
    const durationSeconds = Math.round(
      (Date.now() - new Date(session.startedAt).getTime()) / 1000
    );

    const updated: WorkoutSession = {
      ...session,
      status: "abandoned",
      completedAt: now,
      durationSeconds,
    };

    await workoutRepository.save(updated);
    return updated;
  }
}

export const workoutSessionService = new WorkoutSessionService();
