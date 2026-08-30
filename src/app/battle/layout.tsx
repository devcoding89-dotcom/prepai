import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";
import { repo } from "@/lib/db";
import { Logo } from "@/components/logo";
import { Swords, UserCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const settings = await repo.getSettings();

  // If user is logged in, wrap with the full AppShell
  if (user) {
    return (
      <AppShell user={user} paywallEnabled={settings.paywall_enabled}>
        {children}
      </AppShell>
    );
  }

  // If guest, show a clean, focused header without requiring login
  return (
    <div className="min-h-screen bg-ink-50/50">
      <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
            <span className="hidden h-5 w-px bg-ink-200 sm:inline" />
            <Link
              href="/battle"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700"
            >
              <Swords className="size-4" />
              Battle Room
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login?next=/battle"
              className="flex items-center gap-1.5 text-xs font-bold text-ink-600 hover:text-brand-600"
            >
              <UserCircle className="size-4" />
              Sign in
            </Link>
            <Link
              href="/auth/signup?next=/battle"
              className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
