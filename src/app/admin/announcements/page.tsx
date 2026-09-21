import { repo } from "@/lib/db";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";

export const metadata = { title: "Notices & Announcements" };
export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await repo.listAnnouncements();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">
          Student Notices & Announcements
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Broadcast announcements and subject availability notices to students. Notices will appear on the Student Dashboard and Practice screens. Once an issue is fixed, you can delete the notice here.
        </p>
      </div>

      <AnnouncementsManager initialAnnouncements={announcements} />
    </div>
  );
}
