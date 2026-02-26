/**
 * Credibility analysis types for the first iteration.
 * API returns a fixed result; these types define the response shape.
 */

/** Display label derived from the numeric score. */
export type CredibilityLabel = "low" | "medium" | "high";

/** Optional subscores (stub for first iteration; can be populated later). */
export interface CredibilitySubscores {
  sourceReliability?: number;
  factualConsistency?: number;
  toneAndBias?: number;
}

/** Full result returned by POST /api/analyze. */
export interface CredibilityResult {
  score: number;
  label: CredibilityLabel;
  explanation: string;
  subscores?: CredibilitySubscores;
}
