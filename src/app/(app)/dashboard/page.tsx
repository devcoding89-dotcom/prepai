import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardList,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { canAccessPaidFeatures, getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/stats";
import { Badge, Card, CardBody, CardHeader, CardTitle, EmptyState, ProgressBar, Stat } from "@/components/ui/card";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { ScoreTrendChart } from "@/components/app/charts";
import { formatDate, formatDuration, scoreColor, timeAgo } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { stats, sessions, plan } = await getDashboardData(user.id);
  const subscribed = await canAccessPaidFeatures(user);
  const firstName = user.full_name?.split(" ")[0] ?? "there";
  const completed = sessions.filter((s) => s.status === "completed");
  const inProgress = sessions.find((s) => s.status === "in_progress");

  // Exam countdown — days until the student's exam date (if set and in the future).
  const daysToExam = user.exam_date
    ? Math.ceil((new Date(`${user.exam_date}T00:00:00`).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Preparing for <strong className="font-semibold text-ink-700">{user.target_exam}</strong>
            {stats.streak_days > 0 && (
              <>
                {" "}· <Flame className="inline size-4 -mt-0.5 text-amber-500" /> {stats.streak_days}-day streak
              </>
            )}
          </p>
        </div>
        <LinkButton href="/practice" size="md">
          <ClipboardList className="size-4" />
          Start new practice
        </LinkButton>
      </div>

      {daysToExam != null && daysToExam >= 0 && (
        <Card className="overflow-hidden border-brand-200">
          <CardBody className="flex flex-wrap items-center justify-between gap-4 pt-5">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <CalendarClock className="size-6" />
              </span>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-ink-950">
                  {daysToExam === 0
                    ? `Your ${user.target_exam} exam is today — good luck! 🍀`
                    : `${daysToExam} day${daysToExam === 1 ? "" : "s"} until your ${user.target_exam} exam`}
                </p>
                <p className="text-xs text-ink-500">
                  {daysToExam <= 7
                    ? "Final stretch: short daily drills beat one long cram session."
                    : daysToExam <= 30
                      ? "Focus on your weakest topics below — every point counts now."
                      : "Steady practice now makes the last month calm instead of chaotic."}
                </p>
              </div>
            </div>
            <Link href="/practice" className={buttonClass("primary", "sm")}>
              Practise now
            </Link>
          </CardBody>
        </Card>
      )}

      {inProgress && (
        <Card className="border-amber-300 bg-amber-50/70">
          <CardBody className="flex flex-wrap items-center justify-between gap-3 pt-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">You have an unfinished session</p>
                <p className="text-xs text-amber-700">
                  {(inProgress.subjects ?? []).join(", ") || "Practice session"} · started {timeAgo(inProgress.started_at)}
                </p>
              </div>
            </div>
            <Link href={`/practice/session/${inProgress.id}`} className={buttonClass("primary", "sm")}>
              Resume session
            </Link>
          </CardBody>
        </Card>
      )}

      {!subscribed && (
        <Card className="overflow-hidden border-brand-300">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brand-600 to-violet-700 p-5 text-white">
            <div>
              <p className="text-base font-bold">Your subscription is not active</p>
              <p className="mt-1 text-[13px] text-brand-100">
                Subscribe for ₦1,000/month to run timed sessions, unlock AI reports and read every textbook.
              </p>
            </div>
            <Link href="/billing" className={buttonClass("secondary", "md", "bg-white text-brand-700 hover:bg-brand-50")}>
              Subscribe now
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Card>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Practices" value={stats.sessions} sub={`${stats.questions_answered} questions answered`} icon={<ClipboardList className="size-4.5" />} />
        <Stat
          label="Average score"
          value={stats.avg_score != null ? `${stats.avg_score}%` : "—"}
          sub={stats.best_score != null ? `Best: ${stats.best_score}%` : "No sessions yet"}
          tone="success"
          icon={<TrendingUp className="size-4.5" />}
        />
        <Stat
          label="Accuracy"
          value={stats.accuracy != null ? `${stats.accuracy}%` : "—"}
          sub="Correct ÷ attempted"
          tone="info"
          icon={<Target className="size-4.5" />}
        />
        <Stat
          label="Weak topics"
          value={stats.weak_topics}
          sub="From your last 3 sessions"
          tone={stats.weak_topics > 0 ? "warning" : "success"}
          icon={<Sparkles className="size-4.5" />}
        />
      </div>

      {completed.length === 0 ? (
        <Card>
          <CardBody className="pt-6">
            <EmptyState
              icon={<ClipboardList className="size-6" />}
              title="Start your first practice"
              description="You haven't practised yet. Run a CBT session and your AI weakness report will appear here within seconds of submitting."
              action={<LinkButton href="/practice">Start practising</LinkButton>}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* trend */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Score trend</CardTitle>
                <p className="mt-1 text-sm text-ink-500">Your last {stats.trend.length} completed sessions</p>
              </div>
              {stats.trend.length >= 2 && (
                <Badge tone={stats.trend[stats.trend.length - 1].score >= stats.trend[0].score ? "success" : "danger"}>
                  {stats.trend[stats.trend.length - 1].score - stats.trend[0].score >= 0 ? "+" : ""}
                  {stats.trend[stats.trend.length - 1].score - stats.trend[0].score}% overall
                </Badge>
              )}
            </CardHeader>
            <CardBody>
              <ScoreTrendChart data={stats.trend} />
            </CardBody>
          </Card>

          {/* study plan */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Your AI study plan</CardTitle>
                <p className="mt-1 text-sm text-ink-500">Ranked by impact on your score</p>
              </div>
              <Link href="/reports" className="text-[13px] font-semibold text-brand-700 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardBody className="space-y-3">
              {plan.length === 0 && (
                <p className="rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
                  No weak topics detected yet. Keep practising to build a plan.
                </p>
              )}
              {plan.slice(0, 5).map((p, i) => (
                <div key={p.subject + p.topic} className="rounded-xl border border-ink-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        <span className="mr-1.5 text-ink-400">#{i + 1}</span>
                        {p.topic}
                      </p>
                      <p className="text-xs text-ink-500">
                        {p.subject} · seen in {p.occurrences} session{p.occurrences > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge tone={p.trend === "improving" ? "success" : p.trend === "worsening" ? "danger" : "neutral"}>
                      {p.trend}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={p.avg_weakness}
                    className="mt-2.5"
                    tone={p.avg_weakness >= 75 ? "bg-rose-500" : p.avg_weakness >= 50 ? "bg-amber-500" : "bg-emerald-500"}
                  />
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-ink-500">
                      Weakness {p.avg_weakness}%
                    </span>
                    <div className="flex gap-1.5">
                      {p.textbook_id && (
                        <Link href={`/textbooks/${p.textbook_id}`} className={buttonClass("ghost", "sm", "h-7 px-2 text-[11px]")}>
                          <BookOpen className="size-3.5" />
                          Study
                        </Link>
                      )}
                      <Link
                        href={`/practice?topic=${encodeURIComponent(p.topic)}&subject=${encodeURIComponent(p.subject)}`}
                        className={buttonClass("outline", "sm", "h-7 px-2 text-[11px]")}
                      >
                        Drill
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* recent sessions */}
      {completed.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent sessions</CardTitle>
            <Link href="/sessions" className="text-[13px] font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody className="divide-y divide-ink-100">
            {completed.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                href={`/reports/${s.id}`}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-ink-50/60"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-[11px] font-bold text-ink-600">
                    {s.exam}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {(s.subjects ?? []).join(", ") || "Mixed"}
                    </p>
                    <p className="text-xs text-ink-500">
                      {s.total_questions} questions · {formatDuration(s.time_taken_seconds)} · {formatDate(s.started_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${scoreColor(s.score_percent)}`}>{s.score_percent}%</span>
                  <ArrowRight className="size-4 text-ink-300" />
                </div>
              </Link>
            ))}
          </CardBody>
        </Card>
      )}

      {/* footer info */}
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <div className="flex items-center gap-3">
            <Trophy className="size-5 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-ink-900">
                Subscription: {user.subscription_status === "active" ? "Active" : "Inactive"}
              </p>
              <p className="text-xs text-ink-500">
                {user.subscription_expires_at && user.subscription_status === "active"
                  ? `Renews / expires ${formatDate(user.subscription_expires_at)}`
                  : "Subscribe to unlock unlimited practice."}
              </p>
            </div>
          </div>
          <LinkButton href="/billing" variant="outline" size="sm">
            Manage subscription
          </LinkButton>
        </CardBody>
      </Card>
    </div>
  );
}
