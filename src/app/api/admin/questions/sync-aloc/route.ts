import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { EXAMS, type Exam, type Question } from "@/lib/types";
import { ALOC_SUBJECTS, fetchFromAloc, formatAlocQuestion } from "@/lib/aloc";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      subjectSlug?: string;
      subjectName?: string;
      exam?: Exam;
      count?: number;
      year?: number;
      saveToDb?: boolean;
    };

    const subjectSlug = (body.subjectSlug || "english").trim().toLowerCase();
    const exam = (body.exam || "WAEC").toUpperCase() as Exam;
    if (!EXAMS.includes(exam)) {
      return NextResponse.json({ error: `Invalid exam "${body.exam}". Must be WAEC, JAMB, or NECO.` }, { status: 400 });
    }

    const matchedSubject = ALOC_SUBJECTS.find((s) => s.slug === subjectSlug);
    const subjectName = body.subjectName?.trim() || matchedSubject?.name || subjectSlug.toUpperCase();
    const count = Math.min(Math.max(Number(body.count) || 40, 1), 40);
    const year = body.year ? Number(body.year) : undefined;
    const saveToDb = Boolean(body.saveToDb);

    // Fetch questions from ALOC API
    const rawQuestions = await fetchFromAloc({
      subjectSlug,
      exam,
      count,
      year,
    });

    if (!rawQuestions || rawQuestions.length === 0) {
      return NextResponse.json({
        error: `No questions returned from ALOC for ${subjectName} (${exam}). Try another subject or year.`,
      }, { status: 404 });
    }

    // Transform and sanitize into PrepAI format
    const formatted: Omit<Question, "id" | "created_at">[] = [];
    for (const raw of rawQuestions) {
      const q = formatAlocQuestion(raw, exam, subjectName);
      if (q) formatted.push(q);
    }

    if (formatted.length === 0) {
      return NextResponse.json({
        error: "Questions were fetched, but none could be parsed into valid multiple-choice format.",
      }, { status: 422 });
    }

    let inserted = 0;
    if (saveToDb) {
      inserted = await repo.bulkCreateQuestions(formatted);
    }

    return NextResponse.json({
      ok: true,
      totalFetched: rawQuestions.length,
      totalValid: formatted.length,
      inserted,
      savedToDb: saveToDb,
      questions: formatted,
    });
  } catch (error) {
    console.error("[sync-aloc route error]", error);
    const message = error instanceof Error ? error.message : "Failed to sync questions from ALOC API";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
