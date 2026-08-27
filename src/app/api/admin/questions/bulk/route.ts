import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { normaliseRow, type Incoming } from "@/lib/question-import";
import { EXAMS, type Exam, type Question } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = (await req.json()) as { rows?: Incoming[]; dryRun?: boolean; fallbackExam?: string };
  const incoming = body.rows ?? [];
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return NextResponse.json({ error: "No rows supplied" }, { status: 400 });
  }
  if (incoming.length > 5000) {
    return NextResponse.json({ error: "Import at most 5,000 rows at a time" }, { status: 400 });
  }

  const fallbackExam = body.fallbackExam?.toUpperCase() as Exam | undefined;
  if (fallbackExam && !EXAMS.includes(fallbackExam)) {
    return NextResponse.json({ error: "Choose a valid exam for AI GENERATED rows." }, { status: 400 });
  }

  const valid: Omit<Question, "id" | "created_at">[] = [];
  const errors: { index: number; error: string }[] = [];

  incoming.forEach((raw, i) => {
    const res = normaliseRow(raw, fallbackExam);
    if (res.ok) valid.push(res.row);
    else errors.push({ index: i + 1, error: res.error });
  });

  if (body.dryRun) {
    return NextResponse.json({ ok: true, wouldInsert: valid.length, errors, preview: valid.slice(0, 5) });
  }

  const inserted = valid.length ? await repo.bulkCreateQuestions(valid) : 0;
  return NextResponse.json({ ok: true, inserted, errors });
}
