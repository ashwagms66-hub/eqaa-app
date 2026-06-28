import { LocalExerciseRepository } from "./local/LocalExerciseRepository";
import { LocalMachineRepository } from "./local/LocalMachineRepository";
import { LocalMuscleRepository } from "./local/LocalMuscleRepository";
import type { IExerciseRepository } from "./IExerciseRepository";
import type { IMachineRepository } from "./IMachineRepository";
import type { IMuscleRepository } from "./IMuscleRepository";

export const exerciseRepository: IExerciseRepository = new LocalExerciseRepository();
export const machineRepository: IMachineRepository = new LocalMachineRepository();
export const muscleRepository: IMuscleRepository = new LocalMuscleRepository();

export type { IExerciseRepository, IMachineRepository, IMuscleRepository };
