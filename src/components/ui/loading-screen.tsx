import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  label?: string;
  sublabel?: string;
  fullPage?: boolean;
  className?: string;
}

export function LoadingScreen({
  label = "Loading PREP CLASS...",
  sublabel = "Preparing your smart practice workspace",
  fullPage = true,
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center animate-fade-in",
        fullPage ? "min-h-[70vh] w-full" : "py-12 w-full",
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
        <div className="h-full w-full bg-gradient-to-r from-brand-500 via-violet-500 to-brand-600 rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </div>
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
