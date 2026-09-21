"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CreditCard,
  Database,
  LayoutDashboard,
  ListChecks,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/announcements", label: "Notices & Alerts", icon: Bell },
  { href: "/admin/questions", label: "Questions", icon: Database },
  { href: "/admin/questions/import", label: "Import", icon: Upload },
  { href: "/admin/textbooks", label: "Textbooks", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sessions", label: "Sessions", icon: ListChecks },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ horizontal }: { horizontal?: boolean }) {
  const pathname = usePathname();
  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className={cn(horizontal ? "flex gap-1 py-2" : "mt-5 flex flex-col gap-1")}>
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
            horizontal && "shrink-0 whitespace-nowrap",
            active(i.href, i.exact)
              ? "bg-white/10 text-white"
              : "text-ink-300 hover:bg-white/5 hover:text-white",
          )}
        >
          <i.icon className="size-4" />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
