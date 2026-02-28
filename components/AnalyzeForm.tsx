"use client";

import { useState } from "react";
import type { CredibilityResult } from "@/lib/analysis/types";

type Tab = "url" | "text";

interface AnalyzeFormProps {
  onResult: (result: CredibilityResult) => void;
  /** Called when a new analysis is requested; use to clear previous result. */
  onRequestStart?: () => void;
}

const inputClasses =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400";
const labelClasses = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
const tabBase =
  "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px";
const tabInactive =
  "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300";
const tabActive =
  "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100";

export function AnalyzeForm({ onResult, onRequestStart }: AnalyzeFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUrlEmpty = url.trim() === "";
  const isTextEmpty = rawText.trim() === "";
  const canSubmit =
    activeTab === "url" ? !isUrlEmpty : !isTextEmpty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onRequestStart?.();
    setError(null);
    setLoading(true);
    try {
      const body =
        activeTab === "url"
          ? { url: url.trim() }
          : { rawText: rawText.trim() };
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`${tabBase} ${activeTab === "url" ? tabActive : tabInactive}`}
          aria-pressed={activeTab === "url"}
          aria-label="Analyze by URL"
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={`${tabBase} ${activeTab === "text" ? tabActive : tabInactive}`}
          aria-pressed={activeTab === "text"}
          aria-label="Analyze by pasted text"
        >
          Text
        </button>
      </div>

      {activeTab === "url" && (
        <div>
          <label htmlFor="url" className={labelClasses}>
            Article URL
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputClasses}
            disabled={loading}
          />
        </div>
      )}

      {activeTab === "text" && (
        <div>
          <label htmlFor="rawText" className={labelClasses}>
            Paste text
          </label>
          <textarea
            id="rawText"
            placeholder="Paste article or claim text here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={4}
            className={`${inputClasses} resize-y`}
            disabled={loading}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Analyzing…" : "Analyze"}
      </button>
    </form>
  );
}
