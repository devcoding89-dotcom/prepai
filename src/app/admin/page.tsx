import Link from "next/link";
import {
  Bell,
  BookOpen,
  Database,
  ListChecks,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { repo } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle, Stat, Badge } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { formatDateTime, formatNaira, scoreColor, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [profiles, questions, sessions, payments, textbooks, counts] = await Promise.all([
    repo.listProfiles({ limit: 500 }),
    repo.listQuestions({ limit: 1 }),
    repo.listAllSessions(200),
    repo.listPayments(undefined, 500),
    repo.listTextbooks({}),
    repo.questionCountsBySubject("ALL"),
  ]);

  const completed = sessions.filter((s) => s.status === "completed");
  const activeSubs = profiles.filter(
    (p) => p.subscription_status === "active" && (!p.subscription_expires_at || new Date(p.subscription_expires_at) > new Date()),
  ).length;
  const successful = payments.filter((p) => p.status === "success");
  const revenue = successful.reduce((a, p) => a + p.amount, 0);
  const last30 = successful.filter((p) => new Date(p.paid_at ?? p.created_at) > new Date(Date.now() - 30 * 864e5));
  const avgScore = completed.length
    ? Math.round(completed.reduce((a, s) => a + (s.score_percent ?? 0), 0) / completed.length)
    : 0;
  const newThisWeek = profiles.filter((p) => new Date(p.created_at) > new Date(Date.now() - 7 * 864e5)).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">Overview</h1>
          <p className="mt-1 text-sm text-ink-500">Platform health at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/announcements" className={buttonClass("outline", "sm")}>
            <Bell className="size-4 text-amber-500" />
            Notices & Alerts
          </Link>
          <Link href="/admin/questions/new" className={buttonClass("outline", "sm")}>
            <Database className="size-4" />
            Add question
          </Link>
          <Link href="/admin/questions/import" className={buttonClass("primary", "sm")}>
            <Upload className="size-4" />
            Bulk import
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Students" value={profiles.length} sub={`${newThisWeek} new this week`} icon={<Users className="size-4.5" />} />
        <Stat label="Active subs" value={activeSubs} sub={`${Math.round((activeSubs / Math.max(profiles.length, 1)) * 100)}% of users`} tone="success" icon={<Wallet className="size-4.5" />} />
        <Stat label="Questions" value={questions.total} sub={`${counts.length} subjects`} tone="info" icon={<Database className="size-4.5" />} />
        <Stat label="Revenue" value={formatNaira(revenue)} sub={`${last30.length} payments in 30 days`} tone="warning" icon={<TrendingUp className="size-4.5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent sessions</CardTitle>
            <Link href="/admin/sessions" className="text-[13px] font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {completed.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-500">No sessions yet.</p>
            ) : (
              <div className="divide-y divide-ink-100">
                {completed.slice(0, 8).map((s) => {
                  const owner = profiles.find((p) => p.id === s.user_id);
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">
                          {owner?.full_name ?? owner?.email ?? "Unknown"}
                        </p>
                        <p className="truncate text-[11px] text-ink-500">
                          {s.exam} · {s.subjects.join(", ")} · {timeAgo(s.started_at)}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${scoreColor(s.score_percent)}`}>{s.score_percent}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Question bank health</CardTitle>
            <Badge tone={questions.total >= 200 ? "success" : questions.total >= 50 ? "warning" : "danger"}>
              {questions.total} total
            </Badge>
          </CardHeader>
          <CardBody className="space-y-2.5">
            {counts.length === 0 && <p className="text-sm text-ink-500">No questions yet — import some.</p>}
            {counts.slice(0, 10).map((c) => (
              <div key={c.subject}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-ink-700">{c.subject}</span>
                  <span className="text-ink-500">{c.count}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, (c.count / Math.max(counts[0].count, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Newest students</CardTitle>
            <Link href="/admin/users" className="text-[13px] font-semibold text-brand-700 hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardBody className="divide-y divide-ink-100">
            {profiles.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserPlus className="size-4 shrink-0 text-ink-300" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{p.full_name ?? p.email}</p>
                    <p className="truncate text-[11px] text-ink-500">
                      {p.email} · {formatDateTime(p.created_at)}
                    </p>
                  </div>
                </div>
                <Badge tone={p.subscription_status === "active" ? "success" : "neutral"}>
                  {p.subscription_status}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Avg score" value={`${avgScore}%`} sub={`${completed.length} completed sessions`} icon={<ListChecks className="size-4.5" />} />
          <Stat label="Textbooks" value={textbooks.length} sub={`${textbooks.filter((t) => t.is_published).length} published`} tone="info" icon={<BookOpen className="size-4.5" />} />
          <Card className="sm:col-span-2">
            <CardBody className="pt-5">
              <p className="text-sm font-semibold text-ink-900">Quick actions</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/admin/questions/new" className={buttonClass("outline", "sm", "justify-start")}>
                  <Database className="size-4" /> New question
                </Link>
                <Link href="/admin/textbooks/new" className={buttonClass("outline", "sm", "justify-start")}>
                  <BookOpen className="size-4" /> New chapter
                </Link>
                <Link href="/admin/questions/import" className={buttonClass("outline", "sm", "justify-start")}>
                  <Upload className="size-4" /> Import CSV/JSON
                </Link>
                <Link href="/admin/settings" className={buttonClass("outline", "sm", "justify-start")}>
                  <Wallet className="size-4" /> Pricing
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
