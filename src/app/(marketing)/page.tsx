import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Clock,
  LineChart,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AppMockup } from "@/components/marketing/app-mockup";
import { buttonClass } from "@/components/ui/button";
import { repo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

const examCards = [
  {
    exam: "JAMB",
    name: "JAMB UTME",
    accent: "from-brand-500 to-brand-700",
    ring: "hover:border-brand-400",
    tint: "bg-brand-50 text-brand-700",
    rows: [
      { icon: "📝", label: "4 subjects (English + 3)" },
      { icon: "⏱️", label: "2 hours, single sitting" },
      { icon: "🎯", label: "180 questions per mock" },
    ],
    blurb: "Full CBT simulation with the exact JAMB timing, question grid and navigation.",
  },
  {
    exam: "WAEC",
    name: "WAEC SSCE",
    accent: "from-emerald-500 to-emerald-700",
    ring: "hover:border-emerald-400",
    tint: "bg-emerald-50 text-emerald-700",
    rows: [
      { icon: "📝", label: "9 subjects available" },
      { icon: "⏱️", label: "Self-paced or timed" },
      { icon: "🎯", label: "Objectives per subject" },
    ],
    blurb: "Subject-by-subject practice built from past WAEC objective papers.",
  },
  {
    exam: "NECO",
    name: "NECO SSCE",
    accent: "from-amber-500 to-orange-600",
    ring: "hover:border-amber-400",
    tint: "bg-amber-50 text-amber-700",
    rows: [
      { icon: "📝", label: "9 subjects available" },
      { icon: "⏱️", label: "Self-paced or timed" },
      { icon: "🎯", label: "Objectives per subject" },
    ],
    blurb: "Same engine, same reports — tuned to the NECO syllabus and question style.",
  },
  {
    exam: "AI GENERATED",
    name: "AI-generated questions",
    accent: "from-violet-500 to-violet-700",
    ring: "hover:border-violet-400",
    tint: "bg-violet-50 text-violet-700",
    rows: [
      { icon: "✨", label: "Paste questions in bulk" },
      { icon: "🎯", label: "Assign JAMB, WAEC or NECO" },
      { icon: "✅", label: "Review before importing" },
    ],
    blurb: "Paste AI-created questions, assign the exam and add them to your practice bank.",
  },
];

const features = [
  {
    icon: Clock,
    title: "Real Exam Simulation",
    body: "Countdown timer, question grid, flag-for-review and auto-submit. Practise with the same pressure you will feel in the hall — no surprises on exam day.",
    tint: "bg-brand-50 text-brand-600",
  },
  {
    icon: BrainCircuit,
    title: "Know Exactly What to Study",
    body: "Our engine scores every topic you touched using accuracy, pace and difficulty — then tells you, in plain English, what to fix first. No guessing.",
    tint: "bg-violet-50 text-violet-600",
  },
  {
    icon: BookOpen,
    title: "Study the Right Material",
    body: "Every weak topic links straight to the textbook chapter that covers it. Read it in the app, then re-test the same topic in one tap.",
    tint: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Watch Yourself Improve",
    body: "Score trends, topic mastery and a running study plan. See your weakness list get shorter week after week.",
    tint: "bg-amber-50 text-amber-600",
  },
];

const steps = [
  { icon: Users, title: "Sign Up", body: "Create a free account with your name and email. Takes 20 seconds.", tag: "Free" },
  { icon: Target, title: "Pick Your Exam", body: "JAMB, WAEC or NECO — then choose the subjects you are sitting for.", tag: "1 tap" },
  { icon: ClipboardList, title: "Practise CBT", body: "Timed sessions from 10-question drills to a full 180-question mock.", tag: "Timed" },
  { icon: Sparkles, title: "Study Smart", body: "Read the AI report, open the recommended chapter, then retake the topic.", tag: "AI" },
];

const testimonials = [
  {
    quote:
      "My JAMB score went from 198 to 276. The report showed me I was losing everything in Physics calculations, not theory. I read the recommended chapter and drilled that one topic for two weeks.",
    name: "Chidi O.",
    meta: "Lagos · 2026 JAMB",
    score: "198 → 276",
  },
  {
    quote:
      "I used free apps before but they only told me my score. PrepAI tells me the topic, why I got it wrong and what to read. That is the whole difference.",
    name: "Amaka N.",
    meta: "Abuja · 2026 WAEC",
    score: "B2 → A1 in Chemistry",
  },
  {
    quote:
      "The timer is what did it for me. I used to run out of time in the real thing. After ten full mocks, finishing early became normal.",
    name: "Yusuf B.",
    meta: "Kano · 2026 JAMB",
    score: "Finished 18 mins early",
  },
];

const faqs = [
  { q: "Is it really ₦1,000 per month?", a: "Yes — one flat fee for everything: unlimited CBT practice, every subject, all AI weakness reports and the full textbook library. No hidden charges and no auto-renewal." },
  { q: "Can I practise for free?", a: "You can create an account, browse subjects and see how the platform works for free. Starting a full practice session requires an active subscription." },
  { q: "What exams do you cover?", a: "JAMB UTME, WAEC SSCE and NECO SSCE. You pick one as your main target during onboarding and can switch any time in settings." },
  { q: "Can I use it on my phone?", a: "Yes. PrepAI is mobile-first and works in any phone browser. You can also tap 'Add to Home Screen' to install it like a native app — it opens fullscreen and remembers you." },
  { q: "How does the AI weakness report actually work?", a: "After you submit a session we group every answer by topic and score it on four signals: accuracy, how many questions you saw, how fast you answered and the difficulty of what you missed. Topics above your weakness threshold are flagged, ranked and matched to a textbook chapter. Every number is explainable — nothing is a black box." },
  { q: "What if I forget to renew?", a: "Nothing is lost. Your sessions, reports and progress stay in your account. Subscribe again whenever you are ready and pick up exactly where you stopped." },
  { q: "Do you have past questions?", a: "Yes. The question bank is built from past JAMB, WAEC and NECO objective papers, each with a worked explanation so you learn from the answer, not just the letter." },
  { q: "How do I pay?", a: "Card, bank transfer, USSD or mobile money — all handled securely by Paystack. We never see or store your card details." },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const signedIn = Boolean(user);
  // Signed-in visitors should never be bounced through signup again.
  const startHref = signedIn ? "/practice" : "/auth/signup";
  const examHref = (exam: string) =>
    signedIn ? `/practice?exam=${encodeURIComponent(exam)}` : `/auth/signup?exam=${encodeURIComponent(exam)}`;

  const [settings, counts, questionTotal] = await Promise.all([
    repo.getSettings().catch(() => ({ price_kobo: 100000 })),
    repo.questionCountsBySubject("ALL").catch(() => []),
    repo.listQuestions({ limit: 1 }).then((r) => r.total).catch(() => 0),
  ]);
  const subjectCount = counts.length;
  const price = formatNaira(settings.price_kobo);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_72%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 size-96 rounded-full bg-emerald-200/25 blur-3xl" />

        <div className="container-x relative grid gap-16 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-brand-700 backdrop-blur">
              <Sparkles className="size-3.5" />
              AI weakness reports after every session
            </span>

            <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-ink-950 sm:text-6xl">
              Pass JAMB, WAEC &amp; NECO on your{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                  first try
                </span>
                <svg className="absolute -bottom-1 left-0 z-0 w-full" height="12" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8c60-6 130-8 296-4" stroke="#bdcfff" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-600">
              Practise with real CBT past questions. Get an AI report that names the exact topics
              costing you marks — then study the precise textbook chapter that fixes them.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={startHref} prefetch={false} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
                {signedIn ? "Start practising" : `Start practising — ${price}/month`}
                <ArrowRight className="size-4.5" />
              </Link>
              <Link href="#how" className={buttonClass("outline", "lg", "w-full sm:w-auto")}>
                <Play className="size-4 fill-current" />
                See how it works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex -space-x-2">
                  {["bg-brand-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500"].map((c) => (
                    <span key={c} className={`size-6 rounded-full ring-2 ring-white ${c}`} />
                  ))}
                </span>
                <strong className="font-semibold text-ink-800">500+ students</strong> across Nigeria
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-600" />
                Secure Paystack payments
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-4 text-amber-500" />
                Works on any phone
              </span>
            </div>
          </div>

          <div className="animate-fade-up lg:pl-6 [animation-delay:120ms]">
            <AppMockup />
          </div>
        </div>

        {/* stat strip */}
        <div className="container-x relative pb-14 pt-10 lg:pt-4">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-4">
            {[
              { v: `${questionTotal}+`, l: "Practice questions" },
              { v: `${subjectCount}`, l: "Subjects covered" },
              { v: "3", l: "Exam bodies" },
              { v: price, l: "Per month, flat" },
            ].map((s) => (
              <div key={s.l} className="bg-white px-4 py-5 text-center">
                <p className="text-2xl font-extrabold tracking-tight text-ink-950">{s.v}</p>
                <p className="mt-0.5 text-xs font-medium text-ink-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= EXAM SELECTION ======================= */}
      <section className="border-y border-ink-200 bg-ink-50/50 py-20">
        <div className="container-x">
          <SectionHead
            eyebrow="Choose your path"
            title="Which exam are you preparing for?"
            sub="Pick one to focus on. You can switch any time — your history follows you."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {examCards.map((c) => (
              <Link
                key={c.exam}
                href={examHref(c.exam)}
                prefetch={false}
                className={`group relative overflow-hidden rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-200 card-shadow hover:-translate-y-1 hover:shadow-xl ${c.ring}`}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${c.accent}`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl font-bold tracking-tight text-ink-950">{c.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">{c.blurb}</p>
                  </div>
                  <span className={`rounded-xl px-2.5 py-1 text-[11px] font-bold ${c.tint}`}>{c.exam}</span>
                </div>
                <ul className="mt-5 space-y-2.5 border-t border-ink-100 pt-5">
                  {c.rows.map((r) => (
                    <li key={r.label} className="flex items-center gap-2.5 text-sm text-ink-700">
                      <span className="text-base">{r.icon}</span>
                      {r.label}
                    </li>
                  ))}
                </ul>
                <span className={buttonClass("outline", "md", "mt-6 w-full group-hover:border-brand-400 group-hover:bg-brand-50 group-hover:text-brand-700")}>
                  {c.exam === "AI GENERATED" ? "Paste AI questions" : `Practice ${c.exam}`}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== FEATURES ========================== */}
      <section id="features" className="scroll-mt-20 py-20">
        <div className="container-x">
          <SectionHead
            eyebrow="Features"
            title="Everything you need to pass"
            sub="Four things separate students who improve from students who just keep practising."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-200 card-shadow hover:-translate-y-0.5 hover:border-brand-300"
              >
                <span className={`grid size-12 place-items-center rounded-2xl ${f.tint}`}>
                  <f.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-ink-950">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{f.body}</p>
              </div>
            ))}
          </div>

          {/* deep-dive strip */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-ink-950 to-brand-950 p-8 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-brand-100">
                  <BrainCircuit className="size-3.5" /> Inside the report
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  Not just a score. A diagnosis.
                </h3>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-brand-100/80">
                  Most apps stop at &ldquo;you got 32/50&rdquo;. PrepAI breaks the same session into topics and
                  ranks them by how much each one is costing you — including the topics you skipped and the
                  easy questions you should never have missed.
                </p>
                <ul className="mt-5 grid gap-2.5 text-sm text-brand-50 sm:grid-cols-2">
                  {[
                    "Topic-level accuracy",
                    "Pace analysis (rushing vs stalling)",
                    "Missed-easy detection",
                    "Repeat-weakness tracking",
                    "Predicted JAMB score /400",
                    "Matched textbook chapter",
                  ].map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-200">Sample output</p>
                <div className="mt-3 space-y-3">
                  {[
                    { t: "Quadratic Equations", s: 80, note: "4 of 5 wrong · 2 were easy", c: "bg-rose-500" },
                    { t: "Organic Chemistry", s: 75, note: "3 of 4 wrong · answered too fast", c: "bg-amber-500" },
                    { t: "Calculus", s: 10, note: "9 of 10 correct · strong area", c: "bg-emerald-500" },
                  ].map((r) => (
                    <div key={r.t} className="rounded-xl bg-white/5 p-3">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{r.t}</span>
                        <span className="text-brand-100">{r.s}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${r.c}`} style={{ width: `${r.s}%` }} />
                      </div>
                      <p className="mt-1.5 text-[11px] text-brand-100/70">{r.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section id="how" className="scroll-mt-20 border-y border-ink-200 bg-ink-50/50 py-20">
        <div className="container-x">
          <SectionHead eyebrow="How it works" title="From first login to a better score" sub="Four steps. The loop repeats until your weakness list is empty." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                {i < steps.length - 1 && (
                  <span className="absolute left-[calc(50%+2.5rem)] top-7 hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-ink-300 to-transparent lg:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <span className="relative grid size-14 place-items-center rounded-2xl border border-ink-200 bg-white text-brand-600 card-shadow">
                    <s.icon className="size-6" />
                    <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <p className="mt-4 text-base font-bold text-ink-950">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.body}</p>
                  <span className="mt-3 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-ink-500 ring-1 ring-ink-200">
                    {s.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== PRICING =========================== */}
      <section id="pricing" className="scroll-mt-20 py-20">
        <div className="container-x">
          <SectionHead eyebrow="Pricing" title="Simple pricing" sub="One plan. Everything included. Cancel whenever — there is nothing to cancel, it simply stops." />

          <div className="mx-auto mt-10 max-w-md">
            <div className="relative overflow-hidden rounded-3xl border-2 border-brand-600 bg-white p-8 shadow-[0_30px_70px_-30px_rgba(31,63,237,.45)]">
              <span className="absolute right-5 top-5 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                All access
              </span>
              <p className="text-sm font-semibold text-ink-500">Monthly plan</p>
              <p className="mt-2 flex items-end gap-1.5">
                <span className="text-5xl font-extrabold tracking-tight text-ink-950">{price}</span>
                <span className="pb-1.5 text-base font-medium text-ink-500">/ month</span>
              </p>
              <p className="mt-2 text-sm text-ink-500">Roughly ₦33 a day — less than a bottle of water.</p>

              <ul className="mt-6 space-y-3">
                {[
                  "Unlimited CBT practice sessions",
                  "All subjects, topics and past questions",
                  "AI weakness report after every session",
                  "Full digital textbook library",
                  "Progress dashboard & study plan",
                  "Works offline-friendly on mobile",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] text-ink-700">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={signedIn ? "/billing" : "/auth/signup"} className={buttonClass("primary", "lg", "mt-7 w-full")}>
                {signedIn ? "Manage my subscription" : "Start practising now"}
                <ArrowRight className="size-4.5" />
              </Link>

              <p className="mt-4 text-center text-xs leading-relaxed text-ink-500">
                No hidden fees. No auto-renewal. Pay only when you want to practise.
                <br />
                Card · Bank transfer · USSD — secured by Paystack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== TESTIMONIALS ======================== */}
      <section className="border-y border-ink-200 bg-ink-50/50 py-20">
        <div className="container-x">
          <SectionHead eyebrow="Results" title="What students say" sub="Real feedback from our beta cohort." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border border-ink-200 bg-white p-6 card-shadow">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" className="size-4 fill-current"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" /></svg>
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                  <div>
                    <p className="text-sm font-bold text-ink-950">{t.name}</p>
                    <p className="text-xs text-ink-500">{t.meta}</p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    {t.score}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= FAQ ============================ */}
      <section id="faq" className="scroll-mt-20 py-20">
        <div className="container-x">
          <SectionHead eyebrow="FAQ" title="Frequently asked questions" sub="Still unsure? Reach us any time on the contact page." />
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-ink-200 overflow-hidden rounded-2xl border border-ink-200 bg-white">
            {faqs.map((f) => (
              <details key={f.q} className="group px-5 py-4 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-[15px] font-semibold text-ink-900">{f.q}</span>
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600 transition-transform group-open:rotate-45">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <p className="mt-3 pr-10 text-[15px] leading-relaxed text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= CTA ============================ */}
      <section className="pb-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 px-8 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
            <div className="relative">
              <LineChart className="mx-auto size-10 text-white/70" />
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your next practice session could be the one that changes your score.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-brand-100">
                Join hundreds of Nigerian students who stopped guessing what to study.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href={signedIn ? "/dashboard" : "/auth/signup"} className={buttonClass("secondary", "lg", "bg-white text-brand-700 hover:bg-brand-50")}>
                  {signedIn ? "Go to my dashboard" : "Create your free account"}
                  <ArrowRight className="size-4.5" />
                </Link>
                <Link href={signedIn ? "/practice" : "/auth/login"} className={buttonClass("outline", "lg", "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white")}>
                  {signedIn ? "Start a practice session" : "I already have an account"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
      <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">{title}</h2>
      {sub && <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-500">{sub}</p>}
    </div>
  );
}
