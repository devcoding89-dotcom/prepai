import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Info,
  Megaphone,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { MarkNotificationsRead } from "@/components/app/mark-notifications-read";
import { formatDateTime, timeAgo } from "@/lib/utils";
import type { Announcement, AnnouncementType } from "@/lib/types";

export const metadata = { title: "Notices & Announcements" };
export const dynamic = "force-dynamic";

const TYPE_CONFIG: Record<
  AnnouncementType,
  {
    icon: typeof Info;
    border: string;
    bg: string;
    headerBg: string;
    text: string;
    badgeTone: "warning" | "info" | "danger" | "success";
    badgeText: string;
    iconBg: string;
  }
> = {
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200/90 shadow-sm",
    bg: "bg-white",
    headerBg: "bg-amber-50/80 border-b border-amber-100",
    text: "text-amber-950",
    badgeTone: "warning",
    badgeText: "Subject & Exam Notice",
    iconBg: "bg-amber-100 text-amber-800 border-amber-300/80",
  },
  info: {
    icon: Info,
    border: "border-sky-200/90 shadow-sm",
    bg: "bg-white",
    headerBg: "bg-sky-50/80 border-b border-sky-100",
    text: "text-sky-950",
    badgeTone: "info",
    badgeText: "Platform Update",
    iconBg: "bg-sky-100 text-sky-800 border-sky-300/80",
  },
  alert: {
    icon: AlertCircle,
    border: "border-rose-200/90 shadow-sm",
    bg: "bg-white",
    headerBg: "bg-rose-50/80 border-b border-rose-100",
    text: "text-rose-950",
    badgeTone: "danger",
    badgeText: "Urgent Alert",
    iconBg: "bg-rose-100 text-rose-800 border-rose-300/80",
  },
  success: {
    icon: CheckCircle2,
    border: "border-emerald-200/90 shadow-sm",
    bg: "bg-white",
    headerBg: "bg-emerald-50/80 border-b border-emerald-100",
    text: "text-emerald-950",
    badgeTone: "success",
    badgeText: "Important Update",
    iconBg: "bg-emerald-100 text-emerald-800 border-emerald-300/80",
  },
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const announcements = await repo.listAnnouncements({
    activeOnly: true,
    exam: user.target_exam || undefined,
  });

  const activeIds = announcements.map((a) => a.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Client component to clear unread status */}
      <MarkNotificationsRead ids={activeIds} />

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-600 hover:text-ink-950 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {announcements.length > 0 && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200/60">
            {announcements.length} Active {announcements.length === 1 ? "Notice" : "Notices"}
          </span>
        )}
      </div>

      {/* Page Header */}
      <div className="rounded-3xl border border-ink-200/80 bg-gradient-to-br from-white via-ink-50/30 to-brand-50/20 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Megaphone className="size-4" />
              Examination Notice Board
            </div>
            <h1 className="text-2xl font-black tracking-tight text-ink-950 sm:text-3xl">
              Notices & Announcements
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-600">
              Official announcements from the administration regarding subject availability, questions compilation, and CBT platform updates.
            </p>
          </div>

          <Link href="/practice" className={buttonClass("primary", "sm", "gap-2 shrink-0")}>
            <ClipboardList className="size-4" />
            Go to Practice
          </Link>
        </div>
      </div>

      {/* Notices List */}
      {announcements.length === 0 ? (
        <Card className="border-dashed border-ink-200 py-16 text-center">
          <CardBody className="space-y-3">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
              <Bell className="size-8" />
            </div>
            <h2 className="text-lg font-bold text-ink-900">No active notices right now</h2>
            <p className="max-w-md mx-auto text-sm text-ink-500">
              All CBT questions and examination modules are running smoothly. Any future updates or subject additions from the admin will appear right here.
            </p>
            <div className="pt-2">
              <LinkButton href="/dashboard" variant="outline" size="sm">
                Return to Dashboard
              </LinkButton>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-5">
          {announcements.map((ann, idx) => {
            const config = TYPE_CONFIG[ann.type] || TYPE_CONFIG.warning;
            const Icon = config.icon;

            return (
              <div
                key={ann.id}
                className={`overflow-hidden rounded-3xl border ${config.border} ${config.bg}`}
              >
                {/* Header bar of the notice card */}
                <div className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${config.headerBg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-xl border ${config.iconBg} shadow-2xs`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h2 className={`text-base font-extrabold tracking-tight ${config.text}`}>
                        {ann.title}
                      </h2>
                      <p className="text-[11px] font-medium text-ink-500">
                        Notice #{idx + 1} · {timeAgo(ann.created_at)} ({formatDateTime(ann.created_at)})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone={config.badgeTone}>{config.badgeText}</Badge>
                    <Badge tone="neutral">
                      {ann.target_exam === "ALL" ? "All Exams" : ann.target_exam}
                    </Badge>
                  </div>
                </div>

                {/* Body of the notice card with generous, clear layout */}
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="text-base sm:text-lg leading-relaxed text-ink-800 whitespace-pre-wrap font-normal">
                    {ann.message}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4 text-xs text-ink-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      Broadcasted to all students preparing for{" "}
                      <strong className="text-ink-700 font-semibold">
                        {ann.target_exam === "ALL" ? "JAMB, WAEC & NECO" : ann.target_exam}
                      </strong>
                    </span>

                    <Link
                      href="/practice"
                      className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Start Practice Session <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
