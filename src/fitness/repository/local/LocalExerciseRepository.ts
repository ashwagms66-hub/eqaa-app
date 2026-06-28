import { EXERCISES } from "../../data/exercises";
import type { Exercise } from "../../models/Exercise";
import type { BodyRegion, Difficulty, WorkoutCategory } from "../../models/types";
import type { IExerciseRepository } from "../IExerciseRepository";

export class LocalExerciseRepository implements IExerciseRepository {
  private readonly exercises: readonly Exercise[] = EXERCISES;

  async getAll(): Promise<Exercise[]> {
    return [...this.exercises];
  }

  async getById(id: string): Promise<Exercise | null> {
    return this.exercises.find((e) => e.id === id) ?? null;
  }

  async getByMachineId(machineId: string): Promise<Exercise[]> {
    return this.exercises.filter((e) => e.machineId === machineId);
  }

  async getByPrimaryMuscle(muscleId: string): Promise<Exercise[]> {
    return this.exercises.filter((e) => e.primaryMuscles.includes(muscleId));
  }

  async getByCategory(category: WorkoutCategory): Promise<Exercise[]> {
    return this.exercises.filter((e) => e.category === category);
  }

  async getByDifficulty(difficulty: Difficulty): Promise<Exercise[]> {
    return this.exercises.filter((e) => e.difficulty === difficulty);
  }

  async getByBodyRegion(region: BodyRegion): Promise<Exercise[]> {
    return this.exercises.filter(
      (e) => e.bodyRegion === region || e.bodyRegion === "full_body"
    );
  }

  async getBeginnerFriendly(): Promise<Exercise[]> {
    return this.exercises.filter((e) => e.beginnerFriendly);
  }

  async getPeriodSafe(): Promise<Exercise[]> {
    return this.exercises.filter((e) => e.periodSafe);
  }
}
