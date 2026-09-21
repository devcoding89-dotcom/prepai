"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import type { Announcement, AnnouncementType } from "@/lib/types";

interface AnnouncementsBannerProps {
  announcements: Announcement[];
  className?: string;
  compact?: boolean;
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
    defaultTitle: string;
  }
> = {
  warning: {
    icon: AlertTriangle,
    border: "border-amber-300/80",
    bg: "bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50/40",
    text: "text-amber-950",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    badgeText: "Important Notice",
    defaultTitle: "Notice",
  },
  info: {
    icon: Info,
    border: "border-sky-300/80",
    bg: "bg-gradient-to-r from-sky-50 via-sky-50/70 to-blue-50/40",
    text: "text-sky-950",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
    badgeText: "Update",
    defaultTitle: "Information",
  },
  alert: {
    icon: AlertCircle,
    border: "border-rose-300/80",
    bg: "bg-gradient-to-r from-rose-50 via-rose-50/70 to-red-50/40",
    text: "text-rose-950",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    badgeText: "Urgent Alert",
    defaultTitle: "Alert",
  },
  success: {
    icon: CheckCircle2,
    border: "border-emerald-300/80",
    bg: "bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-teal-50/40",
    text: "text-emerald-950",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    badgeText: "Announcement",
    defaultTitle: "Good News",
  },
};

export function AnnouncementsBanner({
  announcements,
  className = "",
  compact = false,
}: AnnouncementsBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Remember dismissed announcements in sessionStorage so they don't annoy the student
  // during a continuous session, but reappear when re-opened.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("prepai_dismissed_announcements");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => {
      const updated = [...prev, id];
      try {
        sessionStorage.setItem("prepai_dismissed_announcements", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const visibleAnnouncements = announcements.filter(
    (a) => a.is_active && !dismissedIds.includes(a.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAnnouncements.map((ann) => {
        const config = TYPE_CONFIG[ann.type] || TYPE_CONFIG.warning;
        const Icon = config.icon;

        return (
          <div
            key={ann.id}
            role="alert"
            className={`relative rounded-2xl border p-4 sm:p-4.5 shadow-xs transition-all ${config.border} ${config.bg}`}
          >
            <div className="flex items-start gap-3.5 pr-6">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs border ${config.border}`}
              >
                <Icon className={`size-5 ${config.text}`} />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-sm font-extrabold tracking-tight ${config.text}`}>
                    {ann.title || config.defaultTitle}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badgeBg}`}
                  >
                    {ann.target_exam === "ALL" ? config.badgeText : `${ann.target_exam} Notice`}
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed whitespace-pre-wrap ${config.text} opacity-95 ${
                    compact ? "line-clamp-2" : ""
                  }`}
                >
                  {ann.message}
                </p>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => handleDismiss(ann.id)}
              aria-label="Dismiss notice"
              title="Dismiss for this session"
              className={`absolute right-3 top-3 rounded-lg p-1 text-ink-400 hover:bg-black/5 hover:text-ink-700 transition-colors`}
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
