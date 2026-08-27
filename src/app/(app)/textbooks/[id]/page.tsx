import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Bookmark, Lock, Sparkles } from "lucide-react";
import { canAccessPaidFeatures, getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { Badge, Card, CardBody } from "@/components/ui/card";
import { buttonClass, LinkButton } from "@/components/ui/button";
import { toggleBookmarkAction } from "@/app/(app)/textbooks/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await repo.getTextbook(id);
  return { title: t ? t.title : "Textbook" };
}

export default async function ReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const { from } = await searchParams;
  const chapter = await repo.getTextbook(id);
  if (!chapter) redirect("/textbooks");

  const [siblings, bookmarks] = await Promise.all([
    repo.listTextbooks({ exam: chapter.exam, subject: chapter.subject, onlyPublished: true }),
    repo.listBookmarks(user.id),
  ]);
  const idx = siblings.findIndex((s) => s.id === chapter.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const bookmarked = bookmarks.some((b) => b.textbook_id === chapter.id);
  const subscribed = await canAccessPaidFeatures(user);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="no-print flex items-center justify-between gap-3">
        <Link href="/textbooks" className={buttonClass("ghost", "sm")}>
          <ArrowLeft className="size-4" />
          Back to library
        </Link>
        <div className="flex items-center gap-2">
          <form action={toggleBookmarkAction}>
            <input type="hidden" name="textbook_id" value={chapter.id} />
            <button className={buttonClass(bookmarked ? "secondary" : "outline", "sm")}>
              <Bookmark className={bookmarked ? "size-4 fill-current" : "size-4"} />
              {bookmarked ? "Saved" : "Save"}
            </button>
          </form>
        </div>
      </div>

      {from === "report" && (
        <Card className="no-print border-brand-300 bg-gradient-to-r from-brand-50 to-violet-50">
          <CardBody className="flex items-start gap-3 pt-5">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-bold text-brand-900">Recommended for you</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-brand-800">
                Your AI weakness report matched this chapter to a topic you are losing marks on. Read it, then
                use the drill button at the bottom to re-test yourself.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{chapter.exam}</Badge>
            <Badge tone="neutral">{chapter.subject}</Badge>
            {chapter.chapter_number && <Badge tone="info">Chapter {chapter.chapter_number}</Badge>}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">{chapter.title}</h1>
          <p className="mt-1 text-sm text-ink-500">{chapter.book_title}</p>
          {chapter.description && <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{chapter.description}</p>}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {chapter.topic_tags.map((tag) => (
              <Link
                key={tag}
                href={`/practice?subject=${encodeURIComponent(chapter.subject)}&topic=${encodeURIComponent(tag)}`}
                className="rounded-lg bg-ink-100 px-2.5 py-1 text-[11px] font-medium text-ink-600 hover:bg-brand-50 hover:text-brand-700"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {!subscribed ? (
        <Card>
          <CardBody className="pt-8 pb-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Lock className="size-6" />
            </span>
            <p className="mt-4 text-lg font-bold text-ink-950">Subscribe to read this chapter</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
              ₦1,000 unlocks the full textbook library, unlimited CBT practice and every AI weakness report for
              30 days.
            </p>
            <LinkButton href="/billing" className="mt-5">
              Unlock for ₦1,000
            </LinkButton>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="pt-6">
            {chapter.file_path ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-brand-900">{chapter.title}</p>
                    <p className="mt-0.5 text-xs text-brand-700">Document loaded from the textbook library.</p>
                  </div>
                  <a href={chapter.file_path} target="_blank" rel="noreferrer" className={buttonClass("primary", "sm")}>
                    Open document
                  </a>
                </div>
                <iframe
                  src={chapter.file_path}
                  title={chapter.title}
                  className="h-[75vh] w-full rounded-xl border border-ink-200"
                />
                <p className="text-xs text-ink-500">
                  If the document area is blank, select <strong>Open document</strong> to view the PDF in a new browser tab.
                </p>
              </div>
            ) : chapter.content_html ? (
              <article className="reader" dangerouslySetInnerHTML={{ __html: chapter.content_html }} />
            ) : (
              <p className="text-sm text-ink-500">This chapter has no content yet.</p>
            )}
          </CardBody>
        </Card>
      )}

      <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-6">
        <div className="flex gap-2">
          {prev ? (
            <Link href={`/textbooks/${prev.id}`} className={buttonClass("outline", "sm")}>
              <ArrowLeft className="size-4" />
              Previous
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/textbooks/${next.id}`} className={buttonClass("outline", "sm")}>
              Next chapter
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/practice?subject=${encodeURIComponent(chapter.subject)}${
              chapter.topic_tags[0] ? `&topic=${encodeURIComponent(chapter.topic_tags[0])}` : ""
            }`}
            className={buttonClass("primary", "sm")}
          >
            Test yourself on this topic
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
