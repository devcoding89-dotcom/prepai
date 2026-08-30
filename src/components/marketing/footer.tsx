import Link from "next/link";
import { Logo } from "@/components/logo";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#how", label: "How It Works" },
      { href: "/textbooks", label: "Textbooks" },
    ],
  },
  {
    title: "Exams",
    links: [
      { href: "/auth/signup?exam=JAMB", label: "JAMB UTME" },
      { href: "/auth/signup?exam=WAEC", label: "WAEC SSCE" },
      { href: "/auth/signup?exam=NECO", label: "NECO SSCE" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/auth/login", label: "Login" },
      { href: "/auth/signup", label: "Create Account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/refund", label: "Refund Policy" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink-200 bg-ink-50/60">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
              CBT practice with AI weakness detection and matched textbook chapters. Built in Nigeria,
              for Nigerian students.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
              <span className="inline-flex size-2 rounded-full bg-emerald-500" />
              Secure payments by Paystack
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{c.title}</p>
              <ul className="mt-3 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-ink-600 transition-colors hover:text-brand-700">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} PREP CLASS. Built for Nigerian students.
          </p>
          <p className="text-xs text-ink-400">
            Not affiliated with JAMB, WAEC or NECO. Past questions are used for study purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
