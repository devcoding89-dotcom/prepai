import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart3 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { Badge, Card, CardBody, CardHeader, CardTitle, EmptyState, Stat } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatDateTime, formatDuration, scoreColor } from "@/lib/utils";

export const metadata = { title: "Practice history" };
export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const sessions = await repo.listSessions(user.id, 200);
  const completed = sessions.filter((s) => s.status === "completed");
  const totalQuestions = completed.reduce((a, s) => a + s.total_questions, 0);
  const totalTime = completed.reduce((a, s) => a + (s.time_taken_seconds ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">Practice history</h1>
        <p className="mt-1 text-sm text-ink-500">Every session you have run, with full question-by-question review.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sessions" value={completed.length} />
        <Stat label="Questions" value={totalQuestions} tone="info" />
        <Stat label="Time practised" value={formatDuration(totalTime)} tone="success" />
        <Stat
          label="Best score"
          value={completed.length ? `${Math.max(...completed.map((s) => s.score_percent ?? 0))}%` : "—"}
          tone="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All sessions</CardTitle>
        </CardHeader>
        <CardBody>
          {sessions.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="size-6" />}
              title="No sessions yet"
              description="Your completed practice sessions will be listed here."
              action={<LinkButton href="/practice">Start practising</LinkButton>}
            />
          ) : (
            <div className="divide-y divide-ink-100">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  href={s.status === "in_progress" ? `/practice/session/${s.id}` : `/reports/${s.id}`}
                  className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-[11px] font-bold text-ink-600">
                      {s.exam}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{(s.subjects ?? []).join(", ") || "Mixed"}</p>
                      <p className="text-xs text-ink-500">
                        {formatDateTime(s.started_at)} · {s.total_questions} questions ·{" "}
                        {formatDuration(s.time_taken_seconds)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {s.status === "in_progress" ? (
                      <Badge tone="warning">In progress</Badge>
                    ) : (
                      <span className={`text-base font-bold ${scoreColor(s.score_percent)}`}>{s.score_percent}%</span>
                    )}
                    <ArrowRight className="size-4 text-ink-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
