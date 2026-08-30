import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { participant_id?: string };

    const room = await repo.getBattleRoom(id);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Validate host authority
    const participants = await repo.listBattleParticipants(id);
    const hostParticipant = participants.find((p) => p.is_host);

    const isHostBySession = user && user.id === room.host_user_id;
    const isHostByParticipant = body.participant_id && hostParticipant && hostParticipant.id === body.participant_id;

    if (!isHostBySession && !isHostByParticipant) {
      return NextResponse.json({ error: "Only the host can start the battle" }, { status: 403 });
    }

    if (room.status === "active") {
      return NextResponse.json({
        status: "active",
        question_count: room.question_ids.length,
        started_at: room.started_at,
      });
    }

    if (room.status === "finished") {
      return NextResponse.json({ error: "Battle has already finished" }, { status: 400 });
    }

    // Pick questions based on room config
    const count = room.mode === "quick" ? 10 : 50;
    let questions = await repo.pickQuestions({
      exam: room.exam,
      subjects: room.subjects,
      count,
      shuffle: true,
    });

    // Fallback: if selected subjects didn't return enough questions, sample from any subject in the exam
    if (questions.length === 0) {
      questions = await repo.pickQuestions({
        exam: room.exam,
        count,
        shuffle: true,
      });
    }

    if (questions.length === 0) {
      // Last resort fallback: pick from any exam
      questions = await repo.pickQuestions({
        exam: "JAMB",
        count,
        shuffle: true,
      });
    }

    const now = new Date().toISOString();
    await repo.updateBattleRoom(id, {
      status: "active",
      question_ids: questions.map((q) => q.id),
      started_at: now,
    });

    return NextResponse.json({
      status: "active",
      question_count: questions.length,
      started_at: now,
    });
  } catch (e) {
    console.error("Battle start error:", e);
    return NextResponse.json({ error: "Failed to start battle" }, { status: 500 });
  }
}
