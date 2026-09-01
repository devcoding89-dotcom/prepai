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

    // If room is active but question_ids were empty for any reason, sample them now
    if (room.question_ids.length === 0) {
      const count = room.mode === "quick" ? 10 : 50;
      let sampled = await repo.pickQuestions({
        exam: room.exam,
        subjects: room.subjects,
        count,
        shuffle: true,
      });
      if (sampled.length === 0) {
        sampled = await repo.pickQuestions({
          exam: room.exam,
          count,
          shuffle: true,
        });
      }
      if (sampled.length === 0) {
        sampled = await repo.pickQuestions({
          exam: "JAMB",
          count,
          shuffle: true,
        });
      }
      const qids = sampled.map((q) => q.id);
      await repo.updateBattleRoom(id, {
        question_ids: qids,
        status: "active",
        started_at: room.started_at || new Date().toISOString(),
      });
      room.question_ids = qids;
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
          image_url: q.image_url,
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
