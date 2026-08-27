"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Bot,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { logoutAction } from "@/app/auth/actions";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: ClipboardList },
  { href: "/reports", label: "AI Reports", icon: Sparkles },
  { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { href: "/sessions", label: "History", icon: BarChart3 },
  { href: "/textbooks", label: "Textbooks", icon: BookOpen },
  { href: "/billing", label: "Subscription", icon: CreditCard },
];

const mobileNav = nav.slice(0, 5);

function NavItem({ href, label, icon: Icon, active, onClick }: {
  href: string; label: string; icon: typeof LayoutDashboard; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100 hover:text-ink-950",
      )}
    >
      <Icon className={cn("size-[18px]", active && "text-brand-600")} />
      {label}
    </Link>
  );
}

export function AppShell({
  user,
  paywallEnabled = true,
  children,
}: {
  user: Profile;
  paywallEnabled?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const sidebar = (onClick?: () => void) => (
    <>
      <div className="flex flex-col gap-1">
        {nav.map((n) => (
          <NavItem key={n.href} {...n} active={isActive(n.href)} onClick={onClick} />
        ))}
        {user.role === "admin" && (
          <NavItem href="/admin" label="Admin Panel" icon={Shield} active={isActive("/admin")} onClick={onClick} />
        )}
      </div>

      <div className="mt-auto space-y-3 pt-6">
        {paywallEnabled && user.role !== "admin" && user.subscription_status !== "active" && (
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-violet-700 p-4 text-white">
            <p className="text-sm font-bold">Unlock full practice</p>
            <p className="mt-1 text-[12px] leading-relaxed text-brand-100">
              Subscribe to run timed sessions and get AI reports.
            </p>
            <Link href="/billing" onClick={onClick} className={buttonClass("secondary", "sm", "mt-3 w-full bg-white text-brand-700 hover:bg-brand-50")}>
              Subscribe
            </Link>
          </div>
        )}
        <NavItem href="/settings" label="Settings" icon={Settings} active={isActive("/settings")} onClick={onClick} />
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-rose-50 hover:text-rose-700">
            <LogOut className="size-[18px]" />
            Log out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-ink-50/60">
      {/* ---------- desktop sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink-200 bg-white px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-7 flex flex-1 flex-col">{sidebar()}</nav>
      </aside>

      {/* ---------- mobile drawer ---------- */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white px-4 py-5 animate-fade-in">
            <div className="flex items-center justify-between px-2">
              <Logo />
              <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-xl text-ink-500 hover:bg-ink-100">
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-7 flex flex-1 flex-col">{sidebar(() => setOpen(false))}</nav>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* ---------- top bar ---------- */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-ink-200 text-ink-700 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">
            <Logo mark={false} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {user.target_exam && (
              <span className="hidden rounded-lg bg-brand-50 px-2.5 py-1 text-[12px] font-bold text-brand-700 sm:inline">
                {user.target_exam}
              </span>
            )}
            {paywallEnabled ? (
              <span
                className={cn(
                  "hidden rounded-lg px-2.5 py-1 text-[12px] font-semibold sm:inline",
                  user.subscription_status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700",
                )}
              >
                {user.subscription_status === "active" ? "Active" : "No subscription"}
              </span>
            ) : (
              <span className="hidden rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 sm:inline">
                Full access
              </span>
            )}
            <Link href="/settings" className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 hover:bg-ink-100">
              <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[13px] font-bold text-white">
                {initials(user.full_name, user.email)}
              </span>
              <span className="hidden text-sm font-semibold text-ink-800 sm:block">
                {user.full_name?.split(" ")[0] ?? "Student"}
              </span>
            </Link>
          </div>
        </header>

        <main className="px-4 pb-24 pt-6 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* ---------- mobile bottom nav ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {mobileNav.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold",
                active ? "text-brand-700" : "text-ink-500",
              )}
            >
              <n.icon className={cn("size-5", active && "text-brand-600")} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
