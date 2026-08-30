import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { id } = await params;
    const room = await repo.getBattleRoom(id);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Only the host can start the battle
    if (room.host_user_id !== user.id) {
      return NextResponse.json({ error: "Only the host can start the battle" }, { status: 403 });
    }
    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Battle already started or finished" }, { status: 400 });
    }

    // Pick questions based on room config
    const count = room.mode === "quick" ? 10 : 50;
    const questions = await repo.pickQuestions({
      exam: room.exam,
      subjects: room.subjects,
      count,
      shuffle: true,
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions available for the selected subjects" }, { status: 400 });
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
