import { normalizeText, tokenize } from "./normalize";

// Levenshtein distance between two strings
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Similarity score: 0 (no match) → 1 (exact match)
export function similarity(a: string, b: string): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(na, nb);
  return 1 - dist / maxLen;
}

// Token overlap score: how many tokens from query appear in candidate
export function tokenOverlap(query: string, candidate: string): number {
  const qt = tokenize(query);
  const ct = new Set(tokenize(candidate));
  if (qt.length === 0) return 0;
  const hits = qt.filter((t) => ct.has(t) || [...ct].some((c) => similarity(t, c) > 0.8));
  return hits.length / qt.length;
}

// Combined score: weighted combination of string similarity and token overlap
export function combinedScore(query: string, candidate: string): number {
  const strScore = similarity(query, candidate);
  const tokScore = tokenOverlap(query, candidate);
  // Boost: if the candidate contains the query as a substring, bump score
  const nq = normalizeText(query);
  const nc = normalizeText(candidate);
  const containsBoost = nc.includes(nq) ? 0.2 : 0;
  return Math.min(1, strScore * 0.4 + tokScore * 0.4 + containsBoost);
}

export interface ScoredItem<T> {
  item: T;
  score: number;
}

export function rankByRelevance<T>(
  query: string,
  items: T[],
  getText: (item: T) => string[]
): ScoredItem<T>[] {
  return items
    .map((item) => {
      const texts = getText(item);
      const score = Math.max(...texts.map((t) => combinedScore(query, t)));
      return { item, score };
    })
    .filter((r) => r.score > 0.1)
    .sort((a, b) => b.score - a.score);
}
