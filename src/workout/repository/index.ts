import { LocalWorkoutRepository } from "./local/LocalWorkoutRepository";
import type { IWorkoutRepository } from "./IWorkoutRepository";

export const workoutRepository: IWorkoutRepository = new LocalWorkoutRepository();
export type { IWorkoutRepository };
export { LocalWorkoutRepository };
