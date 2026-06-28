// Models
export type { Machine } from "./models/Machine";
export type { Exercise, ExerciseVariant } from "./models/Exercise";
export type { Muscle } from "./models/Muscle";
export type {
  Difficulty,
  BodyRegion,
  WorkoutCategory,
  MovementPattern,
  EquipmentType,
  BodyPart,
} from "./models/types";

// Repositories (default instances + interfaces)
export {
  exerciseRepository,
  machineRepository,
  muscleRepository,
} from "./repository";
export type {
  IExerciseRepository,
  IMachineRepository,
  IMuscleRepository,
} from "./repository";

// Local implementations (for DI / testing overrides)
export { LocalExerciseRepository } from "./repository/local/LocalExerciseRepository";
export { LocalMachineRepository } from "./repository/local/LocalMachineRepository";
export { LocalMuscleRepository } from "./repository/local/LocalMuscleRepository";

// Services
export { searchService, SearchService } from "./services/SearchService";
export { machineMatcher, MachineMatcher } from "./services/MachineMatcher";
export type { SearchResult } from "./services/SearchService";
export type { MachineMatchResult } from "./services/MachineMatcher";

// Search utilities
export { normalizeArabic, normalizeText, tokenize } from "./search/normalize";
export { similarity, combinedScore, rankByRelevance } from "./search/fuzzy";

// Locale helpers
export { localizedName, allNames } from "./utils/locale";
export type { AppLanguage } from "./utils/locale";
