import type { Exercise } from "../models/Exercise";
import type { Machine } from "../models/Machine";
import { rankByRelevance } from "../search/fuzzy";
import { exerciseRepository, machineRepository } from "../repository";

export interface SearchResult<T> {
  item: T;
  score: number;
}

export class SearchService {
  async searchExercises(query: string, limit = 20): Promise<SearchResult<Exercise>[]> {
    const all = await exerciseRepository.getAll();
    return rankByRelevance(query, all, (e) =>
      [e.arabicName, e.englishName, ...e.aliases]
    ).slice(0, limit);
  }

  async searchMachines(query: string, limit = 10): Promise<SearchResult<Machine>[]> {
    const all = await machineRepository.getAll();
    return rankByRelevance(query, all, (m) =>
      [m.arabicName, m.englishName, ...m.aliases]
    ).slice(0, limit);
  }

  async searchAll(
    query: string,
    limit = 20
  ): Promise<{ exercises: SearchResult<Exercise>[]; machines: SearchResult<Machine>[] }> {
    const [exercises, machines] = await Promise.all([
      this.searchExercises(query, limit),
      this.searchMachines(query, limit),
    ]);
    return { exercises, machines };
  }
}

export const searchService = new SearchService();
