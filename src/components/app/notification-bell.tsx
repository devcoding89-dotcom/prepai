"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import type { Announcement } from "@/lib/types";

export function NotificationBell({ announcements = [] }: { announcements?: Announcement[] }) {
  const pathname = usePathname();
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
  }, [pathname]);

  const activeAnnouncements = announcements.filter((a) => a.is_active);
  const unreadCount = activeAnnouncements.filter((a) => !readIds.includes(a.id)).length;

  return (
    <Link
      href="/notifications"
      title={unreadCount > 0 ? `${unreadCount} unread notices - click to open` : "Notices & Announcements"}
      aria-label={`View notifications (${unreadCount} unread)`}
      className={`relative grid size-10 place-items-center rounded-xl border transition-colors ${
        pathname === "/notifications"
          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-xs"
          : "border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50 hover:text-ink-950"
      }`}
    >
      <Bell className="size-[19px]" />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
