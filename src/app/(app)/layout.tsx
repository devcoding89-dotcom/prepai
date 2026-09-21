import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";
import { repo } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const [settings, announcements] = await Promise.all([
    repo.getSettings(),
    repo.listAnnouncements({ activeOnly: true, exam: user.target_exam || undefined }),
  ]);
  return (
    <AppShell user={user} paywallEnabled={settings.paywall_enabled} announcements={announcements}>
      {children}
    </AppShell>
  );
}
