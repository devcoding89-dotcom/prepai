import { NextResponse } from "next/server";
import { repo } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const room = await repo.getBattleRoom(id);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    if (room.status === "waiting") {
      return NextResponse.json({ error: "Battle has not started yet" }, { status: 400 });
    }

    const questions = [];
    for (const qid of room.question_ids) {
      const q = await repo.getQuestion(qid);
      if (q) {
        questions.push({
          id: q.id,
          subject: q.subject,
          topic: q.topic,
          question_text: q.question_text,
          options: q.options,
          difficulty: q.difficulty,
          year: q.year,
        });
      }
    }

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        exam: room.exam,
        subjects: room.subjects,
        duration_seconds: room.duration_seconds,
        status: room.status,
        started_at: room.started_at,
      },
      questions,
    });
  } catch (e) {
    console.error("Battle questions load error:", e);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
}
