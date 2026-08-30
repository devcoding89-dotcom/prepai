import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      {mark && (
        <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm shadow-brand-600/30">
          <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
            <path d="M7 10.5V16c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5.5" />
            <path d="M21 7.5V14" />
          </svg>
        </span>
      )}
      <span className="text-[19px] font-black tracking-tight text-ink-950">
        PREP <span className="text-brand-600">CLASS</span>
      </span>
    </Link>
  );
}
