"use client";

import { useState } from "react";
import { AnalyzeForm } from "@/components/AnalyzeForm";
import { ResultCard } from "@/components/ResultCard";
import type { CredibilityResult } from "@/lib/analysis/types";

export default function Home() {
  const [result, setResult] = useState<CredibilityResult | null>(null);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-10 px-6 py-16">
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Truth Detector v2
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Separate signal from spin.
          </p>
        </header>
        <AnalyzeForm onResult={setResult} onRequestStart={() => setResult(null)} />
        {result && <ResultCard result={result} />}
      </main>
    </div>
  );
}
