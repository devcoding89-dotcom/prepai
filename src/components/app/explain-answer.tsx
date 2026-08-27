"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

/**
 * "Explain this answer" button shown under each question in the report
 * review. Calls the AI explainer endpoint and renders the answer inline.
 */
export function ExplainAnswer({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const explain = async () => {
    if (loading) return;
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (text) return; // already fetched — just re-show
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId }),
      });
      const json = (await res.json().catch(() => null)) as { answer?: string; error?: string } | null;
      if (json?.answer) {
        setText(json.answer);
      } else {
        setError(json?.error ?? "Could not generate an explanation. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={explain}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
        {open ? (loading ? "Thinking…" : "Hide AI explanation") : "Explain with AI"}
      </button>
      {open && text && (
        <div className="mt-2.5 rounded-xl border border-violet-200 bg-violet-50/60 px-3.5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-violet-700">AI explanation</p>
          <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-violet-950">{text}</p>
        </div>
      )}
      {open && error && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p>
      )}
    </div>
  );
}