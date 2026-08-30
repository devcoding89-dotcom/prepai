import { Search, ShieldCheck, UserCog } from "lucide-react";
import { repo } from "@/lib/db";
import { Badge, Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonClass } from "@/components/ui/button";
import { updateUserAction } from "@/app/admin/actions";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [profiles, sessions] = await Promise.all([
    repo.listProfiles({ search: q, limit: 300 }),
    repo.listAllSessions(1000),
  ]);
  const sessionCount = new Map<string, number>();
  for (const s of sessions) sessionCount.set(s.user_id, (sessionCount.get(s.user_id) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">Users</h1>
        <p className="mt-1 text-sm text-ink-500">{profiles.length} accounts. Grant access manually when needed.</p>
      </div>

      <Card>
        <CardBody className="pt-5">
          <form className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-ink-400" />
              <Input name="q" defaultValue={q} placeholder="Search by name or email…" className="pl-9" />
            </div>
            <button className={buttonClass("secondary", "md")}>Search</button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-ink-200 bg-ink-50 text-[11px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Exam</th>
                <th className="px-4 py-3 font-semibold">Sessions</th>
                <th className="px-4 py-3 font-semibold">Subscription</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[12px] font-bold text-white">
                        {initials(p.full_name, p.email)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-semibold text-ink-900">
                          {p.full_name ?? "—"}
                          {p.role === "admin" && <ShieldCheck className="size-3.5 text-brand-600" />}
                        </p>
                        <p className="truncate text-[11px] text-ink-500">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.target_exam ? <Badge tone="brand">{p.target_exam}</Badge> : <span className="text-ink-400">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-800">{sessionCount.get(p.id) ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.subscription_status === "active" ? "success" : p.subscription_status === "expired" ? "warning" : "neutral"}>
                      {p.subscription_status}
                    </Badge>
                    {p.subscription_expires_at && (
                      <p className="mt-0.5 text-[11px] text-ink-500">until {formatDate(p.subscription_expires_at)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-600">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <ActionButton id={p.id} op="grant" label="+30 days" tone="success" />
                      {p.subscription_status === "active" && <ActionButton id={p.id} op="revoke" label="Revoke" tone="danger" />}
                      {p.role === "student" ? (
                        <>
                          <ActionButton id={p.id} op="make_admin" label="Make admin" tone="neutral" />
                          <ActionButton id={p.id} op="delete" label="Delete" tone="danger" />
                        </>
                      ) : (
                        <ActionButton id={p.id} op="make_student" label="Make student" tone="neutral" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {profiles.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <UserCog className="size-8 text-ink-300" />
            <p className="text-sm text-ink-500">No users match that search.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function ActionButton({
  id,
  op,
  label,
  tone,
}: {
  id: string;
  op: string;
  label: string;
  tone: "success" | "danger" | "neutral";
}) {
  const cls = {
    success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
    neutral: "bg-ink-100 text-ink-700 hover:bg-ink-200",
  }[tone];
  return (
    <form action={updateUserAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <button className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${cls}`}>
        {label}
      </button>
    </form>
  );
}
