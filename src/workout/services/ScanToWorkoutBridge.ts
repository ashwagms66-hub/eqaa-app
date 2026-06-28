import { machineMatcher } from "@/src/fitness/services/MachineMatcher";
import { workoutSessionService } from "./WorkoutSessionService";
import type { WorkoutSession } from "../models/WorkoutSession";

export class ScanToWorkoutBridge {
  async createSessionFromScan(
    scanEntryId: string,
    machineNameEN: string,
    preferredExerciseId?: string
  ): Promise<WorkoutSession> {
    const match = await machineMatcher.match(machineNameEN);

    if (!match.machine || match.exercises.length === 0) {
      return workoutSessionService.createSession({
        exerciseId: "unknown",
        machineId: null,
        targetSets: 3,
        targetReps: "10-12",
        targetRestSeconds: 90,
        scanEntryId,
      });
    }

    const exercise = preferredExerciseId
      ? (match.exercises.find((e) => e.id === preferredExerciseId) ?? match.exercises[0])
      : match.exercises[0];

    return workoutSessionService.createSession({
      exerciseId: exercise.id,
      machineId: match.machine.id,
      targetSets: exercise.defaultSets,
      targetReps: exercise.defaultReps,
      targetRestSeconds: exercise.defaultRest,
      scanEntryId,
    });
  }
}

export const scanToWorkoutBridge = new ScanToWorkoutBridge();
