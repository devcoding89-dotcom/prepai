"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  Grid3x3,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatClock, LETTERS_SAFE } from "@/components/app/session-utils";
import type { SafeQuestion } from "@/lib/services/practice";

interface AnswerState {
  selected: string | null;
  flagged: boolean;
  timeMs: number;
  visited: boolean;
  dirty: boolean;
}

export function SessionRunner({
  sessionId,
  exam,
  questions,
  durationSeconds,
  elapsedSeconds,
  initialAnswers,
}: {
  sessionId: string;
  exam: string;
  questions: SafeQuestion[];
  durationSeconds: number;
  elapsedSeconds: number;
  initialAnswers: Record<string, { selected: string | null; flagged: boolean; timeMs: number }>;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(Math.max(0, durationSeconds - elapsedSeconds));
  const [gridOpen, setGridOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => {
    const base: Record<string, AnswerState> = {};
    for (const q of questions) {
      const prev = initialAnswers[q.id];
      base[q.id] = {
        selected: prev?.selected ?? null,
        flagged: prev?.flagged ?? false,
        timeMs: prev?.timeMs ?? 0,
        visited: Boolean(prev),
        dirty: false,
      };
    }
    return base;
  });

  const current = questions[index];
  const questionEnteredAt = useRef<number>(Date.now());
  const submittedRef = useRef(false);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.selected).length,
    [answers],
  );
  const flaggedCount = useMemo(() => Object.values(answers).filter((a) => a.flagged).length, [answers]);

  // ------------------------------------------------------------------ timer
  // Deadline-based countdown: browsers throttle setInterval in background
  // tabs, so decrementing a counter would silently grant extra exam time.
  // Deriving remaining time from the wall clock keeps the limit honest —
  // when the user returns to the tab it snaps to the true value.
  const deadlineRef = useRef<number>(Date.now() + Math.max(0, durationSeconds - elapsedSeconds) * 1000);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, []);

  // ------------------------------------------------------- persist an answer
  const persist = useCallback(
    async (questionId: string, state: AnswerState) => {
      try {
        setSyncing(true);
        await fetch(`/api/sessions/${sessionId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_id: questionId,
            selected: state.selected,
            flagged: state.flagged,
            time_ms: state.timeMs,
          }),
          keepalive: true,
        });
      } catch {
        /* offline — the local copy is flushed on submit */
      } finally {
        setSyncing(false);
      }
    },
    [sessionId],
  );

  /** Fold the time spent on the current question into its answer state. Returns the spent ms. */
  const commitTime = useCallback(() => {
    const spent = Date.now() - questionEnteredAt.current;
    questionEnteredAt.current = Date.now();
    if (!current) return 0;
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { ...prev[current.id], timeMs: (prev[current.id]?.timeMs ?? 0) + spent, visited: true },
    }));
    return spent;
  }, [current]);

  const select = (letter: string) => {
    if (!current) return;
    const spent = Date.now() - questionEnteredAt.current;
    setAnswers((prev) => {
      const next: AnswerState = {
        ...prev[current.id],
        selected: prev[current.id]?.selected === letter ? null : letter,
        timeMs: (prev[current.id]?.timeMs ?? 0) + spent,
        visited: true,
        dirty: true,
      };
      void persist(current.id, next);
      return { ...prev, [current.id]: next };
    });
    questionEnteredAt.current = Date.now();
  };

  const toggleFlag = () => {
    if (!current) return;
    setAnswers((prev) => {
      const next = { ...prev[current.id], flagged: !prev[current.id]?.flagged, visited: true };
      void persist(current.id, next);
      return { ...prev, [current.id]: next };
    });
  };

  const go = useCallback(
    (i: number) => {
      commitTime();
      setIndex(Math.max(0, Math.min(questions.length - 1, i)));
      setGridOpen(false);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [commitTime, questions.length],
  );

  // ----------------------------------------------------------------- submit
  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    // commitTime() updates state asynchronously, so fold the final time chunk
    // into the payload directly instead of relying on the answers snapshot.
    const extraMs = commitTime();
    const payload = Object.entries(answers).map(([question_id, a]) => ({
      question_id,
      selected: a.selected,
      flagged: a.flagged,
      time_ms: question_id === current?.id ? a.timeMs + extraMs : a.timeMs,
    }));
    try {
      const res = await fetch(`/api/sessions/${sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
      const json = (await res.json()) as { redirect?: string };
      router.push(json.redirect ?? `/reports/${sessionId}`);
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
      alert("Could not submit — check your connection and try again.");
    }
  }, [answers, commitTime, current?.id, router, sessionId]);

  // auto-submit when the clock runs out
  useEffect(() => {
    if (remaining === 0 && !submittedRef.current) void doSubmit();
  }, [remaining, doSubmit]);

  // --------------------------------------------------------- keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmOpen || submitting) return;
      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(key)) {
        const idx = LETTERS_SAFE.indexOf(key);
        if (current && idx < current.options.length) select(key);
      }
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
      if (key === "F") toggleFlag();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, index, confirmOpen, submitting]);

  // ------------------------------------------------------- swipe navigation
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 60) go(index + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  };

  // warn before leaving
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  if (!current) return null;

  const state = answers[current.id];
  const lowTime = remaining <= 300;
  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="min-h-dvh bg-ink-50/70 pb-40">
      {/* ---------------- top bar ---------------- */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setGridOpen(true)}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-ink-200 text-ink-700 hover:bg-ink-100"
            aria-label="Question grid"
          >
            <Grid3x3 className="size-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[13px] font-semibold text-ink-900">
                Question {index + 1} <span className="font-normal text-ink-400">of {questions.length}</span>
              </p>
              <span className="hidden text-[11px] font-medium text-ink-400 sm:block">
                {answeredCount} answered · {flaggedCount} flagged
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-sm font-bold tabular-nums",
              lowTime ? "animate-pulse bg-rose-50 text-rose-600" : "bg-ink-100 text-ink-800",
            )}
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            {formatClock(remaining)}
          </div>
        </div>
      </header>

      {/* ---------------- question ---------------- */}
      <main className="mx-auto max-w-4xl px-4 py-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="animate-pop rounded-2xl border border-ink-200 bg-white p-5 card-shadow sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700">{exam}</span>
            <span className="rounded-lg bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-600">{current.subject}</span>
            <span className="rounded-lg bg-ink-100 px-2 py-1 text-[11px] font-medium text-ink-500">{current.topic}</span>
            {current.year && (
              <span className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                {current.year} past question
              </span>
            )}
          </div>

          <p className="mt-4 whitespace-pre-wrap text-[17px] font-semibold leading-relaxed text-ink-950 sm:text-lg">
            {current.question_text}
          </p>

          <div className="mt-5 space-y-2.5">
            {current.options.map((opt, i) => {
              const letter = LETTERS_SAFE[i];
              const on = state?.selected === letter;
              return (
                <button
                  key={letter}
                  onClick={() => select(letter)}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 active:scale-[.995]",
                    on
                      ? "border-brand-600 bg-brand-50 ring-2 ring-brand-500/20"
                      : "border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold transition-colors",
                      on ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600",
                    )}
                  >
                    {on ? <Check className="size-4" /> : letter}
                  </span>
                  <span className={cn("text-[15px] leading-snug", on ? "font-semibold text-brand-900" : "text-ink-800")}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
            <button
              onClick={toggleFlag}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors",
                state?.flagged ? "bg-amber-100 text-amber-800" : "text-ink-500 hover:bg-ink-100",
              )}
            >
              <Flag className={cn("size-4", state?.flagged && "fill-current")} />
              {state?.flagged ? "Flagged for review" : "Flag for review"}
            </button>
            <span className="hidden text-[11px] text-ink-400 sm:block">
              Keys: A–E to answer · ← → to move · F to flag
            </span>
          </div>
        </div>
      </main>

      {/* ---------------- bottom bar ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
          <Button variant="outline" onClick={() => go(index - 1)} disabled={index === 0} className="px-3 sm:px-5">
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="hide-scrollbar mx-1 flex flex-1 gap-1.5 overflow-x-auto">
            {questions.map((q, i) => {
              const a = answers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => go(i)}
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold transition-colors",
                    i === index
                      ? "bg-brand-600 text-white ring-2 ring-brand-500/30"
                      : a?.flagged
                        ? "bg-amber-100 text-amber-800"
                        : a?.selected
                          ? "bg-emerald-100 text-emerald-700"
                          : a?.visited
                            ? "bg-sky-50 text-sky-600"
                            : "bg-ink-100 text-ink-400",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {index === questions.length - 1 ? (
            <Button variant="success" onClick={() => setConfirmOpen(true)} className="px-3 sm:px-5">
              <Send className="size-4" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
          ) : (
            <Button onClick={() => go(index + 1)} className="px-3 sm:px-5">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
        <div className="border-t border-ink-100 px-4 py-2">
          <div className="mx-auto flex max-w-4xl items-center justify-between text-[11px] text-ink-400">
            <span className="flex items-center gap-3">
              <Legend className="bg-emerald-100" label="Answered" />
              <Legend className="bg-amber-100" label="Flagged" />
              <Legend className="bg-ink-100" label="Not seen" />
            </span>
            <span className="flex items-center gap-1.5">
              {syncing ? <Loader2 className="size-3 animate-spin" /> : <span className="size-1.5 rounded-full bg-emerald-500" />}
              {syncing ? "Saving…" : "Saved"}
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- grid drawer ---------------- */}
      {gridOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setGridOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-white p-5 animate-fade-up sm:inset-y-0 sm:right-0 sm:left-auto sm:w-96 sm:max-h-none sm:rounded-none">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-ink-950">Question navigator</p>
              <button onClick={() => setGridOpen(false)} className="grid size-9 place-items-center rounded-xl hover:bg-ink-100">
                <X className="size-5 text-ink-500" />
              </button>
            </div>
            <div className="mt-2 flex gap-4 text-[12px] text-ink-500">
              <span>{answeredCount} answered</span>
              <span>{flaggedCount} flagged</span>
              <span>{questions.length - answeredCount} left</span>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-7">
              {questions.map((q, i) => {
                const a = answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => go(i)}
                    className={cn(
                      "grid aspect-square place-items-center rounded-xl text-[12px] font-bold transition-colors",
                      i === index
                        ? "bg-brand-600 text-white"
                        : a?.flagged
                          ? "bg-amber-100 text-amber-800"
                          : a?.selected
                            ? "bg-emerald-100 text-emerald-700"
                            : a?.visited
                              ? "bg-sky-50 text-sky-600"
                              : "bg-ink-100 text-ink-400",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <Button variant="success" className="mt-6 w-full" onClick={() => { setGridOpen(false); setConfirmOpen(true); }}>
              <Send className="size-4" />
              Submit session
            </Button>
          </div>
        </div>
      )}

      {/* ---------------- submit confirm ---------------- */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => !submitting && setConfirmOpen(false)} />
          <div className="relative w-full max-w-sm animate-pop rounded-2xl bg-white p-6 text-center card-shadow">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle className="size-6" />
            </span>
            <p className="mt-4 text-lg font-bold text-ink-950">Submit this session?</p>
            <p className="mt-1.5 text-sm text-ink-500">
              You answered <strong className="text-ink-800">{answeredCount}</strong> of {questions.length} questions.
              {questions.length - answeredCount > 0 && (
                <> {questions.length - answeredCount} will be marked unanswered — there is no negative marking, so guessing is better than leaving blanks.</>
              )}
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                Keep going
              </Button>
              <Button variant="success" className="flex-1" onClick={doSubmit} loading={submitting}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {submitting && !confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/80 backdrop-blur">
          <div className="text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-brand-600" />
            <p className="mt-3 text-sm font-semibold text-ink-800">Marking your session…</p>
            <p className="text-xs text-ink-500">Generating your AI weakness report</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn("size-2.5 rounded", className)} />
      {label}
    </span>
  );
}