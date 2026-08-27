import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { analyseSession } from "@/lib/engine";
import { loadSessionQuestions } from "@/lib/services/practice";
import { retryMistakesAction } from "@/app/(app)/practice/actions";
import { ExplainAnswer } from "@/components/app/explain-answer";
import { Badge, Card, CardBody, CardHeader, CardTitle, ProgressBar } from "@/components/ui/card";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { SubjectBarChart } from "@/components/app/charts";
import { cn, formatDateTime, formatDuration } from "@/lib/utils";
import { LETTERS } from "@/lib/types";

export const metadata = { title: "Session report" };
export const dynamic = "force-dynamic";

const severityTone = {
  critical: { tone: "danger" as const, bar: "bg-rose-500", label: "Critical gap" },
  weak: { tone: "warning" as const, bar: "bg-amber-500", label: "Needs work" },
  fair: { tone: "info" as const, bar: "bg-sky-500", label: "Almost there" },
  strong: { tone: "success" as const, bar: "bg-emerald-500", label: "Strong" },
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const session = await repo.getSession(id);
  if (!session || (session.user_id !== user.id && user.role !== "admin")) redirect("/reports");
  if (session.status === "in_progress") redirect(`/practice/session/${session.id}`);

  const [answers, questions] = await Promise.all([
    repo.listAnswers(session.id),
    loadSessionQuestions(session),
  ]);
  const analysis = await analyseSession(session, answers, questions);
  const qById = new Map(questions.map((q) => [q.id, q]));
  const aById = new Map(answers.map((a) => [a.question_id, a]));

  const scoreTone =
    analysis.score_percent >= 70 ? "emerald" : analysis.score_percent >= 50 ? "amber" : "rose";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ---------------- score hero ---------------- */}
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex items-center gap-6">
            <div className="relative grid size-32 shrink-0 place-items-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#eceef2" strokeWidth="9" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke={scoreTone === "emerald" ? "#10b981" : scoreTone === "amber" ? "#f59e0b" : "#f43f5e"}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${(analysis.score_percent / 100) * 276.5} 276.5`}
                />
              </svg>
              <div className="text-center">
                <p className="text-3xl font-extrabold tracking-tight text-ink-950">{analysis.score_percent}%</p>
                <p className="text-[11px] font-semibold text-ink-400">
                  {analysis.correct}/{analysis.total}
                </p>
              </div>
            </div>
            <div>
              <Badge tone="brand">{session.exam} · {session.mode}</Badge>
              <h1 className="mt-2 text-xl font-extrabold tracking-tight text-ink-950 sm:text-2xl">
                Session complete
              </h1>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-500">{analysis.headline}</p>
              <p className="mt-2 text-xs text-ink-400">
                {session.subjects.join(", ")} · {formatDateTime(session.started_at)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:justify-self-end">
            <MiniStat icon={<CheckCircle2 className="size-4" />} label="Correct" value={analysis.correct} tone="text-emerald-600" />
            <MiniStat icon={<XCircle className="size-4" />} label="Wrong" value={analysis.wrong} tone="text-rose-600" />
            <MiniStat icon={<Target className="size-4" />} label="Skipped" value={analysis.unanswered} tone="text-ink-500" />
            <MiniStat icon={<Clock className="size-4" />} label="Time" value={formatDuration(session.time_taken_seconds)} tone="text-ink-700" />
          </div>
        </div>

        {analysis.predicted_jamb_score != null && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-brand-50/60 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="size-5 text-brand-600" />
              <p className="text-sm text-ink-700">
                At this accuracy your projected JAMB total is{" "}
                <strong className="font-bold text-brand-800">{analysis.predicted_jamb_score}/400</strong>
              </p>
            </div>
            <p className="text-[12px] text-ink-500">Based on this session only — run a full mock for a firmer estimate.</p>
          </div>
        )}
      </Card>

      {/* ---------------- AI report ---------------- */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-brand-600 text-white">
              <Sparkles className="size-4.5" />
            </span>
            <div>
              <CardTitle>AI weakness report</CardTitle>
              <p className="mt-0.5 text-sm text-ink-500">
                {analysis.weak.length
                  ? `${analysis.weak.length} topic${analysis.weak.length > 1 ? "s" : ""} are costing you marks`
                  : "No topic crossed your weakness threshold"}
              </p>
            </div>
          </div>
          <Badge tone="neutral">{analysis.topics.length} topics analysed</Badge>
        </CardHeader>

        <CardBody className="space-y-4">
          {analysis.advice.length > 0 && (
            <ul className="space-y-2 rounded-xl bg-ink-50 p-4">
              {analysis.advice.map((a) => (
                <li key={a} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-700">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                  {a}
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-3">
            {analysis.topics.map((t) => {
              const sv = severityTone[t.severity];
              return (
                <div key={t.subject + t.topic} className="rounded-2xl border border-ink-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-bold text-ink-950">{t.topic}</p>
                        <Badge tone={sv.tone}>{sv.label}</Badge>
                        {t.confidence === "low" && <Badge tone="neutral">low sample</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {t.subject} · {t.correct}/{t.total} correct
                        {t.unanswered > 0 && ` · ${t.unanswered} skipped`}
                        {t.avg_seconds > 0 && ` · ${t.avg_seconds}s avg`}
                        {t.pace !== "steady" && ` · ${t.pace}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-ink-950">{t.weakness_score}%</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">weakness</p>
                    </div>
                  </div>

                  <ProgressBar value={t.weakness_score} className="mt-3" tone={sv.bar} />

                  <p className="mt-3 text-[13.5px] leading-relaxed text-ink-600">{t.recommendation}</p>

                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {t.textbook_id ? (
                      <Link href={`/textbooks/${t.textbook_id}?from=report`} className={buttonClass("primary", "sm")}>
                        <BookOpen className="size-4" />
                        Study this topic
                      </Link>
                    ) : (
                      <span className="rounded-lg bg-ink-100 px-3 py-2 text-[12px] text-ink-500">
                        No textbook chapter tagged for this topic yet
                      </span>
                    )}
                    <Link
                      href={`/practice?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}`}
                      className={buttonClass("outline", "sm")}
                    >
                      <RefreshCw className="size-4" />
                      Drill this topic
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* ---------------- subject breakdown ---------------- */}
      {analysis.subjects.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by subject</CardTitle>
          </CardHeader>
          <CardBody>
            <SubjectBarChart data={analysis.subjects.map((s) => ({ subject: s.subject, accuracy: s.accuracy }))} />
          </CardBody>
        </Card>
      )}

      {/* ---------------- question review ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Review every question</CardTitle>
          <p className="mt-1 text-sm text-ink-500">Tap a question to see the correct answer and explanation.</p>
        </CardHeader>
        <CardBody className="space-y-2.5">
          {session.question_ids.map((qid, i) => {
            const q = qById.get(qid);
            if (!q) return null;
            const a = aById.get(qid);
            const correct = a?.is_correct === true;
            const skipped = !a?.selected_option;
            return (
              <details key={qid} className="group rounded-xl border border-ink-200 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3.5">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg text-[12px] font-bold",
                      correct ? "bg-emerald-100 text-emerald-700" : skipped ? "bg-ink-100 text-ink-500" : "bg-rose-100 text-rose-700",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-[14px] font-medium text-ink-900">{q.question_text}</span>
                    <span className="text-[11px] text-ink-400">{q.subject} · {q.topic}</span>
                  </span>
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold sm:block",
                      correct ? "bg-emerald-50 text-emerald-700" : skipped ? "bg-ink-100 text-ink-500" : "bg-rose-50 text-rose-700",
                    )}
                  >
                    {correct ? "Correct" : skipped ? "Skipped" : "Wrong"}
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-ink-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-ink-100 p-4">
                  <p className="text-[15px] font-semibold leading-relaxed text-ink-950">{q.question_text}</p>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, oi) => {
                      const letter = LETTERS[oi];
                      const isCorrect = letter === q.correct_answer;
                      const isChosen = letter === a?.selected_option;
                      return (
                        <div
                          key={letter}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border px-3 py-2 text-[14px]",
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900"
                              : isChosen
                                ? "border-rose-300 bg-rose-50 text-rose-900"
                                : "border-ink-200 text-ink-700",
                          )}
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white/70 text-[11px] font-bold">
                            {letter}
                          </span>
                          {opt}
                          {isCorrect && <CheckCircle2 className="ml-auto size-4 text-emerald-600" />}
                          {isChosen && !isCorrect && <XCircle className="ml-auto size-4 text-rose-600" />}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-3 rounded-xl bg-brand-50 px-3.5 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700">Explanation</p>
                      <p className="mt-1 text-[14px] leading-relaxed text-brand-900">{q.explanation}</p>
                    </div>
                  )}
                  {!correct && <ExplainAnswer questionId={q.id} />}
                </div>
              </details>
            );
          })}
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3 pb-4">
        {analysis.wrong + analysis.unanswered > 0 && (
          <form action={retryMistakesAction}>
            <input type="hidden" name="session_id" value={session.id} />
            <button type="submit" className={buttonClass("primary", "md")}>
              <RefreshCw className="size-4" />
              Retry my {analysis.wrong + analysis.unanswered} mistake{analysis.wrong + analysis.unanswered === 1 ? "" : "s"}
            </button>
          </form>
        )}
        <LinkButton href="/practice">
          Practise again
          <ArrowRight className="size-4" />
        </LinkButton>
        <LinkButton href="/textbooks" variant="outline">
          <BookOpen className="size-4" />
          Open textbooks
        </LinkButton>
        <LinkButton href="/dashboard" variant="ghost">
          Back to dashboard
        </LinkButton>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-ink-200 px-3 py-2.5 text-center">
      <span className={cn("mx-auto flex items-center justify-center gap-1", tone)}>{icon}</span>
      <p className="mt-1 text-lg font-bold text-ink-950">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}
