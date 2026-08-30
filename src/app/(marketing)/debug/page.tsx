import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { repo, usingSupabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "System & Session Diagnostics" };

export default async function DebugPage() {
  const jar = await cookies();
  const raw = jar.get("prepai_session")?.value;
  const user = await getCurrentUser();

  // Test DB queries
  let dbStatus = "Checking...";
  let dbError: string | null = null;
  let settingsOk = false;
  let sessionsCount: number | null = null;
  let weaknessesCount: number | null = null;

  try {
    const settings = await repo.getSettings();
    settingsOk = Boolean(settings);
    if (user) {
      const sessions = await repo.listSessions(user.id, 10);
      sessionsCount = sessions.length;
      const weaknesses = await repo.listWeaknesses(user.id, 10);
      weaknessesCount = weaknesses.length;
    }
    dbStatus = "Connected & Healthy";
  } catch (err: unknown) {
    dbStatus = "Query Failed";
    dbError = err instanceof Error ? err.message : String(err);
  }

  const envChecks = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", status: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", status: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
    { key: "SUPABASE_SERVICE_ROLE_KEY", status: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { key: "SUPABASE_DB_SCHEMA", value: process.env.SUPABASE_DB_SCHEMA || "prepai (default)" },
    { key: "AUTH_SECRET", status: Boolean(process.env.AUTH_SECRET), note: !process.env.AUTH_SECRET ? "Using deterministic fallback" : "Configured" },
    { key: "NEXT_PUBLIC_SITE_URL", value: process.env.NEXT_PUBLIC_SITE_URL || "(unset)" },
  ];

  const rows: [string, string][] = [
    ["Signed in?", user ? `YES — ${user.email} (${user.role})` : "NO"],
    ["User ID", user?.id ?? "—"],
    ["Cookie received", raw ? `yes (${raw.length} chars)` : "NO"],
    ["Database Driver", usingSupabase ? "Supabase" : "Local JSON"],
    ["Database Status", dbStatus],
    ["App Settings loaded", settingsOk ? "YES" : "NO"],
    ["Target exam", user?.target_exam ?? "—"],
    ["User Sessions in DB", sessionsCount !== null ? String(sessionsCount) : "N/A"],
    ["User Weaknesses in DB", weaknessesCount !== null ? String(weaknessesCount) : "N/A"],
  ];

  return (
    <div className="container-x max-w-2xl py-12 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">System Diagnostics</h1>
        <p className="mt-1 text-sm text-ink-500">
          Check live server configuration, database connectivity, and session status.
        </p>
      </div>

      {dbError ? (
        <div className="rounded-2xl bg-rose-600 p-5 text-white">
          <p className="text-lg font-bold">❌ Database Query Error</p>
          <p className="mt-1 font-mono text-xs bg-rose-700/80 p-3 rounded-lg mt-2 break-all">{dbError}</p>
        </div>
      ) : (
        <div className={`rounded-2xl p-5 text-white ${user ? "bg-emerald-600" : "bg-blue-600"}`}>
          <p className="text-lg font-bold">
            {user ? "✅ Signed in & Database Operational" : "ℹ️ Database Operational (Not Signed In)"}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {user
              ? `Logged in as ${user.email}. Dashboard should load smoothly.`
              : "Database connection is responding. Sign in to test student dashboard queries."}
          </p>
        </div>
      )}

      {/* Environment variable overview */}
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-bold text-ink-900 mb-3">Server Environment Check</h2>
        <div className="space-y-2">
          {envChecks.map((e) => (
            <div key={e.key} className="flex items-center justify-between text-xs py-1 border-b border-ink-100 last:border-0">
              <span className="font-mono text-ink-700">{e.key}</span>
              <span className="font-semibold text-ink-900">
                {e.value !== undefined ? (
                  <span className="text-brand-600">{e.value}</span>
                ) : e.status ? (
                  <span className="text-emerald-600">✅ Set</span>
                ) : (
                  <span className="text-amber-600">⚠️ Unset {e.note ? `(${e.note})` : ""}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <dl className="divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 px-5 py-3">
            <dt className="text-sm text-ink-500">{k}</dt>
            <dd className="text-right text-sm font-semibold text-ink-900 break-all">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
