import { NextRequest, NextResponse } from "next/server";
import { analyzeWithLLM } from "@/lib/analysis/llm";
import { extractArticleFromUrl } from "@/lib/extractArticle";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";

    const hasUrl = url.length > 0;
    const hasText = rawText.length > 0;
    if (!hasUrl && !hasText) {
      return NextResponse.json(
        { error: "Provide 'url' or 'rawText' in the request body." },
        { status: 400 }
      );
    }
    if (hasUrl && hasText) {
      return NextResponse.json(
        { error: "Provide either 'url' or 'rawText', not both." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        { error: "Analysis is temporarily unavailable." },
        { status: 503 }
      );
    }

    let textToAnalyze: string;
    if (hasUrl) {
      try {
        textToAnalyze = await extractArticleFromUrl(url);
      } catch (extractErr) {
        const msg = extractErr instanceof Error ? extractErr.message : "Could not fetch or extract article from URL.";
        return NextResponse.json(
          { error: msg },
          { status: 502 }
        );
      }
    } else {
      textToAnalyze = rawText;
    }

    const result = await analyzeWithLLM(textToAnalyze);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    const name = err instanceof Error ? err.name : "Unknown";
    // #region agent log
    fetch("http://127.0.0.1:7435/ingest/181214b3-ee0a-4928-8107-89f3d7fe4a73", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e65d2e" },
      body: JSON.stringify({
        sessionId: "e65d2e",
        location: "app/api/analyze/route.ts:catch",
        message: "Analyze failed",
        data: { errorMessage: message, errorName: name },
        timestamp: Date.now(),
        hypothesisId: "H1-H4",
      }),
    }).catch(() => {});
    // #endregion
    if (message === "ANTHROPIC_API_KEY is not set") {
      return NextResponse.json(
        { error: "Analysis is temporarily unavailable." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 502 }
    );
  }
}
