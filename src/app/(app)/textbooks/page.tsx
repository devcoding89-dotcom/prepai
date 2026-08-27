import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Bookmark, Search } from "lucide-react";
import { canAccessPaidFeatures, getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { Card, CardBody, EmptyState } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonClass, LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXAMS, type Exam } from "@/lib/types";

export const metadata = { title: "Textbooks" };
export const dynamic = "force-dynamic";

export default async function TextbooksPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; q?: string; exam?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const sp = await searchParams;
  const requestedExam = sp.exam as Exam;
  const exam = EXAMS.includes(requestedExam) ? requestedExam : "ALL";

  const [all, chapters, bookmarks] = await Promise.all([
    repo.listTextbooks({ exam, onlyPublished: true }),
    repo.listTextbooks({ exam, onlyPublished: true, subject: sp.subject, search: sp.q }),
    repo.listBookmarks(user.id),
  ]);
  const subjects = [...new Set(all.map((t) => t.subject))].sort();
  const marked = new Set(bookmarks.map((b) => b.textbook_id));
  const subscribed = await canAccessPaidFeatures(user);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">Textbook library</h1>
          <p className="mt-1 text-sm text-ink-500">
            Chapters tagged by topic, so your weakness report can point you straight at the right pages.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/textbooks"
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-[12px] font-bold transition-colors",
              exam === "ALL"
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-ink-200 bg-white text-ink-500 hover:border-brand-300 hover:text-brand-700",
            )}
          >
            All exams
          </Link>
          {EXAMS.map((option) => (
            <Link
              key={option}
              href={`/textbooks?exam=${option}`}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[12px] font-bold transition-colors",
                exam === option
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-white text-ink-500 hover:border-brand-300 hover:text-brand-700",
              )}
            >
              {option}
            </Link>
          ))}
        </div>
      </div>

      {!subscribed && (
        <Card className="border-brand-300 bg-brand-50/60">
          <CardBody className="flex flex-wrap items-center justify-between gap-3 pt-5">
            <p className="text-sm text-brand-900">
              <strong className="font-semibold">Reading requires an active subscription.</strong> You can browse
              the catalogue for free.
            </p>
            <LinkButton href="/billing" size="sm">
              Subscribe for ₦1,000
            </LinkButton>
          </CardBody>
        </Card>
      )}

      {/* filters */}
      <form className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="exam" value={exam} />
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-ink-400" />
          <Input name="q" defaultValue={sp.q} placeholder="Search chapters, books or topics…" className="pl-9" />
        </div>
        <button className={buttonClass("primary", "md")}>Search</button>
      </form>

      <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <FilterPill href={`/textbooks?exam=${exam}`} active={!sp.subject} label="All subjects" />
        {subjects.map((s) => (
          <FilterPill
            key={s}
            href={`/textbooks?exam=${exam}&subject=${encodeURIComponent(s)}`}
            active={sp.subject === s}
            label={s}
          />
        ))}
      </div>

      {chapters.length === 0 ? (
        <Card>
          <CardBody className="pt-6">
            <EmptyState
              icon={<BookOpen className="size-6" />}
              title="No chapters found"
              description="Nothing matches that filter yet. An admin can upload chapters from the admin panel."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((t) => (
            <Link
              key={t.id}
              href={`/textbooks/${t.id}`}
              className="group flex flex-col rounded-2xl border border-ink-200 bg-white p-5 transition-all card-shadow hover:-translate-y-0.5 hover:border-brand-300"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <BookOpen className="size-5" />
                </span>
                {marked.has(t.id) && <Bookmark className="size-4 fill-amber-400 text-amber-500" />}
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                {t.subject}
                {t.chapter_number ? ` · Chapter ${t.chapter_number}` : ""}
              </p>
              <p className="mt-1 text-[15px] font-bold leading-snug text-ink-950">{t.title}</p>
              <p className="mt-0.5 text-xs text-ink-500">{t.book_title}</p>
              {t.description && <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-600">{t.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.topic_tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="mt-4 text-[13px] font-bold text-brand-700 group-hover:underline">
                Read chapter →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-colors",
        active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
      )}
    >
      {label}
    </Link>
  );
}
