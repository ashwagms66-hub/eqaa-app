import type { Machine } from "../models/Machine";
import type { Exercise } from "../models/Exercise";
import { rankByRelevance } from "../search/fuzzy";
import { machineRepository, exerciseRepository } from "../repository";

export interface MachineMatchResult {
  machine: Machine | null;
  confidence: number;
  exercises: Exercise[];
}

/**
 * Bridges the Vision AI output (raw machine name string) to the fitness DB.
 * No modification to GymScanner or VisionProvider required.
 */
export class MachineMatcher {
  private readonly CONFIDENCE_THRESHOLD = 0.25;

  async match(rawMachineName: string): Promise<MachineMatchResult> {
    const allMachines = await machineRepository.getAll();

    const ranked = rankByRelevance(rawMachineName, allMachines, (m) =>
      [m.arabicName, m.englishName, ...m.aliases]
    );

    if (ranked.length === 0 || ranked[0].score < this.CONFIDENCE_THRESHOLD) {
      return { machine: null, confidence: 0, exercises: [] };
    }

    const best = ranked[0];
    const exercises = await exerciseRepository.getByMachineId(best.item.id);

    return {
      machine: best.item,
      confidence: best.score,
      exercises,
    };
  }

  async matchMultiple(rawMachineName: string, topN = 3): Promise<MachineMatchResult[]> {
    const allMachines = await machineRepository.getAll();
    const ranked = rankByRelevance(rawMachineName, allMachines, (m) =>
      [m.arabicName, m.englishName, ...m.aliases]
    ).slice(0, topN);

    return Promise.all(
      ranked
        .filter((r) => r.score >= this.CONFIDENCE_THRESHOLD)
        .map(async (r) => {
          const exercises = await exerciseRepository.getByMachineId(r.item.id);
          return { machine: r.item, confidence: r.score, exercises };
        })
    );
  }
}

export const machineMatcher = new MachineMatcher();
