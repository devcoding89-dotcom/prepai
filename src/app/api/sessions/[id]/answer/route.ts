import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { recordAnswer } from "@/lib/services/practice";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await ctx.params;
  const session = await repo.getSession(id);
  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status !== "in_progress") {
    return NextResponse.json({ error: "Session already submitted" }, { status: 409 });
  }

  const body = (await req.json()) as {
    question_id: string;
    selected: string | null;
    flagged?: boolean;
    time_ms?: number;
  };
  if (!body?.question_id || !session.question_ids.includes(body.question_id)) {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }
  if (body.selected !== null && typeof body.selected !== "string") {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }
  if (body.time_ms != null && (!Number.isFinite(body.time_ms) || body.time_ms < 0 || body.time_ms > 86_400_000)) {
    return NextResponse.json({ error: "Invalid answer time" }, { status: 400 });
  }

  await recordAnswer({
    sessionId: session.id,
    questionId: body.question_id,
    selected: body.selected ?? null,
    flagged: Boolean(body.flagged),
    timeMs: Math.max(0, Math.round(body.time_ms ?? 0)),
  });

  return NextResponse.json({ ok: true });
}
