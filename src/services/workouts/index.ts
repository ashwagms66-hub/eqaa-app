export type { WorkoutSession, LoggedExercise, LoggedSet, WorkoutStatus } from "./types";
export {
  saveWorkoutSession,
  getAllWorkoutSessions,
  getRecentWorkoutSessions,
  getWorkoutSessionById,
  deleteWorkoutSession,
  duplicateWorkoutSession,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
} from "./workoutStorage";
export {
  createWorkoutSession,
  completeWorkoutSession,
  abandonWorkoutSession,
  addExerciseToSession,
  updateExerciseInSession,
  getTotalVolumeKg,
  getCompletedSetCount,
} from "./workoutService";
export type { ExerciseLastSession } from "./exerciseHistory";
export { getExerciseLastSession, getExercisePreviousSessions } from "./exerciseHistory";
export type { OverloadSuggestion, OverloadType } from "./progressiveOverload";
export { suggestOverload } from "./progressiveOverload";
export type { MuscleStatus } from "./muscleTracker";
export { getWeeklyMuscleMap } from "./muscleTracker";
export type { WorkoutStats } from "./statsService";
export { getWorkoutStats } from "./statsService";
