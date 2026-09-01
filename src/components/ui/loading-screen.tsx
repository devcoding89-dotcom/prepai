import { Sparkles, ShieldAlert, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDailyMotivation, ANTI_AI_WARNINGS } from "@/lib/motivations";

interface LoadingScreenProps {
  label?: string;
  sublabel?: string;
  fullPage?: boolean;
  className?: string;
  showMotivation?: boolean;
  showAntiAIWarning?: boolean;
}

export function LoadingScreen({
  label = "Loading PREP CLASS...",
  sublabel = "Preparing your smart practice workspace",
  fullPage = true,
  className,
  showMotivation = false,
  showAntiAIWarning = false,
}: LoadingScreenProps) {
  const motivation = showMotivation ? getDailyMotivation() : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center animate-fade-in",
        fullPage ? "min-h-[70vh] w-full" : "py-8 w-full",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing background */}
        <div className="absolute size-24 rounded-3xl bg-gradient-to-tr from-brand-600/30 via-violet-500/20 to-brand-400/30 blur-xl animate-pulse-glow" />

        {/* Rotating dash ring */}
        <div className="absolute size-20 rounded-2xl border-2 border-dashed border-brand-400/40 animate-spin-slow" />

        {/* Central Logo Box */}
        <div className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 shadow-lg shadow-brand-600/30">
          <svg
            viewBox="0 0 24 24"
            className="size-8 text-white animate-bounce-subtle"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
            <path d="M7 10.5V16c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5.5" />
            <path d="M21 7.5V14" />
          </svg>
        </div>
      </div>

      {/* Brand title & animated indicator */}
      <div className="mt-6 flex items-center gap-2">
        <span className="text-base font-black tracking-tight text-ink-950">
          PREP <span className="text-brand-600">CLASS</span>
        </span>
        <span className="flex size-2 relative">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-brand-600" />
        </span>
      </div>

      {/* Dynamic text messages */}
      <h3 className="mt-2 text-sm font-semibold text-ink-800">{label}</h3>
      {sublabel && <p className="mt-1 text-xs text-ink-500 max-w-xs">{sublabel}</p>}

      {/* Animated shimmer progress line */}
      <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full w-full bg-gradient-to-r from-brand-500 via-violet-500 to-brand-600 rounded-full animate-shimmer"
          style={{ backgroundSize: "200% 100%" }}
        />
      </div>

      {/* Dynamic Motivation Card on Loading */}
      {motivation && (
        <div className="mt-8 max-w-md rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 text-left shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700">
            <Lightbulb className="size-3.5 text-brand-600" /> Pro Exam Tip
          </div>
          <p className="mt-1 text-[13px] font-bold text-ink-900">“{motivation.quote}”</p>
          <p className="mt-1 text-[11px] text-ink-600">{motivation.tip}</p>
        </div>
      )}

      {/* Anti-AI & Exam Integrity Warning on Loading */}
      {showAntiAIWarning && (
        <div className="mt-3 max-w-md rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-left shadow-2xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="size-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-950">
                ⚠️ {ANTI_AI_WARNINGS.title}
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                {ANTI_AI_WARNINGS.shortWarning} Solving with your own brain allows PrepAI to diagnose your real weak spots so you can conquer them on exam day!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-ink-200/80 bg-white p-5 card-shadow", className)}>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-ink-100 animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-1/3 rounded-md bg-ink-100 animate-pulse" />
          <div className="h-3 w-1/2 rounded-md bg-ink-50 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded-md bg-ink-100 animate-pulse" />
        <div className="h-3 w-4/5 rounded-md bg-ink-50 animate-pulse" />
      </div>
    </div>
  );
}
