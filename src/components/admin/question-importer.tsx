"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { csvToObjects } from "@/lib/csv";
import { EXAMS, type Exam } from "@/lib/types";

type Row = Record<string, unknown>;
interface Result {
  inserted?: number;
  wouldInsert?: number;
  errors: { index: number; error: string }[];
}

export function QuestionImporter() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [questionRows, setQuestionRows] = useState<Row[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fallbackExam, setFallbackExam] = useState<Exam>("AI GENERATED");
  const rows: Row[] = questionRows;

  const parse = (text: string) => {
    setRaw(text);
    setResult(null);
    setValidated(false);
    if (/^\s*Q\s*:/im.test(text)) {
      const parsed = parseBulkQuestions(text);
      setQuestionRows(parsed);
      setParseError(parsed.length ? null : "No complete multiple-choice blocks found. Check the Q:, A-D, and Ans: lines.");
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      setQuestionRows([]);
      setParseError(null);
      return;
    }
    try {
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const json = JSON.parse(trimmed) as Row | Row[];
        const arr = Array.isArray(json) ? json : [json];
        setQuestionRows(arr);
        setParseError(null);
      } else {
        const objs = csvToObjects(trimmed);
        if (!objs.length) throw new Error("No data rows found — check that the first line is a header.");
        setQuestionRows(objs);
        setParseError(null);
      }
    } catch (e) {
      setQuestionRows([]);
      setParseError(e instanceof Error ? e.message : "Could not parse the input.");
    }
  };

  

  const send = async (dryRun: boolean) => {
    if (!rows.length) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows,
          dryRun,
          fallbackExam,
        }),
      });
      const json = (await res.json().catch(() => null)) as (Result & { error?: string }) | null;
      if (!json) {
        setParseError(`Server error (${res.status}). Please try again.`);
      } else if (json.error) {
        setParseError(json.error);
      } else {
        setResult(json);
        setValidated(dryRun && !json.errors.length);
        if (!dryRun && json.inserted) {
          setTimeout(() => router.push("/admin/questions?created=1"), 1200);
        }
      }
    } catch {
      setParseError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Paste questions, answers, and explanations</CardTitle>
            <p className="mt-1 text-sm text-ink-500">
              Paste all question blocks once. The app will arrange the answer, explanation, year, exam, subject, and topic automatically.
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Textarea
              value={raw}
              onChange={(event) => parse(event.target.value)}
              placeholder={`Q: What is 2 + 2?\nA. 3\nB. 4\nC. 5\nD. 6\nAnswer: B\nWhy: Basic addition.\nYear: 2025\nExam: WAEC\nSubject: Mathematics\nTopic: Arithmetic\n\nQ: Next question...`}
              className="min-h-[32rem] font-mono text-[12px]"
            />

            {parseError && <Alert>{parseError}</Alert>}

            {rows.length > 0 && !parseError && (
              <Alert tone="info">
                Matched <strong>{rows.length}</strong> question{rows.length === 1 ? "" : "s"} with answers by row
                order. Click <strong>Validate</strong> to check every question before saving it.
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => send(true)} disabled={!rows.length || busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Validate
              </Button>
              <Button type="button" onClick={() => send(false)} disabled={!rows.length || !validated || busy}>
                <Upload className="size-4" />
                Import {rows.length || ""} question{rows.length === 1 ? "" : "s"}
              </Button>
            </div>

            <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3.5">
              <label htmlFor="fallback-exam" className="block text-sm font-semibold text-brand-900">
                AI GENERATED rows use
              </label>
              <p className="mt-0.5 text-xs text-brand-800">Rows labelled AI GENERATED will be saved under this exam.</p>
              <select
                id="fallback-exam"
                value={fallbackExam}
                onChange={(event) => setFallbackExam(event.target.value as Exam)}
                className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:max-w-xs"
              >
                {EXAMS.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>

            {result && (
              <div className="space-y-3">
                {typeof result.inserted === "number" && (
                  <Alert tone="success">
                    <strong>{result.inserted}</strong> question{result.inserted === 1 ? "" : "s"} imported
                    successfully. Redirecting…
                  </Alert>
                )}
                {typeof result.wouldInsert === "number" && (
                  <Alert tone="info">
                    <strong>{result.wouldInsert}</strong> row{result.wouldInsert === 1 ? "" : "s"} passed
                    validation and will be imported.
                  </Alert>
                )}
                {result.errors.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <AlertTriangle className="size-4" />
                      {result.errors.length} row{result.errors.length === 1 ? "" : "s"} skipped
                    </p>
                    <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-[12px] text-amber-800">
                      {result.errors.slice(0, 50).map((e) => (
                        <li key={e.index}>
                          Row {e.index}: {e.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview (first 8 rows)</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[12px]">
                <thead className="border-b border-ink-200 bg-ink-50 uppercase tracking-wide text-ink-500">
                  <tr>
                    {["exam", "subject", "topic", "question", "answer", "question year", "answer year"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {rows.slice(0, 8).map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{String(r.exam ?? "—")}</td>
                      <td className="px-3 py-2">{String(r.subject ?? "—")}</td>
                      <td className="px-3 py-2">{String(r.topic ?? "—")}</td>
                      <td className="max-w-xs truncate px-3 py-2">{String(r.question_text ?? r.question ?? "—")}</td>
                      <td className="px-3 py-2 font-bold">{String(r.correct_answer ?? r.answer ?? "—")}</td>
                      <td className="px-3 py-2">{String(r.year ?? "—")}</td>
                      <td className="px-3 py-2">{String(r.answer_year ?? r.year ?? "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Accepted format</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 text-[13px] leading-relaxed text-ink-600">
          <div>
            <p className="font-semibold text-ink-900">Bulk paste format</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-ink-50 p-3 font-mono text-[11px] leading-relaxed text-ink-700">{`Q: What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Ans: B
Why: Basic addition.
Year: 2025
Exam: AI GENERATED
Subject: Mathematics
Topic: Arithmetic`}</pre>
            <p className="mt-2 text-[12px] text-ink-500">Paste multiple blocks together. Use <strong>AI GENERATED</strong> for AI-created questions, then choose whether to save them as JAMB, WAEC, or NECO above.</p>
          </div>
          <div>
            <p className="font-semibold text-ink-900">Required columns</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              <li>
                Choose JAMB, WAEC, or NECO above. Rows marked <code className="font-mono text-[12px]">AI GENERATED</code> use that exam.
              </li>
              <li>
                Choose the subject above — it is added to every imported row
              </li>
              <li>
                <code className="font-mono text-[12px]">question_text</code>
              </li>
              <li>
                <code className="font-mono text-[12px]">option_a … option_e</code> (or a single{" "}
                <code className="font-mono text-[12px]">options</code> column separated by <code>|</code>)
              </li>
              <li>
                <code className="font-mono text-[12px]">correct_answer</code> — the letter A–E, or the exact
                option text
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink-900">Optional</p>
            <p className="mt-1">
              <code className="font-mono text-[12px]">topic</code>, <code className="font-mono text-[12px]">explanation</code>,{" "}
              <code className="font-mono text-[12px]">difficulty</code> (easy/medium/hard),{" "}
              <code className="font-mono text-[12px]">year</code>,{" "}
              <code className="font-mono text-[12px]">image_url</code>,{" "}
              <code className="font-mono text-[12px]">is_active</code>
            </p>
          </div>
          <div className="rounded-xl bg-ink-50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">JSON example</p>
            <pre className="mt-2 overflow-x-auto font-mono text-[11px] leading-relaxed text-ink-700">{`[
  {
    "exam": "JAMB",
    "subject": "Physics",
    "topic": "Waves",
    "question_text": "v = f × ?",
    "options": ["λ", "T", "a", "m"],
    "correct_answer": "A",
    "explanation": "Wave speed = frequency × wavelength",
    "difficulty": "easy",
    "year": 2022
  }
]`}</pre>
          </div>
          <a
            href="/templates/questions-template.csv"
            download
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline"
          >
            <FileUp className="size-4" />
            Download CSV template
          </a>
          <p className="text-[12px] text-ink-500">
            Tip: keep topic names consistent (e.g. always &ldquo;Quadratic Equations&rdquo;). The AI report and
            textbook matcher group by exactly this string.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}


function parseBulkQuestions(text: string): Row[] {
  return text
    .split(/(?=^\s*Q\s*:)/im)
    .map((block) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const row: Row = { options: [] };
      for (const line of lines) {
        if (/^Q\s*:/i.test(line)) row.question_text = line.replace(/^Q\s*:\s*/i, "");
        else if (/^[A-E][.)]\s*/i.test(line)) (row.options as string[]).push(line.replace(/^[A-E][.)]\s*/i, ""));
        else if (/^(?:Ans|Answer)\s*:/i.test(line)) row.correct_answer = line.replace(/^(?:Ans|Answer)\s*:\s*/i, "");
        else if (/^Why\s*:/i.test(line)) row.explanation = line.replace(/^Why\s*:\s*/i, "");
        else if (/^Year\s*:/i.test(line)) row.year = line.replace(/^Year\s*:\s*/i, "");
        else if (/^Exam\s*:/i.test(line)) row.exam = line.replace(/^Exam\s*:\s*/i, "").toUpperCase();
        else if (/^Subject\s*:/i.test(line)) row.subject = line.replace(/^Subject\s*:\s*/i, "");
        else if (/^Topic\s*:/i.test(line)) row.topic = line.replace(/^Topic\s*:\s*/i, "");
      }
      row.answer_year = row.year;
      return row;
    })
    .filter((row) => Boolean(row.question_text && Array.isArray(row.options) && row.options.length >= 2 && row.correct_answer));
}
