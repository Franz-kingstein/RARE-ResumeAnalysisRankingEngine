import type { Candidate, SortKey, FilterLevel } from "../types";
import { candidateApi } from "../api/candidate";
import { mapBackendCandidate } from "../utils/dataMapping";

export const candidateService = {
  async getCandidates(): Promise<Candidate[]> {
    const res = await candidateApi.listCandidates();
    return res.candidates.map(mapBackendCandidate);
  },

  async getCandidateById(id: string | number): Promise<Candidate> {
    const res = await candidateApi.getCandidateById(id);
    return mapBackendCandidate(res);
  },

  async updateCandidateStatus(id: string | number, status: string): Promise<boolean> {
    const res = await candidateApi.updateCandidateStatus(id, status);
    return res.updated;
  },

  async exportCandidatesCsv(ids?: (string | number)[]): Promise<Blob> {
    return candidateApi.exportCandidatesCsv(ids);
  },

  filterAndSort(
    candidates: Candidate[],
    opts: {
      searchQuery?: string;
      filterLevel?: FilterLevel;
      sortBy?: SortKey;
    },
  ): Candidate[] {
    const { searchQuery = "", filterLevel = "all", sortBy = "score" } = opts;

    let result = [...candidates];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }

    // Filter by match level
    if (filterLevel !== "all") {
      result = result.filter((c) => c.matchLevel === filterLevel);
    }

    // Sort
    switch (sortBy) {
      case "score":
        result.sort((a, b) => b.score - a.score);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "role":
        result.sort((a, b) => a.role.localeCompare(b.role));
        break;
    }

    return result;
  },
};
