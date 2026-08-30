import Link from "next/link";
import { Logo } from "@/components/logo";
import { BrainCircuit, BookOpen, Clock, TrendingUp } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-ink-400">
          © {new Date().getFullYear()} PREP CLASS ·{" "}
          <Link href="/legal/terms" className="hover:text-ink-600">Terms</Link> ·{" "}
          <Link href="/legal/privacy" className="hover:text-ink-600">Privacy</Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" />
        <div className="pointer-events-none absolute -right-24 top-10 size-96 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
            Stop guessing what to study.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-brand-100/85">
            Every session ends with a report that names your weak topics and hands you the exact
            chapter to read next.
          </p>
          <ul className="mt-9 space-y-5">
            {[
              { icon: Clock, t: "Real CBT timing", d: "Same clock, same pressure, same navigation as the exam hall." },
              { icon: BrainCircuit, t: "AI weakness report", d: "Topic-level diagnosis in plain English after every session." },
              { icon: BookOpen, t: "Matched textbooks", d: "Weak topic → recommended chapter, one tap away." },
              { icon: TrendingUp, t: "Visible progress", d: "Score trends and a study plan that updates itself." },
            ].map((f) => (
              <li key={f.t} className="flex gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.t}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-brand-100/70">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
            <p className="text-[13px] leading-relaxed text-brand-50">
              &ldquo;My JAMB score went from 198 to 276. The report showed me exactly where I was
              losing marks.&rdquo;
            </p>
            <p className="mt-2 text-[12px] font-semibold text-brand-200">Chidi O. · Lagos</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
