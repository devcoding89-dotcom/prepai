import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, RefreshCw, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { buildStudyPlan } from "@/lib/engine";
import { Badge, Card, CardBody, CardHeader, CardTitle, EmptyState, ProgressBar } from "@/components/ui/card";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { formatDate, scoreColor } from "@/lib/utils";

export const metadata = { title: "AI reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [sessions, weaknesses] = await Promise.all([
    repo.listSessions(user.id, 100),
    repo.listWeaknesses(user.id, 500),
  ]);
  const completed = sessions.filter((s) => s.status === "completed");
  const plan = buildStudyPlan(weaknesses);
  const bySession = new Map<string, typeof weaknesses>();
  for (const w of weaknesses) bySession.set(w.session_id, [...(bySession.get(w.session_id) ?? []), w]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">AI weakness reports</h1>
        <p className="mt-1 text-sm text-ink-500">
          Every session you complete adds to this picture. Topics that keep appearing rise to the top.
        </p>
      </div>

      {completed.length === 0 ? (
        <Card>
          <CardBody className="pt-6">
            <EmptyState
              icon={<Sparkles className="size-6" />}
              title="No reports yet"
              description="Finish a practice session and your first AI weakness report will appear here."
              action={<LinkButton href="/practice">Start practising</LinkButton>}
            />
          </CardBody>
        </Card>
      ) : (
        <>
          {/* master study plan */}
          <Card>
            <CardHeader>
              <CardTitle>Master study plan</CardTitle>
              <p className="mt-1 text-sm text-ink-500">
                Ranked across all {completed.length} completed sessions by how much each topic is costing you.
              </p>
            </CardHeader>
            <CardBody className="space-y-3">
              {plan.length === 0 && (
                <p className="rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
                  Nothing flagged — you are performing consistently across every topic sampled so far.
                </p>
              )}
              {plan.slice(0, 12).map((p, i) => (
                <div key={p.subject + p.topic} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 p-3.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-[12px] font-bold text-ink-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-ink-950">{p.topic}</p>
                      <Badge tone={p.trend === "improving" ? "success" : p.trend === "worsening" ? "danger" : "neutral"}>
                        {p.trend}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-500">
                      {p.subject} · {p.occurrences} session{p.occurrences > 1 ? "s" : ""} · last seen {formatDate(p.latest)}
                    </p>
                    <ProgressBar
                      value={p.avg_weakness}
                      className="mt-2 max-w-md"
                      tone={p.avg_weakness >= 75 ? "bg-rose-500" : p.avg_weakness >= 50 ? "bg-amber-500" : "bg-emerald-500"}
                    />
                  </div>
                  <div className="flex gap-2">
                    {p.textbook_id && (
                      <Link href={`/textbooks/${p.textbook_id}?from=report`} className={buttonClass("outline", "sm")}>
                        <BookOpen className="size-3.5" />
                        Study
                      </Link>
                    )}
                    <Link
                      href={`/practice?subject=${encodeURIComponent(p.subject)}&topic=${encodeURIComponent(p.topic)}`}
                      className={buttonClass("primary", "sm")}
                    >
                      <RefreshCw className="size-3.5" />
                      Drill
                    </Link>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* per session */}
          <Card>
            <CardHeader>
              <CardTitle>Report history</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {completed.map((s) => {
                const rows = (bySession.get(s.id) ?? []).sort((a, b) => b.weakness_score - a.weakness_score);
                return (
                  <Link
                    key={s.id}
                    href={`/reports/${s.id}`}
                    className="block rounded-xl border border-ink-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink-950">
                          {s.exam} · {(s.subjects ?? []).join(", ") || "Mixed"}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatDate(s.started_at)} · {s.total_questions} questions
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${scoreColor(s.score_percent)}`}>{s.score_percent}%</span>
                        <ArrowRight className="size-4 text-ink-300" />
                      </div>
                    </div>
                    {rows.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {rows.slice(0, 6).map((w) => (
                          <span
                            key={w.id}
                            className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
                              w.weakness_score >= 75
                                ? "bg-rose-50 text-rose-700"
                                : w.weakness_score >= 50
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {w.topic} {w.weakness_score}%
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
