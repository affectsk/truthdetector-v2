"use client";

import { useState } from "react";
import type { CredibilityResult } from "@/lib/analysis/types";

interface AnalyzeFormProps {
  onResult: (result: CredibilityResult) => void;
}

export function AnalyzeForm({ onResult }: AnalyzeFormProps) {
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    const trimmedText = rawText.trim();
    if (!trimmedUrl && !trimmedText) {
      setError("Enter a URL or paste some text to analyze.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(trimmedUrl && { url: trimmedUrl }),
          ...(trimmedText && { rawText: trimmedText }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed.");
        return;
      }
      onResult(data as CredibilityResult);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-4">
      <div>
        <label htmlFor="url" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Article URL
        </label>
        <input
          id="url"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="rawText" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Or paste text
        </label>
        <textarea
          id="rawText"
          placeholder="Paste article or claim text here..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={4}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
          disabled={loading}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Analyzing…" : "Analyze"}
      </button>
    </form>
  );
}
