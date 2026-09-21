"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Megaphone,
  X,
} from "lucide-react";
import type { Announcement, AnnouncementType } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface NotificationsProps {
  announcements: Announcement[];
}

const TYPE_CONFIG: Record<
  AnnouncementType,
  {
    icon: typeof Info;
    border: string;
    bg: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
  }
> = {
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200",
    bg: "bg-amber-50/50",
    text: "text-amber-950",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300/80",
    badgeText: "Important Notice",
    iconBg: "bg-amber-100 text-amber-700 border-amber-300/60",
  },
  info: {
    icon: Info,
    border: "border-sky-200",
    bg: "bg-sky-50/50",
    text: "text-sky-950",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-300/80",
    badgeText: "Platform Update",
    iconBg: "bg-sky-100 text-sky-700 border-sky-300/60",
  },
  alert: {
    icon: AlertCircle,
    border: "border-rose-200",
    bg: "bg-rose-50/50",
    text: "text-rose-950",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-300/80",
    badgeText: "Urgent Alert",
    iconBg: "bg-rose-100 text-rose-700 border-rose-300/60",
  },
  success: {
    icon: CheckCircle2,
    border: "border-emerald-200",
    bg: "bg-emerald-50/50",
    text: "text-emerald-950",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300/80",
    badgeText: "Good News",
    iconBg: "bg-emerald-100 text-emerald-700 border-emerald-300/60",
  },
};

/**
 * Shared state manager or event trigger so clicking the notification
 * bell in the header OR the button on the dashboard opens the same view.
 */
let openModalListeners: Array<() => void> = [];

export function openNotificationsModal() {
  openModalListeners.forEach((listener) => listener());
}

export function NotificationBell({ announcements }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("prepai_read_announcements");
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    const handleExternalOpen = () => setIsOpen(true);
    openModalListeners.push(handleExternalOpen);
    return () => {
      openModalListeners = openModalListeners.filter((l) => l !== handleExternalOpen);
    };
  }, []);

  const activeAnnouncements = announcements.filter((a) => a.is_active);
  const unreadCount = activeAnnouncements.filter((a) => !readIds.includes(a.id)).length;

  const handleOpen = () => {
    setIsOpen(true);
    // Mark as read
    const allIds = activeAnnouncements.map((a) => a.id);
    setReadIds(allIds);
    try {
      localStorage.setItem("prepai_read_announcements", JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`View notifications (${unreadCount} unread)`}
        className="relative grid size-10 place-items-center rounded-xl border border-ink-200 bg-white text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <Bell className="size-[19px]" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationsDialog
          announcements={activeAnnouncements}
          onClose={handleClose}
        />
      )}
    </>
  );
}

export function DashboardNoticeButton({ announcements }: NotificationsProps) {
  const activeAnnouncements = announcements.filter((a) => a.is_active);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("prepai_read_announcements");
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  if (activeAnnouncements.length === 0) return null;

  const unreadCount = activeAnnouncements.filter((a) => !readIds.includes(a.id)).length;
  const firstNotice = activeAnnouncements[0];

  return (
    <button
      type="button"
      onClick={openNotificationsModal}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-white to-orange-50/40 p-3.5 sm:px-4.5 sm:py-3 transition-all hover:border-amber-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0 text-left">
        <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-rose-600 ring-2 ring-white" />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-950">
              {unreadCount > 0 ? "New Notice Available" : "Notice Board"}
            </span>
            <span className="rounded-md bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200/60">
              {activeAnnouncements.length} {activeAnnouncements.length === 1 ? "Notice" : "Notices"}
            </span>
          </div>
          <p className="truncate text-xs text-ink-600 font-medium mt-0.5">
            {firstNotice.title}: {firstNotice.message}
          </p>
        </div>
      </div>

      <span className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-200/80 group-hover:bg-amber-100/50 transition-colors shadow-2xs">
        Click to View Details →
      </span>
    </button>
  );
}

function NotificationsDialog({
  announcements,
  onClose,
}: {
  announcements: Announcement[];
  onClose: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-ink-200 bg-white shadow-2xl overflow-hidden z-10 animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/70 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200/50">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-ink-950">
                Notices & Announcements
              </h2>
              <p className="text-xs text-ink-500">
                Official updates from the CBT examination administration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          {announcements.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
                <Bell className="size-7" />
              </div>
              <p className="text-sm font-bold text-ink-800">No active notices right now</p>
              <p className="text-xs text-ink-500 max-w-xs mx-auto">
                All examination systems are running smoothly. Any future updates or subject additions will appear here.
              </p>
            </div>
          ) : (
            announcements.map((ann) => {
              const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.warning;
              const Icon = cfg.icon;

              return (
                <div
                  key={ann.id}
                  className={`rounded-2xl border p-5 transition-all shadow-xs ${cfg.border} ${cfg.bg}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border ${cfg.iconBg} shadow-2xs`}
                    >
                      <Icon className="size-5" />
                    </div>

                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-base font-extrabold tracking-tight ${cfg.text}`}>
                            {ann.title}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${cfg.badgeBg}`}
                          >
                            {ann.target_exam === "ALL" ? cfg.badgeText : `${ann.target_exam} Notice`}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-ink-500">
                          {timeAgo(ann.created_at)}
                        </span>
                      </div>

                      <div className={`text-sm leading-relaxed whitespace-pre-wrap font-medium ${cfg.text} opacity-95`}>
                        {ann.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/50 px-6 py-3.5">
          <p className="text-xs text-ink-500">
            {announcements.length} {announcements.length === 1 ? "notice" : "notices"} available
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ink-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-ink-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
