import { analyzeCredibility } from "@/lib/analysis/providers/claude";
import type { CredibilityResult } from "@/lib/analysis/types";

/**
 * Run credibility analysis with the configured LLM provider.
 * This iteration uses Claude only; later we can route by optional `provider` param.
 */
export async function analyzeWithLLM(rawText: string): Promise<CredibilityResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    throw new Error("rawText is empty");
  }

  return analyzeCredibility(trimmed, apiKey);
}
