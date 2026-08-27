import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { recordAnswer, submitSession } from "@/lib/services/practice";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await ctx.params;
  const session = await repo.getSession(id);
  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status === "completed") {
    return NextResponse.json({ ok: true, redirect: `/reports/${session.id}` });
  }

  // flush any answers the client still holds
  const body = (await req.json().catch(() => ({}))) as {
    answers?: { question_id: string; selected: string | null; flagged?: boolean; time_ms?: number }[];
  };
  const answerWrites = (body.answers ?? [])
    .filter((a) => session.question_ids.includes(a.question_id))
    .filter((a) => a.selected === null || typeof a.selected === "string")
    .filter((a) => a.time_ms == null || (Number.isFinite(a.time_ms) && a.time_ms >= 0 && a.time_ms <= 86_400_000))
    .map((a) =>
      recordAnswer({
        sessionId: session.id,
        questionId: a.question_id,
        selected: a.selected ?? null,
        flagged: Boolean(a.flagged),
        timeMs: Math.max(0, Math.round(a.time_ms ?? 0)),
      }),
    );
  await Promise.all(answerWrites);

  const { analysis } = await submitSession(session);

  return NextResponse.json({
    ok: true,
    redirect: `/reports/${session.id}`,
    score: analysis.score_percent,
  });
}
