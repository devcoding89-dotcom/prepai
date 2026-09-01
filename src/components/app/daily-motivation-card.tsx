"use client";

import { useState } from "react";
import { Flame, Info, Lightbulb, ShieldAlert, Sparkles, Trophy, ChevronRight } from "lucide-react";
import { getDailyMotivation, ANTI_AI_WARNINGS } from "@/lib/motivations";
import { cn } from "@/lib/utils";

interface Props {
  streakDays?: number;
  className?: string;
}

export function DailyMotivationCard({ streakDays = 0, className }: Props) {
  const motivation = getDailyMotivation();
  const [showIntegrityTip, setShowIntegrityTip] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-brand-200/80 bg-gradient-to-br from-white via-brand-50/40 to-violet-50/50 p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      {/* Subtle background decorative shapes */}
      <div className="pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-brand-200/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 size-28 rounded-full bg-violet-200/30 blur-2xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/20">
            <Sparkles className="size-5" />
          </span>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100/80 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                <Lightbulb className="size-3" /> Daily Motivation & Strategy
              </span>
              {streakDays > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  <Flame className="size-3 text-amber-600" /> {streakDays}-day streak
                </span>
              )}
            </div>

            <blockquote className="text-[15px] font-bold leading-snug text-ink-950 sm:text-base">
              “{motivation.quote}”
            </blockquote>

            <p className="text-[13px] leading-relaxed text-ink-600">
              <strong className="font-semibold text-ink-800">Exam Strategy: </strong>
              {motivation.tip}
            </p>
          </div>
        </div>

        {/* Anti-AI & Smart practice toggle */}
        <div className="shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={() => setShowIntegrityTip(!showIntegrityTip)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-ink-700 shadow-2xs backdrop-blur-xs transition-colors hover:border-amber-300 hover:bg-amber-50/60 hover:text-amber-900"
          >
            <ShieldAlert className="size-3.5 text-amber-600" />
            {showIntegrityTip ? "Hide CBT rule" : "Exam Integrity Rule"}
          </button>
        </div>
      </div>

      {/* Expandable Anti-AI / Real Exam Condition Banner */}
      {showIntegrityTip && (
        <div className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/80 p-4 text-[13px] text-amber-950 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="size-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-bold text-amber-900">
                ⚠️ {ANTI_AI_WARNINGS.title}
              </p>
              <p className="text-amber-800 leading-relaxed">
                {ANTI_AI_WARNINGS.detailedMessage}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-amber-900">
                {ANTI_AI_WARNINGS.rules.map((rule, idx) => (
                  <li key={idx} className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 border border-amber-200">
                    ✓ {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
