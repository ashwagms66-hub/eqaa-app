import type { Exercise } from "../models/Exercise";
import type { BodyRegion, Difficulty, WorkoutCategory } from "../models/types";

export interface IExerciseRepository {
  getAll(): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  getByMachineId(machineId: string): Promise<Exercise[]>;
  getByPrimaryMuscle(muscleId: string): Promise<Exercise[]>;
  getByCategory(category: WorkoutCategory): Promise<Exercise[]>;
  getByDifficulty(difficulty: Difficulty): Promise<Exercise[]>;
  getByBodyRegion(region: BodyRegion): Promise<Exercise[]>;
  getBeginnerFriendly(): Promise<Exercise[]>;
  getPeriodSafe(): Promise<Exercise[]>;
}
