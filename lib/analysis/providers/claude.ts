import Anthropic from "@anthropic-ai/sdk";
import type {
  CredibilityResult,
  CredibilityLabel,
  CredibilitySubscores,
} from "@/lib/analysis/types";

const MAX_INPUT_CHARS = 4_000;

const SYSTEM_PROMPT = `You are a credibility analyst. Given a short text (news excerpt, claim, or social post), output a credibility assessment as JSON only. No markdown, no code fence, no other text—just a single JSON object.

Required fields:
- score: number 0-100 (overall credibility)
- label: one of "low" | "medium" | "high"
- explanation: string, 2-4 sentences explaining the assessment

Optional fields (each 0-100 if present):
- subscores: object with optional sourceReliability, factualConsistency, toneAndBias

Output exactly one JSON object and nothing else.`;

/** Provider interface: same signature for all future providers. */
export async function analyzeCredibility(
  text: string,
  apiKey: string
): Promise<CredibilityResult> {
  const truncated =
    text.length > MAX_INPUT_CHARS
      ? text.slice(0, MAX_INPUT_CHARS) + "\n[...truncated]"
      : text;

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: truncated }],
  });

  const raw =
    response.content[0]?.type === "text"
      ? (response.content[0] as { type: "text"; text: string }).text
      : "";

  if (raw === "") {
    // #region agent log
    fetch("http://127.0.0.1:7435/ingest/181214b3-ee0a-4928-8107-89f3d7fe4a73", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e65d2e" },
      body: JSON.stringify({
        sessionId: "e65d2e",
        location: "lib/analysis/providers/claude.ts:emptyContent",
        message: "LLM returned no text content",
        data: { contentLength: response.content?.length ?? 0, firstBlockType: response.content?.[0]?.type },
        timestamp: Date.now(),
        hypothesisId: "H5",
      }),
    }).catch(() => {});
    // #endregion
  }

  // #region agent log
  fetch("http://127.0.0.1:7435/ingest/181214b3-ee0a-4928-8107-89f3d7fe4a73", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e65d2e" },
    body: JSON.stringify({
      sessionId: "e65d2e",
      location: "lib/analysis/providers/claude.ts:beforeParse",
      message: "LLM response received",
      data: { rawLength: raw.length, first100: raw.slice(0, 100) },
      timestamp: Date.now(),
      hypothesisId: "H2-H5",
    }),
  }).catch(() => {});
  // #endregion

  const parsed = parseAndValidate(raw);
  return parsed;
}

const LABELS: CredibilityLabel[] = ["low", "medium", "high"];

function parseAndValidate(raw: string): CredibilityResult {
  const trimmed = raw.trim();
  const jsonStr = trimmed.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : "Parse error";
    // #region agent log
    fetch("http://127.0.0.1:7435/ingest/181214b3-ee0a-4928-8107-89f3d7fe4a73", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e65d2e" },
      body: JSON.stringify({
        sessionId: "e65d2e",
        location: "lib/analysis/providers/claude.ts:parseAndValidate:JSON",
        message: "JSON parse failed",
        data: { parseError: msg, rawPreview: jsonStr.slice(0, 200) },
        timestamp: Date.now(),
        hypothesisId: "H2",
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(`LLM response was not valid JSON: ${msg}`);
  }

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("LLM response was not a JSON object");
  }

  const obj = data as Record<string, unknown>;

  const score = num(obj.score, 0, 100, "score");
  const label = labelVal(obj.label, "label");
  const explanation =
    typeof obj.explanation === "string" && obj.explanation.length > 0
      ? obj.explanation
      : "No explanation provided.";

  const subscores = optionalSubscores(obj.subscores);

  return { score, label, explanation, ...(subscores && { subscores }) };
}

function num(
  value: unknown,
  min: number,
  max: number,
  name: string
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`Invalid ${name}: not a number`);
  if (n < min || n > max) throw new Error(`Invalid ${name}: must be ${min}-${max}`);
  return Math.round(n);
}

function labelVal(value: unknown, name: string): CredibilityLabel {
  if (typeof value !== "string" || !LABELS.includes(value as CredibilityLabel)) {
    throw new Error(`Invalid ${name}: must be one of ${LABELS.join(", ")}`);
  }
  return value as CredibilityLabel;
}

function optionalSubscores(value: unknown): CredibilitySubscores | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) return undefined;

  const obj = value as Record<string, unknown>;
  const sourceReliability =
    obj.sourceReliability !== undefined
      ? num(obj.sourceReliability, 0, 100, "sourceReliability")
      : undefined;
  const factualConsistency =
    obj.factualConsistency !== undefined
      ? num(obj.factualConsistency, 0, 100, "factualConsistency")
      : undefined;
  const toneAndBias =
    obj.toneAndBias !== undefined
      ? num(obj.toneAndBias, 0, 100, "toneAndBias")
      : undefined;

  if (
    sourceReliability === undefined &&
    factualConsistency === undefined &&
    toneAndBias === undefined
  ) {
    return undefined;
  }
  return {
    ...(sourceReliability !== undefined && { sourceReliability }),
    ...(factualConsistency !== undefined && { factualConsistency }),
    ...(toneAndBias !== undefined && { toneAndBias }),
  };
}
