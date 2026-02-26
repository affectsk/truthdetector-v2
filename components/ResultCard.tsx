import type { CredibilityResult } from "@/lib/analysis/types";

interface ResultCardProps {
  result: CredibilityResult;
}

const LABEL_STYLES: Record<CredibilityResult["label"], string> = {
  low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function ResultCard({ result }: ResultCardProps) {
  const { score, label, explanation, subscores } = result;

  return (
    <article className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {score}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${LABEL_STYLES[label]}`}
        >
          {label}
        </span>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">{explanation}</p>
      {subscores && (
        <dl className="mt-4 grid grid-cols-1 gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-600 sm:grid-cols-3">
          {subscores.sourceReliability != null && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Source
              </dt>
              <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {subscores.sourceReliability}
              </dd>
            </div>
          )}
          {subscores.factualConsistency != null && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Facts
              </dt>
              <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {subscores.factualConsistency}
              </dd>
            </div>
          )}
          {subscores.toneAndBias != null && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Tone
              </dt>
              <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {subscores.toneAndBias}
              </dd>
            </div>
          )}
        </dl>
      )}
    </article>
  );
}
