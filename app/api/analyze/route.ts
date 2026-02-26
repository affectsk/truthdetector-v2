import { NextRequest, NextResponse } from "next/server";
import type { CredibilityResult } from "@/lib/analysis/types";

/** Fixed mock result for the first iteration (no real analysis yet). */
const MOCK_RESULT: CredibilityResult = {
  score: 65,
  label: "medium",
  explanation:
    "This is a placeholder result. Real analysis (source checks, fact-checking, bias detection) will be added in a later iteration.",
  subscores: {
    sourceReliability: 70,
    factualConsistency: 60,
    toneAndBias: 65,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const _url = typeof body.url === "string" ? body.url : undefined;
    const _rawText = typeof body.rawText === "string" ? body.rawText : undefined;

    // Validate: require at least one input (content ignored for now)
    if (!_url && !_rawText) {
      return NextResponse.json(
        { error: "Provide either 'url' or 'rawText' in the request body." },
        { status: 400 }
      );
    }

    return NextResponse.json(MOCK_RESULT);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
