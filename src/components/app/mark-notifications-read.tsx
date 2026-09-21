"use client";

import { useEffect } from "react";

export function MarkNotificationsRead({ ids }: { ids: string[] }) {
  useEffect(() => {
    if (!ids || ids.length === 0) return;
    try {
      localStorage.setItem("prepai_read_announcements", JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [ids]);

  return null;
}
