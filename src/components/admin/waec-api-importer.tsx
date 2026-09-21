"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  CloudDownload,
  Database,
  ExternalLink,
  Eye,
  ImageIcon,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge, Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ALOC_SUBJECTS, SUBJECTS_NOT_IN_ALOC } from "@/lib/aloc";
import { type Exam, type Question } from "@/lib/types";
import { cn } from "@/lib/utils";

type PreviewQuestion = Omit<Question, "id" | "created_at">;

export function WaecApiImporter() {
  const [exam, setExam] = useState<Exam>("WAEC");
  const [subjectSlug, setSubjectSlug] = useState<string>("mathematics");
  const [count, setCount] = useState<number>(40);
  const [year, setYear] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([]);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const selectedSubjectObj = ALOC_SUBJECTS.find((s) => s.slug === subjectSlug);
  // WAEC/NECO call it "Financial Accounting", JAMB calls it "Accounting"
  const subjectName =
    subjectSlug === "accounting" && (exam === "WAEC" || exam === "NECO")
      ? "Financial Accounting"
      : selectedSubjectObj?.name || "Mathematics";

  const handleFetch = async (saveDirectly: boolean) => {
    setBusy(true);
    setError(null);
    setSuccessMessage(null);
    if (!saveDirectly) {
      setPreviewQuestions([]);
    }

    try {
      const res = await fetch("/api/admin/questions/sync-aloc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          subjectName,
          exam,
          count,
          year: year ? Number(year) : undefined,
          saveToDb: saveDirectly,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        totalFetched?: number;
        totalValid?: number;
        duplicatesSkipped?: number;
        newCount?: number;
        inserted?: number;
        questions?: PreviewQuestion[];
      };

      if (!res.ok || data.error) {
        setError(data.error || "Failed to fetch questions from the WAEC API.");
        return;
      }

      const dups = data.duplicatesSkipped ?? 0;
      const newItems = data.newCount ?? data.inserted ?? 0;

      if (saveDirectly) {
        if (newItems === 0) {
          setError(
            `All ${data.totalFetched ?? 0} questions fetched were already in your bank! Select a specific year (e.g. 2021, 2020) to get fresh questions.`
          );
        } else {
          setSuccessMessage(
            `Successfully saved ${newItems} new ${exam} ${subjectName} questions!${dups > 0 ? ` (${dups} duplicates were already in your bank and were skipped).` : ""}`
          );
        }
        setPreviewQuestions([]);
      } else {
        if (newItems === 0) {
          setError(
            `All ${data.totalFetched ?? 0} questions fetched were already in your bank! Select a specific year to find new ones.`
          );
        } else if (dups > 0) {
          setSuccessMessage(
            `Found ${newItems} brand-new questions (${dups} already in database were skipped). Review them below.`
          );
        }
        setPreviewQuestions(data.questions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error reaching the server.");
    } finally {
      setBusy(false);
    }
  };

  const handleSavePreview = async () => {
    if (!previewQuestions.length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: previewQuestions,
          dryRun: false,
          fallbackExam: exam,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string; inserted?: number };
      if (!res.ok || data.error) {
        setError(data.error || "Failed to save questions to database.");
        return;
      }

      setSavedCount(data.inserted ?? previewQuestions.length);
      setSuccessMessage(
        `Successfully saved ${data.inserted ?? previewQuestions.length} ${exam} ${subjectName} questions into the database!`
      );
      setPreviewQuestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error saving questions.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-brand-200/80 bg-gradient-to-br from-brand-50/40 via-white to-sky-50/30">
        <CardHeader className="border-b border-brand-100/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
                <CloudDownload className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-ink-950">
                  WAEC &amp; JAMB Past Questions API Sync
                </CardTitle>
                <p className="text-xs text-ink-500">
                  Live connection to official Nigerian examination question bank (ALOC API). No manual typing.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                <ShieldCheck className="size-3.5 text-blue-600" />
                Duplicate Blocker Active
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                API Connected
              </span>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-5 pt-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                Examination Body
              </label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value as Exam)}
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink-900 shadow-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="WAEC">WAEC (WASSCE)</option>
                <option value="JAMB">JAMB (UTME)</option>
                <option value="NECO">NECO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                Subject ({ALOC_SUBJECTS.length} available)
              </label>
              <select
                value={subjectSlug}
                onChange={(e) => setSubjectSlug(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-900 shadow-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {ALOC_SUBJECTS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                Questions to Fetch
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-900 shadow-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value={10}>10 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={30}>30 Questions</option>
                <option value={40}>40 Questions (1 Batch)</option>
                <option value={80}>80 Questions (2 Batches)</option>
                <option value={120}>120 Questions (3 Batches)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                Target Year (Optional)
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-900 shadow-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Any / Mixed Years</option>
                {Array.from({ length: 24 }, (_, i) => 2023 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleFetch(false)}
              disabled={busy}
              className="gap-2"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
              Fetch &amp; Preview Questions
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() => handleFetch(true)}
              disabled={busy}
              className="gap-2 bg-brand-600 hover:bg-brand-700"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <CloudDownload className="size-4" />}
              1-Click Fetch &amp; Save ({count} Qs)
            </Button>

            <span className="text-xs text-ink-500">
              Pulls directly from verified WAEC question banks with answer keys &amp; solutions.
            </span>
          </div>

          {error && <Alert tone="danger">{error}</Alert>}

          {successMessage && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-900">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
              <Link
                href={`/admin/questions?exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(subjectName)}`}
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline text-xs"
              >
                View in Question Bank <ExternalLink className="size-3.5" />
              </Link>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Notice: subjects NOT available from ALOC API */}
      <Card className="border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
        <CardBody className="flex flex-col gap-3 py-4">
          <div className="flex items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Some subjects are not available from the ALOC API
              </p>
              <p className="mt-0.5 text-xs text-amber-800/80">
                The following subjects don&apos;t have past questions in the ALOC database. Use{" "}
                <strong>Manual Entry</strong>, <strong>Bulk Paste/Import</strong>, or <strong>AI Generation</strong> to add questions for them.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-[2.625rem]">
            {SUBJECTS_NOT_IN_ALOC.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full bg-amber-100/80 px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-200/60"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pl-[2.625rem]">
            <Link
              href="/admin/questions/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 border border-brand-200 shadow-xs hover:bg-brand-50 transition-colors"
            >
              <BookOpen className="size-3.5" />
              Add Question Manually
            </Link>
            <Link
              href="/admin/questions/import"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 border border-brand-200 shadow-xs hover:bg-brand-50 transition-colors"
            >
              <CloudDownload className="size-3.5" />
              Bulk Paste / Import
            </Link>
          </div>
        </CardBody>
      </Card>

      {previewQuestions.length > 0 && (
        <Card className="border-ink-200 shadow-sm">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/60 pb-3.5">
            <div>
              <CardTitle className="text-base font-bold text-ink-900">
                Fetched {previewQuestions.length} Questions for {exam} - {subjectName}
              </CardTitle>
              <p className="text-xs text-ink-500">
                Review below, then click &ldquo;Save All to Database&rdquo; to add them to your live bank.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={handleSavePreview}
              disabled={busy}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4" />}
              Save All {previewQuestions.length} Questions to Database
            </Button>
          </CardHeader>

          <div className="divide-y divide-ink-100 max-h-[42rem] overflow-y-auto">
            {previewQuestions.map((q, idx) => (
              <div key={idx} className="p-4 hover:bg-ink-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-xs font-bold text-ink-700">
                      {idx + 1}
                    </span>
                    <div className="space-y-2">
                      <p className="font-medium text-ink-900 text-sm">{q.question_text}</p>

                      {q.image_url && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 text-xs text-brand-700">
                          <ImageIcon className="size-3.5" /> Has Diagram / Image
                        </div>
                      )}

                      <div className="grid gap-1.5 sm:grid-cols-2 pt-1 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const letter = ["A", "B", "C", "D", "E"][optIdx];
                          const isCorrect = letter === q.correct_answer;
                          return (
                            <div
                              key={optIdx}
                              className={cn(
                                "flex items-start gap-2 rounded-lg border px-2.5 py-1.5",
                                isCorrect
                                  ? "border-emerald-300 bg-emerald-50/80 text-emerald-900 font-semibold"
                                  : "border-ink-200 bg-white text-ink-700"
                              )}
                            >
                              <span
                                className={cn(
                                  "size-5 shrink-0 rounded text-[11px] grid place-items-center font-bold",
                                  isCorrect ? "bg-emerald-600 text-white" : "bg-ink-100 text-ink-600"
                                )}
                              >
                                {letter}
                              </span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="rounded-lg bg-amber-50/60 border border-amber-200/70 p-2.5 text-xs text-amber-900">
                          <strong className="font-semibold">Solution:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge tone="brand">{q.exam}</Badge>
                    {q.year && <span className="text-[11px] font-medium text-ink-400">{q.year}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-ink-100 bg-ink-50/60 p-4 flex items-center justify-between">
            <span className="text-xs text-ink-500">
              {previewQuestions.length} questions ready to be stored in Supabase.
            </span>
            <Button
              type="button"
              variant="primary"
              onClick={handleSavePreview}
              disabled={busy}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4" />}
              Save All {previewQuestions.length} Questions
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
