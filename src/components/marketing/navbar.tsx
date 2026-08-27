"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-200",
        scrolled
          ? "border-ink-200/70 bg-white/85 backdrop-blur-xl"
          : "border-transparent bg-white/60 backdrop-blur-sm",
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin-login"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-950"
          >
            Admin
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <Link href="/dashboard" className={buttonClass("primary", "sm", "px-4")}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className={buttonClass("ghost", "sm")}>
                Login
              </Link>
              <Link href="/auth/signup" className={buttonClass("primary", "sm", "px-4")}>
                Get Started
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-xl border border-ink-200 text-ink-700 md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-ink-200 bg-white md:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink-800 hover:bg-ink-100"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/admin-login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink-800 hover:bg-ink-100"
            >
              Admin
            </Link>
            <div className="mt-3 flex flex-col gap-2">
              {signedIn ? (
                <Link href="/dashboard" className={buttonClass("primary", "md", "w-full")}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className={buttonClass("outline", "md", "w-full")}>
                    Login
                  </Link>
                  <Link href="/auth/signup" className={buttonClass("primary", "md", "w-full")}>
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
