import { cn } from "@/lib/utils";

/** Stylised in-app screenshot used on the landing hero (pure markup, no images). */
export function AppMockup({ className }: { className?: string }) {
  const opts = [
    { l: "A", t: "x = 2 or 3", state: "correct" },
    { l: "B", t: "x = −2 or −3", state: "idle" },
    { l: "C", t: "x = 1 or 6", state: "idle" },
    { l: "D", t: "x = −1 or −6", state: "idle" },
  ];
  return (
    <div className={cn("relative", className)}>
      {/* main window */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_30px_80px_-30px_rgba(16,24,40,.35)]">
        <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/80 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 rounded-md bg-white px-2.5 py-1 text-[10px] font-medium text-ink-400 ring-1 ring-ink-200">
            prepclass.ng/practice/session
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700">JAMB</span>
              <span className="text-[11px] font-medium text-ink-500">Mathematics · Quadratic Equations</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 font-mono text-[12px] font-bold text-rose-600">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
              01:45:32
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full w-[38%] rounded-full bg-brand-600" />
            </div>
            <span className="text-[10px] font-semibold text-ink-400">19/50</span>
          </div>

          <p className="mt-4 text-[15px] font-semibold leading-snug text-ink-950">
            Solve for x: x² − 5x + 6 = 0
          </p>

          <div className="mt-3 space-y-2">
            {opts.map((o) => (
              <div
                key={o.l}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[13px]",
                  o.state === "correct"
                    ? "border-brand-500 bg-brand-50/70 font-semibold text-brand-900 ring-2 ring-brand-500/20"
                    : "border-ink-200 text-ink-700",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-lg text-[11px] font-bold",
                    o.state === "correct" ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500",
                  )}
                >
                  {o.l}
                </span>
                {o.t}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "grid size-6 place-items-center rounded-md text-[9px] font-bold",
                  i < 14
                    ? "bg-emerald-100 text-emerald-700"
                    : i === 14
                      ? "bg-brand-600 text-white"
                      : i === 16
                        ? "bg-amber-100 text-amber-700"
                        : "bg-ink-100 text-ink-400",
                )}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* floating weakness-report card */}
      <div className="absolute -bottom-8 -left-4 w-60 rounded-2xl border border-ink-200 bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(16,24,40,.4)] sm:-left-10 sm:w-64">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-brand-600 text-white">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></svg>
          </span>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">AI Weakness Report</p>
        </div>
        <div className="mt-3 space-y-2.5">
          {[
            { t: "Quadratic Equations", v: 80, c: "bg-rose-500" },
            { t: "Trigonometry", v: 65, c: "bg-amber-500" },
            { t: "Calculus", v: 15, c: "bg-emerald-500" },
          ].map((r) => (
            <div key={r.t}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-ink-700">{r.t}</span>
                <span className="font-bold text-ink-500">{r.v}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div className={cn("h-full rounded-full", r.c)} style={{ width: `${r.v}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-brand-50 px-2.5 py-2 text-[10px] font-medium leading-snug text-brand-800">
          📖 Read: New School Mathematics — Ch. 2
        </div>
      </div>

      {/* floating score pill */}
      <div className="absolute -right-3 -top-5 rounded-2xl border border-ink-200 bg-white px-4 py-3 shadow-[0_20px_50px_-20px_rgba(16,24,40,.4)] sm:-right-8">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">Score trend</p>
        <div className="mt-1.5 flex items-end gap-1">
          {[38, 46, 52, 61, 72].map((h, i) => (
            <span
              key={i}
              className="w-2.5 rounded-t bg-gradient-to-t from-brand-200 to-brand-600"
              style={{ height: `${h * 0.5}px` }}
            />
          ))}
        </div>
        <p className="mt-1.5 text-[11px] font-bold text-emerald-600">+34% in 5 weeks</p>
      </div>
    </div>
  );
}
