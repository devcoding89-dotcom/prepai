import Link from "next/link";
import { CloudDownload, Image as ImageIcon, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { repo } from "@/lib/db";
import { EXAMS, type Difficulty, type Exam } from "@/lib/types";
import { Badge, Card, CardBody, EmptyState } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { buttonClass } from "@/components/ui/button";
import { deleteQuestionAction, toggleQuestionActiveAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PER_PAGE = 25;

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    exam?: string;
    subject?: string;
    difficulty?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const exam = (params.exam || undefined) as Exam | undefined;
  const subject = params.subject || undefined;
  const difficulty = (params.difficulty || undefined) as Difficulty | undefined;
  const search = params.q?.trim() || undefined;

  const [{ total, rows }, facets] = await Promise.all([
    repo.listQuestions({
      exam,
      subject,
      difficulty,
      search,
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
    }),
    repo.questionFacets(exam),
  ]);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const uniqueSubjects = (facets.subjects ?? []).sort();

  const qs = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: params.q, exam: params.exam, subject: params.subject, difficulty: params.difficulty, page: params.page, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v));
    return `/admin/questions?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">Questions</h1>
          <p className="mt-1 text-sm text-ink-500">
            {total} question{total === 1 ? "" : "s"} in the question bank
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/questions/import" className={buttonClass("outline", "sm")}>
            <CloudDownload className="size-4 text-brand-600" />
            Import &amp; Sync API
          </Link>
          <Link href="/admin/questions/new" className={buttonClass("primary", "sm")}>
            <Plus className="size-4" />
            Add question
          </Link>
        </div>
      </div>

      <Card>
        <CardBody>
          <form method="GET" className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
              <Input
                name="q"
                defaultValue={search ?? ""}
                placeholder="Search question text or topic…"
                className="pl-9"
              />
            </div>
            <Select name="exam" defaultValue={exam ?? ""}>
              <option value="">All exams</option>
              {EXAMS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
            <Select name="subject" defaultValue={subject ?? ""}>
              <option value="">All subjects</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select name="difficulty" defaultValue={difficulty ?? ""}>
              <option value="">All levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
            <button type="submit" className={buttonClass("secondary", "md")}>
              Filter
            </button>
          </form>
        </CardBody>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No questions found"
          description="Try adjusting your filters, or add the first question."
          action={
            <Link href="/admin/questions/new" className={buttonClass("primary", "sm")}>
              Add question
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-xs text-ink-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Question</th>
                  <th className="px-4 py-3 font-semibold">Exam</th>
                  <th className="px-4 py-3 font-semibold">Subject / topic</th>
                  <th className="px-4 py-3 font-semibold">Ans</th>
                  <th className="px-4 py-3 font-semibold">Level</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((q) => (
                  <tr key={q.id} className="hover:bg-ink-50/60">
                    <td className="max-w-md px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        {q.image_url && (
                          <span
                            title="Has Diagram/Image"
                            className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200"
                          >
                            <ImageIcon className="size-3" /> Diagram
                          </span>
                        )}
                        <div>
                          <p className="line-clamp-2 font-medium text-ink-900">{q.question_text}</p>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-400">
                            {q.options.length} options{q.year ? ` · ${q.year}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="brand">{q.exam}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-800">{q.subject}</p>
                      <p className="text-[11px] text-ink-500">{q.topic}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-[12px] font-bold text-emerald-700">
                        {q.correct_answer}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                          q.difficulty === "hard"
                            ? "bg-rose-50 text-rose-700"
                            : q.difficulty === "easy"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={toggleQuestionActiveAction}>
                        <input type="hidden" name="id" value={q.id} />
                        <button className={cn("text-[11px] font-semibold", q.is_active ? "text-emerald-600" : "text-ink-400")}>
                          {q.is_active ? "● Active" : "○ Hidden"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/questions/${q.id}`}
                          className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <form action={deleteQuestionAction}>
                          <input type="hidden" name="id" value={q.id} />
                          <button className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 className="size-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-sm">
              <span className="text-ink-500">
                Page {page} of {pages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={qs({ page: page - 1 })} className={buttonClass("outline", "sm")}>
                    Previous
                  </Link>
                )}
                {page < pages && (
                  <Link href={qs({ page: page + 1 })} className={buttonClass("outline", "sm")}>
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
